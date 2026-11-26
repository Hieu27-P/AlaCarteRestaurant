import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { menuOptionGroupService } from '../services/menuOptionGroupService';
import type {
  MenuOptionGroupDto,
  OptionGroupResponseDto,
} from '../types/menuOptionGroup';
import { getErrorMessage } from '../utils/getErrorMessage';

export function useMenuOptionGroups() {
  const [optionGroups, setOptionGroups] = useState<OptionGroupResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    let isActive = true;

    void menuOptionGroupService
      .getAll()
      .then((groups) => {
        if (isActive) {
          setOptionGroups(groups);
          setError(null);
        }
      })
      .catch((requestError: unknown) => {
        if (isActive) {
          setError(
            getErrorMessage(requestError, 'Đã xảy ra lỗi khi tải nhóm tùy chọn.'),
          );
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
      setOptionGroups(await menuOptionGroupService.getAll());
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, 'Đã xảy ra lỗi khi tải nhóm tùy chọn.'),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveOptionGroup = useCallback(
    async (data: MenuOptionGroupDto, id?: number): Promise<boolean> => {
      setIsSaving(true);

      try {
        if (id === undefined) {
          await menuOptionGroupService.create(data);
          toast.success('Đã thêm nhóm tùy chọn.');
        } else {
          await menuOptionGroupService.update(id, data);
          toast.success('Đã cập nhật nhóm tùy chọn.');
        }

        await reload();
        return true;
      } catch (requestError) {
        toast.error(
          getErrorMessage(requestError, 'Không thể lưu nhóm tùy chọn.'),
        );
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [reload],
  );

  const removeOptionGroup = useCallback(
    async (id: number): Promise<boolean> => {
      setDeletingId(id);

      try {
        await menuOptionGroupService.remove(id);
        toast.success('Đã xóa nhóm tùy chọn.');
        await reload();
        return true;
      } catch (requestError) {
        toast.error(
          getErrorMessage(requestError, 'Không thể xóa nhóm tùy chọn.'),
        );
        return false;
      } finally {
        setDeletingId(null);
      }
    },
    [reload],
  );

  return {
    optionGroups,
    isLoading,
    error,
    reload,
    saveOptionGroup,
    removeOptionGroup,
    isSaving,
    deletingId,
  };
}
