# ScamCheckSA

South Africa's open scam reporting and verification database.

## Stack

- **Backend**: FastAPI + MongoDB (Motor async driver)
- **Frontend**: React 18 (dark theme, #0A0E14)
- **AI**: Claude API for Facebook post parsing
- **Auth**: JWT (bcrypt passwords)

## Quick Start

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
cp .env.example .env         # fill in your values
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm start
```

### Docker (full stack)

```bash
cp backend/.env.example backend/.env   # edit .env
docker-compose up --build
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/reports/` | — | Submit scam report |
| GET | `/api/reports/search?q=&field=` | — | Search verified reports |
| GET | `/api/reports/{id}` | — | Get single report |
| POST | `/api/auth/token` | — | Login (returns JWT) |
| POST | `/api/auth/register` | — | Register user |
| GET | `/api/admin/reports` | Admin | List all reports |
| PATCH | `/api/admin/reports/{id}` | Admin | Approve / reject |
| DELETE | `/api/admin/reports/{id}` | Admin | Delete report |
| POST | `/api/admin/parse-facebook-post` | Admin | AI-parse FB post |

## Facebook Post Parser

The `POST /api/admin/parse-facebook-post` endpoint accepts raw Facebook post text and uses Claude AI to extract:

- Scammer name, phone, bank account, ID number
- Amount lost, scam category
- Concise description

The admin can then review the extracted data and submit it as a pending report.

## MongoDB Schema

```
reports collection:
  name          String (optional)
  phone         String (optional)
  bank_account  String (optional)
  bank_name     String (optional)
  id_number     String (optional)
  amount_lost   Float (optional, ZAR)
  description   String (required)
  category      Enum: romance|investment|phishing|job|shopping|other
  status        Enum: pending|verified|rejected
  source        Enum: manual|facebook|api
  created_at    DateTime
  reviewed_at   DateTime (optional)
  reviewed_by   String (optional)
```

## Environment Variables

```
MONGODB_URL=mongodb://localhost:27017
DB_NAME=scamchecksa
SECRET_KEY=your-secret-key
ANTHROPIC_API_KEY=sk-ant-...
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-password
```
