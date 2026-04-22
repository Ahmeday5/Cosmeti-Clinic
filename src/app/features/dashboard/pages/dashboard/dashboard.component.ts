import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { Category, CategoryTypes } from '../../models/dashboard.model';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, AfterViewInit {
  categories: Category[] = [];
  CategoriesTypes: CategoryTypes[] = [];
  hasLoaded = false;

  private readonly toast = inject(ToastService);

  @ViewChild('fileInput') private fileInputRef!: ElementRef<HTMLInputElement>;

  categoryForm: FormGroup;
  isEditMode = false;
  editingId: number | null = null;
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  private modalInstance: any;

  constructor(
    private categoryService: DashboardService,
    private fb: FormBuilder,
    private router: Router,
  ) {
    this.categoryForm = this.fb.group({
      category: ['', [Validators.required]],
      title: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadCategoriesTypes();
  }

  ngAfterViewInit(): void {
    const modalElement = document.getElementById('addSectionModal') as HTMLElement;
    if (modalElement) {
      this.modalInstance = new (window as any).bootstrap.Modal(modalElement, {
        keyboard: false,
      });
    }
  }

  loadCategoriesTypes(): void {
    this.categoryService.getCategoryTypes().subscribe({
      next: (data) => {
        this.CategoriesTypes = data;
        this.hasLoaded = true;
      },
      error: (err) => {
        this.toast.error(err.message);
        this.hasLoaded = true;
      },
    });
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (data) => {
        console.log(data);
        this.categories = data;
        this.hasLoaded = true;
      },
      error: (err) => {
        this.toast.error(err.message);
        this.hasLoaded = true;
      },
    });
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.editingId = null;
    this.categoryForm.reset();
    this.selectedFile = null;
    this.imagePreview = null;
    this.fileInputRef.nativeElement.value = '';
    this.modalInstance?.show();
  }

  openEditModal(category: Category): void {
    this.isEditMode = true;
    this.editingId = category.id;
    this.categoryForm.patchValue({
      category: category.category,
      title: category.title,
      description: category.description,
    });
    this.imagePreview = category.imageUrl;
    this.selectedFile = null;
    this.modalInstance?.show();
  }

  closeModal(): void {
    this.modalInstance?.hide();
  }

  onCategoryTypeChange(event: Event): void {
    const name = (event.target as HTMLSelectElement).value;
    const selected = this.CategoriesTypes.find((t) => t.name === name);
    if (selected) {
      this.categoryForm.patchValue({
        category: selected.name,
        title: selected.arabicName,
      });
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.imagePreview = URL.createObjectURL(file);
    }
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    if (!this.selectedFile && !this.isEditMode) {
      this.toast.error('يرجي رفع صورة قسم صالحة');
      return;
    }

    const formData = new FormData();
    formData.append('Title', this.categoryForm.get('title')!.value);
    formData.append('Description', this.categoryForm.get('description')!.value);
    formData.append('Category', this.categoryForm.get('category')!.value);

    if (this.selectedFile) {
      formData.append('Image', this.selectedFile);
    }

    const request$ = this.isEditMode && this.editingId
      ? this.categoryService.update(this.editingId, formData)
      : this.categoryService.create(formData);

    request$.subscribe({
      next: () => {
        this.toast.success(this.isEditMode ? 'تم التعديل بنجاح' : 'تمت الإضافة بنجاح');
        this.closeModal();
        this.loadCategories();
      },
      error: (err) => this.toast.error(err.message),
    });
  }

  async deleteCategory(id: number): Promise<void> {
    const confirmed = await this.toast.confirm('هل أنت متأكد من حذف هذا القسم؟');
    if (!confirmed) return;

    this.categoryService.delete(id).subscribe({
      next: () => {
        this.toast.success('تم الحذف بنجاح');
        this.loadCategories();
      },
      error: (err) => this.toast.error(err.message),
    });
  }

  goToCategory(categoryId: number) {
    this.router.navigate(['categories/main-category', categoryId]);
  }
}
