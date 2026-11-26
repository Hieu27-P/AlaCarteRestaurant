import apiClient from './apiClient';
import type { MenuOptionDto, MenuOptionResponseDto } from '../types/menuOption';

const endpoint = '/api/MenuOptions';

export const menuOptionService = {
  async getAll(): Promise<MenuOptionResponseDto[]> {
    const response = await apiClient.get<MenuOptionResponseDto[]>(endpoint);
    return response.data;
  },

  async getById(id: number): Promise<MenuOptionResponseDto> {
    const response = await apiClient.get<MenuOptionResponseDto>(`${endpoint}/${id}`);
    return response.data;
  },

  async create(data: MenuOptionDto): Promise<MenuOptionResponseDto> {
    const response = await apiClient.post<MenuOptionResponseDto>(endpoint, data);
    return response.data;
  },

  async update(id: number, data: MenuOptionDto): Promise<MenuOptionResponseDto> {
    const response = await apiClient.put<MenuOptionResponseDto>(`${endpoint}/${id}`, data);
    return response.data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete<void>(`${endpoint}/${id}`);
  },
};
