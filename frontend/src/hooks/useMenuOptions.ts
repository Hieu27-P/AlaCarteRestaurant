import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { menuOptionService } from '../services/menuOptionService';
import { menuOptionGroupService } from '../services/menuOptionGroupService';
import type { MenuOptionDto, MenuOptionResponseDto } from '../types/menuOption';
import type { OptionGroupResponseDto } from '../types/menuOptionGroup';
import { getErrorMessage } from '../utils/getErrorMessage';

async function getMenuOptionPageData() {
  return Promise.all([
    menuOptionService.getAll(),
    menuOptionGroupService.getAll(),
  ]);
}

export function useMenuOptions() {
  const [menuOptions, setMenuOptions] = useState<MenuOptionResponseDto[]>([]);
  const [optionGroups, setOptionGroups] = useState<OptionGroupResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    let isActive = true;

    void getMenuOptionPageData()
      .then(([options, groups]) => {
        if (!isActive) return;
        setMenuOptions(options);
        setOptionGroups(groups);
        setError(null);
      })
      .catch((requestError: unknown) => {
        if (isActive) {
          setError(getErrorMessage(requestError, 'Đã xảy ra lỗi khi tải tùy chọn.'));
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
      const [options, groups] = await getMenuOptionPageData();
      setMenuOptions(options);
      setOptionGroups(groups);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Đã xảy ra lỗi khi tải tùy chọn.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveMenuOption = useCallback(
    async (data: MenuOptionDto, id?: number): Promise<boolean> => {
      setIsSaving(true);

      try {
        if (id === undefined) {
          await menuOptionService.create(data);
          toast.success('Đã thêm tùy chọn.');
        } else {
          await menuOptionService.update(id, data);
          toast.success('Đã cập nhật tùy chọn.');
        }

        await reload();
        return true;
      } catch (requestError) {
        toast.error(getErrorMessage(requestError, 'Không thể lưu tùy chọn.'));
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [reload],
  );

  const removeMenuOption = useCallback(
    async (id: number): Promise<boolean> => {
      setDeletingId(id);

      try {
        await menuOptionService.remove(id);
        toast.success('Đã xóa tùy chọn.');
        await reload();
        return true;
      } catch (requestError) {
        toast.error(getErrorMessage(requestError, 'Không thể xóa tùy chọn.'));
        return false;
      } finally {
        setDeletingId(null);
      }
    },
    [reload],
  );

  return {
    menuOptions,
    optionGroups,
    isLoading,
    error,
    reload,
    saveMenuOption,
    removeMenuOption,
    isSaving,
    deletingId,
  };
}
