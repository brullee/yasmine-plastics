"""
normalize_images.py — Remove background and normalize product images to 1400x1400 PNGs.

Usage:
    python scripts/normalize_images.py <reference_image> <input_file_or_dir> [--model birefnet|rmbg2]

    --model birefnet-massive  (default) Local BiRefNet-massive via rembg. No API key needed.
    --model rmbg2     RMBG-2.0 via fal.ai REST API. Requires FAL_KEY env var.
                      Note: non-commercial license (CC BY-NC 4.0) — testing only.

Requirements:
    pip install Pillow numpy rembg onnxruntime requests
"""

import os
import sys
import io
import base64
import time
import requests
import numpy as np
from PIL import Image, ImageFilter
from rembg import remove, new_session

TARGET_SIZE  = 1400
OUTPUT_DIR   = "scripts/images-out"
BG_THRESHOLD = 20
PADDING      = 40

_session = None
_session_model = None

def get_birefnet_session(model: str):
    global _session, _session_model
    if _session is None or _session_model != model:
        print(f"  Loading {model} model into memory (downloads once, then loads from cache)...")
        _session = new_session(model)
        _session_model = model
    return _session


def remove_bg_birefnet(img: Image.Image, model: str, alpha_threshold: int = 30) -> Image.Image:
    result = remove(img, session=get_birefnet_session(model))
    data = np.array(result.convert("RGBA"))
    data[:, :, 3] = np.where(data[:, :, 3] < alpha_threshold, 0, data[:, :, 3])
    alpha = Image.fromarray(data[:, :, 3]).filter(ImageFilter.MinFilter(3))
    data[:, :, 3] = np.array(alpha)
    return Image.fromarray(data, "RGBA")


_rmbg2_model = None

def remove_bg_rmbg2_local(img: Image.Image) -> Image.Image:
    import torch
    from torchvision import transforms

    global _rmbg2_model
    if _rmbg2_model is None:
        from transformers import AutoModelForImageSegmentation
        print("  Loading RMBG-2.0 model (downloads ~176MB on first run)...")
        token = os.environ.get("HF_TOKEN")
        _rmbg2_model = AutoModelForImageSegmentation.from_pretrained('briaai/RMBG-2.0', trust_remote_code=True, token=token)
        _rmbg2_model.eval()
        if torch.cuda.is_available():
            _rmbg2_model = _rmbg2_model.to('cuda')

    transform = transforms.Compose([
        transforms.Resize((1024, 1024)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ])

    tensor = transform(img.convert('RGB')).unsqueeze(0)
    if torch.cuda.is_available():
        tensor = tensor.to('cuda')

    with torch.no_grad():
        result = _rmbg2_model(tensor)

    mask = result[-1].sigmoid().cpu().squeeze().numpy()
    mask = (mask * 255).astype(np.uint8)
    mask_img = Image.fromarray(mask).resize(img.size, Image.LANCZOS)

    rgba = img.convert('RGBA')
    rgba.putalpha(mask_img)
    return rgba


def remove_bg_rmbg2(img: Image.Image) -> Image.Image:
    key = os.environ.get("FAL_KEY")
    if not key:
        print("ERROR: FAL_KEY env var not set.")
        sys.exit(1)

    # Encode image as base64 data URI so we don't need a hosted URL
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    b64 = base64.b64encode(buf.getvalue()).decode()
    data_uri = f"data:image/png;base64,{b64}"

    res = requests.post(
        "https://fal.run/fal-ai/bria/background/remove",
        headers={
            "Authorization": f"Key {key}",
            "Content-Type": "application/json",
        },
        json={"image_url": data_uri},
        timeout=120,
    )

    if not res.ok:
        raise RuntimeError(f"fal.ai API error {res.status_code}: {res.text}")

    result = res.json()
    img_url = result["image"]["url"]

    # Download the result (PNG with transparent background)
    dl = requests.get(img_url, timeout=60)
    dl.raise_for_status()
    return Image.open(io.BytesIO(dl.content)).convert("RGBA")


def remove_background(img: Image.Image, model: str) -> Image.Image:
    if model == "rmbg2":
        print("  Removing background (RMBG-2.0 via fal.ai)...")
        return remove_bg_rmbg2(img)
    if model == "rmbg2-local":
        print("  Removing background (RMBG-2.0 local)...")
        return remove_bg_rmbg2_local(img)
    print(f"  Removing background ({model})...")
    return remove_bg_birefnet(img, model)


def find_subject_bbox(img: Image.Image):
    data = np.array(img.convert("RGBA"), dtype=np.int32)
    r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
    transparent  = a < 10
    near_white   = ((255-r)**2 + (255-g)**2 + (255-b)**2 < BG_THRESHOLD**2) & ~transparent
    subject_mask = ~transparent & ~near_white
    rows = np.any(subject_mask, axis=1)
    cols = np.any(subject_mask, axis=0)
    if not rows.any():
        return None
    top    = int(np.where(rows)[0][0])
    bottom = int(np.where(rows)[0][-1]) + 1
    left   = int(np.where(cols)[0][0])
    right  = int(np.where(cols)[0][-1]) + 1
    return (left, top, right, bottom)


def read_reference(ref_path: str) -> dict:
    img = Image.open(ref_path)
    if img.size != (TARGET_SIZE, TARGET_SIZE):
        print(f"  WARNING: reference is {img.size}, expected {TARGET_SIZE}x{TARGET_SIZE}")
    bbox = find_subject_bbox(img)
    if bbox is None:
        raise ValueError(f"Could not detect subject in reference: {ref_path}")
    raw_w = bbox[2] - bbox[0]
    raw_h = bbox[3] - bbox[1]
    canvas_box = (
        max(0,           bbox[0] - PADDING),
        max(0,           bbox[1] - PADDING),
        min(TARGET_SIZE, bbox[2] + PADDING),
        min(TARGET_SIZE, bbox[3] + PADDING),
    )
    print(f"  Reference cup size : {raw_w} x {raw_h} px  ({raw_w/TARGET_SIZE*100:.1f}% of canvas)")
    print(f"  Canvas box (padded): {canvas_box}")
    return {"subject_size": (raw_w, raw_h), "canvas_box": canvas_box}


def process_image(src_path: str, out_path: str, ref: dict, model: str):
    img = Image.open(src_path)
    print(f"  Input size : {img.size}  mode: {img.mode}")
    t0 = time.time()
    img = remove_background(img, model)
    print(f"  BG removal : {time.time() - t0:.1f}s")
    bbox = find_subject_bbox(img)
    if bbox is None:
        print("  SKIP: no subject detected after background removal")
        return
    subject = img.crop(bbox)
    target_w, target_h = ref["subject_size"]
    subject = subject.copy()
    subject.thumbnail((target_w, target_h), Image.LANCZOS)
    cb = ref["canvas_box"]
    canvas_w = cb[2] - cb[0]
    canvas_h = cb[3] - cb[1]
    paste_x = cb[0] + (canvas_w - subject.width)  // 2
    paste_y = cb[1] + (canvas_h - subject.height) // 2
    canvas = Image.new("RGB", (TARGET_SIZE, TARGET_SIZE), (255, 255, 255))
    subject_rgba = subject.convert("RGBA")
    canvas.paste(subject_rgba, (paste_x, paste_y), subject_rgba.split()[3])
    canvas.save(out_path, "PNG", optimize=True)
    print(f"  Saved      : {out_path}")


def collect_files(paths: list[str]) -> list[str]:
    exts = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff", ".tif"}
    files = []
    for p in paths:
        if os.path.isdir(p):
            for f in sorted(os.listdir(p)):
                if os.path.splitext(f)[1].lower() in exts:
                    files.append(os.path.join(p, f))
        elif os.path.isfile(p):
            files.append(p)
        else:
            print(f"WARNING: '{p}' is not a file or directory, skipping.")
    return files


def main():
    args  = [a for a in sys.argv[1:] if not a.startswith("--")]
    flags = {a: sys.argv[sys.argv.index(a) + 1] for a in sys.argv[1:] if a == "--model"}
    model = flags.get("--model", "birefnet-massive")

    if len(args) < 2:
        print(__doc__)
        sys.exit(1)

    ref_path    = args[0]
    input_paths = args[1:]

    if not os.path.isfile(ref_path):
        print(f"ERROR: reference image not found: {ref_path}")
        sys.exit(1)

    print(f"\nReference : {ref_path}")
    print(f"Model     : {model}\n")
    ref = read_reference(ref_path)

    files = collect_files(input_paths)
    files = [f for f in files if os.path.abspath(f) != os.path.abspath(ref_path)]

    if not files:
        print("No input files found.")
        sys.exit(1)

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"\nProcessing {len(files)} image(s) → ./{OUTPUT_DIR}/\n")

    for f in files:
        stem = os.path.splitext(os.path.basename(f))[0]
        out  = os.path.join(OUTPUT_DIR, f"{stem}_{model}_1400.png")
        print(f"[{os.path.basename(f)}]")
        process_image(f, out, ref, model)
        print()

    print(f"Done. {len(files)} image(s) written to ./{OUTPUT_DIR}/")


if __name__ == "__main__":
    main()
