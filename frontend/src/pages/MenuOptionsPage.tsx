import { useMemo, useState, type FormEvent } from 'react';
import {
  AlertCircle,
  ListFilter,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import Modal from '../components/Modal';
import { useMenuOptions } from '../hooks/useMenuOptions';
import type { MenuOptionDto, MenuOptionResponseDto } from '../types/menuOption';
import { formatCurrencyVnd } from '../utils/formatCurrencyVnd';

type ModalState =
  | { kind: 'form'; option?: MenuOptionResponseDto }
  | { kind: 'delete'; option: MenuOptionResponseDto }
  | null;

function MenuOptionsPage() {
  const {
    menuOptions,
    optionGroups,
    isLoading,
    error,
    reload,
    saveMenuOption,
    removeMenuOption,
    isSaving,
    deletingId,
  } = useMenuOptions();
  const [searchTerm, setSearchTerm] = useState('');
  const [modal, setModal] = useState<ModalState>(null);
  const [groupId, setGroupId] = useState('');
  const [name, setName] = useState('');
  const [extraPrice, setExtraPrice] = useState('0');
  const [isAvailable, setIsAvailable] = useState(true);
  const [nameError, setNameError] = useState('');
  const [priceError, setPriceError] = useState('');

  const filteredOptions = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase('vi');
    return query
      ? menuOptions.filter((option) => option.name.toLocaleLowerCase('vi').includes(query))
      : menuOptions;
  }, [menuOptions, searchTerm]);

  const groupsById = useMemo(
    () => new Map(optionGroups.map((group) => [group.id, group])),
    [optionGroups],
  );

  function resetForm() {
    setGroupId('');
    setName('');
    setExtraPrice('0');
    setIsAvailable(true);
    setNameError('');
    setPriceError('');
  }

  function openCreateModal() {
    resetForm();
    setModal({ kind: 'form' });
  }

  function openEditModal(option: MenuOptionResponseDto) {
    setGroupId(String(option.optionGroupId));
    setName(option.name);
    setExtraPrice(String(option.extraPrice));
    setIsAvailable(option.isAvailable ?? false);
    setNameError('');
    setPriceError('');
    setModal({ kind: 'form', option });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedName = name.trim();
    const priceValue = extraPrice.trim() === '' ? undefined : Number(extraPrice);

    if (!normalizedName) {
      setNameError('Vui lòng nhập tên tùy chọn.');
      return;
    }
    if (normalizedName.length > 100) {
      setNameError('Tên tùy chọn không được vượt quá 100 ký tự.');
      return;
    }
    if (!groupId) {
      return;
    }
    if (priceValue !== undefined && (!Number.isFinite(priceValue) || priceValue < 0)) {
      setPriceError('Giá thêm phải là số không âm.');
      return;
    }
    if (modal?.kind !== 'form') return;

    const payload: MenuOptionDto = {
      optionGroupId: Number(groupId),
      name: normalizedName,
      ...(priceValue === undefined ? {} : { extraPrice: priceValue }),
      isAvailable,
    };
    const saved = await saveMenuOption(payload, modal.option?.id);
    if (saved) setModal(null);
  }

  async function handleDelete() {
    if (modal?.kind !== 'delete') return;
    const removed = await removeMenuOption(modal.option.id);
    if (removed) setModal(null);
  }

  function getGroupLabel(id: number): string {
    const group = groupsById.get(id);
    return group ? group.name : `Không xác định (#${id})`;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">Quản lý các lựa chọn và giá thêm cho món ăn.</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="relative block sm:w-64">
            <span className="sr-only">Tìm theo tên tùy chọn</span>
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Tìm tùy chọn..."
              className="min-h-11 w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
            />
          </label>
          {optionGroups.length > 0 ? (
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 text-sm font-medium text-white hover:bg-emerald-700"
            >
              <Plus size={17} aria-hidden="true" />
              Thêm tùy chọn
            </button>
          ) : (
            <Link
              to="/menu-option-groups"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Tạo nhóm tùy chọn
            </Link>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3 rounded-md border border-slate-200 bg-white p-4" role="status" aria-label="Đang tải tùy chọn">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="h-10 animate-pulse rounded-md bg-slate-100" />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-start gap-3 rounded-md border border-slate-200 bg-white p-4 sm:flex-row sm:items-center" role="alert">
          <AlertCircle size={18} className="text-red-600" aria-hidden="true" />
          <p className="flex-1 text-sm text-slate-700">{error}</p>
          <button
            type="button"
            onClick={() => void reload()}
            className="inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw size={15} aria-hidden="true" />
            Thử lại
          </button>
        </div>
      ) : filteredOptions.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-md border border-slate-200 bg-white p-8 text-center">
          <ListFilter size={24} className="text-slate-400" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-slate-800">
              {searchTerm.trim() ? 'Không tìm thấy tùy chọn phù hợp.' : 'Chưa có tùy chọn nào.'}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {searchTerm.trim()
                ? 'Thử từ khóa khác hoặc xóa nội dung tìm kiếm.'
                : optionGroups.length > 0
                  ? 'Thêm tùy chọn để khách có thể tùy chỉnh món ăn.'
                  : 'Trước tiên hãy tạo một nhóm tùy chọn.'}
            </p>
          </div>
          {searchTerm.trim() ? (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="min-h-11 rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Xóa tìm kiếm
            </button>
          ) : optionGroups.length > 0 ? (
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-emerald-600 px-3 text-sm font-medium text-white hover:bg-emerald-700"
            >
              <Plus size={16} aria-hidden="true" />
              Thêm tùy chọn
            </button>
          ) : (
            <Link
              to="/menu-option-groups"
              className="inline-flex min-h-11 items-center rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Tạo nhóm tùy chọn
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-md border border-slate-200 bg-white md:block">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th scope="col" className="px-3 py-2.5">Mã</th>
                  <th scope="col" className="px-3 py-2.5">Tên tùy chọn</th>
                  <th scope="col" className="px-3 py-2.5">Nhóm</th>
                  <th scope="col" className="px-3 py-2.5">Giá thêm</th>
                  <th scope="col" className="px-3 py-2.5">Trạng thái</th>
                  <th scope="col" className="px-3 py-2.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredOptions.map((option) => (
                  <tr key={option.id} className="text-slate-700">
                    <td className="whitespace-nowrap px-3 py-2.5 text-slate-500">{option.id}</td>
                    <td className="px-3 py-2.5 font-medium text-slate-800">{option.name}</td>
                    <td className="px-3 py-2.5">{getGroupLabel(option.optionGroupId)}</td>
                    <td className="whitespace-nowrap px-3 py-2.5">
                      {formatCurrencyVnd(option.extraPrice)}
                    </td>
                    <td className="px-3 py-2.5">
                      <AvailabilityStatus isAvailable={option.isAvailable} />
                    </td>
                    <td className="px-3 py-2.5">
                      <OptionActions
                        option={option}
                        onEdit={openEditModal}
                        onDelete={() => setModal({ kind: 'delete', option })}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-2 md:hidden">
            {filteredOptions.map((option) => (
              <article key={option.id} className="rounded-md border border-slate-200 bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">{option.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{getGroupLabel(option.optionGroupId)}</p>
                  </div>
                  <AvailabilityStatus isAvailable={option.isAvailable} />
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-2 text-sm">
                  <span className="text-slate-500">Giá thêm</span>
                  <span className="font-medium text-slate-800">
                    {formatCurrencyVnd(option.extraPrice)}
                  </span>
                </div>
                <div className="mt-2 flex justify-end border-t border-slate-200 pt-2">
                  <OptionActions
                    option={option}
                    onEdit={openEditModal}
                    onDelete={() => setModal({ kind: 'delete', option })}
                  />
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {modal?.kind === 'form' && (
        <Modal
          title={modal.option ? 'Sửa tùy chọn' : 'Thêm tùy chọn'}
          isBusy={isSaving}
          onClose={() => setModal(null)}
        >
          <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4 p-4">
            <div>
              <label htmlFor="menu-option-group" className="mb-1.5 block text-sm font-medium text-slate-700">
                Nhóm tùy chọn <span className="text-red-600">*</span>
              </label>
              <select
                id="menu-option-group"
                required
                value={groupId}
                onChange={(event) => setGroupId(event.target.value)}
                className="min-h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
              >
                <option value="">Chọn nhóm tùy chọn</option>
                {optionGroups.map((group) => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
              {optionGroups.length === 0 && (
                <p className="mt-1 text-xs text-slate-500">
                  Chưa có nhóm.{' '}
                  <Link to="/menu-option-groups" className="underline underline-offset-2">
                    Tạo nhóm tùy chọn
                  </Link>
                </p>
              )}
            </div>
            <div>
              <label htmlFor="menu-option-name" className="mb-1.5 block text-sm font-medium text-slate-700">
                Tên tùy chọn <span className="text-red-600">*</span>
              </label>
              <input
                id="menu-option-name"
                autoFocus
                required
                minLength={1}
                maxLength={100}
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setNameError('');
                }}
                aria-invalid={Boolean(nameError)}
                aria-describedby={nameError ? 'menu-option-name-error' : undefined}
                className="min-h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                placeholder="Nhập tên tùy chọn"
              />
              {nameError && (
                <p id="menu-option-name-error" className="mt-1 text-xs text-red-600" role="alert">
                  {nameError}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="menu-option-extra-price" className="mb-1.5 block text-sm font-medium text-slate-700">
                Giá thêm (VND)
              </label>
              <input
                id="menu-option-extra-price"
                type="number"
                min={0}
                step="any"
                value={extraPrice}
                onChange={(event) => {
                  setExtraPrice(event.target.value);
                  setPriceError('');
                }}
                aria-invalid={Boolean(priceError)}
                aria-describedby={priceError ? 'menu-option-price-error' : undefined}
                className="min-h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
              />
              {priceError && (
                <p id="menu-option-price-error" className="mt-1 text-xs text-red-600" role="alert">
                  {priceError}
                </p>
              )}
            </div>
            <label className="flex min-h-11 items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(event) => setIsAvailable(event.target.checked)}
                className="h-4 w-4 accent-slate-700"
              />
              Đang phục vụ
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
                disabled={isSaving || optionGroups.length === 0}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving && <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />}
                {isSaving ? 'Đang lưu...' : 'Lưu tùy chọn'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modal?.kind === 'delete' && (
        <ConfirmDialog
          title="Xóa tùy chọn"
          message={`Bạn có chắc muốn xóa tùy chọn “${modal.option.name}”? Thao tác này không thể hoàn tác.`}
          isLoading={deletingId === modal.option.id}
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

interface OptionActionsProps {
  option: MenuOptionResponseDto;
  onEdit: (option: MenuOptionResponseDto) => void;
  onDelete: () => void;
}

function OptionActions({ option, onEdit, onDelete }: OptionActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      <button
        type="button"
        onClick={() => onEdit(option)}
        aria-label={`Sửa ${option.name}`}
        className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100"
      >
        <Pencil size={16} aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label={`Xóa ${option.name}`}
        className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-red-600 hover:bg-slate-100"
      >
        <Trash2 size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

export default MenuOptionsPage;
