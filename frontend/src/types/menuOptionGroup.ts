import type { MenuItemResponseDto } from './menuItem';
import type { OptionResponseDto } from './menuOption';

export interface MenuOptionGroupDto {
  name: string;
}

export interface OptionGroupResponseDto {
  id: number;
  name: string;
  options?: OptionResponseDto[];
  menuItems?: MenuItemResponseDto[];
}
