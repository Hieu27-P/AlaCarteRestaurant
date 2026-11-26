import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { categoryService } from '../services/categoryService';
import { menuItemService } from '../services/menuItemService';
import { menuOptionGroupService } from '../services/menuOptionGroupService';
import type { CategoryResponseDto } from '../types/category';
import type { MenuItemDto, MenuItemResponseDto } from '../types/menuItem';
import type { OptionGroupResponseDto } from '../types/menuOptionGroup';
import { getErrorMessage } from '../utils/getErrorMessage';

async function getMenuItemPageData() {
  return Promise.all([
    menuItemService.getAll(),
    categoryService.getAll(),
    menuOptionGroupService.getAll(),
  ]);
}

export function useMenuItems() {
  const [menuItems, setMenuItems] = useState<MenuItemResponseDto[]>([]);
  const [categories, setCategories] = useState<CategoryResponseDto[]>([]);
  const [optionGroups, setOptionGroups] = useState<OptionGroupResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    let isActive = true;

    void getMenuItemPageData()
      .then(([items, loadedCategories, loadedOptionGroups]) => {
        if (!isActive) return;
        setMenuItems(items);
        setCategories(loadedCategories);
        setOptionGroups(loadedOptionGroups);
        setError(null);
      })
      .catch((requestError: unknown) => {
        if (isActive) {
          setError(getErrorMessage(requestError, 'Đã xảy ra lỗi khi tải thực đơn.'));
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
      const [items, loadedCategories, loadedOptionGroups] = await getMenuItemPageData();
      setMenuItems(items);
      setCategories(loadedCategories);
      setOptionGroups(loadedOptionGroups);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Đã xảy ra lỗi khi tải thực đơn.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getById = useCallback((id: number) => menuItemService.getById(id), []);

  const saveMenuItem = useCallback(
    async (data: MenuItemDto, id?: number): Promise<boolean> => {
      setIsSaving(true);

      try {
        if (id === undefined) {
          await menuItemService.create(data);
          toast.success('Đã thêm món ăn.');
        } else {
          await menuItemService.update(id, data);
          toast.success('Đã cập nhật món ăn.');
        }

        await reload();
        return true;
      } catch (requestError) {
        toast.error(getErrorMessage(requestError, 'Không thể lưu món ăn.'));
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [reload],
  );

  const removeMenuItem = useCallback(
    async (id: number): Promise<boolean> => {
      setDeletingId(id);

      try {
        await menuItemService.remove(id);
        toast.success('Đã xóa món ăn.');
        await reload();
        return true;
      } catch (requestError) {
        toast.error(getErrorMessage(requestError, 'Không thể xóa món ăn.'));
        return false;
      } finally {
        setDeletingId(null);
      }
    },
    [reload],
  );

  return {
    menuItems,
    categories,
    optionGroups,
    isLoading,
    error,
    reload,
    getById,
    saveMenuItem,
    removeMenuItem,
    isSaving,
    deletingId,
  };
}
