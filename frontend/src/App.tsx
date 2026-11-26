import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import AdminLayout from './components/AdminLayout';
import CategoriesPage from './pages/CategoriesPage';
import CustomerMenuPage from './pages/CustomerMenuPage';
import MenuItemsPage from './pages/MenuItemsPage';
import MenuOptionGroupsPage from './pages/MenuOptionGroupsPage';
import MenuOptionsPage from './pages/MenuOptionsPage';

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            border: '1px solid var(--color-slate-200)',
            borderRadius: '6px',
            boxShadow: 'none',
            fontSize: '14px',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<CustomerMenuPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/categories" replace />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="menu-items" element={<MenuItemsPage />} />
          <Route path="menu-option-groups" element={<MenuOptionGroupsPage />} />
          <Route path="menu-options" element={<MenuOptionsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
