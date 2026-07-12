# Hướng Dẫn Cho Người Mới Bắt Đầu (Getting Started)

Chào mừng bạn đến với dự án Figma-to-Code! Tài liệu này hướng dẫn cách cài đặt, chạy thử và thực hiện các luồng công việc hàng ngày trong hệ thống đồng bộ hóa token thiết kế.

---

## 1. Yêu Cầu Hệ Thống (Prerequisites)

* **Node.js:** Phiên bản `>= 20`
* **npm:** Phiên bản `>= 10`
* **Figma Desktop:** Dành cho lập trình viên cần xuất snapshot từ Figma.

---

## 2. Thiết Lập Ban Đầu (Initial Setup)

Chạy các lệnh sau tại thư mục gốc của dự án để chuẩn bị môi trường:

```bash
# 1. Di chuyển vào thư mục tooling
cd figma-to-code

# 2. Cài đặt các thư viện phụ thuộc
npm install

# 3. Biên dịch mã nguồn TypeScript của các CLI scripts
npm run build

# 4. Biên dịch mã nguồn Figma Plugin
npm run plugin:build

# 5. Chạy toàn bộ các bài kiểm thử unit/integration
npm test
```

Nếu tất cả các bài kiểm tra báo xanh, môi trường của bạn đã sẵn sàng!

---

## 3. Luồng Công Việc Hàng Ngày (Daily Workflows)

### Tình huống A: Thiết kế trên Figma thay đổi (Thêm/Sửa biến)
1. Hãy chạy lệnh biên dịch plugin để đảm bảo mã chạy mới nhất:
   ```bash
   npm run plugin:build
   ```
2. Mở ứng dụng **Figma Desktop**, mở tệp thiết kế của bạn.
3. Import plugin từ manifest:
   * Menu Quick Action (`Ctrl + /`) -> **Import plugin from manifest...**
   * Chọn tệp `figma-to-code/plugin/figma-token-export/manifest.json`.
4. Mở plugin, nhấp **Scan Variables** và bấm **Download** để tải tệp `figma-variables.snapshot.json` về.
5. Sao chép tệp snapshot vừa tải về vào thư mục dự án:
   `figma-to-code/generated/figma-variables.snapshot.json`
6. Mở file [token-map.json](file:///e:/Projects/AI-Skills/figma-to-code/token-map.json) và khai báo thêm các ánh xạ được duyệt cho biến mới:
   ```json
   {
     "figmaToken": "colors/brand-new",
     "systemToken": "--brand-coral-600",
     "status": "approved"
   }
   ```
7. Chạy lệnh đồng bộ hóa để cập nhật adapter SCSS:
   ```bash
   npm run tokens:sync
   ```

### Tình huống B: Code SCSS thay đổi (Thêm biến SCSS mới)
1. Thêm biến SCSS của bạn vào tệp tương ứng trong `styles/tokens/` (ví dụ: `_semantic.scss`).
2. Chạy lệnh đồng bộ hóa để cập nhật lại thông tin đăng ký hệ thống:
   ```bash
   npm run tokens:sync
   ```
3. Chạy lệnh kiểm tra tính cập nhật để đảm bảo file tự động sinh trùng khớp hoàn toàn:
   ```bash
   npm run tokens:check-stale
   ```

---

## 4. Danh Sách Câu Lệnh CLI

* **`npm run typecheck`:** Kiểm tra lỗi kiểu dữ liệu TypeScript tĩnh trên toàn bộ code scripts.
* **`npm run test`:** Khởi chạy bộ unit test trên vitest (kiểm thử parser, resolver, transformer).
* **`npm run tokens:scan`:** Chạy công cụ quét SCSS và ghi nhận file debug registry cục bộ.
* **`npm run tokens:sync`:** Quy trình đồng bộ hóa đầy đủ (Quét SCSS -> So khớp snapshot -> Validate lỗi -> Sinh adapter).
* **`npm run verify:automatable`:** Chốt chặn kiểm tra chất lượng tự động trước khi git commit hoặc đẩy lên CI.
