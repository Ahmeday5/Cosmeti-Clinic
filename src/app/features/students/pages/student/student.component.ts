import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { Country, Student } from '../../models/student.model';
import { StudentService } from '../../services/student.service';

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  templateUrl: './student.component.html',
  styleUrl: './student.component.scss',
})
export class StudentComponent implements OnInit, OnDestroy {
  // ==========================
  // State
  // ==========================
  students: Student[] = [];
  countries: Country[] = [];

  totalCount = 0;
  currentPage = 1;
  readonly pageSize = 10;

  searchQuery = '';
  selectedCountryId: number | null = null;

  hasLoaded = false;
  isLoading = false;
  errorMessage: string | null = null;

  // Activation state
  activatingId: number | null = null;
  activationSuccess: string | null = null;
  activationError: string | null = null;

  private readonly searchSubject = new Subject<string>();
  private readonly subs = new Subscription();

  constructor(private readonly studentService: StudentService) {}

  // ==========================
  // Lifecycle
  // ==========================
  ngOnInit(): void {
    this.loadCountries();
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

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  // ==========================
  // Computed
  // ==========================
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

  // ==========================
  // Load Data
  // ==========================
  private loadStudents(): void {
    this.isLoading = true;
    this.errorMessage = null;

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
          this.errorMessage = err.message;
          this.hasLoaded = true;
          this.isLoading = false;
        },
      });
  }

  private loadCountries(): void {
    this.studentService.getCountries().subscribe({
      next: (data) => (this.countries = data),
      error: () => {}, // silent — filter still works without this
    });
  }

  // ==========================
  // Event Handlers
  // ==========================
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

  // ==========================
  // Toggle Activation
  // ==========================
  toggleActivation(student: Student): void {
    if (this.activatingId !== null) return; // منع double-click

    const newStatus = !student.isActive;
    this.activatingId = student.id;
    this.activationSuccess = null;
    this.activationError = null;

    this.studentService.toggleActivation(student.id, newStatus).subscribe({
      next: (res) => {
        // تحديث الحالة محلياً بدون إعادة تحميل كل البيانات
        student.isActive = newStatus;
        this.activatingId = null;
        this.showActivationSuccess(res.message);
      },
      error: (err) => {
        this.activatingId = null;
        this.showActivationError(err.message);
      },
    });
  }

  // ==========================
  // Helpers
  // ==========================
  private showActivationSuccess(msg: string): void {
    this.activationSuccess = msg;
    setTimeout(() => (this.activationSuccess = null), 3500);
  }

  private showActivationError(msg: string): void {
    this.activationError = msg;
    setTimeout(() => (this.activationError = null), 4000);
  }

  formatDate(dateStr: string): string {
    return dateStr.split('T')[0];
  }

  trackByStudentId(_: number, student: Student): number {
    return student.id;
  }
}
