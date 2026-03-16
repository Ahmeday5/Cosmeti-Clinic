// ==============================
// موديل headcontent
// ==============================

export interface Product {
  id: number;
  headContentId: number;
  type: string;
  title: string;
  imageUrl: string;
  data: any;
  sortOrder: number;
  createdAt: string;
}

// ==============================
// ريسبونس create / update
// ==============================

export interface ProductResponse {
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
