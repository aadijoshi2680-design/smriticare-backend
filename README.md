# SmritiCare Backend API

AI Memory and Safety Companion for Alzheimer's Patients - Backend API

## Overview

SmritiCare is a comprehensive backend system designed to help guardians manage and monitor Alzheimer's patients. The API provides features for patient management, location tracking, schedule management, emergency contacts, QR code identification, and AI chat assistance.

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Supabase** - Database and authentication
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

## Project Structure

```
smriticare-backend/
├── config/
│   ├── database.js       # Supabase connection
│   └── env.js           # Environment configuration
├── controllers/
│   ├── authController.js
│   ├── patientController.js
│   ├── locationController.js
│   ├── scheduleController.js
│   ├── qrController.js
│   ├── emergencyContactController.js
│   └── aiController.js
├── middleware/
│   ├── auth.js          # JWT authentication
│   ├── errorHandler.js  # Error handling
│   └── validation.js    # Request validation
├── routes/
│   ├── authRoutes.js
│   ├── patientRoutes.js
│   ├── locationRoutes.js
│   ├── scheduleRoutes.js
│   ├── qrRoutes.js
│   ├── emergencyContactRoutes.js
│   └── aiRoutes.js
├── server.js            # Main application file
├── package.json
└── .env.example
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
PORT=3000
NODE_ENV=development

VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```

3. Run the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Documentation

Base URL: `http://localhost:3000/api`

### Authentication

#### Register Guardian
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123",
  "phone": "+1234567890"
}
```

#### Login Guardian
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepass123"
}
```

#### Get Guardian Profile
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Patient Management

#### Create Patient
```http
POST /api/patients
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Jane Smith",
  "age": 75,
  "medicalCondition": "Alzheimer's Stage 2",
  "guardianPhone": "+1234567890",
  "address": "123 Main St, City, State",
  "photoUrl": "https://example.com/photo.jpg",
  "emergencyContacts": [
    {
      "name": "Emergency Contact",
      "phone": "+1234567891",
      "relationship": "Daughter",
      "priority": 1
    }
  ]
}
```

#### Get All Patients
```http
GET /api/patients
Authorization: Bearer <token>
```

#### Get Patient by ID
```http
GET /api/patients/:id
Authorization: Bearer <token>
```

#### Update Patient
```http
PUT /api/patients/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Jane Smith Updated",
  "age": 76
}
```

#### Delete Patient
```http
DELETE /api/patients/:id
Authorization: Bearer <token>
```

### Location Tracking

#### Update Location
```http
POST /api/location/update
Authorization: Bearer <token>
Content-Type: application/json

{
  "patientId": "uuid",
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

#### Get Latest Location
```http
GET /api/location/:patientId
Authorization: Bearer <token>
```

#### Get Location History
```http
GET /api/location/history/:patientId?limit=50&offset=0
Authorization: Bearer <token>
```

### Schedule Management

#### Create Schedule
```http
POST /api/schedules
Authorization: Bearer <token>
Content-Type: application/json

{
  "patientId": "uuid",
  "title": "Morning Medication",
  "description": "Take blood pressure medication",
  "scheduleTime": "2024-01-20T08:00:00Z",
  "type": "medicine"
}
```

Types: `medicine`, `meal`, `sleep`, `other`

#### Get Patient Schedules
```http
GET /api/schedules/:patientId?type=medicine&completed=false
Authorization: Bearer <token>
```

#### Get Schedule by ID
```http
GET /api/schedules/details/:id
Authorization: Bearer <token>
```

#### Update Schedule
```http
PUT /api/schedules/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "completed": true
}
```

#### Delete Schedule
```http
DELETE /api/schedules/:id
Authorization: Bearer <token>
```

### QR Code

#### Get Patient Info by QR Code (Public)
```http
GET /api/qr/:qrCodeId
```

This endpoint is public and returns emergency information for first responders.

#### Get QR Code for Patient
```http
GET /api/qr/patient/:patientId
Authorization: Bearer <token>
```

#### Regenerate QR Code
```http
POST /api/qr/regenerate/:patientId
Authorization: Bearer <token>
```

### Emergency Contacts

#### Add Emergency Contact
```http
POST /api/emergency-contacts
Authorization: Bearer <token>
Content-Type: application/json

{
  "patientId": "uuid",
  "name": "Sarah Smith",
  "phone": "+1234567892",
  "relationship": "Sister",
  "priority": 2
}
```

#### Get Emergency Contacts
```http
GET /api/emergency-contacts/:patientId
Authorization: Bearer <token>
```

#### Update Emergency Contact
```http
PUT /api/emergency-contacts/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "phone": "+1234567893",
  "priority": 1
}
```

#### Delete Emergency Contact
```http
DELETE /api/emergency-contacts/:id
Authorization: Bearer <token>
```

### AI Chat (Placeholder)

#### Send Chat Message
```http
POST /api/ai/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "What should I do for medication reminders?",
  "patientId": "uuid"
}
```

#### Get Care Suggestions
```http
GET /api/ai/suggestions/:patientId
Authorization: Bearer <token>
```

## Database Schema

### Tables

1. **guardians** - Guardian/caregiver accounts
2. **patients** - Patient information and medical details
3. **locations** - Patient location tracking history
4. **schedules** - Daily schedules and reminders
5. **emergency_contacts** - Emergency contact information

### Security

- Row Level Security (RLS) enabled on all tables
- Guardians can only access their own patients and related data
- JWT-based authentication for all protected endpoints
- Password hashing using bcrypt

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## Health Check

```http
GET /health
```

Returns server health status.

## Future Enhancements

- Integrate actual AI service for chat functionality
- Add real-time location tracking with WebSockets
- Implement push notifications for schedules
- Add medication interaction checking
- Implement geofencing alerts
- Add caregiver notes and daily logs
- Implement voice command support

## License

MIT
