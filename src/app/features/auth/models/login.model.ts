export interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  message: {
    statusCode: number;
    message: string;
    data: any | null;
  };
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface RawAuthResponse {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  message?: any;
  [k: string]: any; // عشان الـ API بيرجع حاجات زيادة زي statusCode و data
}

// البيانات اللي هنخزنها في localStorage ونستخدمها داخل التطبيق
export interface StoredUser {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string; // ISO string - من الـ JWT نفسه
  refreshTokenExpiresAt?: string; // اختياري - لو الـ backend بيرجعه (إحنا بنحسبه 14 يوم)
}
