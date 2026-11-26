import type { OptionGroupResponseDto } from './menuOptionGroup';

export interface MenuOptionDto {
  optionGroupId: number;
  name: string;
  extraPrice?: number;
  isAvailable?: boolean;
}

export interface MenuOptionResponseDto {
  id: number;
  optionGroupId: number;
  name: string;
  extraPrice: number;
  isAvailable: boolean | null;
  optionGroup?: OptionGroupResponseDto;
}

export interface OptionResponseDto {
  id: number;
  name: string;
  extraPrice: number;
  isAvailable: boolean | null;
}
