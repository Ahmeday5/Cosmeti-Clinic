// ==============================
// موديل السب كاتيجوري
// ==============================

export interface SubCategory {
  id: number;
  categoryId: number;
  title: string;
  description: string;
  imageUrl: string;
  sortOrder: number;
}

// ==============================
// ريسبونس create / update
// ==============================

export interface SubCategoryResponse {
  statusCode: number;
  message: string;
  data: number;
}

// ==============================
// ريسبونس SortOrder
// ==============================

export interface NextSortOrderResponse {
  nextSortOrder: number;
}
