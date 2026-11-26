# Skill: Xây dựng giao diện Khách hàng (Customer Menu & Ordering UX)

Khi xây dựng giao diện cho khách hàng tại nhà hàng À la carte:
1. **Thiết kế Mobile-First & Tinh tế:** Nền sáng sạch sẽ (`bg-stone-50` hoặc `bg-white`), điểm nhấn màu xanh lá tự nhiên (`emerald-600` / `emerald-700`), bo góc vừa phải (`rounded-lg`), ưu tiên hiển thị hình ảnh món ăn rõ nét, tên món, mô tả ngắn và giá tiền định dạng VND (`120.000 đ`).
2. **Trải nghiệm chọn món À la carte:**
   - Thanh tab danh mục (Categories) dính cố định phía trên (sticky) và cho phép cuộn ngang mượt mà trên điện thoại.
   - Bấm vào món ăn sẽ mở Modal/Bottom-sheet hiển thị chi tiết món cùng các nhóm tùy chọn (`MenuOptionGroup`) và tùy chọn con (`MenuOption`) tương ứng, tự động cộng dồn giá tiền tùy chọn vào tổng giá món.
3. **Giỏ hàng tạm (Local Cart State):** Lưu danh sách món khách chọn vào React State / Context để hiển thị thanh "Xem giỏ hàng & Tạm tính" ở đáy màn hình khi có món được chọn