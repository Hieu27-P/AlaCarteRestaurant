import { useMemo, useState, type FormEvent } from 'react';
import {
  AlertCircle,
  FolderOpen,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import Modal from '../components/Modal';
import { useMenuOptionGroups } from '../hooks/useMenuOptionGroups';
import type { OptionGroupResponseDto } from '../types/menuOptionGroup';

type ModalState =
  | { kind: 'form'; group?: OptionGroupResponseDto }
  | { kind: 'delete'; group: OptionGroupResponseDto }
  | null;

function MenuOptionGroupsPage() {
  const {
    optionGroups,
    isLoading,
    error,
    reload,
    saveOptionGroup,
    removeOptionGroup,
    isSaving,
    deletingId,
  } = useMenuOptionGroups();
  const [searchTerm, setSearchTerm] = useState('');
  const [modal, setModal] = useState<ModalState>(null);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');

  const filteredGroups = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase('vi');
    return query
      ? optionGroups.filter((group) => group.name.toLocaleLowerCase('vi').includes(query))
      : optionGroups;
  }, [optionGroups, searchTerm]);

  function openCreateModal() {
    setName('');
    setNameError('');
    setModal({ kind: 'form' });
  }

  function openEditModal(group: OptionGroupResponseDto) {
    setName(group.name);
    setNameError('');
    setModal({ kind: 'form', group });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedName = name.trim();

    if (!normalizedName) {
      setNameError('Vui lòng nhập tên nhóm tùy chọn.');
      return;
    }
    if (normalizedName.length > 100) {
      setNameError('Tên nhóm tùy chọn không được vượt quá 100 ký tự.');
      return;
    }
    if (modal?.kind !== 'form') return;

    const saved = await saveOptionGroup(
      { name: normalizedName },
      modal.group?.id,
    );
    if (saved) setModal(null);
  }

  async function handleDelete() {
    if (modal?.kind !== 'delete') return;
    const removed = await removeOptionGroup(modal.group.id);
    if (removed) setModal(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">Tạo nhóm để tổ chức các tùy chọn món ăn.</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="relative block sm:w-64">
            <span className="sr-only">Tìm theo tên nhóm</span>
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Tìm nhóm tùy chọn..."
              className="min-h-11 w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
            />
          </label>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 text-sm font-medium text-white hover:bg-emerald-700"
          >
            <Plus size={17} aria-hidden="true" />
            Thêm nhóm
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3 rounded-md border border-slate-200 bg-white p-4" role="status" aria-label="Đang tải nhóm tùy chọn">
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
      ) : filteredGroups.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-md border border-slate-200 bg-white p-8 text-center">
          <FolderOpen size={24} className="text-slate-400" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-slate-800">
              {searchTerm.trim() ? 'Không tìm thấy nhóm phù hợp.' : 'Chưa có nhóm tùy chọn nào.'}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {searchTerm.trim()
                ? 'Thử từ khóa khác hoặc xóa nội dung tìm kiếm.'
                : 'Thêm nhóm để liên kết với các món ăn.'}
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
          ) : (
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-emerald-600 px-3 text-sm font-medium text-white hover:bg-emerald-700"
            >
              <Plus size={16} aria-hidden="true" />
              Thêm nhóm
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
                  <th scope="col" className="px-3 py-2.5">Tên nhóm</th>
                  <th scope="col" className="px-3 py-2.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredGroups.map((group) => (
                  <tr key={group.id} className="text-slate-700">
                    <td className="whitespace-nowrap px-3 py-2.5 text-slate-500">{group.id}</td>
                    <td className="px-3 py-2.5 font-medium text-slate-800">{group.name}</td>
                    <td className="px-3 py-2.5">
                      <GroupActions
                        group={group}
                        onEdit={openEditModal}
                        onDelete={() => setModal({ kind: 'delete', group })}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-2 md:hidden">
            {filteredGroups.map((group) => (
              <article key={group.id} className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">{group.name}</p>
                  <p className="mt-1 text-xs text-slate-500">Mã: {group.id}</p>
                </div>
                <GroupActions
                  group={group}
                  onEdit={openEditModal}
                  onDelete={() => setModal({ kind: 'delete', group })}
                />
              </article>
            ))}
          </div>
        </>
      )}

      {modal?.kind === 'form' && (
        <Modal
          title={modal.group ? 'Sửa nhóm tùy chọn' : 'Thêm nhóm tùy chọn'}
          isBusy={isSaving}
          onClose={() => setModal(null)}
        >
          <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4 p-4">
            <div>
              <label htmlFor="option-group-name" className="mb-1.5 block text-sm font-medium text-slate-700">
                Tên nhóm <span className="text-red-600">*</span>
              </label>
              <input
                id="option-group-name"
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
                aria-describedby={nameError ? 'option-group-name-error' : undefined}
                className="min-h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
              />
              {nameError && (
                <p id="option-group-name-error" className="mt-1 text-xs text-red-600" role="alert">
                  {nameError}
                </p>
              )}
              <p className="mt-1 text-xs text-slate-500">Tối đa 100 ký tự.</p>
            </div>
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
                {isSaving ? 'Đang lưu...' : 'Lưu nhóm'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modal?.kind === 'delete' && (
        <ConfirmDialog
          title="Xóa nhóm tùy chọn"
          message={`Bạn có chắc muốn xóa nhóm “${modal.group.name}”? Thao tác này không thể hoàn tác.`}
          isLoading={deletingId === modal.group.id}
          onCancel={() => setModal(null)}
          onConfirm={() => void handleDelete()}
        />
      )}
    </div>
  );
}

interface GroupActionsProps {
  group: OptionGroupResponseDto;
  onEdit: (group: OptionGroupResponseDto) => void;
  onDelete: () => void;
}

function GroupActions({ group, onEdit, onDelete }: GroupActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      <button
        type="button"
        onClick={() => onEdit(group)}
        aria-label={`Sửa ${group.name}`}
        className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100"
      >
        <Pencil size={16} aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label={`Xóa ${group.name}`}
        className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-red-600 hover:bg-slate-100"
      >
        <Trash2 size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

export default MenuOptionGroupsPage;
