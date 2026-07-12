# Hướng Dẫn Chi Tiết Các Pha Hoạt Động (Workflow & Phases Deep Dive)

Tài liệu này là cẩm nang chuyên sâu dành cho nhà phát triển mới để làm quen, phân tích và hiểu rõ cơ chế hoạt động của từng pha (Phase) trong toàn bộ quy trình Figma-to-Code.

---

## Bức Tranh Toàn Cảnh (Workflow Overview)

Quy trình được chia làm 4 pha chính chạy tuần tự:

```text
               [ Figma Design File ]
                         │
                         ▼
┌──────────────────────────────────────────────────┐
│ Phase 1: Figma UI Analysis                       │ <── Phân tích cấu trúc UI
└────────────────────────┬─────────────────────────┘
                         │ (ui-spec.generated.json)
                         ▼
┌──────────────────────────────────────────────────┐
│ Phase 2: Token Synchronization Pipeline          │
│   ├─ Phase 2A: Figma Snapshot Exporter           │ <── Xuất tệp Figma snapshot
│   ├─ Phase 2B: Codebase Token AST Scanner        │ <── Quét AST SCSS codebase
│   └─ Phase 2C: Token Resolver & Validator        │ <── So khớp, kiểm tra & sinh adapter
└────────────────────────┬─────────────────────────┘
                         │ (registry & mapped.generated.scss)
                         ▼
┌──────────────────────────────────────────────────┐
│ Phase 3: Component-Aware Code Implementation     │ <── Sinh/Extend Angular & SCSS component
└────────────────────────┬─────────────────────────┘
                         │ (Angular + SCSS Code)
                         ▼
┌──────────────────────────────────────────────────┐
│ Phase 4: Verification                            │ <── Chốt chặn Quality Gates tự động
└──────────────────────────────────────────────────┘
```

---

## Phase 1: Figma UI Analysis (Phân Tích Thiết Kế)

### 1. Mục tiêu
Chuyển đổi một node/frame được chọn trên Figma thành đặc tả kỹ thuật dạng JSON (`ui-spec.generated.json`) để mô tả cấu trúc bố cục (layout) và responsive intent, chuẩn bị dữ liệu đầu vào sạch cho khâu triển khai code (Phase 3).

### 2. Chi tiết Input & Output
* **Input:**
  * **Figma Node URL / Selected Node ID:** Định danh đối tượng trên Figma.
  * **Design Context Payload (MCP):** Cấu trúc cây node Figma thô gồm kích thước, đệm (padding), khoảng cách (gap), căn lề (alignment), kiểu căn lề (horizontal/vertical sizing: HUG, FILL, FIXED).
  * **Ảnh chụp màn hình (Screenshot):** Hình ảnh thực tế của node giao diện.
* **Output:**
  * **`ui-spec.generated.json`:** Tuân thủ schema [ui-spec.schema.json](../schemas/ui-spec.schema.json). Ghi nhận responsive classification, token references gắn với từng ID cụ thể, và cảnh báo khác biệt giữa cây phân tích và ảnh chụp.

### 3. Cơ chế hoạt động (How it works)
* **Responsive Classifier:** Trình phân loại tự động dựa trên quy tắc logic:
  * Nếu phần tử có `absolute` -> Gán lớp **`Decorative absolute`**.
  * Nếu horizontal hoặc vertical sizing là `FILL` -> Gán lớp **`Fluid`**.
  * Nếu sizing là `HUG` -> Gán lớp **`Intrinsic`**.
  * **Quy tắc chặn lỗi:** Nếu là một Frame của Figma có kích thước cố định nhưng không sử dụng Auto Layout, nó sẽ được gán là **`Content-dependent`** thay vì **`Fixed`**. Điều này ngăn cản việc sinh CSS có kích thước cứng nhắc (ví dụ: `width: 1440px`), gây hỏng giao diện trên thiết bị di động.
* **Traceability:** Mọi thuộc tính màu nền/viền sử dụng token đều được gán chặt với `nodeId` của Figma để dễ dàng truy vết và gỡ lỗi sau này.

### 4. Lệnh liên quan
* **Kiểm tra schema ngoại tuyến:**
  ```bash
  cd figma-to-code
  npm run ui-spec:validate
  ```
  *(Mặc định kiểm tra tệp mẫu `tests/fixtures/ui-spec/sample.ui-spec.json`)*

---

## Phase 2A: Figma Token Snapshot Export (Xuất Snapshot Figma)

### 1. Mục tiêu
Xuất toàn bộ hệ thống biến thiết kế (Variables) đang lưu trên Figma thành tệp JSON snapshot tĩnh, phục vụ cho quá trình xử lý ngoại tuyến (chạy được trên CI không có mạng).

### 2. Chi tiết Input & Output
* **Input:**
  * Thao tác click chuột của nhà phát triển trên plugin Figma (hoặc dữ liệu mô phỏng `RawFigmaExportInput` khi chạy test).
* **Output:**
  * **`figma-variables.snapshot.json`:** Chứa thông tin chi tiết về Collections, Modes, Variables và giá trị biến.

### 3. Cơ chế hoạt động (How it works)
* **Asynchronous Call:** Plugin sử dụng API bất đồng bộ `getLocalVariableCollectionsAsync()` và `getLocalVariablesAsync()` của Figma để lấy dữ liệu mà không gây treo (hang) ứng dụng Figma.
* **Chuyển đổi màu sắc:** Bản chất Figma lưu mã màu dạng số thực thập phân `0-1` (`{ r: 0.5, g: 0.1, b: 0.1, a: 1 }`). Plugin tự động quy đổi về hệ byte `0-255` và trả về mã màu Hex `#801a1a` hoặc `rgba(...)` nếu có kênh alpha `< 1`.
* **Tránh làm phẳng liên kết (No flattening):** Nếu biến A trỏ đến biến B (ví dụ: `app/primary` trỏ đến `brand/primary`), plugin lưu trữ dưới dạng liên kết alias `{ "kind": "alias", "variableId": "var-primary" }` thay vì gộp thẳng thành màu Hex cuối cùng. Việc này giữ nguyên mối liên hệ cấu trúc của Figma.

### 4. Lệnh liên quan
* **Biên dịch tệp plugin:**
  ```bash
  npm run plugin:build
  ```
  *(Biên dịch tệp TypeScript/HTML nguồn từ `scripts/build-plugin.ts` vào thư mục `plugin/figma-token-export/dist/`)*

---

## Phase 2B: Codebase Token Scan (Quét Token Code)

### 1. Mục tiêu
Quét toàn bộ các tệp SCSS hiện có của codebase để tạo ra một Registry token hệ thống đại diện cho trạng thái thực tế của code.

### 2. Chi tiết Input & Output
* **Input:**
  * Các file SCSS nằm trong đường dẫn cấu hình (mặc định là `styles/tokens/` và `styles/_variables.scss`).
* **Output:**
  * **`system-token-registry.debug.json`:** Lưu trữ danh sách toàn bộ các token đã phát hiện kèm thông tin siêu dữ liệu (metadata) nguồn.

### 3. Cơ chế hoạt động (How it works)
* **PostCSS SCSS AST Parser:** Thay vì dùng Regex thô sơ dễ sót, Scanner sử dụng parser AST của PostCSS để bóc tách tệp.
* **Selector & Media Context:**
  * Khi quét qua một khai báo biến, scanner đẩy selector cha vào một ngăn xếp (`selectorStack`). Nhờ đó, nó nhận biết được biến `--color-bg` nằm trong selector `:root` (Light theme) hay selector `[data-theme='dark']` (Dark theme).
  * Scanner theo dõi các block `@include media-up` để lưu responsive context cho token.
* **Chặn lỗi bảo mật và riêng tư:** Các biến bắt đầu bằng tiền tố cấu hình (mặc định `--_` như `--_choice-size`) được coi là biến riêng tư cục bộ và bị loại khỏi Registry công khai.
* **Kiểm tra lỗi tĩnh (Static Checks):**
  * **`TOKEN_DUPLICATE_DECLARATION`:** Cảnh báo nếu một token bị khai báo trùng lặp hai lần trong cùng một selector ngữ cảnh.
  * **`TOKEN_BROKEN_REFERENCE`:** Lỗi đỏ nếu biến A gọi `var(--name-b)` nhưng `--name-b` không hề được định nghĩa ở đâu trong hệ thống.
  * **`TOKEN_CIRCULAR_REFERENCE`:** Lỗi đỏ chặn build nếu phát hiện chuỗi tham chiếu vòng tròn giữa các biến (ví dụ: `--a: var(--b); --b: var(--a);`).

### 4. Lệnh liên quan
* **Quét token hệ thống:**
  ```bash
  npm run tokens:scan
  ```

---

## Phase 2C: Token Resolve & Validate (Đối Chiếu & Xác Minh)

### 1. Mục tiêu
Đối chiếu snapshot thiết kế từ Figma (Pha 2A) với hệ thống token code SCSS thực tế (Pha 2B) thông qua luật ánh xạ, phát hiện sai lệch và sinh file thích ứng.

### 2. Chi tiết Input & Output
* **Input:**
  * `figma-variables.snapshot.json` (Snapshot Figma)
  * `system-token-registry.debug.json` (Registry SCSS)
  * **`token-map.json` (Quy tắc ánh xạ con người duyệt):**
    ```json
    {
      "figmaToken": "brand/primary",
      "systemToken": "--brand-coral-500",
      "status": "approved"
    }
    ```
* **Output:**
  * **`token-registry.generated.json`:** Tệp cấu hình tổng hợp cuối cùng.
  * **`mapped.generated.scss`:** Tệp cầu nối biến CSS dạng `:root { --figma-brand-primary: var(--brand-coral-500); }`.

### 3. Cơ chế hoạt động (How it works)
* **Strict Resolution Mode:**
  * Chỉ các mapping có trạng thái `"approved"` mới được nạp vào tệp adapter SCSS sinh ra.
  * Các gợi ý tự động (auto-suggestions) chỉ được liệt kê trong thuộc tính `suggestedMappings` của registry để tham khảo, **tuyệt đối không bao giờ** tự nâng cấp thành `approved`.
* **Kiểm tra lệch giá trị (VALUE_DRIFT):**
  * Resolver so khớp giá trị thực tế của biến Figma và biến SCSS (sau khi quy đổi chuẩn hóa hệ màu). Nếu lệch giá trị, hệ thống phát ra cảnh báo `VALUE_DRIFT` để nhà phát triển và thiết kế cùng đối thoại, chỉnh sửa file gốc.
* **Chốt chặn lỗi kiểu dữ liệu (Type validation):**
  * Nếu biến Figma là kiểu số (`FLOAT`) nhưng được map sang một biến SCSS kiểu `color`, hệ thống phát lỗi đỏ `MAPPING_TYPE_MISMATCH` và dừng build ngay lập tức.

### 4. Lệnh liên quan
* **Chạy so khớp và đối chiếu:**
  ```bash
  npm run tokens:resolve
  ```
* **Chạy toàn bộ pipeline Phase 2 (Scan -> Resolve -> Validate -> Generate SCSS):**
  ```bash
  npm run tokens:sync
  ```

---

## Phase 3: Component-Aware Implementation (Sinh Mã Nguồn)

### 1. Mục tiêu
Hỗ trợ AI Agent hoặc lập trình viên hiện thực hóa giao diện Angular + SCSS bằng cách cung cấp kế hoạch triển khai thông minh dựa trên các file đặc tả đã sinh ở Phase 1 và Phase 2.

### 2. Chi tiết Input & Output
* **Input:** `ui-spec.generated.json` và `token-registry.generated.json`.
* **Output:** Mã nguồn tệp component Angular (`.ts`, `.html`) và styles (`.scss`).

### 3. Cơ chế hoạt động (How it works)
* **Reuse Strategy Planner:** Cung cấp chiến lược tái sử dụng component:
  * Nếu node Figma khớp với một component có sẵn trong thư viện dự án với độ tin cậy `>= 0.7`, chiến lược là **`Existing component`**.
  * Nếu độ tin cậy thấp hơn hoặc component thiếu một số thuộc tính, chiến lược là **`Extend existing component`**.
  * Nếu không tìm thấy component phù hợp, chiến lược là **`Create new component`**.
* **Nguyên tắc Token:** Chặn việc sử dụng trực tiếp mã màu thô (hardcoded hex color). Lập trình viên bắt buộc phải sử dụng các CSS custom properties ngữ nghĩa được lấy ra từ registry đã sinh ở Phase 2C.

---

## Phase 4: Verification (Kiểm Định)

### 1. Mục tiêu
Chốt chặn tự động ở cổng ra cuối cùng của dự án để đảm bảo chất lượng, sự tương thích và không phát sinh lỗi thiết kế (regressions).

### 2. Chi tiết Input & Output
* **Input:** Toàn bộ codebase sau khi đã sửa đổi, các tệp cấu hình viewport/theme.
* **Output:** Báo cáo kiểm định chất lượng (`VerificationReport`).

### 3. Cơ chế hoạt động (How it works)
* **Quality Gate Checklist:**
  1. **Build:** Dự án Angular và SCSS phải biên dịch không có lỗi.
  2. **Token Lint:** Quét toàn bộ mã nguồn xem có biến nào chưa được resolve hoặc sử dụng biến thô không.
  3. **Viewport Matrix:** Chạy kiểm tra layout trên ma trận responsive quy định trong config (mobile, wide-mobile, tablet, laptop, large, desktop).
  4. **Theme Matrix:** Kiểm tra độ tương phản và hiển thị của chế độ sáng (Light) và tối (Dark).
* **Quy trình gác cổng ngoại tuyến:** Đối với các tác vụ đòi hỏi tương tác vật lý (như so sánh điểm ảnh Pixel visual hay duyệt giao diện trên Figma Desktop), hệ thống định nghĩa các checklist tại `reports/manual-verification/` và đánh dấu `PENDING_EXTERNAL_VERIFICATION`. CI tự động sẽ bỏ qua các kiểm tra vật lý này nhưng bắt buộc các kiểm tra mã nguồn tĩnh phải đạt 100% **PASS**.

### 4. Lệnh liên quan
* **Chạy chốt chặn kiểm định tự động:**
  ```bash
  npm run verify:automatable
  ```
