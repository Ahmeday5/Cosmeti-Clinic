import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment.development';

@Component({
  selector: 'app-notificaion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notificaion.component.html',
  styleUrl: './notificaion.component.scss',
})
export class NotificaionComponent {
  title: string = '';
  body: string = '';
  topic: string = 'all'; // الافتراضي
  successMessage: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  async sendNotification() {
    this.successMessage = '';
    this.errorMessage = '';

    this.isLoading = true;

    try {
      const response = await firstValueFrom(
        this.http.post<any>(`${this.baseUrl}/api/Notification/send`, {
          title: this.title,
          body: this.body,
          topic: this.topic,
        }),
      );
      console.log('Notification sent:', response);
      this.successMessage = 'تم إرسال الإشعار بنجاح';
      setTimeout(() => {
        this.successMessage = '';
        // 👇 تفريغ الحقول بعد النجاح
        this.title = '';
        this.body = '';
        this.topic = 'all';
      }, 2000);
    } catch (error: any) {
      console.error('Error sending notification:', error);
      this.errorMessage = 'فشل في إرسال الإشعار';
    } finally {
      this.isLoading = false;
    }
  }
}
