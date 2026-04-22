import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  inject,
} from '@angular/core';
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
import { ToastService } from '../../../../core/services/toast.service';

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

  private readonly toast = inject(ToastService);

  @ViewChild('fileInput') private fileInputRef!: ElementRef<HTMLInputElement>;

  headContentId!: number;

  form: FormGroup;
  isEditMode = false;
  editingId: number | null = null;

  selectedFile: File | null = null;
  imagePreview: string | null = null;

  selectedBlockType: string | null = null;
  dataLabel: string = '';

  public modalInstance: any;

  hasLoaded = false;
  selectedBlock: Product | null = null;
  modalInstanceSub: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: ProductService,
    private subService: SubCategoryService,
    private fb: FormBuilder,
  ) {
    this.form = this.fb.group({
      headContentId: [null, Validators.required],
      parentBlockId: [null],
      BlockType: [null, Validators.required],
      title: [''],
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
        this.subService.getById(this.headContentId).subscribe({
          next: (cat) => (this.headContentName = cat.title),
          error: (err) => console.error(err),
        });
        this.loadProduct(this.headContentId);
      }
    });
  }

  ngAfterViewInit() {
    const modal = document.getElementById('ProductModal');
    if (modal) {
      this.modalInstance = new (window as any).bootstrap.Modal(modal);
    }

    const subModal = document.getElementById('subBlocksModal');
    if (subModal) {
      this.modalInstanceSub = new (window as any).bootstrap.Modal(subModal);
    }
  }

  blockTypes = [
    { value: 'Text', label: 'نص' },
    { value: 'Image', label: 'صورة' },
    { value: 'ListItems', label: 'قائمة عناصر' },
    { value: 'VideoList', label: 'فيديوهات' },
  ];

  onBlockTypeChange() {
    this.selectedBlockType = this.form.get('BlockType')?.value;

    if (this.selectedBlockType === 'Text') this.dataLabel = 'الوصف';
    if (this.selectedBlockType === 'VideoList') this.dataLabel = 'لينك الفيديو';
    if (this.selectedBlockType === 'ListItems') this.dataLabel = 'الوصف';
  }

  getBlockTypeLabel(type: string) {
    const found = this.blockTypes.find((t) => t.value === type);
    return found ? found.label : type;
  }

  loadHeadContent() {
    this.subService.getAll().subscribe({
      next: (data) => (this.headcontents = data),
    });
  }

  loadProduct(id: number) {
    this.service.getByHeadContentId(id).subscribe({
      next: (data) => {
        this.Products = data;
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
    this.selectedBlockType = null;
    this.form.reset();
    this.selectedFile = null;
    this.imagePreview = null;
    if (this.fileInputRef) this.fileInputRef.nativeElement.value = '';
    
    if (this.headContentId) {
      this.service.getNextSortOrder(this.headContentId).subscribe({
        next: (res) => {
          this.sorts = res.nextSortOrder;
          this.form.patchValue({
            sortOrder: res.nextSortOrder,
            headContentId: this.headContentId,
          });
        },
        error: () => this.toast.error('فشل الحصول على ترتيب العرض'),
      });
    } else {
      this.form.patchValue({ sortOrder: null, headContentId: null });
    }

    this.modalInstance.show();
  }

  openAddSubBlock(parentId: number) {
    this.isEditMode = false;
    this.selectedBlockType = null;
    this.form.reset();
    this.selectedFile = null;
    this.imagePreview = null;
    if (this.fileInputRef) this.fileInputRef.nativeElement.value = '';

    this.form.patchValue({
      headContentId: this.headContentId,
      parentBlockId: parentId,
    });

    this.service.getNextSortOrder(this.headContentId).subscribe({
      next: (res) => this.form.patchValue({ sortOrder: res.nextSortOrder }),
    });

    this.modalInstance.show();
  }

  openEditModal(id: number) {
    if (this.modalInstanceSub) {
      this.modalInstanceSub.hide();
    }

    this.isEditMode = true;
    this.editingId = id;

    this.service.getById(id).subscribe({
      next: (data) => {
        this.selectedBlockType = data.type;

        this.form.patchValue({
          headContentId: data.headContentId,
          parentBlockId: data.parentBlockId,
          title: data.title,
          sortOrder: data.sortOrder,
          BlockType: data.type,
          DataJson: data.data?.text || data.data?.value || '',
        });

        this.imagePreview = data.imageUrl;

        setTimeout(() => this.modalInstance.show(), 200);
      },
    });
  }

  openSubBlocksModal(block: Product) {
    this.selectedBlock = block;
    this.modalInstanceSub.show();
  }

  onCategoryChange(event: any) {
    const headContentId = event.target.value;
    if (!headContentId) return;
    this.service.getNextSortOrder(headContentId).subscribe({
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

    const selectedBlockType = this.form.get('BlockType')?.value;
    if (
      (selectedBlockType === 'Image' || selectedBlockType === 'ListItems') &&
      !this.selectedFile &&
      !this.isEditMode
    ) {
      this.toast.error('يرجي رفع صورة محتوي صالحة');
      return;
    }

    const formData = new FormData();
    formData.append('HeadContentId', this.form.get('headContentId')?.value);
    const parentId = this.form.get('parentBlockId')?.value;
    if (parentId) formData.append('ParentBlockId', parentId);
    const titleValue = this.form.get('title')?.value;
    formData.append('Title', titleValue ? titleValue : '');
    formData.append('SortOrder', this.form.get('sortOrder')?.value);
    formData.append('BlockType', this.form.get('BlockType')?.value);

    const dataValue = this.form.get('DataJson')?.value;
    formData.append('DataJson', JSON.stringify(dataValue ? { value: dataValue } : {}));

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
        if (this.headContentId) this.loadProduct(this.headContentId);
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

  async deleteProduct(id: number) {
    const confirmed = await this.toast.confirm('هل أنت متأكد من حذف هذا البلوك؟');
    if (!confirmed) return;

    this.service.delete(id).subscribe({
      next: () => {
        this.toast.success('تم الحذف بنجاح');
        if (this.headContentId) this.loadProduct(this.headContentId);
      },
      error: (err) => this.toast.error(err.message),
    });
  }

  formatDate(date: string): string {
    return date.split('T')[0];
  }
}
