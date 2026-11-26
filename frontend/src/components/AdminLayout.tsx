import { useState } from 'react';
import { Leaf, ListFilter, Menu, SlidersHorizontal, Tags, Utensils, X } from 'lucide-react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';

const navigationItems = [
  { label: 'Quản lý Danh mục', to: '/categories', icon: Tags },
  { label: 'Quản lý Thực đơn', to: '/menu-items', icon: Utensils },
  { label: 'Nhóm tùy chọn', to: '/menu-option-groups', icon: SlidersHorizontal },
  { label: 'Tùy chọn món', to: '/menu-options', icon: ListFilter },
];

const titlesByPath: Record<string, string> = {
  '/categories': 'Quản lý Danh mục',
  '/menu-items': 'Quản lý Thực đơn',
  '/menu-option-groups': 'Nhóm tùy chọn',
  '/menu-options': 'Tùy chọn món',
};

function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname.replace(/\/+$/, '') || '/';
  const pageTitle = titlesByPath[currentPath] ?? 'Quản trị nhà hàng';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Đóng menu điều hướng"
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-56 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-slate-200 px-4">
          <Link
            to="/categories"
            className="flex min-h-11 items-center gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            aria-label="À la carte - về trang quản trị"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
              <Leaf size={19} strokeWidth={2.2} aria-hidden="true" />
            </span>
            <span className="text-base font-semibold tracking-tight text-slate-800">
              Tịnh Mộc Chay
            </span>
          </Link>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-emerald-600 lg:hidden"
            aria-label="Đóng menu điều hướng"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Điều hướng chính">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Quản lý nhà hàng
          </p>
          {navigationItems.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                `flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon size={19} strokeWidth={1.9} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="min-h-screen lg:pl-56">
        <header className="sticky top-0 z-20 flex h-12 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-emerald-600 lg:hidden"
              aria-label="Mở menu điều hướng"
              aria-expanded={isSidebarOpen}
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={21} aria-hidden="true" />
            </button>
            <h1 className="truncate text-lg font-semibold text-slate-800">{pageTitle}</h1>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
