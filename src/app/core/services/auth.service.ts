import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, of, firstValueFrom } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  StoredUser,
  RawAuthResponse,
} from '../../features/auth/models/login.model';
import { environment } from '../../../environments/environment.development';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

export interface JwtPayload {
  exp?: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userDataSubject = new BehaviorSubject<StoredUser | null>(null);
  public userData$ = this.userDataSubject.asObservable();
  public isLoggedInSubject = new BehaviorSubject<boolean>(
    localStorage.getItem('isLoggedIn') === 'true',
  );
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private refreshTimeoutId: any = null;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  private readonly BASE_URL = environment.apiBaseUrl;
  private readonly loginUrl = `${this.BASE_URL}/api/Auth/login/appuser`;
  private readonly refreshUrl = `${this.BASE_URL}/api/Auth/refresh-token`;
  private readonly logoutUrl = `${this.BASE_URL}/api/Auth/logout`;

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    this.loadUserData();
  }

  // ====================== LOGIN ======================
  // === تسجيل الدخول ===
  async login(
    email: string,
    password: string,
    rememberMe: boolean = true,
  ): Promise<StoredUser> {
    this.clearPersisted();

    const payload = { email, password, rememberMe };

    try {
      const raw = await firstValueFrom(
        this.http.post<RawAuthResponse>(`${this.loginUrl}`, payload).pipe(
          catchError((err) => {
            if (err.status === 401)
              throw new Error('البريد أو كلمة المرور غير صحيحة');
            if (err.status === 400) throw new Error('بيانات غير صحيحة');
            throw new Error('فشل تسجيل الدخول');
          }),
        ),
      );

      const user = this.makeStoredUserFromRaw(raw);
      this.persistUser(user);
      if (rememberMe) localStorage.setItem('savedEmail', email);

      return user;
    } catch (error: any) {
      throw new Error(error.message || 'فشل تسجيل الدخول');
    }
  }

  // ====================== REFRESH TOKEN (يستدعى تلقائياً في الـ Interceptor) ======================
  // === تجديد التوكن ===
  async refresh(): Promise<StoredUser> {
    const current = this.userDataSubject.value;
    const refreshToken = current?.refreshToken;

    if (!refreshToken || this.isRefreshTokenExpired()) {
      this.logoutAndRedirect();
      throw new Error('Refresh token منتهي');
    }

    try {
      const raw = await firstValueFrom(
        this.http.post<RawAuthResponse>(`${this.refreshUrl}`, { refreshToken }),
      );

      const newUser = this.makeStoredUserFromRaw({
        accessToken: raw.accessToken,
        refreshToken: raw.refreshToken ?? refreshToken,
      });

      this.persistUser(newUser); // ← هنا بيحصل startTokenRefreshTimer تلقائي
      return newUser;
    } catch (error) {
      this.logoutAndRedirect();
      throw error;
    }
  }

  // ====================== LOGOUT (يستدعى من الـ UI) ======================
  // === تسجيل الخروج ===
  logout(): void {
    const token = this.userDataSubject.value?.refreshToken;
    if (token) {
      this.http
        .post(`${this.logoutUrl}`, { refreshToken: token })
        .pipe(catchError(() => of(null)))
        .subscribe();
    }
    this.clearPersisted();
    this.isLoggedInSubject.next(false);
    void this.router.navigate(['/']);
  }

  // ====================== GETTERS ======================
  getAccessToken(): string | null {
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  private handleAuthError(err: HttpErrorResponse): string {
    if (err.status === 0) {
      return 'خطأ في الاتصال بالسيرفر. يرجى التحقق من اتصال الإنترنت.';
    }
    if (err.status === 400) {
      return 'بيانات الدخول غير صحيحة. تأكد من الإيميل وكلمة المرور.';
    }
    if (err.status === 401) {
      return 'غير مصرح به. يرجى تسجيل الدخول مرة أخرى.';
    }
    if (err.status === 500) {
      return 'خطأ داخلي في السيرفر. حاول مرة أخرى بعد قليل.';
    }
    // رسالة الـ backend المباشرة
    return (
      err.error?.message?.message ||
      err.error?.title ||
      'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'
    );
  }

  private clearAuth(): void {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.accessToken = null;
    this.refreshToken = null;
    this.userDataSubject.next(null);
  }

  public forceLogout(): void {
    this.clearAuth();
  }

  // === فك الـ exp من الـ JWT ===
  private decodeExpFromToken(token: string): number | null {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return decoded?.exp ? decoded.exp * 1000 : null;
    } catch (e) {
      return null;
    }
  }

  // === تحويل الاستجابة لـ StoredUser ===
  private makeStoredUserFromRaw(raw: RawAuthResponse): StoredUser {
    const accessExp = this.decodeExpFromToken(raw.accessToken!);
    const accessTokenExpiresAt = accessExp
      ? new Date(accessExp).toISOString()
      : new Date(Date.now() + 30 * 60 * 1000).toISOString(); // fallback 30 دقيقة

    // لو الـ backend مرجعش refresh expiry → نفترض 14 يوم
    const refreshTokenExpiresAt = new Date(
      Date.now() + 14 * 24 * 60 * 60 * 1000,
    ).toISOString();

    return {
      accessToken: raw.accessToken!,
      refreshToken: raw.refreshToken!,
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
    };
  }

  // === حفظ البيانات بعد اللوجين أو الرفريش ===
  private persistUser(user: StoredUser) {
    this.userDataSubject.next(user);
    localStorage.setItem('userData', JSON.stringify(user));
    localStorage.setItem('token', user.accessToken);
    localStorage.setItem('isLoggedIn', 'true');
    this.isLoggedInSubject.next(true);
    this.startTokenRefreshTimer(); // مهم جدًا: نعيد جدولة التايمر بالوقت الجديد
  }

  // === تنظيف كل حاجة ===
  private clearPersisted() {
    this.userDataSubject.next(null);
    localStorage.removeItem('userData');
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('savedEmail');
    if (this.refreshTimeoutId) {
      clearTimeout(this.refreshTimeoutId);
      this.refreshTimeoutId = null;
    }
  }

  // === تحميل البيانات عند بدء التطبيق ===
  private loadUserData(): void {
    const stored = localStorage.getItem('userData');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    if (!stored || !isLoggedIn) {
      this.clearPersisted();
      return;
    }

    try {
      const parsed = JSON.parse(stored) as StoredUser;
      this.userDataSubject.next(parsed);

      const accessValid = !!parsed.accessToken && !this.isTokenExpired();
      const refreshValid = !this.isRefreshTokenExpired();

      if (accessValid && refreshValid) {
        this.startTokenRefreshTimer();
      } else if (!accessValid && refreshValid) {
        // access انتهى بس refresh شغال → نعمل refresh فورًا
        this.refresh()
          .then(() => this.startTokenRefreshTimer())
          .catch(() => this.logoutAndRedirect());
      } else {
        this.logoutAndRedirect();
      }
    } catch (e) {
      console.error('Failed to parse userData', e);
      this.logoutAndRedirect();
    }
  }

  private logoutAndRedirect() {
    this.clearPersisted();
    this.isLoggedInSubject.next(false);
    void this.router.navigate(['/']);
  }

  // === جدولة الرفريش التلقائي ===
  startTokenRefreshTimer(): void {
    if (this.refreshTimeoutId) clearTimeout(this.refreshTimeoutId);

    const stored = this.userDataSubject.value;
    if (!stored?.accessTokenExpiresAt) {
      this.logoutAndRedirect();
      return;
    }

    const expiry = Date.parse(stored.accessTokenExpiresAt);
    if (isNaN(expiry)) {
      this.logoutAndRedirect();
      return;
    }

    const now = Date.now();
    const timeLeft = expiry - now;
    const threshold = 2 * 60 * 1000; // 2 دقايق قبل الانتهاء

    if (timeLeft <= threshold) {
      void this.refresh().catch(() => this.logoutAndRedirect());
      return;
    }

    const delay = timeLeft - threshold;

    this.refreshTimeoutId = setTimeout(() => {
      void this.refresh().catch(() => this.logoutAndRedirect());
    }, delay);
  }

  // === دوال مساعدة ===
  isLoggedIn(): boolean {
    return !!this.getToken() && !this.isTokenExpired();
  }

  isTokenExpired(): boolean {
    const stored = this.userDataSubject.value;
    return (
      !stored?.accessTokenExpiresAt ||
      Date.parse(stored.accessTokenExpiresAt) < Date.now()
    );
  }

  isRefreshTokenExpired(): boolean {
    const stored = this.userDataSubject.value;
    if (!stored?.refreshTokenExpiresAt) return false;
    return Date.parse(stored.refreshTokenExpiresAt) < Date.now();
  }

  getToken(): string | null {
    return this.userDataSubject.value?.accessToken ?? null;
  }

  getSavedEmail(): string | null {
    return localStorage.getItem('savedEmail');
  }
}
