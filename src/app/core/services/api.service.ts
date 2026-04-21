import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  constructor() {}

  // ====================== GET ======================
  get<T>(endpoint: string): Observable<T> {
    return this.http
      .get<T>(`${this.baseUrl}${endpoint}`)
      .pipe(catchError(this.handleError));
  }

  // ====================== POST (يدعم FormData + JSON) ======================
  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http
      .post<T>(`${this.baseUrl}${endpoint}`, body)
      .pipe(catchError(this.handleError));
  }

  // ====================== PUT ======================
  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http
      .put<T>(`${this.baseUrl}${endpoint}`, body)
      .pipe(catchError(this.handleError));
  }

  // ====================== DELETE ======================
  delete<T>(endpoint: string): Observable<T> {
    return this.http
      .delete<T>(`${this.baseUrl}${endpoint}`)
      .pipe(catchError(this.handleError));
  }

  // ====================== Error Handler موحد (بروفيشنال) ======================
  private handleError(err: HttpErrorResponse): Observable<never> {
    let errorMsg = 'حدث خطأ غير متوقع';

    // رسالة من السيرفر لو موجودة
    const serverMsg =
      err.error?.message || err.error?.Message || err.error?.error;

    switch (err.status) {
      // ====== مشاكل الاتصال ======
      case 0:
        errorMsg = 'فشل الاتصال بالسيرفر. تحقق من اتصال الإنترنت';
        break;

      // ====== 4xx - أخطاء من جهة العميل ======
      case 400:
        errorMsg = serverMsg || 'البيانات المُرسلة غير صحيحة';
        break;
      case 401:
        errorMsg = 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى';
        break;
      case 403:
        errorMsg = 'ليس لديك صلاحية للقيام بهذا الإجراء';
        break;
      case 404:
        errorMsg = serverMsg || 'لم يتم العثور على البيانات المطلوبة';
        break;
      case 405:
        errorMsg = 'هذه العملية غير مسموح بها';
        break;
      case 408:
        errorMsg = 'انتهت مهلة الطلب. يرجى المحاولة مرة أخرى';
        break;

      // ====== 5xx - أخطاء من جهة السيرفر ======
      case 500:
        errorMsg = 'حدث خطأ داخلي في السيرفر. يرجى المحاولة لاحقاً';
        break;
      case 501:
        errorMsg = 'هذه الخدمة غير مُفعَّلة على السيرفر حالياً';
        break;
      case 502:
        errorMsg = 'السيرفر يستقبل رد غير صالح. يرجى المحاولة بعد قليل';
        break;
      case 503:
        errorMsg = 'الخدمة غير متاحة حالياً. قد يكون السيرفر تحت الصيانة';
        break;
      case 504:
        errorMsg = 'انتهت مهلة الاتصال بالسيرفر. تحقق من الشبكة وحاول مجدداً';
        break;
      case 505:
        errorMsg = 'إصدار HTTP المستخدم غير مدعوم من السيرفر';
        break;
      case 507:
        errorMsg = 'مساحة التخزين على السيرفر غير كافية';
        break;
      case 508:
        errorMsg = 'تم اكتشاف حلقة لا نهائية في معالجة الطلب';
        break;
      case 511:
        errorMsg = 'يتطلب الأمر تسجيل الدخول إلى الشبكة أولاً';
        break;

      // ====== حالات غير متوقعة ======
      default:
        if (err.status >= 500) {
          errorMsg = `خطأ في السيرفر (${err.status}). يرجى التواصل مع الدعم الفني`;
        } else if (err.status >= 400) {
          errorMsg = serverMsg || `خطأ في الطلب (${err.status})`;
        } else {
          errorMsg = serverMsg || `حدث خطأ غير متوقع (${err.status})`;
        }
        break;
    }

    // تسجيل الخطأ للمطورين
    console.error('API Error:', {
      status: err.status,
      statusText: err.statusText,
      url: err.url,
      message: errorMsg,
      serverResponse: err.error,
    });

    return throwError(() => new Error(errorMsg));
  }
}
