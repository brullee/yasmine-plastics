"""
modal_bg_remove_birefnet_massive.py — BiRefNet-massive background removal as a Modal web endpoint.

Deploy:
    $env:PYTHONUTF8=1; python -m modal deploy scripts/modal_bg_remove_birefnet_massive.py

The endpoint URL is printed after deployment. Add it to .env as MODAL_BG_REMOVE_URL.
"""

import io
import os
import numpy as np
import modal
from pydantic import BaseModel

app = modal.App("yasmine-plastics-bg-remove-massive")


class BgRemoveRequest(BaseModel):
    image_url: str
    api_key: str | None = None


def download_model():
    from rembg import new_session
    print("Pre-downloading birefnet-massive into image...")
    new_session("birefnet-massive")
    print("Done.")


container_image = (
    modal.Image.from_registry("nvidia/cuda:12.4.1-cudnn-runtime-ubuntu22.04", add_python="3.11")
    .pip_install("rembg[gpu]", "onnxruntime-gpu", "Pillow", "numpy", "requests", "fastapi[standard]", "pydantic")
    .run_function(download_model)
)


@app.cls(image=container_image, gpu="T4", scaledown_window=300, timeout=120)
class BackgroundRemover:
    @modal.enter()
    def load_model(self):
        from rembg import new_session
        print("Loading birefnet-massive...")
        self.session = new_session("birefnet-massive")
        print("Ready.")

    @modal.asgi_app()
    def api(self):
        from fastapi import FastAPI, HTTPException
        from fastapi.responses import Response
        from rembg import remove

        fastapi_app = FastAPI()
        session = self.session

        @fastapi_app.post("/")
        async def remove_bg(body: BgRemoveRequest):
            import requests as http
            from PIL import Image, ImageFilter

            secret = os.environ.get("MODAL_API_SECRET")
            if secret and body.api_key != secret:
                raise HTTPException(status_code=401, detail="Unauthorized")

            r = http.get(body.image_url, timeout=30)
            r.raise_for_status()
            img = Image.open(io.BytesIO(r.content))

            result = remove(img, session=session)
            data = np.array(result.convert("RGBA"))
            data[:, :, 3] = np.where(data[:, :, 3] < 30, 0, data[:, :, 3])
            alpha = Image.fromarray(data[:, :, 3]).filter(ImageFilter.MinFilter(3))
            data[:, :, 3] = np.array(alpha)
            result = Image.fromarray(data, "RGBA")

            buf = io.BytesIO()
            result.save(buf, format="PNG")
            return Response(content=buf.getvalue(), media_type="image/png")

        return fastapi_app
