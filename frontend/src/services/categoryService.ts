import apiClient from './apiClient';
import type {
  CategoryDetailResponseDto,
  CategoryDto,
  CategoryResponseDto,
} from '../types/category';

const endpoint = '/api/Categories';

export const categoryService = {
  async getAll(): Promise<CategoryResponseDto[]> {
    const response = await apiClient.get<CategoryResponseDto[]>(endpoint);
    return response.data;
  },

  async getById(id: number): Promise<CategoryDetailResponseDto> {
    const response = await apiClient.get<CategoryDetailResponseDto>(`${endpoint}/${id}`);
    return response.data;
  },

  async create(data: CategoryDto): Promise<CategoryResponseDto> {
    const response = await apiClient.post<CategoryResponseDto>(endpoint, data);
    return response.data;
  },

  async update(id: number, data: CategoryDto): Promise<CategoryResponseDto> {
    const response = await apiClient.put<CategoryResponseDto>(`${endpoint}/${id}`, data);
    return response.data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete<void>(`${endpoint}/${id}`);
  },
};
