// ==============================
// موديل headcontent
// ==============================
export interface ProductData {
  value?: string;
}

export interface Product {
  id: number;
  headContentId: number;
  parentBlockId: number | null;
  type: string;
  title: string | null;
  imageUrl: string | null;
  data: any;
  childBlocks?: Product[];
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
