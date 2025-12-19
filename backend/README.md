# Karigar Backend API

FastAPI backend for the Karigar hyperlocal service provider booking platform.

## Features

### Customer Features (Implemented)
- ✅ Browse & Search Providers (Hyperlocal search using PostGIS)
- ✅ Provider Profile View (with availability and reviews)
- ✅ Service Booking (with availability validation)
- ✅ Booking Tracking
- ✅ Reviews & Ratings

## Setup Instructions

### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv

# On Windows
venv\Scripts\activate

# On Linux/Mac
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
DATABASE_URL=postgresql://user:password@host:port/database

# FastAPI Configuration
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**Important**: 
- Get your Supabase credentials from your Supabase project settings
- The `DATABASE_URL` should be your PostgreSQL connection string (not the Supabase connection pooler URL, use the direct connection URL for PostGIS queries)
- Ensure PostGIS extension is enabled in your Supabase database

### 4. Run the Application

```bash
# Development mode with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or use Python directly
python -m app.main
```

### 5. Access API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Customer Endpoints

All customer endpoints require authentication (Bearer token from Supabase Auth).

- `GET /customers/categories` - Get all service categories
- `GET /customers/providers/search` - Search providers by location (hyperlocal)
- `GET /customers/providers/{provider_id}` - Get provider profile details
- `POST /customers/bookings` - Create a new booking
- `GET /customers/bookings` - Get customer's bookings
- `GET /customers/bookings/{booking_id}` - Get specific booking
- `PUT /customers/bookings/{booking_id}/cancel` - Cancel a booking
- `POST /customers/reviews` - Create a review for completed booking
- `GET /customers/reviews/my` - Get customer's reviews

## Database Schema

The application uses the following Supabase tables:
- `profiles` - User profiles with roles
- `categories` - Service categories
- `provider_profiles` - Provider information (with PostGIS location)
- `provider_availability` - Provider weekly availability schedule
- `bookings` - Service bookings
- `reviews` - Reviews and ratings

## Hyperlocal Search

The provider search uses PostGIS for distance-based queries:
- Uses `ST_DWithin` for efficient radius-based searches
- Returns results sorted by distance (nearest first)
- Requires PostGIS extension enabled in PostgreSQL
- Uses GIST index on `provider_profiles.location` for performance

## Authentication

Authentication is handled by Supabase Auth. Clients should:
1. Sign up/login using Supabase Auth
2. Get the JWT access token
3. Include token in Authorization header: `Bearer <token>`

## Error Handling

The API returns standard HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error
- `503` - Service Unavailable

## Development

### Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── customers/
│   │       └── routes.py      # Customer endpoints
│   ├── core/
│   │   ├── config.py          # Configuration
│   │   ├── database.py        # Database connections
│   │   └── security.py        # Authentication & authorization
│   ├── models/
│   │   └── schemas.py         # Pydantic models
│   └── main.py                # FastAPI app
├── requirements.txt
├── .env                        # Environment variables (not in git)
└── README.md
```

## Notes

- PostGIS queries require a direct PostgreSQL connection (not through Supabase connection pooler)
- Provider search uses geography type for accurate distance calculations
- Booking validation checks provider availability and prevents double bookings
- Reviews can only be created for completed bookings

