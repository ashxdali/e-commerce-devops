import apiClient from './api';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  _count?: {
    products: number;
  };
}

export interface ProductImage {
  id: string;
  url: string;
  altText?: string | null;
  sortOrder: number;
}

export interface ProductInventory {
  quantity: number;
  reservedQuantity: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number | string;
  compareAtPrice?: number | string | null;
  sku: string;
  categoryId: string;
  isActive: boolean;
  category?: Category;
  images?: ProductImage[];
  inventory?: ProductInventory;
  createdAt: string;
  updatedAt: string;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'name' | 'price' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedProductsResponse {
  success: boolean;
  data: Product[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SingleProductResponse {
  success: boolean;
  data: Product;
}

export interface CategoriesResponse {
  success: boolean;
  data: Category[];
}

export const catalogService = {
  async getCategories(): Promise<Category[]> {
    const response = await apiClient.get<CategoriesResponse>('/v1/categories');
    return response.data.data;
  },

  async getCategoryById(id: string): Promise<Category> {
    const response = await apiClient.get<SingleProductResponse>('/v1/categories/' + id);
    return response.data.data as unknown as Category;
  },

  async getProducts(params?: ProductQueryParams): Promise<PaginatedProductsResponse> {
    const response = await apiClient.get<PaginatedProductsResponse>('/v1/products', { params });
    return response.data;
  },

  async getProductById(id: string): Promise<Product> {
    const response = await apiClient.get<SingleProductResponse>('/v1/products/' + id);
    return response.data.data;
  },
};

export default catalogService;
