from fastapi import FastAPI
from app.auth.api.routes import router as auth_router
from app.settings.api.routes import router as settings_router
from app.core.api.routes import router as core_router
from app.platforms.api.routes import router as platforms_router
from app.center.api.routes import router as center_router
from app.membership.api.routes import router as membership_router
from app.attendance.api.routes import router as attendance_router
from app.networking.api.routes import router as networking_router
from app.support.api.routes import router as support_router
from app.branding.api.routes import router as branding_router
from app.branching.api.routes import router as branching_router



from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="My FastAPI Project",
    description="API documentation for my FastAPI app",
    version="1.0.0",
    docs_url="/api/docs",        # Swagger UI
    redoc_url="/api/redoc",      # ReDoc
    openapi_url="/api/openapi.json"
)

origins = [
    "https://tcenteros.com",
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/")
def root():
    return {"message": "FastAPI running...."}

@app.get("/api/health")
def health_check():
    return {"status": "ok"}



# Additional routes and logic can be added here
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(core_router, prefix="/api/auth", tags=["core"]),
app.include_router(platforms_router, prefix="/api/platforms", tags=["Platforms"])
app.include_router(settings_router, prefix="/api/settings/superadmin", tags=["Settings"])
app.include_router(center_router, prefix="/api/center", tags=["Center Onboarding"])
app.include_router(membership_router, prefix="/api/membership", tags=["Membership"])
app.include_router(attendance_router, prefix="/api/attendance", tags=["Attendance"])
app.include_router(networking_router, prefix="/api/networking", tags=["Networking"])
app.include_router(support_router, prefix="/api/support", tags=["Support"])
app.include_router(branding_router, prefix="/api/branding", tags=["Branding"])
app.include_router(branching_router, prefix="/api/branching", tags=["Branching"])