# AI-Skills — Figma-to-Code Pipeline

Repository này lưu trữ mã nguồn hệ thống **Figma-to-Code Token Synchronization Pipeline** và cây thư mục styles SCSS production.

---

## 1. Luồng Hoạt Động (Workflow Overview)

Hệ thống hoạt động dưới dạng một pipeline khép kín chạy từ khâu phân tích UI thiết kế, xuất snapshot biến từ Figma, đối chiếu với code SCSS thực tế, kiểm tra lỗi và sinh tệp thích ứng CSS variables tự động.

```text
[ Figma Design System ] ──(Figma Plugin)──> figma-variables.snapshot.json
                                                        │
[ Codebase SCSS Styles ] ──(PostCSS Scan)──> system-token-registry.debug.json
                                                        │
                                                        ▼
[ token-map.json (Human Approved) ] ────> Resolve & Validate (tokens:sync)
                                                        │
                                                        ├─> token-registry.generated.json
                                                        └─> mapped.generated.scss (CSS bridge)
```

---

## 2. Các Bước Thực Hiện Chi Tiết

### Bước 1: Trích xuất thiết kế từ Figma (Figma Token Snapshot Export)
1. Nhà thiết kế cập nhật các biến (Local Variables) trên Figma.
2. Nhà phát triển mở plugin **Figma Token Snapshot Export** (trong menu Plugins -> Development -> Import manifest).
3. Nhấp **Scan Variables** và **Download Snapshot** để lưu tệp tin `figma-variables.snapshot.json` tại `figma-to-code/generated/`.

### Bước 2: Quét mã nguồn SCSS thực tế (SCSS Token Scanner)
1. Sử dụng thư viện **PostCSS SCSS parser** để phân tích cú pháp AST của các file SCSS trong `styles/tokens`.
2. Trích xuất toàn bộ tên biến, giá trị thô, kiểu dữ liệu, các selector context (`:root`, `[data-theme='dark']`), responsive context (`@include media-up`) và các liên kết alias.
3. Tạo ra sơ đồ cấu trúc nhập (`@use`/`@forward`) và danh sách token code nội bộ.

### Bước 3: Ánh xạ & Đối chiếu (Token Resolver & Validator)
1. Lấy thông tin ánh xạ được duyệt trong tệp **`token-map.json`** làm nguồn đối chiếu chuẩn.
2. **Resolve:** Ghép các Figma variables với SCSS custom properties tương ứng.
3. **Validate:** Chạy chốt chặn kiểm tra:
   - `FIGMA_TOKEN_UNMAPPED_USED` (Lỗi nếu một biến Figma được đánh dấu đang sử dụng trong code nhưng chưa được cấu hình ánh xạ).
   - `MAPPING_TARGET_MISSING` (Lỗi nếu tệp ánh xạ trỏ đến một biến SCSS không tồn tại).
   - `VALUE_DRIFT` (Cảnh báo nếu giá trị màu sắc/kích thước giữa Figma và Code bị lệch nhau).
   - `TOKEN_CIRCULAR_REFERENCE` (Lỗi nếu phát hiện vòng lặp alias).

### Bước 4: Tạo tệp sinh tự động (Adapter Generation)
1. Sinh tệp **`token-registry.generated.json`** lưu thông tin đầy đủ để các AI Agent khác khai thác trong phát triển UI.
2. Sinh tệp **`mapped.generated.scss`** chứa cầu nối CSS variables dưới dạng `:root { --figma-xxx: var(--app-xxx); }` để thích ứng giá trị runtime.

---

## 3. Khởi Chạy Nhanh (Quick Start)

### Cài đặt và Chạy thử:
```bash
cd figma-to-code
npm install
npm run ci
```

### Các lệnh điều khiển hàng ngày:
* **Đồng bộ hóa toàn bộ:** `npm run tokens:sync` (Quét SCSS -> Đối chiếu snapshot -> Tạo adapter).
* **Kiểm tra trạng thái cập nhật:** `npm run tokens:check-stale` (Kiểm tra xem file adapter có bị lệch so với mã nguồn hay không).
* **Kiểm định chất lượng:** `npm run verify:automatable` (Chạy toàn bộ các Quality Gates gồm build, lint, theme, viewport responsive, accessibility).

---

## 4. Phân Chia Vai Trò Dữ Liệu (Source of Truth)

* **Figma Variables:** Thuộc về Figma Design System (chỉ sửa qua Figma).
* **Mã nguồn SCSS (`styles/`)**: Do con người viết và duy trì.
* **Quy tắc ánh xạ (`token-map.json`)**: Do con người quyết định thủ công (approved mappings).
* **Các file `.generated.*` (Adapter & Registry):** Do scripts tự sinh, **tuyệt đối không chỉnh sửa thủ công**.
