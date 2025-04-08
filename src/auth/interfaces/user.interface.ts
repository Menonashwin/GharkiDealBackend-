// src/auth/interfaces/user.interface.ts
import { UserType } from '../dto/phone-auth.dto';

export interface JwtUserPayload {
  ph_no: string;      // Phone number
  sub: string;        // User ID (UUID)
  user_type: UserType; // User type (user or service_provider)
  iat?: number;       // Issued at
  exp?: number;       // Expiration
}