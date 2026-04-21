import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment.development';
import { ToastService } from '../../../../core/services/toast.service';

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
  topic: string = 'all';
  isLoading: boolean = false;

  private readonly toast = inject(ToastService);
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  async sendNotification() {
    this.isLoading = true;

    try {
      await firstValueFrom(
        this.http.post<any>(`${this.baseUrl}/api/Notification/send`, {
          title: this.title,
          body: this.body,
          topic: this.topic,
        }),
      );
      this.toast.success('تم إرسال الإشعار بنجاح');
      this.title = '';
      this.body = '';
      this.topic = 'all';
    } catch (error: any) {
      this.toast.error('فشل في إرسال الإشعار');
    } finally {
      this.isLoading = false;
    }
  }
}
