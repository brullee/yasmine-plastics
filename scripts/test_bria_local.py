"""
test_bria_local.py — local BG removal using BRIA RMBG 2.0

Usage:
    pip install torch torchvision transformers Pillow numpy
    python scripts/test_bria_local.py path/to/image.jpg

Output: path/to/image_bria.png  (transparent PNG)

GPU (CUDA) is used automatically if available; falls back to CPU (slower ~30s).
"""

import sys
from pathlib import Path

import numpy as np
import torch
from PIL import Image, ImageFilter
from torchvision import transforms
from transformers import AutoModelForImageSegmentation


def load_model():
    print("Loading briaai/RMBG-2.0 (downloads ~170 MB on first run)...")
    model = AutoModelForImageSegmentation.from_pretrained(
        "Aero-Ex/RMBG-2.0", trust_remote_code=True
    )
    torch.set_float32_matmul_precision("high")
    model.eval()
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = model.to(device)
    print(f"Model ready on {device}.")
    return model, device


def remove_bg(model, device, image: Image.Image) -> Image.Image:
    transform = transforms.Compose([
        transforms.Resize((1024, 1024)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ])

    rgb = image.convert("RGB")
    tensor = transform(rgb).unsqueeze(0).to(device)

    with torch.no_grad():
        preds = model(tensor)[-1].sigmoid().cpu()

    mask = transforms.ToPILImage()(preds[0].squeeze()).resize(image.size, Image.LANCZOS)

    # Clean up noise at edges (matches the Modal post-processing)
    result = image.convert("RGBA")
    data = np.array(result)
    data[:, :, 3] = np.array(mask)
    data[:, :, 3] = np.where(data[:, :, 3] < 30, 0, data[:, :, 3])
    alpha = Image.fromarray(data[:, :, 3]).filter(ImageFilter.MinFilter(3))
    data[:, :, 3] = np.array(alpha)
    return Image.fromarray(data, "RGBA")


def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/test_bria_local.py <image_path> [output_dir]")
        sys.exit(1)

    src = Path(sys.argv[1])
    if not src.exists():
        print(f"File not found: {src}")
        sys.exit(1)

    out_dir = Path(sys.argv[2]) if len(sys.argv) >= 3 else src.parent
    out_dir.mkdir(parents=True, exist_ok=True)

    model, device = load_model()

    print(f"Processing {src.name}...")
    image = Image.open(src)
    result = remove_bg(model, device, image)

    out = out_dir / (src.stem + "_bria.png")
    result.save(out, format="PNG")
    print(f"Saved -> {out}")


if __name__ == "__main__":
    main()
