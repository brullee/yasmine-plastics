"""
modal_bg_remove.py — BRIA RMBG 2.0 background removal as a Modal web endpoint.

Deploy:
    PYTHONUTF8=1 python -m modal deploy scripts/modal_bg_remove.py

The endpoint URL is printed after deployment. Add it to .env as MODAL_BG_REMOVE_URL.
"""

import io
import os
import numpy as np
import modal
from pydantic import BaseModel

app = modal.App("yasmine-plastics-bg-remove")


class BgRemoveRequest(BaseModel):
    image_url: str
    api_key: str | None = None


def download_model():
    from transformers import AutoModelForImageSegmentation
    print("Pre-downloading Aero-Ex/RMBG-2.0 into image...")
    AutoModelForImageSegmentation.from_pretrained("Aero-Ex/RMBG-2.0", trust_remote_code=True)
    print("Done.")


container_image = (
    modal.Image.from_registry("nvidia/cuda:12.4.1-cudnn-runtime-ubuntu22.04", add_python="3.11")
    .pip_install(
        "torch", "torchvision",
        "transformers==4.45.2", "timm", "kornia",
        "Pillow", "numpy", "requests", "fastapi[standard]", "pydantic",
    )
    .run_function(download_model)
)


@app.cls(image=container_image, gpu="T4", scaledown_window=300, timeout=120)
class BackgroundRemover:
    @modal.enter()
    def load_model(self):
        import torch
        from transformers import AutoModelForImageSegmentation
        print("Loading Aero-Ex/RMBG-2.0...")
        self.model = AutoModelForImageSegmentation.from_pretrained(
            "Aero-Ex/RMBG-2.0", trust_remote_code=True
        )
        torch.set_float32_matmul_precision("high")
        self.model.eval().to("cuda")
        print("Ready.")

    @modal.asgi_app()
    def api(self):
        from fastapi import FastAPI, HTTPException
        from fastapi.responses import Response

        fastapi_app = FastAPI()
        model = self.model

        @fastapi_app.post("/")
        async def remove_bg(body: BgRemoveRequest):
            import torch
            import requests as http
            from PIL import Image, ImageFilter
            from torchvision import transforms

            secret = os.environ.get("MODAL_API_SECRET")
            if secret and body.api_key != secret:
                raise HTTPException(status_code=401, detail="Unauthorized")

            r = http.get(body.image_url, timeout=30)
            r.raise_for_status()
            img = Image.open(io.BytesIO(r.content)).convert("RGB")

            transform = transforms.Compose([
                transforms.Resize((1024, 1024)),
                transforms.ToTensor(),
                transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
            ])
            tensor = transform(img).unsqueeze(0).to("cuda")

            with torch.no_grad():
                preds = model(tensor)[-1].sigmoid().cpu()

            mask = transforms.ToPILImage()(preds[0].squeeze()).resize(img.size, Image.LANCZOS)

            result = img.convert("RGBA")
            data = np.array(result)
            data[:, :, 3] = np.array(mask)
            data[:, :, 3] = np.where(data[:, :, 3] < 30, 0, data[:, :, 3])
            alpha = Image.fromarray(data[:, :, 3]).filter(ImageFilter.MinFilter(3))
            data[:, :, 3] = np.array(alpha)
            result = Image.fromarray(data, "RGBA")

            buf = io.BytesIO()
            result.save(buf, format="PNG")
            return Response(content=buf.getvalue(), media_type="image/png")

        return fastapi_app
