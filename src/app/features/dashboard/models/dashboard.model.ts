export interface Category {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
}

export interface CategoryResponse {
  statusCode: number;
  message: string;
  data: any;
}
