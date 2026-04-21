export interface Student {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  whatsappPhoneNumber: string;
  age: string;
  countryId: number;
  countryName: string;
  governorate: string;
  academicQualification: string;
  collegeName: string;
  specification: string;
  categoryTypes: string[];
  isActive: boolean;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  data: T[];
}

export interface Country {
  id: number;
  name: string;
}

export interface StudentFilterParams {
  pageIndex: number;
  pageSize: number;
  search?: string;
  countryId?: number;
}

export interface ActivationResponse {
  statusCode: number;
  message: string;
  data: number;
}

export interface UpdateCategoryTypesDto {
  categoryTypes: string[];
}
