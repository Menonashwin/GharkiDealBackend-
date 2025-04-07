// src/auth/interfaces/user.interface.ts
import { UserRole } from '../dto/phone-auth.dto';

export interface JwtUserPayload {
  ph_no: string;      // Phone number
  sub: string;        // User ID (UUID)
  role: UserRole;     // User role
  iat?: number;       // Issued at
  exp?: number;       // Expiration
}