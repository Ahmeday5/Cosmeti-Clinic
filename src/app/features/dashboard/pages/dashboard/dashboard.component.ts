import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service'; // ← تأكد من المسار الصحيح
import { Category } from '../../models/dashboard.model'; // ← تأكد من المسار

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, AfterViewInit {
  categories: Category[] = [];
  isLoading = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  successMessageModel: string | null = null;
  errorMessageModel: string | null = null;

  categoryForm: FormGroup;
  isEditMode = false;
  editingId: number | null = null;
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  // ====================== المتغير الخاص بالمودال ======================
  private modalInstance: any; // هيحتوي على كائن Bootstrap Modal

  constructor(
    private categoryService: DashboardService,
    private fb: FormBuilder,
    private router: Router,
  ) {
    this.categoryForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  // ====================== تهيئة المودال بعد تحميل الـ DOM ======================
  ngAfterViewInit(): void {
    const modalElement = document.getElementById(
      'addSectionModal',
    ) as HTMLElement;
    if (modalElement) {
      // هنا نستخدم window.bootstrap عشان TypeScript ما يشتكيش
      this.modalInstance = new (window as any).bootstrap.Modal(modalElement, {
        keyboard: false, // ما يقفلش بالـ ESC
      });
    }
  }

  // ====================== تحميل الكاتيجوريز ======================
  loadCategories(): void {
    this.isLoading = true;
    this.categoryService.getAll().subscribe({
      next: (data) => {
        this.categories = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.isLoading = false;
      },
    });
  }

  // ====================== فتح المودال (إضافة جديدة) ======================
  openAddModal(): void {
    this.isEditMode = false;
    this.editingId = null;
    this.categoryForm.reset();
    this.selectedFile = null;
    this.imagePreview = null;
    this.modalInstance?.show();
  }

  // ====================== فتح المودال (تعديل) ======================
  openEditModal(category: Category): void {
    this.isEditMode = true;
    this.editingId = category.id;
    this.categoryForm.patchValue({
      title: category.title,
      description: category.description,
    });
    this.imagePreview = category.imageUrl;
    this.selectedFile = null;
    this.modalInstance?.show();
  }

  // ====================== إغلاق المودال (يدوي) ======================
  closeModal(): void {
    this.modalInstance?.hide();
  }

  // ====================== اختيار صورة + Preview ======================
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.imagePreview = URL.createObjectURL(file);
    }
  }

  // ====================== حفظ (Add or Update) ======================
  onSubmit(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    if (!this.selectedFile && !this.isEditMode) {
      this.showErrorModel('يرجي رفع صورة قسم صالحة');
      return; // مهم جدا عشان يمنع ارسال الداتا
    }

    const formData = new FormData();
    formData.append('Title', this.categoryForm.get('title')!.value);
    formData.append('Description', this.categoryForm.get('description')!.value);

    if (this.selectedFile) {
      formData.append('Image', this.selectedFile);
    }

    this.isLoading = true;

    const request$ =
      this.isEditMode && this.editingId
        ? this.categoryService.update(this.editingId, formData)
        : this.categoryService.create(formData);

    request$.subscribe({
      next: (res) => {
        this.showSuccessModel(
          this.isEditMode ? 'تم التعديل بنجاح' : 'تمت الإضافة بنجاح',
        );
        this.closeModal();
        this.loadCategories();
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessageModel = err.message;
        this.isLoading = false;
      },
    });
  }

  // ====================== حذف ======================
  deleteCategory(id: number): void {
    if (!confirm('هل أنت متأكد من حذف هذا القسم؟')) return;

    this.isLoading = true;
    this.categoryService.delete(id).subscribe({
      next: (res) => {
        this.showSuccess('تم الحذف بنجاح');
        this.loadCategories();
      },
      error: (err) => (this.errorMessage = err.message),
      complete: () => (this.isLoading = false),
    });
  }

  private showSuccess(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => (this.successMessage = null), 5000);
  }

  private showSuccessModel(msg: string): void {
    this.successMessageModel = msg;
    setTimeout(() => (this.successMessageModel = null), 5000);
  }

  private showErrorModel(msg: string): void {
    this.errorMessageModel = msg;
    setTimeout(() => (this.errorMessageModel = null), 5000);
  }

  goToCategory(categoryId: number) {
    this.router.navigate(['categories/main-category', categoryId]);
  }
}
