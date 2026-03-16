// ==============================
// موديل headcontent
// ==============================

export interface headcontent {
  id: number;
  subCategoryId: number;
  title: string;
  imageUrl: string;
  layoutType: string;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
}

// ==============================
// ريسبونس create / update
// ==============================

export interface headcontentResponse {
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
