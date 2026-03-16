import { Routes } from '@angular/router';

export const MAIN_CATEGORY_ROUTES: Routes = [
  {
    path: 'main-category',
    loadComponent: () =>
      import('./pages/main-category/main-category.component').then(
        (m) => m.MainCategoryComponent,
      ),
    title: 'الأقسام الفرعية',
  },
  {
    path: 'main-category/:categoryId',
    loadComponent: () =>
      import('./pages/main-category/main-category.component').then(
        (m) => m.MainCategoryComponent,
      ),
    title: 'الأقسام الفرعية حسب القسم الرئيسي',
  },
  {
    path: 'sub-category',
    loadComponent: () =>
      import('./pages/sub-category/sub-category.component').then(
        (m) => m.SubCategoryComponent,
      ),
    title: 'المحتوي الراسي',
  },
  {
    path: 'sub-category/:subcategoryId',
    loadComponent: () =>
      import('./pages/sub-category/sub-category.component').then(
        (m) => m.SubCategoryComponent,
      ),
     title: 'المحتوي الراسي حسب القسم الفرعي',
  },
];
