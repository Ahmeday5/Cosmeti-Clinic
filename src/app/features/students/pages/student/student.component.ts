import { CommonModule } from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit,
  AfterViewInit,
  inject,
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { Country, Student } from '../../models/student.model';
import { StudentService } from '../../services/student.service';
import { ToastService } from '../../../../core/services/toast.service';
import { CategoryTypes } from '../../../dashboard/models/dashboard.model';

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  templateUrl: './student.component.html',
  styleUrl: './student.component.scss',
})
export class StudentComponent implements OnInit, AfterViewInit, OnDestroy {
  // ── Data ────────────────────────────────────────────────────────────────────
  students: Student[] = [];
  countries: Country[] = [];
  allCategoryTypes: CategoryTypes[] = [];

  // ── Pagination ──────────────────────────────────────────────────────────────
  totalCount = 0;
  currentPage = 1;
  readonly pageSize = 10;

  // ── Filters ─────────────────────────────────────────────────────────────────
  searchQuery = '';
  selectedCountryId: number | null = null;

  // ── State ───────────────────────────────────────────────────────────────────
  hasLoaded = false;
  isLoading = false;
  activatingId: number | null = null;

  // ── Category Types Modal ─────────────────────────────────────────────────────
  editingStudent: Student | null = null;
  selectedTypes: string[] = [];
  isSavingTypes = false;
  private categoryModalInstance: any;

  private readonly toast = inject(ToastService);
  private readonly searchSubject = new Subject<string>();
  private readonly subs = new Subscription();

  constructor(private readonly studentService: StudentService) {}

  // ── Lifecycle ───────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadCountries();
    this.loadCategoryTypes();
    this.loadStudents();

    const searchSub = this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((query) => {
        this.searchQuery = query;
        this.currentPage = 1;
        this.loadStudents();
      });

    this.subs.add(searchSub);
  }

  ngAfterViewInit(): void {
    const modal = document.getElementById('categoryTypesModal');
    if (modal) {
      this.categoryModalInstance = new (window as any).bootstrap.Modal(modal);
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  // ── Computed ────────────────────────────────────────────────────────────────
  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize) || 1;
  }

  get startItem(): number {
    if (this.totalCount === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalCount);
  }

  // ── Data Loaders ─────────────────────────────────────────────────────────────
  private loadStudents(): void {
    this.isLoading = true;

    this.studentService
      .getStudents({
        pageIndex: this.currentPage,
        pageSize: this.pageSize,
        search: this.searchQuery || undefined,
        countryId: this.selectedCountryId ?? undefined,
      })
      .subscribe({
        next: (res) => {
          this.students = res.data;
          this.totalCount = res.totalCount;
          this.hasLoaded = true;
          this.isLoading = false;
        },
        error: (err) => {
          this.toast.error(err.message);
          this.hasLoaded = true;
          this.isLoading = false;
        },
      });
  }

  private loadCountries(): void {
    this.studentService.getCountries().subscribe({
      next: (data) => (this.countries = data),
      error: () => {},
    });
  }

  private loadCategoryTypes(): void {
    this.studentService.getCategoryTypes().subscribe({
      next: (data) => (this.allCategoryTypes = data),
      error: () => {},
    });
  }

  // ── Category Types Helpers ───────────────────────────────────────────────────
  getArabicName(englishName: string): string {
    const found = this.allCategoryTypes.find((t) => t.name === englishName);
    return found ? found.arabicName : englishName;
  }

  openCategoryTypesModal(student: Student): void {
    this.editingStudent = student;
    this.selectedTypes = [...(student.categoryTypes ?? [])];
    this.categoryModalInstance?.show();
  }

  closeCategoryTypesModal(): void {
    this.categoryModalInstance?.hide();
    this.editingStudent = null;
    this.selectedTypes = [];
  }

  isTypeSelected(name: string): boolean {
    return this.selectedTypes.includes(name);
  }

  toggleType(name: string): void {
    if (this.isTypeSelected(name)) {
      this.selectedTypes = this.selectedTypes.filter((t) => t !== name);
    } else {
      this.selectedTypes = [...this.selectedTypes, name];
    }
  }

  saveCategoryTypes(): void {
    if (!this.editingStudent) return;

    this.isSavingTypes = true;
    this.studentService
      .updateCategoryTypes(this.editingStudent.id, {
        categoryTypes: this.selectedTypes,
      })
      .subscribe({
        next: () => {
          this.editingStudent!.categoryTypes = [...this.selectedTypes];
          this.toast.success('تم تحديث التخصصات بنجاح');
          this.closeCategoryTypesModal();
          this.isSavingTypes = false;
        },
        error: (err) => {
          this.toast.error(err.message);
          this.isSavingTypes = false;
        },
      });
  }

  // ── Events ──────────────────────────────────────────────────────────────────
  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  onCountryChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedCountryId = value ? +value : null;
    this.currentPage = 1;
    this.loadStudents();
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.loadStudents();
  }

  async toggleActivation(student: Student): Promise<void> {
    const confirmed = await this.toast.confirm(
      `هل أنت متأكد من تغيير حالة الطالب ${student.name}؟`,
    );
    if (!confirmed) return;
    if (this.activatingId !== null) return;

    const newStatus = !student.isActive;
    this.activatingId = student.id;

    this.studentService.toggleActivation(student.id, newStatus).subscribe({
      next: (res) => {
        student.isActive = newStatus;
        this.activatingId = null;
        this.toast.success(res.message);
      },
      error: (err) => {
        this.activatingId = null;
        this.toast.error(err.message);
      },
    });
  }

  async deleteStudent(student: Student): Promise<void> {
    const confirmed = await this.toast.confirm(
      `هل أنت متأكد من حذف الطالب ${student.name}؟`,
    );
    if (!confirmed) return;

    this.studentService.delete(student.id).subscribe({
      next: (res) => {
        this.toast.success(res.message);
        this.loadStudents();
      },
      error: (err) => {
        this.toast.error(err.message);
      },
    });
  }

  // ── Utils ────────────────────────────────────────────────────────────────────
  formatDate(dateStr: string): string {
    return dateStr.split('T')[0];
  }

  trackByStudentId(_: number, student: Student): number {
    return student.id;
  }
}
