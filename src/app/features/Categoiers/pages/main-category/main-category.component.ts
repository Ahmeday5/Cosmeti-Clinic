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
import { SubCategoryService } from '../../services/sub-category.service';
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

  successMessage: string | null = null;
  errorMessage: string | null = null;

  categoryId!: number;
  isLoading = false;

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
    private mainCategoryService: MainCategoryService,
    private service: MainCategoryService,
    private dashboardService: DashboardService,
    private fb: FormBuilder,
  ) {
    this.form = this.fb.group({
      categoryId: ['', Validators.required],

      title: ['', [Validators.required, Validators.minLength(3)]],

      description: ['', [Validators.required, Validators.minLength(10)]],

      sortOrder: [],
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
    this.isLoading = true;
    this.service.getAll().subscribe({
      next: (data) => {
        this.subCategories = data;
        this.isLoading = false;
      },

      error: (err) => {
        this.errorMessage = err.message;
        this.isLoading = false;
      },
    });
  }

  // ======================
  // LOAD BY CATEGORY
  // ======================

  loadSubByCategory(id: number) {
    this.isLoading = true;

    this.service.getByCategoryId(id).subscribe({
      next: (data) => {
        this.subCategories = data;
        this.isLoading = false;
      },

      error: (err) => {
        this.errorMessage = err.message;
        this.isLoading = false;
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

    // enable the sortOrder temporarily
    this.form.get('sortOrder')?.enable();

    this.service.getNextSortOrder(this.categoryId).subscribe({
      next: (res) => {
        this.sorts = res.nextSortOrder; // احفظ الرقم في المتغير
        this.form.patchValue({
          sortOrder: res.nextSortOrder,
          categoryId: this.categoryId,
        });
      },
      error: (err) => {
        this.errorMessage = 'فشل الحصول على ترتيب العرض';
        console.error(err);
      },
    });

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

    const formData = new FormData();
    formData.append('CategoryId', this.form.get('categoryId')?.value);
    formData.append('Title', this.form.get('title')?.value);
    formData.append('Description', this.form.get('description')?.value);
    formData.append('SortOrder', this.form.get('sortOrder')?.value);

    if (this.selectedFile) {
      formData.append('Image', this.selectedFile);
    }

    this.isLoading = true;

    const request$ = this.isEditMode
      ? this.service.update(this.editingId!, formData)
      : this.service.create(formData);

    request$.subscribe({
      next: () => {
        this.showSuccess(
          this.isEditMode ? 'تم التعديل بنجاح' : 'تمت الإضافة بنجاح',
        );

        this.modalInstance.hide();
        this.loadSubByCategory(this.categoryId);
        this.isLoading = false;
      },

      error: (err) => {
        this.errorMessage = err.message;
        this.isLoading = false;
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
        this.loadSubByCategory(this.categoryId);
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
    }, 4000);
  }

  goToSubCategory(id: number) {
    this.router.navigate(['categories/sub-category', id]);
  }
}
