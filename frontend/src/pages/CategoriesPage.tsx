import { useMemo, useState, type FormEvent } from 'react';
import {
  AlertCircle,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Tags,
  Trash2,
  X,
} from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import type { CategoryDto, CategoryResponseDto } from '../types/category';

type ModalState =
  | { kind: 'form'; category?: CategoryResponseDto }
  | { kind: 'delete'; category: CategoryResponseDto }
  | null;

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short' }).format(date);
}

function CategoriesPage() {
  const {
    categories,
    isLoading,
    error,
    reload,
    saveCategory,
    removeCategory,
    isSaving,
    deletingId,
  } = useCategories();
  const [searchTerm, setSearchTerm] = useState('');
  const [modal, setModal] = useState<ModalState>(null);
  const [name, setName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [nameError, setNameError] = useState('');

  const filteredCategories = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase('vi');
    return query
      ? categories.filter((category) =>
          category.name.toLocaleLowerCase('vi').includes(query),
        )
      : categories;
  }, [categories, searchTerm]);

  function openCreateModal() {
    setName('');
    setIsActive(true);
    setNameError('');
    setModal({ kind: 'form' });
  }

  function openEditModal(category: CategoryResponseDto) {
    setName(category.name);
    setIsActive(category.isActive ?? false);
    setNameError('');
    setModal({ kind: 'form', category });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedName = name.trim();

    if (!normalizedName) {
      setNameError('Vui lòng nhập tên danh mục.');
      return;
    }
    if (normalizedName.length > 100) {
      setNameError('Tên danh mục không được vượt quá 100 ký tự.');
      return;
    }
    if (modal?.kind !== 'form') {
      return;
    }

    setNameError('');
    const payload: CategoryDto = { name: normalizedName, isActive };
    const saved = await saveCategory(payload, modal.category?.id);
    if (saved) {
      setModal(null);
    }
  }

  async function handleDelete() {
    if (modal?.kind !== 'delete') {
      return;
    }

    const removed = await removeCategory(modal.category.id);
    if (removed) {
      setModal(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          Danh sách danh mục và trạng thái hoạt động.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="relative block sm:w-64">
            <span className="sr-only">Tìm theo tên danh mục</span>
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Tìm danh mục..."
              className="min-h-11 w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
            />
          </label>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 text-sm font-medium text-white transition-colors hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          >
            <Plus size={17} aria-hidden="true" />
            Thêm danh mục
          </button>
        </div>
      </div>

      {isLoading ? (
        <div
          className="space-y-3 rounded-md border border-slate-200 bg-white p-4"
          role="status"
          aria-label="Đang tải danh mục"
        >
          {Array.from({ length: 5 }, (_, index) => (
            <div
              key={index}
              className="h-10 animate-pulse rounded-md bg-slate-100"
            />
          ))}
        </div>
      ) : error ? (
        <div
          className="flex flex-col items-start gap-3 rounded-md border border-slate-200 bg-white p-4 sm:flex-row sm:items-center"
          role="alert"
        >
          <AlertCircle size={18} className="text-red-600" aria-hidden="true" />
          <p className="flex-1 text-sm text-slate-700">{error}</p>
          <button
            type="button"
            onClick={() => void reload()}
            className="inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-emerald-600"
          >
            <RefreshCw size={15} aria-hidden="true" />
            Thử lại
          </button>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-md border border-slate-200 bg-white p-8 text-center">
          <Tags size={24} className="text-slate-400" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-slate-800">
              {searchTerm.trim()
                ? 'Không tìm thấy danh mục phù hợp.'
                : 'Chưa có danh mục nào.'}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {searchTerm.trim()
                ? 'Thử từ khóa khác hoặc xóa nội dung tìm kiếm.'
                : 'Thêm danh mục để bắt đầu sắp xếp thực đơn.'}
            </p>
          </div>
          {searchTerm.trim() ? (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Xóa tìm kiếm
            </button>
          ) : (
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-emerald-600 px-3 text-sm font-medium text-white hover:bg-emerald-700"
            >
              <Plus size={16} aria-hidden="true" />
              Thêm danh mục
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-md border border-slate-200 bg-white md:block">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th scope="col" className="px-3 py-2.5">Mã</th>
                  <th scope="col" className="px-3 py-2.5">Tên danh mục</th>
                  <th scope="col" className="px-3 py-2.5">Trạng thái</th>
                  <th scope="col" className="px-3 py-2.5">Ngày tạo</th>
                  <th scope="col" className="px-3 py-2.5">Cập nhật</th>
                  <th scope="col" className="px-3 py-2.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredCategories.map((category) => (
                  <tr key={category.id} className="text-slate-700">
                    <td className="whitespace-nowrap px-3 py-2.5 text-slate-500">
                      {category.id}
                    </td>
                    <td className="px-3 py-2.5 font-medium text-slate-800">
                      {category.name}
                    </td>
                    <td className="px-3 py-2.5">
                      <CategoryStatus isActive={category.isActive} />
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5">
                      {formatDate(category.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5">
                      {formatDate(category.updatedAt)}
                    </td>
                    <td className="px-3 py-2.5">
                      <CategoryActions
                        category={category}
                        onEdit={openEditModal}
                        onDelete={() => setModal({ kind: 'delete', category })}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-2 md:hidden">
            {filteredCategories.map((category) => (
              <article
                key={category.id}
                className="rounded-md border border-slate-200 bg-white p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {category.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">Mã: {category.id}</p>
                  </div>
                  <CategoryStatus isActive={category.isActive} />
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-200 pt-2 text-xs">
                  <div>
                    <dt className="text-slate-500">Ngày tạo</dt>
                    <dd className="mt-0.5 text-slate-700">
                      {formatDate(category.createdAt)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Cập nhật</dt>
                    <dd className="mt-0.5 text-slate-700">
                      {formatDate(category.updatedAt)}
                    </dd>
                  </div>
                </dl>
                <div className="mt-2 flex justify-end border-t border-slate-200 pt-2">
                  <CategoryActions
                    category={category}
                    onEdit={openEditModal}
                    onDelete={() => setModal({ kind: 'delete', category })}
                  />
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {modal?.kind === 'form' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-form-title"
            className="w-full max-w-md rounded-md border border-slate-200 bg-white"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h2 id="category-form-title" className="text-base font-semibold text-slate-800">
                {modal.category ? 'Sửa danh mục' : 'Thêm danh mục'}
              </h2>
              <button
                type="button"
                onClick={() => setModal(null)}
                disabled={isSaving}
                aria-label="Đóng"
                className="flex h-11 w-11 items-center justify-center rounded-md text-slate-500 hover:bg-slate-50 disabled:opacity-50"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4 p-4">
              <div>
                <label htmlFor="category-name" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Tên danh mục <span className="text-red-600">*</span>
                </label>
                <input
                  id="category-name"
                  autoFocus
                  required
                  minLength={1}
                  maxLength={100}
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    if (nameError) setNameError('');
                  }}
                  aria-invalid={Boolean(nameError)}
                  aria-describedby={nameError ? 'category-name-error' : undefined}
                  className="min-h-11 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-800 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                  placeholder="Nhập tên danh mục"
                />
                {nameError && (
                  <p id="category-name-error" className="mt-1 text-xs text-red-600" role="alert">
                    {nameError}
                  </p>
                )}
                <p className="mt-1 text-xs text-slate-500">Tối đa 100 ký tự.</p>
              </div>
              <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(event) => setIsActive(event.target.checked)}
                  className="h-4 w-4 accent-slate-700"
                />
                Đang hoạt động
              </label>
              <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setModal(null)}
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
                  {isSaving ? 'Đang lưu...' : 'Lưu danh mục'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {modal?.kind === 'delete' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="category-delete-title"
            aria-describedby="category-delete-description"
            className="w-full max-w-md rounded-md border border-slate-200 bg-white"
          >
            <div className="border-b border-slate-200 px-4 py-3">
              <h2 id="category-delete-title" className="text-base font-semibold text-slate-800">
                Xóa danh mục
              </h2>
            </div>
            <div className="space-y-2 p-4">
              <p id="category-delete-description" className="text-sm text-slate-700">
                Bạn có chắc muốn xóa danh mục <strong>{modal.category.name}</strong>?
              </p>
              <p className="text-xs text-slate-500">Thao tác này không thể hoàn tác.</p>
            </div>
            <div className="flex flex-col-reverse gap-2 border-t border-slate-200 p-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setModal(null)}
                disabled={deletingId === modal.category.id}
                className="min-h-11 rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={deletingId === modal.category.id}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-red-600 px-3 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingId === modal.category.id && (
                  <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
                )}
                {deletingId === modal.category.id ? 'Đang xóa...' : 'Xóa danh mục'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

interface CategoryStatusProps {
  isActive: boolean | null;
}

function CategoryStatus({ isActive }: CategoryStatusProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600">
      <span
        className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-slate-500' : 'bg-slate-300'}`}
        aria-hidden="true"
      />
      {isActive ? 'Hoạt động' : 'Ngừng hoạt động'}
    </span>
  );
}

interface CategoryActionsProps {
  category: CategoryResponseDto;
  onEdit: (category: CategoryResponseDto) => void;
  onDelete: () => void;
}

function CategoryActions({ category, onEdit, onDelete }: CategoryActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      <button
        type="button"
        onClick={() => onEdit(category)}
        aria-label={`Sửa ${category.name}`}
        className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-emerald-600"
      >
        <Pencil size={16} aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label={`Xóa ${category.name}`}
        className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-red-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-red-600"
      >
        <Trash2 size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

export default CategoriesPage;
