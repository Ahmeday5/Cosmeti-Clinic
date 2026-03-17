import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { headcontent } from '../../../Categoiers/models/sub-category.model';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { SubCategoryService } from '../../../Categoiers/services/sub-category.service';
import { ProductBlockComponent } from '../../../../shared/components/product-block/product-block.component';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ProductBlockComponent,
  ],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss',
})
export class ProductComponent implements OnInit, AfterViewInit {
  Products: Product[] = [];
  headcontents: headcontent[] = [];

  sorts: any;
  headContentName: string = '';

  successMessage: string | null = null;
  errorMessage: string | null = null;

  errorMessageModel: string | null = null;

  headContentId!: number;

  form: FormGroup;
  isEditMode = false;
  editingId: number | null = null;

  selectedFile: File | null = null;
  imagePreview: string | null = null;

  selectedBlockType: string | null = null;
  dataLabel: string = '';

  // modal
  public modalInstance: any;

  hasLoaded = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: ProductService,
    private subService: SubCategoryService,
    private fb: FormBuilder,
  ) {
    this.form = this.fb.group({
      headContentId: [null, Validators.required],
      BlockType: [null, Validators.required],
      title: ['', Validators.required],
      sortOrder: ['', Validators.required],
      DataJson: [''],
    });
  }

  ngOnInit() {
    this.loadHeadContent();

    this.route.paramMap.subscribe((params) => {
      const id = params.get('headContentId');

      if (id) {
        this.headContentId = +id;
        // جلب اسم المحتوي الراسي
        this.subService.getById(this.headContentId).subscribe({
          next: (cat) => {
            this.headContentName = cat.title;
          },
          error: (err) => console.error(err),
        });
        this.loadProduct(this.headContentId);
      }
    });
  }

  ngAfterViewInit() {
    const modal = document.getElementById('subCategoryModal');

    if (modal) {
      this.modalInstance = new (window as any).bootstrap.Modal(modal);
    }
  }

  //============================
  //blockType
  //============================

  blockTypes = [
    { value: 'Text', label: 'نص' },
    { value: 'Image', label: 'صورة' },
    { value: 'ListItems', label: 'قائمة عناصر' },
    { value: 'VideoList', label: 'فيديوهات' },
  ];

  onBlockTypeChange() {
    this.selectedBlockType = this.form.get('BlockType')?.value;

    if (this.selectedBlockType === 'Text') {
      this.dataLabel = 'الوصف';
    }

    if (this.selectedBlockType === 'VideoList') {
      this.dataLabel = 'لينك الفيديو';
    }

    if (this.selectedBlockType === 'ListItems') {
      this.dataLabel = 'الوصف';
    }
  }

  getBlockTypeLabel(type: string) {
    const found = this.blockTypes.find((t) => t.value === type);
    return found ? found.label : type;
  }

  // =========================
  // تحميل HeadContent
  // =========================

  loadHeadContent() {
    this.subService.getAll().subscribe({
      next: (data) => (this.headcontents = data),
    });
  }

  // ======================
  // LOAD BY CATEGORY
  // ======================

  loadProduct(id: number) {
    this.service.getByHeadContentId(id).subscribe({
      next: (data) => {
        this.Products = data;
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
    if (this.headContentId) {
      this.service.getNextSortOrder(this.headContentId).subscribe({
        next: (res) => {
          this.sorts = res.nextSortOrder;

          this.form.patchValue({
            sortOrder: res.nextSortOrder,
            headContentId: this.headContentId,
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
        headContentId: null,
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
        this.selectedBlockType = data.type;
        this.form.patchValue({
          headContentId: data.headContentId,
          title: data.title,
          sortOrder: data.sortOrder,
          BlockType: data.type,
          DataJson: data.data?.text || data.data?.value || '',
        });

        this.imagePreview = data.imageUrl;
        this.modalInstance.show();
      },
    });
  }

  onCategoryChange(event: any) {
    const headContentId = event.target.value;
    if (!headContentId) return;
    this.service.getNextSortOrder(headContentId).subscribe({
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

    const selectedBlockType = this.form.get('BlockType')?.value;
    if (
      (selectedBlockType === 'Image' || selectedBlockType === 'ListItems') &&
      !this.selectedFile &&
      !this.isEditMode
    ) {
      this.showErrorModel('يرجي رفع صورة محتوي صالحة');
      return;
    }

    const formData = new FormData();
    formData.append('HeadContentId', this.form.get('headContentId')?.value);
    formData.append('Title', this.form.get('title')?.value);
    formData.append('SortOrder', this.form.get('sortOrder')?.value);
    formData.append('BlockType', this.form.get('BlockType')?.value);

    //==========================dataJson====================
    const dataValue = this.form.get('DataJson')?.value;
    let dataJson = {};
    if (dataValue) {
      dataJson = {
        value: dataValue,
      };
    }
    formData.append('DataJson', JSON.stringify(dataJson));

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
        if (this.headContentId) {
          this.loadProduct(this.headContentId);
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

  deleteProduct(id: number) {
    if (!confirm('هل تريد الحذف؟')) return;

    this.service.delete(id).subscribe({
      next: () => {
        this.showSuccess('تم الحذف بنجاح');
        if (this.headContentId) {
          this.loadProduct(this.headContentId);
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

  // دالة لتنسيق التاريخ
  formatDate(date: string): string {
    return date.split('T')[0]; // استخراج YYYY-MM-DD فقط
  }
}
