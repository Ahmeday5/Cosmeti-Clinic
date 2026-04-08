import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MainCategoryService } from '../../services/main-category.service';
import { SubCategory } from '../../models/main-category.model';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Category } from '../../../dashboard/models/dashboard.model';
import { DashboardService } from '../../../dashboard/services/dashboard.service';

@Component({
  selector: 'app-main-category',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './main-category.component.html',
  styleUrl: './main-category.component.scss',
})
export class MainCategoryComponent implements OnInit, AfterViewInit {
  subCategories: SubCategory[] = [];
  categories: Category[] = [];

  sorts: any;
  categoryName: string = '';
  hasLoaded = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  errorMessageModel: string | null = null;

  categoryId!: number;

  form: FormGroup;
  isEditMode = false;
  editingId: number | null = null;

  selectedFile: File | null = null;
  imagePreview: string | null = null;

  // modal
  public modalInstance: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: MainCategoryService,
    private dashboardService: DashboardService,
    private fb: FormBuilder,
  ) {
    this.form = this.fb.group({
      categoryId: [null, Validators.required],

      title: ['', [Validators.required, Validators.minLength(3)]],

      description: ['', [Validators.required, Validators.minLength(10)]],

      sortOrder: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    this.loadCategories();

    this.route.paramMap.subscribe((params) => {
      const id = params.get('categoryId');

      if (id) {
        this.categoryId = +id;
        // جلب اسم الكاتجوري
        this.dashboardService.getById(this.categoryId).subscribe({
          next: (cat) => {
            this.categoryName = cat.title;
          },
          error: (err) => console.error(err),
        });
        this.loadSubByCategory(this.categoryId);
      } else {
        this.loadAll();
      }
    });
  }

  ngAfterViewInit() {
    const modal = document.getElementById('subCategoryModal');

    if (modal) {
      this.modalInstance = new (window as any).bootstrap.Modal(modal);
    }
  }

  // =========================
  // تحميل السب كاتجوري
  // =========================

  loadCategories() {
    this.dashboardService.getAll().subscribe({
      next: (data) => (this.categories = data),
    });
  }

  // ======================
  // LOAD ALL
  // ======================

  loadAll() {
    this.service.getAll().subscribe({
      next: (data) => {
        this.subCategories = data;
        this.hasLoaded = true;
      },

      error: (err) => {
        this.errorMessage = err.message;
        this.hasLoaded = true;
      },
    });
  }

  // ======================
  // LOAD BY CATEGORY
  // ======================

  loadSubByCategory(id: number) {

    this.service.getByCategoryId(id).subscribe({
      next: (data) => {
        this.subCategories = data;
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
  openAddModal() {
    this.isEditMode = false;
    this.form.reset();

    this.selectedFile = null;
    this.imagePreview = null;

    // لو الصفحة مفتوحة بكاتجوري
    if (this.categoryId) {
      this.service.getNextSortOrder(this.categoryId).subscribe({
        next: (res) => {
          this.sorts = res.nextSortOrder;

          this.form.patchValue({
            sortOrder: res.nextSortOrder,
            categoryId: this.categoryId,
          });
        },
        error: () => {
          this.errorMessage = 'فشل الحصول على ترتيب العرض';
        },
      });
    } else {
      // المستخدم لازم يختار الكاتجوري
      this.form.patchValue({
        sortOrder: null,
        categoryId: null,
      });
    }

    this.modalInstance.show();
  }

  // ======================
  // EDIT MODAL
  // ======================

  openEditModal(id: number) {
    this.isEditMode = true;
    this.editingId = id;

    // get by id
    this.service.getById(id).subscribe({
      next: (data) => {
        this.form.patchValue({
          categoryId: data.categoryId,
          title: data.title,
          description: data.description,
          sortOrder: data.sortOrder,
        });

        this.imagePreview = data.imageUrl;
        this.modalInstance.show();
      },
    });
  }

  onCategoryChange(event: any) {
    const categoryId = event.target.value;
    if (!categoryId) return;
    this.service.getNextSortOrder(categoryId).subscribe({
      next: (res) => {
        this.form.patchValue({
          sortOrder: res.nextSortOrder,
        });
      },
      error: () => {
        this.errorMessageModel = 'فشل الحصول على ترتيب العرض';
      },
    });
  }
  // ======================
  // FILE SELECT
  // ======================

  onFileSelected(event: any) {
    const file = event.target.files[0];

    if (file) {
      this.selectedFile = file;
      this.imagePreview = URL.createObjectURL(file);
    }
  }

  // ======================
  // SUBMIT
  // ======================

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.selectedFile && !this.isEditMode) {
      this.showErrorModel('يرجي رفع صورة قسم صالحة');
      return; // مهم جدا عشان يمنع ارسال الداتا
    }

    const formData = new FormData();
    formData.append('CategoryId', this.form.get('categoryId')?.value);
    formData.append('Title', this.form.get('title')?.value);
    formData.append('Description', this.form.get('description')?.value);
    formData.append('SortOrder', this.form.get('sortOrder')?.value);

    if (this.selectedFile) {
      formData.append('Image', this.selectedFile);
    } else if (this.isEditMode && this.imagePreview) {
      formData.append('Image', this.imagePreview);
    }

    const request$ = this.isEditMode
      ? this.service.update(this.editingId!, formData)
      : this.service.create(formData);

    request$.subscribe({
      next: () => {
        this.showSuccess(
          this.isEditMode ? 'تم التعديل بنجاح' : 'تمت الإضافة بنجاح',
        );
        this.modalInstance.hide();
        if (this.categoryId) {
          this.loadSubByCategory(this.categoryId);
        } else {
          this.loadAll();
        }
      },
      error: (err) => {
        if (
          err.error?.message === 'SortOrder already exists for this SubCategory'
        ) {
          this.showErrorModel('رقم ترتيب العرض مستخدم بالفعل، جرب رقم أكبر');
        } else {
          this.errorMessageModel = err.message;
        }
      },
    });
  }

  // ======================
  // DELETE
  // ======================

  deleteSub(id: number) {
    if (!confirm('هل تريد الحذف؟')) return;

    this.service.delete(id).subscribe({
      next: () => {
        this.showSuccess('تم الحذف بنجاح');
        if (this.categoryId) {
          this.loadSubByCategory(this.categoryId);
        } else {
          this.loadAll();
        }
      },
      error: (err) => (this.errorMessage = err.message),
    });
  }

  // ======================
  // SUCCESS
  // ======================

  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => {
      this.successMessage = null;
    }, 3000);
  }

  private showErrorModel(msg: string): void {
    this.errorMessageModel = msg;
    setTimeout(() => (this.errorMessageModel = null), 5000);
  }

  goToSubCategory(id: number) {
    this.router.navigate(['categories/sub-category', id]);
  }
}
