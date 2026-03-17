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
import { headcontent } from '../../models/sub-category.model';

@Component({
  selector: 'app-sub-category',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './sub-category.component.html',
  styleUrl: './sub-category.component.scss',
})
export class SubCategoryComponent implements OnInit, AfterViewInit {
  headcontents: headcontent[] = [];
  subCategories: SubCategory[] = [];

  sorts: any;
  subCategoryName: string = '';

  successMessage: string | null = null;
  errorMessage: string | null = null;

  errorMessageModel: string | null = null;

  SubCategoryId!: number;
   hasLoaded = false;

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
    private service: SubCategoryService,
    private mainService: MainCategoryService,
    private fb: FormBuilder,
  ) {
    this.form = this.fb.group({
      SubCategoryId: [null, Validators.required],
      title: ['', [Validators.required, Validators.minLength(3)]],
      sortOrder: ['', [Validators.required]],
      IsPublished: [true],
      LayoutType: ['Generic'],
    });
  }

  ngOnInit() {
    this.loadSubCategories();

    this.route.paramMap.subscribe((params) => {
      const id = params.get('subcategoryId');

      if (id) {
        this.SubCategoryId = +id;
        // جلب اسم الكاتجوري
        this.mainService.getById(this.SubCategoryId).subscribe({
          next: (cat) => {
            this.subCategoryName = cat.title;
          },
          error: (err) => console.error(err),
        });
        this.loadHeadContent(this.SubCategoryId);
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

  loadSubCategories() {
    this.mainService.getAll().subscribe({
      next: (data) => (this.subCategories = data),
    });
  }

  // ======================
  // LOAD ALL
  // ======================

  loadAll() {
    this.service.getAll().subscribe({
      next: (data) => {
        this.headcontents = data;
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

  loadHeadContent(id: number) {

    this.service.getBySubCategoryId(id).subscribe({
      next: (data) => {
        this.headcontents = data;
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
    if (this.SubCategoryId) {
      this.service.getNextSortOrder(this.SubCategoryId).subscribe({
        next: (res) => {
          this.sorts = res.nextSortOrder;

          this.form.patchValue({
            sortOrder: res.nextSortOrder,
            SubCategoryId: this.SubCategoryId,
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
        SubCategoryId: null,
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
          SubCategoryId: data.subCategoryId,
          title: data.title,
          sortOrder: data.sortOrder,
          IsPublished: true,
          LayoutType: 'Generic',
        });

        this.imagePreview = data.imageUrl;
        this.modalInstance.show();
      },
    });
  }

  onCategoryChange(event: any) {
    const SubCategoryId = event.target.value;
    if (!SubCategoryId) return;
    this.service.getNextSortOrder(SubCategoryId).subscribe({
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
      this.showErrorModel('يرجي رفع صورة محتوي صالحة');
      return; // مهم جدا عشان يمنع ارسال الداتا
    }

    const formData = new FormData();
    formData.append('SubCategoryId', this.form.get('SubCategoryId')?.value);
    formData.append('Title', this.form.get('title')?.value);
    formData.append('SortOrder', this.form.get('sortOrder')?.value);
    formData.append('LayoutType', 'Generic');
    formData.append('IsPublished', 'true');

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
        if (this.SubCategoryId) {
          this.loadHeadContent(this.SubCategoryId);
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

  deleteHead(id: number) {
    if (!confirm('هل تريد الحذف؟')) return;

    this.service.delete(id).subscribe({
      next: () => {
        this.showSuccess('تم الحذف بنجاح');
        if (this.SubCategoryId) {
          this.loadHeadContent(this.SubCategoryId);
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
    }, 4000);
  }

  private showErrorModel(msg: string): void {
    this.errorMessageModel = msg;
    setTimeout(() => (this.errorMessageModel = null), 5000);
  }

  goToProducts(id: number) {
    this.router.navigate(['Products/product', id]);
  }

  // دالة لتنسيق التاريخ
  formatDate(date: string): string {
    return date.split('T')[0]; // استخراج YYYY-MM-DD فقط
  }
}
