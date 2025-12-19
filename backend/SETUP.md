# Quick Setup Guide

## Prerequisites
- Python 3.8 or higher
- Supabase project with database schema set up
- PostGIS extension enabled in your Supabase database

## Steps

### 1. Create Virtual Environment

**Windows:**
```cmd
cd backend
setup_venv.bat
venv\Scripts\activate
```

**Linux/Mac:**
```bash
cd backend
chmod +x setup_venv.sh
./setup_venv.sh
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure Environment

Create `.env` file in `backend/` directory:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**Important Notes:**
- Get your Supabase URL and keys from: Project Settings → API
- For `DATABASE_URL`, use the direct PostgreSQL connection (not connection pooler)
- Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
- Find your password in: Project Settings → Database → Connection string

### 4. Run the Server
```bash
uvicorn app.main:app --reload
```

The API will be available at: http://localhost:8000
Documentation: http://localhost:8000/docs

## Testing

1. Make sure your Supabase database has:
   - PostGIS extension enabled
   - All tables created (profiles, categories, provider_profiles, etc.)
   - At least one verified provider with location data

2. Test the endpoints using the Swagger UI at `/docs`

## Troubleshooting

**"Database connection not available"**
- Check your `DATABASE_URL` is correct
- Ensure PostGIS extension is enabled: `CREATE EXTENSION IF NOT EXISTS postgis;`

**Authentication errors**
- Verify your Supabase credentials in `.env`
- Ensure the JWT token is being sent in the Authorization header

**Import errors**
- Make sure virtual environment is activated
- Run `pip install -r requirements.txt` again

