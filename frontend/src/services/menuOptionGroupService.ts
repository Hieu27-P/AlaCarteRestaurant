import apiClient from './apiClient';
import type {
  MenuOptionGroupDto,
  OptionGroupResponseDto,
} from '../types/menuOptionGroup';

const endpoint = '/api/MenuOptionGroups';

export const menuOptionGroupService = {
  async getAll(): Promise<OptionGroupResponseDto[]> {
    const response = await apiClient.get<OptionGroupResponseDto[]>(endpoint);
    return response.data;
  },

  async getById(id: number): Promise<OptionGroupResponseDto> {
    const response = await apiClient.get<OptionGroupResponseDto>(`${endpoint}/${id}`);
    return response.data;
  },

  async create(data: MenuOptionGroupDto): Promise<OptionGroupResponseDto> {
    const response = await apiClient.post<OptionGroupResponseDto>(endpoint, data);
    return response.data;
  },

  async update(id: number, data: MenuOptionGroupDto): Promise<OptionGroupResponseDto> {
    const response = await apiClient.put<OptionGroupResponseDto>(`${endpoint}/${id}`, data);
    return response.data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete<void>(`${endpoint}/${id}`);
  },
};
