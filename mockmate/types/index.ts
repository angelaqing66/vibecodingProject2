// MockMate API Contract
// Agreed upon by both team members before splitting work.
// You mock these on the frontend. She implements them on the backend.
// Neither side changes these shapes without telling the other.

// ─────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────

export type Level = 'INTERN' | 'NEW_GRAD' | 'EXPERIENCED';
export type InterviewType = 'BEHAVIORAL' | 'CODING' | 'SYSTEM_DESIGN';
export type Period = 'MORNING' | 'AFTERNOON' | 'EVENING';
export type SessionStatus = 'UPCOMING' | 'COMPLETED' | 'CANCELLED';
export type UserRole = 'STUDENT' | 'ADMIN';

// ─────────────────────────────────────────
// CORE OBJECTS
// ─────────────────────────────────────────

// User object — returned by GET /api/users/[id]
export interface User {
  id: string;
  name: string;
  email: string;
  bio: string | null;
  level: Level;
  interviewTypes: InterviewType[];
  companies: string[];
  meetingLink: string | null;
  role: UserRole;
  availability: TimeSlot[];
  createdAt: string;
}

// TimeSlot object — part of User
export interface TimeSlot {
  id: string;
  dayOfWeek: number; // 0 = Monday, 6 = Sunday
  period: Period;
  isBooked: boolean;
}

// Session object — returned by GET /api/sessions
export interface Session {
  id: string;
  interviewType: InterviewType;
  status: SessionStatus;
  meetingLink: string | null;
  notes: string | null;
  timeSlot: TimeSlot;
  requester: {
    id: string;
    name: string;
    level: Level;
  };
  partner: {
    id: string;
    name: string;
    level: Level;
  };
  createdAt: string;
}

// ─────────────────────────────────────────
// API ROUTES
// ─────────────────────────────────────────

// POST /api/auth/signup
// Request:
export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}
// Response:
export interface SignupResponse {
  success: true;
  data: { id: string; name: string; email: string };
}

// POST /api/auth/login — handled by NextAuth
// POST /api/auth/logout — handled by NextAuth

// ─────────────────────────────────────────

// GET /api/users/[id]
// Response:
export interface GetUserResponse {
  success: true;
  data: User;
}

// PUT /api/users/[id]
// Request:
export interface UpdateUserRequest {
  name?: string;
  bio?: string;
  level?: Level;
  interviewTypes?: InterviewType[];
  companies?: string[];
  meetingLink?: string;
}
// Response:
export interface UpdateUserResponse {
  success: true;
  data: User;
}

// ─────────────────────────────────────────

// GET /api/users?level=&type=&company=
// Query params (all optional):
// level: Level
// type: InterviewType
// company: string
// Response:
export interface SearchUsersResponse {
  success: true;
  data: User[];
}

// ─────────────────────────────────────────

// POST /api/availability
// Request:
export interface CreateAvailabilityRequest {
  dayOfWeek: number;
  period: Period;
}
// Response:
export interface CreateAvailabilityResponse {
  success: true;
  data: TimeSlot;
}

// DELETE /api/availability/[id]
// Response:
export interface DeleteAvailabilityResponse {
  success: true;
  data: { id: string };
}

// ─────────────────────────────────────────

// POST /api/sessions
// Request:
export interface CreateSessionRequest {
  partnerId: string;
  timeSlotId: string;
  interviewType: InterviewType;
  notes?: string;
}
// Response:
export interface CreateSessionResponse {
  success: true;
  data: Session; // includes meetingLink revealed here
}

// GET /api/sessions
// Returns all sessions for logged-in user
// Response:
export interface GetSessionsResponse {
  success: true;
  data: Session[];
}

// DELETE /api/sessions/[id]
// Response:
export interface DeleteSessionResponse {
  success: true;
  data: { id: string };
}

// ─────────────────────────────────────────
// ADMIN ROUTES (admin role only)
// ─────────────────────────────────────────

// GET /api/admin/users
export interface GetAdminUsersResponse {
  success: true;
  data: User[];
}

// PUT /api/admin/users/[id]/suspend
export interface SuspendUserResponse {
  success: true;
  data: { id: string; suspended: boolean };
}

// GET /api/admin/stats
export interface GetAdminStatsResponse {
  success: true;
  data: {
    totalUsers: number;
    sessionsThisWeek: number;
    showUpRate: number;
  };
}

// ─────────────────────────────────────────
// ERROR RESPONSE (same shape for all routes)
// ─────────────────────────────────────────

export interface ErrorResponse {
  success: false;
  error: string; // human readable message
}

// ─────────────────────────────────────────
// SOCKET.IO EVENTS
// ─────────────────────────────────────────

// Server emits → Client listens:
// "notification:booking"
export interface BookingNotification {
  sessionId: string;
  partnerName: string;
  interviewType: InterviewType;
  timeSlot: TimeSlot;
}

// "notification:cancellation"
export interface CancellationNotification {
  sessionId: string;
  partnerName: string;
}
