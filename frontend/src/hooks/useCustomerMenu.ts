import { useCallback, useEffect, useState } from 'react';
import { categoryService } from '../services/categoryService';
import { menuItemService } from '../services/menuItemService';
import { menuOptionGroupService } from '../services/menuOptionGroupService';
import { menuOptionService } from '../services/menuOptionService';
import type { CategoryResponseDto } from '../types/category';
import type { MenuItemResponseDto } from '../types/menuItem';
import type { MenuOptionResponseDto } from '../types/menuOption';
import type { OptionGroupResponseDto } from '../types/menuOptionGroup';
import { getErrorMessage } from '../utils/getErrorMessage';

export interface MenuItemOptionGroup {
  group: OptionGroupResponseDto;
  options: MenuOptionResponseDto[];
}

async function getCustomerMenuData() {
  return Promise.all([
    categoryService.getAll(),
    menuItemService.getAll(),
    menuOptionGroupService.getAll(),
    menuOptionService.getAll(),
  ]);
}

export function useCustomerMenu() {
  const [categories, setCategories] = useState<CategoryResponseDto[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemResponseDto[]>([]);
  const [optionGroups, setOptionGroups] = useState<OptionGroupResponseDto[]>([]);
  const [menuOptions, setMenuOptions] = useState<MenuOptionResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    void getCustomerMenuData()
      .then(([loadedCategories, loadedMenuItems, loadedGroups, loadedOptions]) => {
        if (!isActive) return;
        setCategories(loadedCategories);
        setMenuItems(loadedMenuItems);
        setOptionGroups(loadedGroups);
        setMenuOptions(loadedOptions);
        setError(null);
      })
      .catch((requestError: unknown) => {
        if (isActive) {
          setError(getErrorMessage(requestError, 'Không thể tải thực đơn.'));
        }
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [loadedCategories, loadedMenuItems, loadedGroups, loadedOptions] =
        await getCustomerMenuData();
      setCategories(loadedCategories);
      setMenuItems(loadedMenuItems);
      setOptionGroups(loadedGroups);
      setMenuOptions(loadedOptions);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Không thể tải thực đơn.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getOptionsForMenuItem = useCallback(
    async (menuItemId: number): Promise<MenuItemOptionGroup[]> => {
      const details = await menuItemService.getById(menuItemId);
      const associatedGroupIds = new Set(
        (details.optionGroups ?? []).map((group) => group.id),
      );

      return optionGroups
        .filter((group) => associatedGroupIds.has(group.id))
        .map((group) => ({
          group,
          options: menuOptions.filter(
            (option) => option.optionGroupId === group.id && option.isAvailable === true,
          ),
        }));
    },
    [menuOptions, optionGroups],
  );

  return {
    categories,
    menuItems,
    isLoading,
    error,
    reload,
    getOptionsForMenuItem,
  };
}
