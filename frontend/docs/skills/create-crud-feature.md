---
name: crud-from-swagger
description: Dựng tính năng CRUD hoàn chỉnh (types, service, hook, trang quản lý, route) cho một tài nguyên dựa trên file swagger trong frontend/docs. Dùng khi người dùng yêu cầu làm CRUD/trang quản lý cho một resource như Categories, Dishes, Orders.
---

# Skill: Xây dựng tính năng CRUD hoàn chỉnh từ Swagger

Khi người dùng gọi skill này kèm tên một tài nguyên (ví dụ: Categories, Dishes, Orders), thực hiện tuần tự các bước dưới đây. Tuân thủ toàn bộ quy tắc trong `CLAUDE.md`. Nếu có điểm nào swagger không rõ, **dừng và hỏi người dùng**, không tự bịa.

## Bước 0: Kiểm tra những gì đã có

- Xem `frontend/src/types/`, `services/`, `hooks/`, `components/`, `pages/` để biết đã có gì liên quan (đặc biệt `apiClient.ts`, Modal, ConfirmDialog, Skeleton, EmptyState, ErrorState, Sidebar).
- Tái sử dụng những gì có sẵn. Nếu đã có trang CRUD mẫu (ví dụ `pages/CategoriesPage.tsx`), **bám theo cấu trúc và giao diện của trang đó**.

## Bước 1: Đọc Schema

- Mở file `*-swagger.json` tương ứng trong `frontend/docs/`.
- Xác định chính xác đường dẫn endpoint (GET danh sách, GET theo id nếu có, POST, PUT, DELETE).
- Ghi nhận cấu trúc Request/Response DTO: tên field, kiểu dữ liệu, nullable, bắt buộc, giới hạn độ dài (`maxLength`), enum.
- Xác định API có phân trang (`page`, `pageSize`) hoặc tham số tìm kiếm (`search`, `keyword`) hay không.
- Nếu thiếu endpoint hoặc DTO cần thiết: dừng và hỏi.

## Bước 2: Tạo Types

- Tạo hoặc cập nhật file trong `frontend/src/types/` (ví dụ `category.ts`).
- Định nghĩa đầy đủ:
  - Kiểu dữ liệu trả về (Response DTO).
  - Kiểu dữ liệu cho form **Tạo mới** (Create) và **Cập nhật** (Update).
  - Kiểu phân trang nếu API có hỗ trợ.
- Khớp 100% swagger, đúng nullable (`T | null`) và optional. Cấm dùng `any`.

## Bước 3: Tạo Service

- Tạo file trong `frontend/src/services/` (ví dụ `categoryService.ts`), dùng `apiClient` để viết các hàm: `getAll`, `getById` (nếu có), `create`, `update`, `remove`.
- Khai báo kiểu tham số và kiểu trả về rõ ràng bằng types ở Bước 2.
- Không đọc `error.response` ở đây nếu interceptor đã chuẩn hóa lỗi; để lỗi nổi lên cho hook xử lý.

## Bước 4: Tạo Hook

- Tạo hook trong `frontend/src/hooks/` (ví dụ `useCategories.ts`) bọc service, quản lý: `data`, `isLoading`, `error`, hàm `reload`, và các hàm `create/update/remove`.
- Sau khi Thêm/Sửa/Xóa thành công: hiện toast thành công và tự động tải lại danh sách. Khi thất bại: hiện toast lỗi với `message` đã chuẩn hóa.

## Bước 5: Dựng giao diện (UI)

Tạo trang quản lý trong `frontend/src/pages/` gồm:

- **Thanh công cụ phía trên:** tiêu đề, ô tìm kiếm nhanh, nút "+ Thêm mới".
  - Nếu swagger có tham số tìm kiếm thì tìm phía server (kèm debounce). Nếu không có thì lọc phía client.
- **Khu vực hiển thị dữ liệu:** Bảng (Table) trên màn hình lớn và lưới thẻ (Grid Cards) trên màn hình nhỏ, hiển thị đầy đủ các trường quan trọng. Dùng phân trang nếu swagger có hỗ trợ.
- **Đủ 3 trạng thái:** Loading (Skeleton), Empty (thông báo + gợi ý thêm mới), Error (thông báo + nút "Thử lại").
- **Hành động trên từng dòng/thẻ:**
  - Nút **Sửa**: mở Modal với dữ liệu cũ điền sẵn.
  - Nút **Xóa**: mở hộp thoại xác nhận (ConfirmDialog) trước khi gọi API xóa.
- **Form Tạo/Sửa (trong Modal):**
  - Validate theo swagger (field bắt buộc, `maxLength`, kiểu số...), hiển thị lỗi ngay dưới từng field.
  - Khóa nút Submit và hiện trạng thái đang xử lý khi đang gọi API.
  - Field nullable (ví dụ `categoryId`) cho phép để trống; field tham chiếu tới resource khác dùng dropdown lấy dữ liệu từ service tương ứng.
  - Field ảnh (`imageUrl`): hỏi người dùng nên nhập link hay upload nếu chưa rõ; hiển thị ảnh xem trước.
  - Field tiền tệ hiển thị bằng hàm format VND dùng chung.
- Kết nối vào hook/service vừa tạo. Không gọi `axios`/`fetch` trong `.tsx`.
- Giao diện thân thiện cảm ứng: nút đủ lớn (tối thiểu 44px), khoảng cách thoáng, responsive cho tablet và điện thoại.

## Bước 6: Đăng ký route và menu

- Thêm route của trang mới vào router.
- Thêm mục điều hướng tương ứng vào Sidebar.

## Bước 7: Kiểm tra trước khi báo xong

- Chạy `npm run build` và `npm run lint` trong `frontend/`, sửa hết lỗi.
- Tự rà lại: đủ 3 trạng thái, types khớp swagger, không có `any`, không có `axios`/`fetch` trong `.tsx`, URL lấy từ `VITE_API_BASE_URL`.
- Tóm tắt ngắn gọn: danh sách file đã tạo/sửa và các giả định (nếu có) để người dùng duyệt.