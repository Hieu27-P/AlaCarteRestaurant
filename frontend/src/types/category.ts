import type { MenuItemResponseDto } from './menuItem';

export interface CategoryDto {
  name: string;
  isActive?: boolean;
}

export interface CategoryResponseDto {
  id: number;
  name: string;
  isActive: boolean | null;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryDetailResponseDto extends CategoryResponseDto {
  menuItems?: MenuItemResponseDto[];
}
