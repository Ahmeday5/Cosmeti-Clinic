import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-block',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-block.component.html',
  styleUrl: './product-block.component.scss',
})
export class ProductBlockComponent {
  @Input() product: any;
  @Output() addSub = new EventEmitter<number>();
  @Input() isSubBlock: boolean = false;
  @Output() viewSub = new EventEmitter<any>();

  getBlockTypeLabel(type: string) {
    const map: any = {
      Text: 'نص',
      Image: 'صورة',
      ListItems: 'قائمة عناصر',
      VideoList: 'فيديوهات',
    };
    return map[type] || type;
  }

  @Output() edit = new EventEmitter<number>();
  @Output() delete = new EventEmitter<number>();
}
