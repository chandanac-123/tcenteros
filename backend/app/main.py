from fastapi import FastAPI
from app.auth.api.routes import router as auth_router
from app.settings.api.routes import router as settings_router

app = FastAPI(
    title="My FastAPI Project",
    description="API documentation for my FastAPI app",
    version="1.0.0",
    docs_url="/api/docs",        # Swagger UI
    redoc_url="/api/redoc",      # ReDoc
    openapi_url="/api/openapi.json"
)

@app.get("/api/")
def root():
    return {"message": "FastAPI running...."}

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

# Additional routes and logic can be added here
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(settings_router, prefix="/api/settings/superadmin", tags=["Settings"])
