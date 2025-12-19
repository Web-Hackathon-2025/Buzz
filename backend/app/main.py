from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import close_db_pool
from app.api.customers.routes import router as customers_router
from app.api.providers.routes import router as providers_router
from app.api.admins.routes import router as admins_router
from app.api.auth.routes import router as auth_router
import uvicorn

app = FastAPI(
    title="Karigar API",
    description="Hyperlocal Service Provider Booking Platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(customers_router)
app.include_router(providers_router)
app.include_router(admins_router)
app.include_router(auth_router)

@app.get("/")
async def root():
    return {
        "message": "Karigar API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.on_event("shutdown")
async def shutdown_event():
    await close_db_pool()


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )

