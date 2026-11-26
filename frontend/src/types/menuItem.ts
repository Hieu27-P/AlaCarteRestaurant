import type { OptionGroupResponseDto } from './menuOptionGroup';

export interface MenuItemDto {
  categoryId?: number | null;
  name: string;
  description?: string | null;
  price?: number;
  imageUrl?: string | null;
  isAvailable?: boolean;
  optionGroupIds: number[];
}

export interface MenuItemResponseDto {
  id: number;
  categoryId: number | null;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean | null;
  createdAt: string;
  updatedAt: string;
  optionGroups?: OptionGroupResponseDto[];
}
