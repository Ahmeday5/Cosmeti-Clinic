export interface CategoryTypes {
  id: number;
  name: string;
  arabicName: string;
}
export interface Category {
  id: number;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
}

export interface CategoryResponse {
  statusCode: number;
  message: string;
  data: Category;
}
