import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild, ElementRef, inject } from '@angular/core';
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
import { ToastService } from '../../../../core/services/toast.service';

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

  private readonly toast = inject(ToastService);

  @ViewChild('fileInput') private fileInputRef!: ElementRef<HTMLInputElement>;

  categoryId!: number;

  form: FormGroup;
  isEditMode = false;
  editingId: number | null = null;

  selectedFile: File | null = null;
  imagePreview: string | null = null;

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
        this.dashboardService.getById(this.categoryId).subscribe({
          next: (cat) => (this.categoryName = cat.title),
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

  loadCategories() {
    this.dashboardService.getAll().subscribe({
      next: (data) => (this.categories = data),
    });
  }

  loadAll() {
    this.service.getAll().subscribe({
      next: (data) => {
        this.subCategories = data;
        this.hasLoaded = true;
      },
      error: (err) => {
        this.toast.error(err.message);
        this.hasLoaded = true;
      },
    });
  }

  loadSubByCategory(id: number) {
    this.service.getByCategoryId(id).subscribe({
      next: (data) => {
        this.subCategories = data;
        this.hasLoaded = true;
      },
      error: (err) => {
        this.toast.error(err.message);
        this.hasLoaded = true;
      },
    });
  }

  openAddModal() {
    this.isEditMode = false;
    this.form.reset();
    this.selectedFile = null;
    this.imagePreview = null;
    this.fileInputRef.nativeElement.value = '';

    if (this.categoryId) {
      this.service.getNextSortOrder(this.categoryId).subscribe({
        next: (res) => {
          this.sorts = res.nextSortOrder;
          this.form.patchValue({
            sortOrder: res.nextSortOrder,
            categoryId: this.categoryId,
          });
        },
        error: () => this.toast.error('فشل الحصول على ترتيب العرض'),
      });
    } else {
      this.form.patchValue({ sortOrder: null, categoryId: null });
    }

    this.modalInstance.show();
  }

  openEditModal(id: number) {
    this.isEditMode = true;
    this.editingId = id;

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
      next: (res) => this.form.patchValue({ sortOrder: res.nextSortOrder }),
      error: () => this.toast.error('فشل الحصول على ترتيب العرض'),
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.imagePreview = URL.createObjectURL(file);
    }
  }

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
    } else if (this.isEditMode && this.imagePreview) {
      formData.append('Image', this.imagePreview);
    }

    const request$ = this.isEditMode
      ? this.service.update(this.editingId!, formData)
      : this.service.create(formData);

    request$.subscribe({
      next: () => {
        this.toast.success(this.isEditMode ? 'تم التعديل بنجاح' : 'تمت الإضافة بنجاح');
        this.modalInstance.hide();
        if (this.categoryId) {
          this.loadSubByCategory(this.categoryId);
        } else {
          this.loadAll();
        }
      },
      error: (err) => {
        if (err.error?.message === 'SortOrder already exists for this SubCategory') {
          this.toast.error('رقم ترتيب العرض مستخدم بالفعل، جرب رقم أكبر');
        } else {
          this.toast.error(err.message);
        }
      },
    });
  }

  async deleteSub(id: number) {
    const confirmed = await this.toast.confirm('هل أنت متأكد من حذف هذا القسم؟');
    if (!confirmed) return;

    this.service.delete(id).subscribe({
      next: () => {
        this.toast.success('تم الحذف بنجاح');
        if (this.categoryId) {
          this.loadSubByCategory(this.categoryId);
        } else {
          this.loadAll();
        }
      },
      error: (err) => this.toast.error(err.message),
    });
  }

  goToSubCategory(id: number) {
    this.router.navigate(['categories/sub-category', id]);
  }
}
