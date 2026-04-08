export interface AppUser {
  id: string;
  userName: string;
  email: string;
  phoneNumber: string | null;
  emailConfirmed: boolean;
  lockoutEnabled: boolean;
}

export interface AppUserDetail extends AppUser {
  roles: string[];
}

export interface AppUserRequest {
  userName: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: string;
}

export interface AppUserResponse {
  statusCode: number;
  message: string;
  data: string | null;
}
