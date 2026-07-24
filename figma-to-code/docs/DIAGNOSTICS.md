# Hướng Dẫn Xử Lý Lỗi & Cảnh Báo (Diagnostics Guide)

Hệ thống sử dụng bộ mã chẩn đoán (Diagnostic Codes) ổn định để phân loại thông tin, cảnh báo và lỗi chặn build trong quá trình đồng bộ hóa token.

---

## 1. Phân Loại Cấp Độ Nghiêm Trọng (Severity Levels)

* **`error` (Lỗi chặn build):** Bất kỳ lỗi nào ở cấp độ này sẽ khiến câu lệnh trả về exit code `1`. CI sẽ báo đỏ và chặn merge code. Bạn bắt buộc phải sửa lỗi này trước khi tiếp tục.
* **`warning` (Cảnh báo nhắc nhở):** Không chặn build (exit code `0`). Tuy nhiên, lập trình viên cần xem xét kỹ lưỡng để tránh sai lệch thiết kế.
* **`info` (Thông tin bổ sung):** Các gợi ý tự động hoặc thông tin ngữ cảnh giúp lập trình viên thao tác nhanh hơn.

---

## 2. Danh Sách Mã Chẩn Đoán & Cách Khắc Phục

### A. Nhóm Lỗi Chặn Build (`error`)

#### 1. `FIGMA_TOKEN_UNMAPPED_USED`
* **Mô tả:** Biến thiết kế Figma được khai báo đang sử dụng trong code nhưng chưa được đăng ký ánh xạ trong `token-map.json`.
* **Cách khắc phục:** Mở file `token-map.json` và bổ sung một ánh xạ hợp lệ với trạng thái `status: "approved"` trỏ từ biến Figma sang biến SCSS tương ứng.

#### 2. `MAPPING_TARGET_MISSING`
* **Mô tả:** Một ánh xạ được duyệt trong `token-map.json` trỏ tới một biến SCSS (`systemToken`) không tồn tại trong mã nguồn.
* **Cách khắc phục:** Kiểm tra lại chính tả của biến SCSS trong tệp mapping hoặc thêm định nghĩa biến đó vào file SCSS trong thư mục `styles/tokens/`.

#### 3. `MAPPING_TYPE_MISMATCH`
* **Mô tả:** Kiểu dữ liệu của biến Figma và biến SCSS không tương thích (ví dụ: biến Figma kiểu `COLOR` map sang biến SCSS kiểu `dimension` kích thước).
* **Cách khắc phục:** Điều chỉnh lại tệp mapping hoặc thay đổi kiểu biến trên Figma/SCSS để bảo đảm đồng nhất về ngữ nghĩa dữ liệu.

#### 4. `TOKEN_CIRCULAR_REFERENCE`
* **Mô tả:** Phát hiện vòng lặp tham chiếu chéo (ví dụ: Biến A -> Biến B -> Biến A) trong SCSS hoặc alias Figma.
* **Cách khắc phục:** Kiểm tra lại cây alias trên Figma hoặc định nghĩa `var()` trong các file SCSS để bẻ gãy vòng lặp.

#### 5. `TOKEN_BROKEN_REFERENCE`
* **Mô tả:** Một biến SCSS sử dụng hàm `var(--name)` trỏ đến một biến khác không tồn tại trong codebase.
* **Cách khắc phục:** Định nghĩa biến bị thiếu hoặc sửa lại tên hàm `var()` cho chính xác.

---

### B. Nhóm Cảnh Báo Không Chặn Build (`warning`)

#### 1. `VALUE_DRIFT`
* **Mô tả:** Giá trị cụ thể của màu sắc hoặc kích thước giữa Figma và SCSS bị lệch nhau (ví dụ: Figma lưu màu đỏ `#e7404b` nhưng SCSS lưu màu `#e74000`).
* **Cách khắc phục:**
  * **Quy tắc quan trọng:** Tuyệt đối không tự ý dùng tool tự động ghi đè hoặc chỉnh sửa thủ công tệp generated.
  * Hãy thảo luận với Designer hoặc Tech Lead để thống nhất giá trị chuẩn, sau đó cập nhật thủ công trên Figma hoặc tệp SCSS tương ứng trong `styles/`.

#### 2. `FIGMA_TOKEN_UNMAPPED_UNUSED`
* **Mô tả:** Một biến trong Figma snapshot chưa được cấu hình ánh xạ trong `token-map.json`, và cũng chưa được sử dụng trong codebase.
* **Cách khắc phục:** Đây là cảnh báo nhắc nhở thông thường. Bạn không cần làm gì nếu chưa có nhu cầu sử dụng biến đó trong code.

#### 3. `GENERATED_OUTPUT_STALE`
* **Mô tả:** Tệp sinh tự động trên đĩa (`mapped.generated.scss` hoặc `token-registry.generated.json`) bị lệch so với dữ liệu nguồn.
* **Cách khắc phục:** Chạy lệnh `npm run tokens:sync` để tái tạo lại các file thích ứng.
