# Tiến trình dự án À la carte

> Cập nhật theo trạng thái workspace ngày 26/11/2026. Tài liệu này phân biệt phần đã có mã nguồn với tình trạng chạy thực tế; không xem cấu hình hoặc mã gọi API là bằng chứng kiểm thử end-to-end.

## 1. Tổng quan kiến trúc hệ thống hiện tại

### Backend trong `src/`

Qua rà soát mã nguồn trong [`src/`](../../src/), hiện có một microservice nghiệp vụ và một API Gateway:

| Project | Vai trò | Project profile trong `launchSettings.json` |
| --- | --- | --- |
| [`MenuService`](../../src/Services/MenuService/) | API danh mục, món ăn, nhóm tùy chọn và tùy chọn; .NET 6, EF Core/MySQL | HTTP `http://localhost:5063`; HTTPS `https://localhost:7153` |
| [`ApiGateways`](../../src/ApiGateways/) | YARP reverse proxy; .NET 6 | HTTP `http://localhost:5250`; HTTPS `https://localhost:7241` |

IIS Express còn cấu hình các cổng phụ: MenuService HTTP `26984` / SSL `44381`; ApiGateways HTTP `34404` / SSL `44384`. Đây là profile khác với các project profile trong bảng.

[`ApiGateways/appsettings.json`](../../src/ApiGateways/appsettings.json) khai báo route `menu-route`, khớp `/api/{**catch-all}` và chuyển tới cluster `menu-cluster`, destination `https://localhost:7153`. Cấu hình gateway hiện có một route/cluster đích này. `DangerousAcceptAnyServerCertificate` được đặt `true`.

[`ApiGateways/Program.cs`](../../src/ApiGateways/Program.cs) đăng ký chính sách CORS `AllowFrontend`: cho phép origin `http://localhost:5173` và `http://localhost:3000`, mọi header/method và credentials. Cấu hình CORS nằm ở Gateway.

MenuService dùng MySQL; connection string trong [`MenuService/appsettings.json`](../../src/Services/MenuService/appsettings.json) trỏ tới `localhost:3306`, database `menu_db`.

**Phạm vi backend hiện có:** trong `src/` không thấy project OrderService, TableService, PaymentService hoặc microservice nghiệp vụ nào khác ngoài MenuService. Các thư mục `bin/` và `obj/` là build output, không được tính là service.

### Frontend

[`frontend/`](../) là ứng dụng React 19 + TypeScript + Vite, Tailwind CSS v4 qua `@tailwindcss/vite`, React Router, Axios, lucide-react và Sonner. `npm run dev`, `npm run build`, `npm run lint` là các script hiện có trong [`package.json`](../package.json). API client lấy `VITE_API_BASE_URL`, mặc định `http://localhost:5250`.

Các tầng hiện có trong [`frontend/src/`](../src/):

- `types/`: DTO/interfaces cho Category, MenuItem, MenuOptionGroup và MenuOption.
- `services/`: `apiClient.ts` và bốn resource service; giao tiếp HTTP tập trung qua `apiClient`.
- `hooks/`: hook dữ liệu/CRUD cho bốn resource và hook tải dữ liệu menu khách hàng.
- `components/`: `AdminLayout`, `Modal`, `ConfirmDialog`.
- `pages/`: bốn màn hình quản trị và `CustomerMenuPage`.
- `utils/`: định dạng tiền VND và trích xuất thông báo lỗi.

`App.tsx` đặt `/` trực tiếp vào trang khách hàng; các trang quản trị nằm riêng dưới `/admin/*`, dùng `AdminLayout`.

## 2. Các tính năng ĐÃ HOÀN THÀNH (Done)

> “Đã hoàn thành” ở đây nghĩa là đã có UI, types, service và luồng gọi API trong mã nguồn. Tại thời điểm rà soát, các cổng HTTP/HTTPS của MenuService và Gateway bên trên không lắng nghe, nên chưa xác nhận CRUD chạy thông suốt end-to-end với backend đang hoạt động.

### Lớp API và CRUD quản trị

- [`apiClient.ts`](../src/services/apiClient.ts): Axios base URL lấy từ biến môi trường hoặc fallback `http://localhost:5250`; interceptor chuẩn hóa lỗi thành `ApiError`.
- Các service [`categoryService.ts`](../src/services/categoryService.ts), [`menuItemService.ts`](../src/services/menuItemService.ts), [`menuOptionGroupService.ts`](../src/services/menuOptionGroupService.ts), [`menuOptionService.ts`](../src/services/menuOptionService.ts) có `getAll`, `getById`, `create`, `update`, `remove`.
- MenuService controllers có GET danh sách, GET theo ID, POST, PUT và DELETE cho `/api/Categories`, `/api/MenuItems`, `/api/MenuOptionGroups`, `/api/MenuOptions` (chi tiết hợp đồng frontend tại [`menu-swagger.json`](./menu-swagger.json)).
- [`AdminLayout.tsx`](../src/components/AdminLayout.tsx): sidebar responsive, điều hướng tới bốn trang quản trị; header compact.
- [`CategoriesPage.tsx`](../src/pages/CategoriesPage.tsx): tìm kiếm, thêm/sửa trong modal, xóa có xác nhận.
- [`MenuItemsPage.tsx`](../src/pages/MenuItemsPage.tsx): tìm kiếm/quản lý món, chọn danh mục và nhóm tùy chọn, modal thêm/sửa và xác nhận xóa.
- [`MenuOptionGroupsPage.tsx`](../src/pages/MenuOptionGroupsPage.tsx) và [`MenuOptionsPage.tsx`](../src/pages/MenuOptionsPage.tsx): quản lý nhóm tùy chọn và tùy chọn; modal thêm/sửa, xác nhận xóa.
- Các trang quản trị có trạng thái loading, empty, error/thử lại; hook xử lý toast và tải lại dữ liệu sau thao tác.

### Trang khách hàng

- [`CustomerMenuPage.tsx`](../src/pages/CustomerMenuPage.tsx) và [`useCustomerMenu.ts`](../src/hooks/useCustomerMenu.ts) tải danh mục, món ăn, nhóm tùy chọn và tùy chọn qua service. Chi tiết món được tải theo ID để lấy các nhóm liên quan; chỉ hiển thị option đang khả dụng.
- Có tìm kiếm món, lọc danh mục, thẻ món với ảnh/giá/trạng thái, skeleton, empty state và error/retry.
- Modal món cho phép chọn nhiều option tùy chọn, thay đổi số lượng và tính giá động; giỏ hàng tạm hiển thị các dòng món và tạm tính.

### Quy ước UI/UX đang áp dụng

- **Admin:** compact dashboard, nền slate nhạt, thẻ/bảng trắng, viền mảnh, chữ nhỏ gọn; sidebar `w-56`, header `h-12`, tiêu đề `text-lg`, điểm nhấn emerald.
- **Customer Menu:** mobile-first; giao diện tham khảo [`frontend/docs/Code`](./Code/) với nền kem, vàng, đen và xanh olive/forest; danh mục cuộn ngang, thẻ món và bottom-sheet/modal thân thiện thao tác chạm.

## 3. Các phần đang dùng giải pháp tạm / Chưa có Backend (Mock / Pending)

- Giỏ hàng chỉ nằm trong React state: không persist khi tải lại trang, không tạo đơn, không có checkout vì hiện chưa có `OrderService` hoặc contract Order trong workspace.
- Chưa có service/API cho đặt bàn, bàn/QR, ưu đãi, đánh giá, gallery khách hàng hoặc thanh toán. Những section dữ liệu mẫu tương ứng trong giao diện tham khảo không được triển khai thành tính năng có dữ liệu giả trong trang React.
- Chưa có xác nhận vận hành end-to-end: tại lần rà soát, `localhost:5250`, `7241`, `5063`, `7153` không lắng nghe; `localhost:3306` có TCP listener. Vì vậy không thể kiểm tra CRUD thật, tải menu, tùy chọn, hoặc thao tác giỏ dựa trên dữ liệu backend.
- Không có contract/API Order, Table hoặc Payment trong [`frontend/docs/`](./).

## 4. Tài liệu & Quy tắc AI Coding đã thiết lập

- [`.github/copilot-instructions.md`](../../.github/copilot-instructions.md): mô tả kiến trúc, stack, phân tầng frontend, quy tắc Swagger, UI/UX và quy trình kiểm tra. File này hướng dẫn ưu tiên `frontend/docs/*.json` làm nguồn API.
- Hiện **không có thư mục `.github/prompts/`** trong workspace.
- [`frontend/docs/skills/create-crud-feature.md`](./skills/create-crud-feature.md): quy trình xây dựng CRUD từ Swagger.
- [`frontend/docs/skills/create-customer-page.prompt.md`](./skills/create-customer-page.prompt.md): hướng dẫn UX cho menu khách hàng và giỏ tạm.
- [`frontend/docs/menu-swagger.json`](./menu-swagger.json): hợp đồng API MenuService hiện có; chưa thấy Swagger cho order, table/QR hoặc payment.
- [`frontend/docs/Code/`](./Code/): HTML/CSS và ảnh dùng làm tài liệu tham khảo giao diện; có kèm bản phân phối Bootstrap cho mẫu tĩnh, không phải dependency UI của React hiện tại.

## 5. Lộ trình phát triển tiếp theo (Next Steps)

1. **Khôi phục và xác minh luồng hiện có:** chạy MySQL, MenuService và ApiGateways theo các project profile; kiểm tra Swagger, CORS và CRUD qua Gateway; xác nhận dữ liệu thật trên từng trang.
2. **Thiết kế OrderService:** thống nhất DTO/Swagger, vòng đời đơn, chi tiết món, giá/tùy chọn và lưu trữ; sau đó bổ sung route Gateway, types/services/hooks và giao diện tạo/xem đơn.
3. **Bổ sung TableService và QR tại bàn:** xác định schema/API bàn và liên kết bàn với đơn trước khi triển khai quét QR phía khách.
4. **Tích hợp thanh toán:** chọn nhà cung cấp và luồng xác nhận/thất bại/refund trước khi thêm API/UI; hiện chưa có provider hoặc payment contract trong workspace.
5. **Hoàn thiện kiểm thử tích hợp:** kiểm thử Gateway → service → database cho menu, order, table và payment; chỉ đánh dấu các luồng “thông suốt” sau khi xác minh trên môi trường chạy.
