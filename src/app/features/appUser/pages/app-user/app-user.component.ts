import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AppUserService } from '../../services/app-user.service';
import { AppUser, AppUserDetail } from '../../models/app-user.model';

@Component({
  selector: 'app-app-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app-user.component.html',
  styleUrl: './app-user.component.scss',
})
export class AppUserComponent implements OnInit, AfterViewInit {
  users: AppUser[] = [];
  hasLoaded = false;

  successMessage: string | null = null;
  errorMessage: string | null = null;
  errorMessageModel: string | null = null;

  form: FormGroup;
  isEditMode = false;
  editingId: string | null = null;

  public modalInstance: any;

  constructor(
    private service: AppUserService,
    private fb: FormBuilder,
  ) {
    this.form = this.fb.group({
      userName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phoneNumber: ['', Validators.required],
      role: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadAll();
  }

  ngAfterViewInit(): void {
    const modal = document.getElementById('appUserModal');
    if (modal) {
      this.modalInstance = new (window as any).bootstrap.Modal(modal);
    }
  }

  // ======================
  // LOAD ALL
  // ======================
  loadAll(): void {
    this.service.getAll().subscribe({
      next: (data) => {
        this.users = data;
        this.hasLoaded = true;
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.hasLoaded = true;
      },
    });
  }

  // ======================
  // ADD MODAL
  // ======================
  openAddModal(): void {
    this.isEditMode = false;
    this.editingId = null;
    this.form.reset();
    this.form.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.form.get('password')?.updateValueAndValidity();
    this.errorMessageModel = null;
    this.modalInstance.show();
  }

  // ======================
  // EDIT MODAL
  // ======================
  openEditModal(id: string): void {
    this.isEditMode = true;
    this.editingId = id;
    this.errorMessageModel = null;

    this.service.getById(id).subscribe({
      next: (data: AppUserDetail) => {
        this.form.patchValue({
          userName: data.userName,
          email: data.email,
          phoneNumber: data.phoneNumber ?? '',
          role: data.roles?.[0] ?? '',
          password: '',
        });
        // password اختياري في التعديل
        this.form.get('password')?.clearValidators();
        this.form.get('password')?.updateValueAndValidity();
        this.modalInstance.show();
      },
      error: (err) => {
        this.showError(err.message);
      },
    });
  }

  // ======================
  // SUBMIT
  // ======================
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const body = {
      userName: this.form.get('userName')?.value,
      email: this.form.get('email')?.value,
      password: this.form.get('password')?.value,
      phoneNumber: this.form.get('phoneNumber')?.value,
      role: this.form.get('role')?.value,
    };

    const request$ = this.isEditMode
      ? this.service.update(this.editingId!, body)
      : this.service.create(body);

    request$.subscribe({
      next: () => {
        this.showSuccess(this.isEditMode ? 'تم التعديل بنجاح' : 'تمت الإضافة بنجاح');
        this.modalInstance.hide();
        this.loadAll();
      },
      error: (err) => {
        this.errorMessageModel = err.message;
      },
    });
  }

  // ======================
  // DELETE
  // ======================
  deleteUser(id: string): void {
    if (!confirm('هل تريد حذف هذا المستخدم؟')) return;

    this.service.delete(id).subscribe({
      next: () => {
        this.showSuccess('تم الحذف بنجاح');
        this.loadAll();
      },
      error: (err) => {
        this.showError(err.message);
      },
    });
  }

  // ======================
  // STATS GETTERS
  // ======================
  get confirmedCount(): number {
    return this.users.filter((u) => u.emailConfirmed).length;
  }

  get unconfirmedCount(): number {
    return this.users.filter((u) => !u.emailConfirmed).length;
  }

  get lockedCount(): number {
    return this.users.filter((u) => u.lockoutEnabled).length;
  }

  // ======================
  // HELPERS
  // ======================
  showSuccess(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => (this.successMessage = null), 3000);
  }

  showError(msg: string): void {
    this.errorMessage = msg;
    setTimeout(() => (this.errorMessage = null), 5000);
  }
}
