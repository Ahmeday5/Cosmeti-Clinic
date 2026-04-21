import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TermsService } from '../../services/terms.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Terms } from '../../models/terms.model';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './terms.component.html',
  styleUrl: './terms.component.scss',
})
export class TermsComponent implements OnInit {
  terms: Terms | null = null;
  content: string = '';
  hasLoaded = false;
  isSaving = false;

  private readonly termsService = inject(TermsService);
  private readonly toast = inject(ToastService);

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.termsService.get().subscribe({
      next: (data) => {
        this.terms = data;
        this.content = data.content;
        this.hasLoaded = true;
      },
      error: (err) => {
        this.toast.error(err.message);
        this.hasLoaded = true;
      },
    });
  }

  save(): void {
    if (!this.content.trim()) {
      this.toast.error('المحتوى لا يمكن أن يكون فارغاً');
      return;
    }

    this.isSaving = true;
    this.termsService.update({ content: this.content }).subscribe({
      next: () => {
        this.toast.success('تم حفظ الشروط والأحكام بنجاح');
        this.isSaving = false;
        if (this.terms) {
          this.terms.updatedAt = new Date().toISOString();
        }
      },
      error: (err) => {
        this.toast.error(err.message);
        this.isSaving = false;
      },
    });
  }

  formatDate(iso: string): string {
    return iso.split('T')[0];
  }
}
