from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.utils import get_openapi
from fastapi.responses import FileResponse
from .database import engine
from . import models
from .routers import items
import os

models.Base.metadata.create_all(bind=engine)

app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)

# Include the router with the /api prefix
app.include_router(items.router, prefix="/api")


@app.get("/", include_in_schema=False)
async def serve_index():
    index_path = os.path.join("frontend", "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    raise HTTPException(status_code=404, detail="Index file not found")

@app.get("/api/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    return get_swagger_ui_html(
        openapi_url="/api/openapi.json",
        title="API Docs",
    )

@app.get("/api/openapi.json", include_in_schema=False)
async def get_open_api_endpoint():
    return get_openapi(title="API Docs", version="1.0.0", routes=app.routes)

# Serve static files
app.mount("/", StaticFiles(directory="frontend"), name="static")

# Make sure to export the 'app' variable
__all__ = ['app']