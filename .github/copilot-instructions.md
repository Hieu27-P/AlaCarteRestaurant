# Tổng quan dự án

- **Tên dự án:** Hệ thống bán hàng đa kênh (Omnichannel) & quản lý đặt món nhà hàng chay theo mô hình À la carte (AlaCarteRestaurant).
- **Backend:** .NET Microservices trong `src/`, giao tiếp qua YARP API Gateway tại `http://localhost:5250`.
- **Frontend:** React + TypeScript + Vite + Tailwind CSS v4, nằm trong `frontend/`.
- **Tài liệu API chuẩn (Single Source of Truth):** `frontend/docs/*.json` (ví dụ: `frontend/docs/menu-swagger.json`).
- **Người dùng cuối:** nhân viên (tablet) và khách hàng (điện thoại).
- Khi làm việc ở frontend, **không sửa code backend**. Các thư mục monolith cũ trong `src/` (nếu còn) bỏ qua, không dùng làm tham chiếu.

# Công nghệ & thư viện (chỉ dùng những thư viện này)

- Router: `react-router-dom`
- HTTP: `axios` (chỉ được dùng trong `services/apiClient.ts`)
- Icon: `lucide-react`
- Toast: `sonner`
- Style: Tailwind CSS v4 (dùng `@import "tailwindcss"` và `@theme` trong file CSS, **không có** `tailwind.config.js`, không viết theo cú pháp v3)
- Không tự cài thêm thư viện mới khi chưa hỏi người dùng.

# Quy tắc thẩm mỹ & UI/UX (Admin Dashboard - Bắt buộc)
- Phong cách: Minimalist Data-Centric Admin (tương tự Linear / Stripe Dashboard). Tuyệt đối không thiết kế kiểu ứng dụng tiêu dùng màu mè.
- Hình khối & Viền: Chỉ dùng bo góc nhẹ (`rounded` hoặc `rounded-md`, tối đa 6px). Không dùng `rounded-xl`, `rounded-2xl` hay `rounded-full` (trừ chấm trạng thái nhỏ). Phân tách khối bằng đường viền mỏng `border border-slate-200`, hạn chế tối đa `box-shadow`.
- Mật độ & Cỡ chữ (Compact): Tối ưu không gian hiển thị dữ liệu.
  - Chữ nội dung & bảng dữ liệu: `text-sm` (14px) hoặc `text-xs` (12px) cho nhãn phụ.
  - Tiêu đề trang (H1): `text-lg font-semibold` (18px).
  - Padding gọn gàng (`p-4` cho khung chính, `py-2 px-3` cho các nút bấm và dòng bảng).
- Màu sắc tiết chế: Nền chính `bg-slate-50`, bề mặt thẻ/bảng `bg-white`, chữ chính `text-slate-800`, chữ phụ `text-slate-500`. Chỉ dùng màu xanh lá (`emerald-600`) làm điểm nhấn duy nhất cho nút hành động chính (Primary button) và mục menu đang chọn.
- Header tối giản: Chỉ hiển thị tiêu đề trang và nút hành động chính (nếu có). Không đặt các badge trạng thái kết nối server thừa thãi trên Header.

# Quy tắc kiến trúc code Frontend

- **Tuyệt đối không** gọi `axios` hoặc `fetch` trực tiếp trong file giao diện (`.tsx`) hay trong `hooks/`. Mọi lời gọi API đi qua `services/`.
- URL gốc lấy từ `import.meta.env.VITE_API_BASE_URL` (mặc định `http://localhost:5250`). Không hard-code URL ở nơi khác.
- Cấu trúc thư mục trong `frontend/src/`:
  - `types/`: TypeScript interface **khớp 100%** với schema trong `frontend/docs/*.json` (tên field, kiểu dữ liệu, nullable, bắt buộc).
  - `services/`: `apiClient.ts` (cấu hình axios + interceptor) và các file service (`categoryService.ts`, `menuService.ts`...).
  - `hooks/`: custom hook bọc service để quản lý dữ liệu, loading, error (ví dụ `useCategories.ts`).
  - `components/`: thành phần tái sử dụng (Modal, ConfirmDialog, Badge, Sidebar, Skeleton, EmptyState, ErrorState, Card món ăn...).
  - `pages/`: các trang màn hình chính.
  - `utils/`: hàm tiện ích thuần (format tiền, ngày...).
- `apiClient.ts` dùng interceptor để chuẩn hóa lỗi về một dạng thống nhất (ví dụ `{ message: string; status?: number }`). UI chỉ hiển thị `message`, **không** tự đọc `error.response` trong component.
- Quy ước code:
  - Chỉ dùng function component và hooks.
  - TypeScript `strict`, **cấm dùng `any`** (dùng `unknown` rồi thu hẹp kiểu nếu cần).
  - Component và file component: `PascalCase`. File service, hook, util: `camelCase`. Mỗi file một component chính.
  - Định dạng tiền tệ VND bằng hàm dùng chung trong `utils/`, không tự format rải rác.

# Quy tắc làm việc với Swagger

- Chỉ dùng field, endpoint và kiểu dữ liệu có trong `frontend/docs/*.json`.
- Nếu swagger thiếu thông tin, mơ hồ hoặc mâu thuẫn: **dừng và hỏi lại người dùng, không tự bịa field/endpoint**.
- Khi swagger thay đổi, cập nhật `types/` và `services/` tương ứng trước, rồi mới sửa UI.

# Quy tắc phạm vi & quy trình

- Chỉ sửa các file liên quan đến yêu cầu. Không refactor hoặc đổi tên ngoài phạm vi.
- Ưu tiên tái sử dụng component/hook/service đã có, kiểm tra trước khi tạo mới.
- Mỗi lần chỉ làm một resource hoặc một màn hình.
- Trước khi báo hoàn thành, chạy `npm run build` và `npm run lint` trong `frontend/`, sửa hết lỗi. Sau đó tóm tắt ngắn gọn các file đã tạo/sửa.
- Lệnh thường dùng (chạy trong `frontend/`): `npm run dev`, `npm run build`, `npm run lint`.

# Ghi chú

- Khi cần quy trình dựng CRUD từ swagger, dùng skill `crud-from-swagger`.
- Resource làm đầu tiên (Categories) là **mẫu chuẩn** về cấu trúc và giao diện cho các resource sau.