import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { categoryService } from '../services/categoryService';
import type { CategoryDto, CategoryResponseDto } from '../types/category';
import { getErrorMessage } from '../utils/getErrorMessage';

export function useCategories() {
  const [categories, setCategories] = useState<CategoryResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    let isActive = true;

    void categoryService
      .getAll()
      .then((items) => {
        if (isActive) {
          setCategories(items);
          setError(null);
        }
      })
      .catch((requestError: unknown) => {
        if (isActive) {
          setError(getErrorMessage(requestError, 'Đã xảy ra lỗi khi tải danh mục.'));
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const items = await categoryService.getAll();
      setCategories(items);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Đã xảy ra lỗi khi tải danh mục.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveCategory = useCallback(
    async (data: CategoryDto, id?: number): Promise<boolean> => {
      setIsSaving(true);

      try {
        if (id === undefined) {
          await categoryService.create(data);
          toast.success('Đã thêm danh mục.');
        } else {
          await categoryService.update(id, data);
          toast.success('Đã cập nhật danh mục.');
        }

        await reload();
        return true;
      } catch (requestError) {
        toast.error(getErrorMessage(requestError, 'Không thể lưu danh mục.'));
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [reload],
  );

  const removeCategory = useCallback(
    async (id: number): Promise<boolean> => {
      setDeletingId(id);

      try {
        await categoryService.remove(id);
        toast.success('Đã xóa danh mục.');
        await reload();
        return true;
      } catch (requestError) {
        toast.error(getErrorMessage(requestError, 'Không thể xóa danh mục.'));
        return false;
      } finally {
        setDeletingId(null);
      }
    },
    [reload],
  );

  return {
    categories,
    isLoading,
    error,
    reload,
    saveCategory,
    removeCategory,
    isSaving,
    deletingId,
  };
}
