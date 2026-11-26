import { useMemo, useRef, useState, type FormEvent } from 'react';
import {
  AlertCircle,
  Image,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Utensils,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import Modal from '../components/Modal';
import { useMenuItems } from '../hooks/useMenuItems';
import type { MenuItemDto, MenuItemResponseDto } from '../types/menuItem';
import { formatCurrencyVnd } from '../utils/formatCurrencyVnd';
import { getErrorMessage } from '../utils/getErrorMessage';

type ModalState =
  | { kind: 'form'; item?: MenuItemResponseDto }
  | { kind: 'delete'; item: MenuItemResponseDto }
  | null;

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short' }).format(date);
}

function MenuItemsPage() {
  const {
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
  } = useMenuItems();
  const [searchTerm, setSearchTerm] = useState('');
  const [modal, setModal] = useState<ModalState>(null);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('0');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [optionGroupIds, setOptionGroupIds] = useState<number[]>([]);
  const [nameError, setNameError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [priceError, setPriceError] = useState('');
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const editRequestId = useRef(0);

  const filteredItems = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase('vi');
    return query
      ? menuItems.filter((item) => item.name.toLocaleLowerCase('vi').includes(query))
      : menuItems;
  }, [menuItems, searchTerm]);

  const categoryNames = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories],
  );

  function resetForm() {
    setName('');
    setCategoryId('');
    setDescription('');
    setPrice('0');
    setImageUrl(null);
    setIsAvailable(true);
    setOptionGroupIds([]);
    setNameError('');
    setDescriptionError('');
    setPriceError('');
    setDetailsError(null);
    setIsDetailsLoading(false);
  }

  function closeModal() {
    editRequestId.current += 1;
    setModal(null);
  }

  function openCreateModal() {
    editRequestId.current += 1;
    resetForm();
    setModal({ kind: 'form' });
  }

  function openEditModal(item: MenuItemResponseDto) {
    const requestId = editRequestId.current + 1;
    editRequestId.current = requestId;
    setName(item.name);
    setCategoryId(item.categoryId === null ? '' : String(item.categoryId));
    setDescription(item.description ?? '');
    setPrice(String(item.price));
    setImageUrl(item.imageUrl);
    setIsAvailable(item.isAvailable ?? false);
    setOptionGroupIds([]);
    setNameError('');
    setDescriptionError('');
    setPriceError('');
    setDetailsError(null);
    setIsDetailsLoading(true);
    setModal({ kind: 'form', item });

    void getById(item.id)
      .then((details) => {
        if (editRequestId.current !== requestId) return;
        setName(details.name);
        setCategoryId(details.categoryId === null ? '' : String(details.categoryId));
        setDescription(details.description ?? '');
        setPrice(String(details.price));
        setImageUrl(details.imageUrl);
        setIsAvailable(details.isAvailable ?? false);
        setOptionGroupIds(details.optionGroups?.map((group) => group.id) ?? []);
      })
      .catch((requestError: unknown) => {
        if (editRequestId.current === requestId) {
          setDetailsError(getErrorMessage(requestError, 'Không thể tải chi tiết món ăn.'));
        }
      })
      .finally(() => {
        if (editRequestId.current === requestId) {
          setIsDetailsLoading(false);
        }
      });
  }

  function toggleOptionGroup(id: number) {
    setOptionGroupIds((selected) =>
      selected.includes(id)
        ? selected.filter((selectedId) => selectedId !== id)
        : [...selected, id],
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedName = name.trim();
    const normalizedDescription = description.trim();

    if (!normalizedName) {
      setNameError('Vui lòng nhập tên món ăn.');
      return;
    }
    if (normalizedName.length > 150) {
      setNameError('Tên món ăn không được vượt quá 150 ký tự.');
      return;
    }
    if (normalizedDescription.length > 500) {
      setDescriptionError('Mô tả không được vượt quá 500 ký tự.');
      return;
    }

    const priceValue = price.trim() === '' ? undefined : Number(price);
    if (priceValue !== undefined && (!Number.isFinite(priceValue) || priceValue < 0)) {
      setPriceError('Giá món ăn phải là số không âm.');
      return;
    }
    if (modal?.kind !== 'form' || isDetailsLoading || detailsError) {
      return;
    }

    setNameError('');
    setDescriptionError('');
    setPriceError('');
    const payload: MenuItemDto = {
      categoryId: categoryId ? Number(categoryId) : null,
      name: normalizedName,
      description: normalizedDescription || null,
      ...(priceValue === undefined ? {} : { price: priceValue }),
      imageUrl,
      isAvailable,
      optionGroupIds,
    };
    const saved = await saveMenuItem(payload, modal.item?.id);
    if (saved) closeModal();
  }

  async function handleDelete() {
    if (modal?.kind !== 'delete') return;
    const removed = await removeMenuItem(modal.item.id);
    if (removed) setModal(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">Danh sách món ăn trong thực đơn.</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="relative block sm:w-64">
            <span className="sr-only">Tìm theo tên món ăn</span>
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Tìm món ăn..."
              className="min-h-11 w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
            />
          </label>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 text-sm font-medium text-white hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          >
            <Plus size={17} aria-hidden="true" />
            Thêm món ăn
          </button>
        </div>
      </div>

      {isLoading ? (
        <LoadingState label="Đang tải thực đơn" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void reload()} />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          hasSearch={Boolean(searchTerm.trim())}
          onClearSearch={() => setSearchTerm('')}
          onCreate={openCreateModal}
        />
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-md border border-slate-200 bg-white md:block">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th scope="col" className="px-3 py-2.5">Mã</th>
                  <th scope="col" className="px-3 py-2.5">Tên món ăn</th>
                  <th scope="col" className="px-3 py-2.5">Danh mục</th>
                  <th scope="col" className="px-3 py-2.5">Giá</th>
                  <th scope="col" className="px-3 py-2.5">Trạng thái</th>
                  <th scope="col" className="px-3 py-2.5">Cập nhật</th>
                  <th scope="col" className="px-3 py-2.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="text-slate-700">
                    <td className="whitespace-nowrap px-3 py-2.5 text-slate-500">
                      {item.id}
                    </td>
                    <td className="px-3 py-2.5 font-medium text-slate-800">
                      {item.name}
                    </td>
                    <td className="px-3 py-2.5">
                      {item.categoryId === null
                        ? 'Chưa phân loại'
                        : categoryNames.get(item.categoryId) ?? `#${item.categoryId}`}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5">
                      {formatCurrencyVnd(item.price)}
                    </td>
                    <td className="px-3 py-2.5">
                      <AvailabilityStatus isAvailable={item.isAvailable} />
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5">
                      {formatDate(item.updatedAt)}
                    </td>
                    <td className="px-3 py-2.5">
                      <ItemActions
                        item={item}
                        onEdit={openEditModal}
                        onDelete={() => setModal({ kind: 'delete', item })}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-2 md:hidden">
            {filteredItems.map((item) => (
              <article
                key={item.id}
                className="rounded-md border border-slate-200 bg-white p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">{item.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.categoryId === null
                        ? 'Chưa phân loại'
                        : categoryNames.get(item.categoryId) ?? `#${item.categoryId}`}
                    </p>
                  </div>
                  <AvailabilityStatus isAvailable={item.isAvailable} />
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-2 text-sm">
                  <span className="text-slate-500">Giá</span>
                  <span className="font-medium text-slate-800">
                    {formatCurrencyVnd(item.price)}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>Mã: {item.id}</span>
                  <span>Cập nhật: {formatDate(item.updatedAt)}</span>
                </div>
                <div className="mt-2 flex justify-end border-t border-slate-200 pt-2">
                  <ItemActions
                    item={item}
                    onEdit={openEditModal}
                    onDelete={() => setModal({ kind: 'delete', item })}
                  />
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {modal?.kind === 'form' && (
        <Modal
          title={modal.item ? 'Sửa món ăn' : 'Thêm món ăn'}
          isBusy={isSaving}
          onClose={closeModal}
        >
          {isDetailsLoading ? (
            <div className="flex min-h-40 items-center justify-center gap-2 p-4 text-sm text-slate-500">
              <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />
              Đang tải chi tiết món ăn...
            </div>
          ) : detailsError ? (
            <div className="space-y-3 p-4" role="alert">
              <p className="text-sm text-slate-700">{detailsError}</p>
              {modal.item && (
                <button
                  type="button"
                    onClick={() => {
                      if (modal.item) openEditModal(modal.item);
                    }}
                  className="inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <RefreshCw size={15} aria-hidden="true" />
                  Thử tải lại
                </button>
              )}
            </div>
          ) : (
            <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4 p-4">
              <div>
                <label htmlFor="menu-item-name" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Tên món ăn <span className="text-red-600">*</span>
                </label>
                <input
                  id="menu-item-name"
                  autoFocus
                  required
                  minLength={1}
                  maxLength={150}
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setNameError('');
                  }}
                  aria-invalid={Boolean(nameError)}
                  aria-describedby={nameError ? 'menu-item-name-error' : undefined}
                  className="min-h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                />
                {nameError && (
                  <p id="menu-item-name-error" className="mt-1 text-xs text-red-600" role="alert">
                    {nameError}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="menu-item-category" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Danh mục
                </label>
                <select
                  id="menu-item-category"
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
                  className="min-h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                >
                  <option value="">Không phân loại</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {categories.length === 0 && (
                  <p className="mt-1 text-xs text-slate-500">Chưa có danh mục nào.</p>
                )}
              </div>

              <div>
                <label htmlFor="menu-item-description" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Mô tả
                </label>
                <textarea
                  id="menu-item-description"
                  rows={3}
                  maxLength={500}
                  value={description}
                  onChange={(event) => {
                    setDescription(event.target.value);
                    setDescriptionError('');
                  }}
                  aria-invalid={Boolean(descriptionError)}
                  aria-describedby={descriptionError ? 'menu-item-description-error' : undefined}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                />
                {descriptionError && (
                  <p id="menu-item-description-error" className="mt-1 text-xs text-red-600" role="alert">
                    {descriptionError}
                  </p>
                )}
                <p className="mt-1 text-xs text-slate-500">{description.length}/500 ký tự</p>
              </div>

              <div>
                <label htmlFor="menu-item-price" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Giá (VND)
                </label>
                <input
                  id="menu-item-price"
                  type="number"
                  min={0}
                  step="any"
                  value={price}
                  onChange={(event) => {
                    setPrice(event.target.value);
                    setPriceError('');
                  }}
                  aria-invalid={Boolean(priceError)}
                  aria-describedby={priceError ? 'menu-item-price-error' : undefined}
                  className="min-h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                />
                {priceError && (
                  <p id="menu-item-price-error" className="mt-1 text-xs text-red-600" role="alert">
                    {priceError}
                  </p>
                )}
              </div>

              <fieldset className="space-y-1">
                <legend className="mb-1.5 text-sm font-medium text-slate-700">
                  Nhóm tùy chọn
                </legend>
                {optionGroups.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    Chưa có nhóm tùy chọn.{' '}
                    <Link
                      to="/menu-option-groups"
                      className="font-medium text-slate-700 underline underline-offset-2"
                    >
                      Tạo nhóm tùy chọn
                    </Link>
                  </p>
                ) : (
                  <div className="grid gap-1 sm:grid-cols-2">
                    {optionGroups.map((group) => (
                      <label
                        key={group.id}
                        className="flex min-h-11 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm text-slate-700"
                      >
                        <input
                          type="checkbox"
                          checked={optionGroupIds.includes(group.id)}
                          onChange={() => toggleOptionGroup(group.id)}
                          className="h-4 w-4 accent-slate-700"
                        />
                        <span className="truncate">{group.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </fieldset>

              <label className="flex min-h-11 items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(event) => setIsAvailable(event.target.checked)}
                  className="h-4 w-4 accent-slate-700"
                />
                Đang phục vụ
              </label>
              {modal.item && imageUrl && (
                <p className="flex items-center gap-2 text-xs text-slate-500">
                  <Image size={15} aria-hidden="true" />
                  Ảnh hiện tại được giữ nguyên.
                </p>
              )}

              <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSaving}
                  className="min-h-11 rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving && <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />}
                  {isSaving ? 'Đang lưu...' : 'Lưu món ăn'}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}

      {modal?.kind === 'delete' && (
        <ConfirmDialog
          title="Xóa món ăn"
          message={`Bạn có chắc muốn xóa món “${modal.item.name}”? Thao tác này không thể hoàn tác.`}
          isLoading={deletingId === modal.item.id}
          onCancel={() => setModal(null)}
          onConfirm={() => void handleDelete()}
        />
      )}
    </div>
  );
}

interface AvailabilityStatusProps {
  isAvailable: boolean | null;
}

function AvailabilityStatus({ isAvailable }: AvailabilityStatusProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600">
      <span
        className={`h-1.5 w-1.5 rounded-full ${isAvailable ? 'bg-slate-500' : 'bg-slate-300'}`}
        aria-hidden="true"
      />
      {isAvailable ? 'Đang phục vụ' : 'Tạm ngưng'}
    </span>
  );
}

interface ItemActionsProps {
  item: MenuItemResponseDto;
  onEdit: (item: MenuItemResponseDto) => void;
  onDelete: () => void;
}

function ItemActions({ item, onEdit, onDelete }: ItemActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      <button
        type="button"
        onClick={() => onEdit(item)}
        aria-label={`Sửa ${item.name}`}
        className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100"
      >
        <Pencil size={16} aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label={`Xóa ${item.name}`}
        className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-red-600 hover:bg-slate-100"
      >
        <Trash2 size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <div
      className="space-y-3 rounded-md border border-slate-200 bg-white p-4"
      role="status"
      aria-label={label}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="h-10 animate-pulse rounded-md bg-slate-100" />
      ))}
    </div>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-md border border-slate-200 bg-white p-4 sm:flex-row sm:items-center" role="alert">
      <AlertCircle size={18} className="text-red-600" aria-hidden="true" />
      <p className="flex-1 text-sm text-slate-700">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        <RefreshCw size={15} aria-hidden="true" />
        Thử lại
      </button>
    </div>
  );
}

interface EmptyStateProps {
  hasSearch: boolean;
  onClearSearch: () => void;
  onCreate: () => void;
}

function EmptyState({ hasSearch, onClearSearch, onCreate }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-md border border-slate-200 bg-white p-8 text-center">
      <Utensils size={24} className="text-slate-400" aria-hidden="true" />
      <div>
        <p className="text-sm font-medium text-slate-800">
          {hasSearch ? 'Không tìm thấy món ăn phù hợp.' : 'Chưa có món ăn nào.'}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          {hasSearch
            ? 'Thử từ khóa khác hoặc xóa nội dung tìm kiếm.'
            : 'Thêm món ăn để bắt đầu xây dựng thực đơn.'}
        </p>
      </div>
      {hasSearch ? (
        <button
          type="button"
          onClick={onClearSearch}
          className="min-h-11 rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Xóa tìm kiếm
        </button>
      ) : (
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-emerald-600 px-3 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <Plus size={16} aria-hidden="true" />
          Thêm món ăn
        </button>
      )}
    </div>
  );
}

export default MenuItemsPage;
