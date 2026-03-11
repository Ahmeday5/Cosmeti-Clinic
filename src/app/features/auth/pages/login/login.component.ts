import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  email: string = '';
  password: string = ''; // ✅ تمت إضافته
  showPassword: boolean = false;
  rememberMe: boolean = true; // ✅ افتراضي true
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async onSubmit(form: NgForm): Promise<void> {
    this.errorMessage = null;

    if (!form.valid) {
      this.errorMessage = 'يرجى تصحيح الأخطاء في الحقول أدناه';
      form.control.markAllAsTouched(); // يظهر كل الـ validation messages
      return;
    }

    this.isLoading = true;

    try {
      await this.authService.login(
        this.email,
        this.password,
        this.rememberMe,
      );
      this.errorMessage = null;
      await this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.errorMessage = error.message || 'بيانات الدخول غير صحيحة';
    } finally {
      this.isLoading = false;
    }
  }
}
