import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';

interface PageItem {
  type: 'page' | 'ellipsis';
  value?: number;
}

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
})
export class PaginationComponent implements OnChanges {
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 0;
  @Input() windowSize: number = 2;

  @Output() pageChange = new EventEmitter<number>();

  pages: PageItem[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentPage'] || changes['totalPages']) {
      this.pages = this.buildPages();
    }
  }

  private buildPages(): PageItem[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const win = this.windowSize;
    const result: PageItem[] = [];

    // عدد صفحات صغير — اعرض كلها بدون ellipsis
    if (total <= 2 * win + 3) {
      for (let i = 1; i <= total; i++) {
        result.push({ type: 'page', value: i });
      }
      return result;
    }

    // الصفحة الأولى دائماً
    result.push({ type: 'page', value: 1 });

    let start = Math.max(2, current - win);
    let end = Math.min(total - 1, current + win);

    // قرب من البداية
    if (current <= win + 1) {
      end = 2 * win + 1;
    }
    // قرب من النهاية
    else if (current >= total - win) {
      start = total - 2 * win;
    }

    if (start > 2) {
      result.push({ type: 'ellipsis' });
    }

    for (let i = start; i <= end; i++) {
      result.push({ type: 'page', value: i });
    }

    if (end < total - 1) {
      result.push({ type: 'ellipsis' });
    }

    // الصفحة الأخيرة دائماً
    if (total > 1) {
      result.push({ type: 'page', value: total });
    }

    return result;
  }

  go(page: number | undefined): void {
    if (
      typeof page !== 'number' ||
      page < 1 ||
      page > this.totalPages ||
      page === this.currentPage
    ) return;

    this.pageChange.emit(page);
  }
}
