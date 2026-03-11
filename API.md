# MockMate Public API Documentation

**Base URL**: `https://mock-mate.vercel.app/api`

> **Authentication Note:** All protected routes require a valid NextAuth session cookie (`next-auth.session-token`). Requests without a valid session will receive a `401 Unauthorized` response.

### Response Format
All endpoints return a standardized JSON response:
- **Success:** `{ success: true, data: { ... } }`
- **Error:** `{ success: false, error: "Human readable message" }`

---

## 1. Authentication Endpoints (Public)

### POST `/api/auth/signup`
Creates a new user account.
- **Auth Required:** No
- **Request Body:**
```typescript
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```
- **Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "cuid123",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```
- **Error Responses:** `400 Bad Request` (Invalid input, duplicate email)
- **Example cURL:**
```bash
curl -X POST https://mock-mate.vercel.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"securepassword123"}'
```

### POST `/api/auth/login`
Handled automatically by NextAuth credentials provider.
- **Auth Required:** No

### POST `/api/auth/logout`
Handled automatically by NextAuth.
- **Auth Required:** Yes

---

## 2. User Endpoints (Protected)

### GET `/api/users/[id]`
Retrieves a specific user's public profile and availability.
- **Auth Required:** Yes
- **Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "cuid123",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "USER",
    "experienceLevel": "Experienced",
    "interviewTypes": ["System Design", "Coding"],
    "availability": [],
    "zoomLink": "https://zoom.us/j/123"
  }
}
```
- **Error Responses:** `404 Not Found`
- **Example cURL:**
```bash
curl -X GET https://mock-mate.vercel.app/api/users/cuid123 \
  -H "Cookie: next-auth.session-token=your_token_here"
```

### PUT `/api/users/[id]`
Updates the authenticated user's profile information.
- **Auth Required:** Yes (Must match `[id]`)
- **Request Body:**
```typescript
{
  "name"?: "Jane Doe",
  "experienceLevel"?: "Experienced",
  "interviewTypes"?: ["System Design"],
  "zoomLink"?: "https://zoom.us/j/999"
}
```
- **Success Response (200):** Updated user object.
- **Error Responses:** `400 Bad Request`, `403 Forbidden`
- **Example cURL:**
```bash
curl -X PUT https://mock-mate.vercel.app/api/users/cuid123 \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=your_token_here" \
  -d '{"experienceLevel":"Experienced"}'
```

### GET `/api/users`
Searches for potential partners.
- **Auth Required:** Yes
- **Query Params (Optional):**
  - `level`: `INTERN` | `NEW_GRAD` | `EXPERIENCED`
  - `type`: `BEHAVIORAL` | `CODING` | `SYSTEM_DESIGN`
  - `company`: string
- **Success Response (200):** List of user objects matching the criteria.
- **Example cURL:**
```bash
curl -X GET "https://mock-mate.vercel.app/api/users?level=NEW_GRAD&type=CODING" \
  -H "Cookie: next-auth.session-token=your_token_here"
```

---

## 3. Availability Endpoints (Protected)

### POST `/api/availability`
Adds a new timeslot to the user's schedule.
- **Auth Required:** Yes
- **Request Body:**
```typescript
{
  "dayOfWeek": 3,      // 0 = Mon, 6 = Sun
  "period": "MORNING"  // MORNING | AFTERNOON | EVENING
}
```
- **Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "slot456",
    "dayOfWeek": 3,
    "period": "MORNING",
    "isBooked": false
  }
}
```
- **Example cURL:**
```bash
curl -X POST https://mock-mate.vercel.app/api/availability \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=your_token_here" \
  -d '{"dayOfWeek":3,"period":"MORNING"}'
```

### DELETE `/api/availability/[id]`
Removes a timeslot from the user's schedule.
- **Auth Required:** Yes
- **Success Response (200):** `{ "success": true, "data": { "id": "slot456" } }`
- **Example cURL:**
```bash
curl -X DELETE https://mock-mate.vercel.app/api/availability/slot456 \
  -H "Cookie: next-auth.session-token=your_token_here"
```

---

## 4. Session Endpoints (Protected)

### POST `/api/sessions`
Requests a mock interview session with a partner.
- **Auth Required:** Yes
- **Request Body:**
```typescript
{
  "partnerId": "cuid999",
  "timeSlotId": "slot456",
  "interviewType": "CODING",
  "notes"?: "Let's focus on dynamic programming"
}
```
- **Success Response (201):** Returns a Session object.
- **Error Responses:** `400 Bad Request` (Self-booking, slot unavailable or already booked)
- **Example cURL:**
```bash
curl -X POST https://mock-mate.vercel.app/api/sessions \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=your_token_here" \
  -d '{"partnerId":"cuid999","timeSlotId":"slot456","interviewType":"CODING"}'
```

### GET `/api/sessions`
Retrieves all sessions (upcoming, pending, and past) for the authenticated user.
- **Auth Required:** Yes
- **Success Response (200):** Array of Session objects.
- **Example cURL:**
```bash
curl -X GET https://mock-mate.vercel.app/api/sessions \
  -H "Cookie: next-auth.session-token=your_token_here"
```

### DELETE `/api/sessions/[id]`
Cancels or declines a session request.
- **Auth Required:** Yes (Must be host or guest)
- **Success Response (200):** `{ "success": true, "data": { "id": "sess789" } }`
- **Example cURL:**
```bash
curl -X DELETE https://mock-mate.vercel.app/api/sessions/sess789 \
  -H "Cookie: next-auth.session-token=your_token_here"
```

---

## 5. Admin Endpoints (Admin Role Only)

These endpoints will return `403 Forbidden` if the authenticated user's role is not `ADMIN`.

### GET `/api/admin/users`
Retrieves a list of all registered users on the platform.
- **Auth Required:** Yes (Admin)
- **Example cURL:**
```bash
curl -X GET https://mock-mate.vercel.app/api/admin/users \
  -H "Cookie: next-auth.session-token=admin_token_here"
```

### PUT `/api/admin/users/[id]/suspend`
Suspends or un-suspends a user account.
- **Auth Required:** Yes (Admin)
- **Success Response (200):** `{ "success": true, "data": { "id": "cuid123", "suspended": true } }`
- **Example cURL:**
```bash
curl -X PUT https://mock-mate.vercel.app/api/admin/users/cuid123/suspend \
  -H "Cookie: next-auth.session-token=admin_token_here"
```

### DELETE `/api/admin/users/[id]`
Permanently deletes a user and cascades their sessions.
- **Auth Required:** Yes (Admin)
- **Example cURL:**
```bash
curl -X DELETE https://mock-mate.vercel.app/api/admin/users/cuid123 \
  -H "Cookie: next-auth.session-token=admin_token_here"
```

### GET `/api/admin/sessions`
Retrieves a global list of sessions.
- **Auth Required:** Yes (Admin)
- **Example cURL:**
```bash
curl -X GET https://mock-mate.vercel.app/api/admin/sessions \
  -H "Cookie: next-auth.session-token=admin_token_here"
```

### GET `/api/admin/stats`
Retrieves platform-wide analytical statistics.
- **Auth Required:** Yes (Admin)
- **Success Response (200):**
```json
{
  "success": true,
  "data": {
    "totalUsers": 142,
    "sessionsThisWeek": 28,
    "showUpRate": 0.95
  }
}
```
- **Example cURL:**
```bash
curl -X GET https://mock-mate.vercel.app/api/admin/stats \
  -H "Cookie: next-auth.session-token=admin_token_here"
```

---

## 6. Error Codes Reference

| Status Code | Meaning | When it occurs |
|-------------|---------|----------------|
| `200` | Success | Request completed successfully |
| `201` | Created | Resource (User, Session) was successfully created |
| `400` | Bad Request | Invalid input, validation failed, or rule violation |
| `401` | Unauthorized | User is not logged in / missing session cookie |
| `403` | Forbidden | Logged in, but lacks permission (e.g. not an Admin) |
| `404` | Not Found | Formatted resource or ID does not exist in the database |
| `500` | Server Error | An unexpected server-side exception occurred |

---

## 7. Data Models

Based on `types/index.ts` and `prisma/schema.prisma`.

### User
```typescript
interface User {
  id: string;               // cuid
  name: string | null;
  email: string | null;
  role: string;             // "USER" | "ADMIN"
  experienceLevel: string | null; // "Intern" | "New Grad" | "Experienced"
  interviewTypes: string[];       // ["Behavioral", "Coding", "System Design"]
  availability: string[];         // JSON array of timeslots
  zoomLink: string | null;
}
```

### TimeSlot
```typescript
interface TimeSlot {
  id: string;
  dayOfWeek: number;        // 0 = Mon, 6 = Sun
  period: "MORNING" | "AFTERNOON" | "EVENING";
  isBooked: boolean;
}
```

### Session (MockSession)
```typescript
interface Session {
  id: string;               // cuid
  hostId: string;
  guestId: string;
  scheduledTime: Date;
  status: string;           // "PENDING" | "SCHEDULED" | "COMPLETED" | "CANCELLED"
  notes?: string | null;
  message?: string | null;
  
  // Relations
  host: User;
  guest: User;
}
```
