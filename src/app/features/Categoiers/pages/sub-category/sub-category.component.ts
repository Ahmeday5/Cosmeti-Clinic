import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-sub-category',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sub-category.component.html',
  styleUrl: './sub-category.component.scss'
})


export class SubCategoryComponent {
  constructor(private router: Router) {}

  goToProducts() {
    this.router.navigate(['Products/product']);
  }
}
