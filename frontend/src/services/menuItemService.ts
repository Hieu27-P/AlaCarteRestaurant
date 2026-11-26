import apiClient from './apiClient';
import type { MenuItemDto, MenuItemResponseDto } from '../types/menuItem';

const endpoint = '/api/MenuItems';

export const menuItemService = {
  async getAll(): Promise<MenuItemResponseDto[]> {
    const response = await apiClient.get<MenuItemResponseDto[]>(endpoint);
    return response.data;
  },

  async getById(id: number): Promise<MenuItemResponseDto> {
    const response = await apiClient.get<MenuItemResponseDto>(`${endpoint}/${id}`);
    return response.data;
  },

  async create(data: MenuItemDto): Promise<MenuItemResponseDto> {
    const response = await apiClient.post<MenuItemResponseDto>(endpoint, data);
    return response.data;
  },

  async update(id: number, data: MenuItemDto): Promise<MenuItemResponseDto> {
    const response = await apiClient.put<MenuItemResponseDto>(`${endpoint}/${id}`, data);
    return response.data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete<void>(`${endpoint}/${id}`);
  },
};
