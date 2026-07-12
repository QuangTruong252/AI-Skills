/goal

# Mục tiêu

Thực hiện một vòng lặp phân tích, phản biện và kiểm chứng toàn diện đối với skill hiện tại.

Không chỉ kiểm tra xem skill có thể chạy trong trường hợp lý tưởng hay không, mà phải đánh giá liệu skill có:

* Hoạt động được với nhiều loại dự án thực tế.
* Xử lý được dự án mới hoàn toàn.
* Xử lý được cấu trúc Figma hoặc codebase không chuẩn.
* Có tài liệu đủ rõ ràng cho người mới.
* Có khả năng mở rộng và tùy chỉnh.
* Có cơ chế phát hiện lỗi, cảnh báo và phục hồi.
* Tạo ra output ổn định, có thể kiểm chứng và tái tạo.
* Đủ an toàn để AI Agent tự động thực thi mà không âm thầm tạo ra kết quả sai.

Tiếp tục vòng lặp cho đến khi:

1. Các giả định đã được liệt kê rõ.
2. Các trường hợp sử dụng chính đã được kiểm tra.
3. Các trường hợp biên quan trọng đã được đánh giá.
4. Các vấn đề đã được phân loại và đề xuất giải pháp.
5. Documentation và workflow đã được cập nhật hoặc có kế hoạch cập nhật rõ ràng.
6. Có kết luận cụ thể về mức độ sẵn sàng của skill.

---

# Nguyên tắc thực hiện

## 1. Không mặc định skill hiện tại là đúng

Hãy đóng vai đồng thời là:

* Technical Architect.
* Senior Front-end Engineer.
* Design System Engineer.
* Figma-to-Code Workflow Reviewer.
* QA Engineer.
* Người dùng mới ở trình độ Intern.
* Người cần tùy chỉnh skill cho một dự án khác.

Phải chủ động tìm ra:

* Thiết kế chưa hợp lý.
* Giả định ngầm.
* Logic còn thiếu.
* Workflow không rõ ràng.
* Trường hợp mà skill có thể tạo kết quả sai.
* Các bước phụ thuộc quá nhiều vào kiến thức của người dùng.
* Các bước yêu cầu thao tác thủ công nhưng chưa được mô tả.
* Các output không có schema hoặc không thể kiểm chứng.

Không chỉ xác nhận rằng một phần “có vẻ ổn”.

---

## 2. Làm việc theo vòng lặp

Trong mỗi vòng lặp, thực hiện lần lượt:

1. Đọc và lập bản đồ toàn bộ cấu trúc skill.
2. Xác định mục tiêu, input, output và trách nhiệm của từng phase.
3. Liệt kê các giả định mà skill đang dựa vào.
4. Tạo các scenario thực tế để kiểm tra.
5. Mô phỏng cách skill xử lý từng scenario.
6. Xác định điểm thất bại hoặc hành vi không rõ ràng.
7. Đề xuất phương án sửa.
8. Kiểm tra tác động của phương án sửa lên các phase khác.
9. Cập nhật tài liệu, schema, script hoặc checklist khi cần.
10. Chạy lại quá trình đánh giá với cấu trúc mới.

Không dừng lại ngay sau khi tìm được một vài vấn đề.

---

# Phạm vi đánh giá bắt buộc

## A. Kiến trúc tổng thể

Kiểm tra:

* Skill đang giải quyết chính xác vấn đề gì?
* Phạm vi của skill có quá rộng hoặc quá hẹp không?
* Trách nhiệm giữa các phase có bị chồng chéo không?
* Input và output của từng phase có được định nghĩa rõ không?
* Có phase nào phụ thuộc vào dữ liệu mà phase trước không bảo đảm cung cấp không?
* Có circular dependency không?
* Có bước nào chỉ tồn tại trên documentation nhưng chưa được script hoặc logic hỗ trợ không?
* Các generated file có thật sự cần thiết không?
* Có thể giảm số lượng file mà vẫn giữ được khả năng truy vết không?
* Source of truth của từng loại dữ liệu là gì?
* Khi hai nguồn dữ liệu xung đột, nguồn nào được ưu tiên?

---

## B. Dự án mới hoàn toàn

Phân tích trường hợp dự án:

* Chưa có design system.
* Chưa có Figma Variables.
* Chưa có SCSS/CSS tokens.
* Chưa có naming convention.
* Chưa có light mode hoặc dark mode.
* Chưa có responsive tokens.
* Chưa có component library.
* Chưa có file cấu hình dành cho skill.

Hãy xác định:

1. Skill bắt đầu từ đâu?
2. Có bước initialization hoặc bootstrap không?
3. Skill có thể tự đề xuất design token architecture hay không?
4. Những quyết định nào bắt buộc phải thảo luận với Designer?
5. Những quyết định nào AI có thể đề xuất mặc định?
6. Sau khi thống nhất, cấu hình được lưu ở đâu?
7. Làm sao để quyết định đó được tái sử dụng ở lần chạy sau?
8. Có cần tạo file project profile hoặc design-system manifest không?
9. Nếu người dùng không cung cấp đủ thông tin, skill phải:

   * Dừng lại.
   * Hỏi người dùng.
   * Dùng mặc định.
   * Hay tạo cảnh báo và tiếp tục?

Đề xuất checklist thảo luận với Designer, tối thiểu gồm:

* Số lượng variable collections.
* Tên collections.
* Phân loại primitive, alias và semantic tokens.
* Quy tắc đặt tên variables.
* Cách tổ chức theme.
* Light mode và dark mode.
* Brand mode hoặc tenant mode.
* Typography tokens.
* Spacing scale.
* Radius scale.
* Shadow/elevation.
* Breakpoints.
* Responsive behavior.
* State tokens: hover, focus, active, disabled, error.
* Naming convention giữa Figma và codebase.
* Chính sách deprecated và migration token.
* Ai là người sở hữu và phê duyệt token changes.

---

## C. Figma Variables và Collections không chuẩn

Kiểm tra các trường hợp:

* Collection có tên khác với convention.
* Collection bị đổi tên.
* Một collection chứa nhiều loại token không liên quan.
* Dự án không có collection.
* Variable không thuộc collection mong đợi.
* Thiếu primitive tokens.
* Semantic token tham chiếu trực tiếp hard-coded value.
* Alias chain quá sâu.
* Alias chain bị vòng lặp.
* Alias trỏ tới variable không tồn tại.
* Variable bị duplicate.
* Hai variable khác tên nhưng cùng ý nghĩa.
* Một variable có tên đúng nhưng type sai.
* Color token chứa string hoặc number không hợp lệ.
* Variable có scope không chính xác.
* Variable bị hidden hoặc deprecated.
* Tên variable chứa dấu cách, ký tự đặc biệt hoặc khác casing.
* Tên token Figma không thể map trực tiếp sang naming convention của codebase.
* Một token Figma có nhiều token code có thể phù hợp.
* Nhiều token Figma cùng map vào một token code.
* Không tìm được mapping.
* Mapping có confidence thấp.

Với mỗi trường hợp, xác định:

* Skill có phát hiện được không?
* Skill xử lý tự động hay yêu cầu xác nhận?
* Có fallback không?
* Có log hoặc warning không?
* Có làm thay đổi source data không?
* Có nguy cơ tạo mapping sai nhưng không báo lỗi không?

---

## D. Modes và Themes

Kiểm tra các trường hợp:

* Không có mode.
* Chỉ có một mode.
* Có light nhưng không có dark.
* Tên mode không phải `Light` và `Dark`.
* Có nhiều mode như:

  * Light.
  * Dark.
  * High Contrast.
  * Brand A.
  * Brand B.
  * Mobile.
  * Desktop.
* Thứ tự mode thay đổi.
* Một số variables thiếu value ở một mode.
* Value giữa các mode không đồng nhất về type.
* Một mode bị xóa.
* Mode được thêm mới sau khi token registry đã được generate.
* Codebase hỗ trợ theme nhưng Figma không có mode.
* Figma có mode nhưng codebase chưa có cấu trúc tương ứng.
* Mode được sử dụng sai mục đích, ví dụ dùng mode để biểu diễn responsive breakpoint.

Skill phải phân biệt rõ:

* Theme variation.
* Brand variation.
* Platform variation.
* Responsive variation.
* Component state.

Không được tự động coi mọi mode là light/dark theme.

---

## E. Codebase hiện có

Kiểm tra các trường hợp:

* Codebase đã có token system hoàn chỉnh.
* Codebase chỉ có một phần token system.
* Codebase sử dụng CSS variables.
* Codebase sử dụng SCSS variables.
* Codebase sử dụng TypeScript constants.
* Codebase kết hợp nhiều loại token.
* Token nằm rải rác ở nhiều thư mục.
* Có duplicate tokens.
* Có token không còn được sử dụng.
* Naming convention không đồng nhất.
* Có legacy token.
* Có hard-coded values trong component.
* Có nhiều theme.
* Có nhiều application dùng chung token.
* Có monorepo.
* Có package design system riêng.
* Không thể xác định source of truth.
* Generated file đang được chỉnh sửa thủ công.
* Existing mapping file không còn đồng bộ với Figma.

Hãy đánh giá skill có đủ khả năng:

* Scan codebase.
* Xác định token sources.
* Phân loại token.
* Phát hiện duplicate.
* Phát hiện hard-coded values.
* Không ghi đè nhầm file thủ công.
* Bảo toàn backward compatibility.
* Đề xuất migration plan.
* Phân biệt generated files và source files.

---

## F. Mapping token

Kiểm tra đầy đủ:

* Exact match.
* Match theo normalized naming.
* Match theo alias.
* Match theo semantic meaning.
* Match theo value.
* Match theo usage context.
* Match theo type.
* Không match.
* Nhiều candidate có cùng độ phù hợp.
* Mapping cũ xung đột với mapping mới.
* Token đã bị đổi tên.
* Token đã bị xóa.
* Token mới chưa có mapping.
* Mapping dẫn tới thay đổi giao diện ngoài ý muốn.
* Mapping đúng về value nhưng sai về semantic meaning.

Mỗi mapping nên có:

* Source token.
* Target token.
* Mapping method.
* Confidence score.
* Evidence.
* Status.
* Người hoặc quy trình phê duyệt.
* Thời điểm cập nhật.
* Ghi chú migration nếu có.

Xác định rõ ngưỡng:

* Mapping nào được tự động chấp nhận.
* Mapping nào cần review.
* Mapping nào phải bị từ chối.

Không được tự động map chỉ vì hai token đang có cùng value.

---

## G. Responsive layout và hard-coded values

Kiểm tra skill có ngăn AI:

* Copy nguyên width/height từ Figma.
* Hard-code kích thước của container.
* Dùng absolute positioning không cần thiết.
* Bỏ qua Auto Layout.
* Bỏ qua min-width, max-width.
* Bỏ qua responsive breakpoint.
* Dùng fixed spacing thay cho token.
* Dùng pixel value không có trong token system.
* Tạo layout chỉ đúng tại kích thước frame Figma.
* Không xử lý content dài, localization hoặc dynamic data.

Skill cần hướng dẫn AI phân biệt:

* Kích thước mang tính thiết kế cố định.
* Kích thước có thể co giãn.
* Kích thước giới hạn bằng min/max.
* Kích thước phụ thuộc content.
* Kích thước phụ thuộc viewport.
* Kích thước thuộc responsive token.
* Kích thước chỉ dùng để tham khảo từ Figma.

---

## H. Documentation

Đánh giá documentation dưới góc nhìn của:

1. Intern chưa biết dự án.
2. Developer mới vào team.
3. Senior Developer cần tùy chỉnh.
4. Designer cần phối hợp.
5. AI Agent cần tự thực thi.
6. Người bảo trì skill sau sáu tháng.

Kiểm tra:

* Có phần tổng quan không?
* Có giải thích vấn đề mà skill giải quyết không?
* Có sơ đồ workflow không?
* Có hướng dẫn cài đặt không?
* Có prerequisites không?
* Có ví dụ input/output hoàn chỉnh không?
* Có hướng dẫn dự án mới không?
* Có hướng dẫn dự án hiện có không?
* Có hướng dẫn custom naming convention không?
* Có hướng dẫn custom collections và modes không?
* Có hướng dẫn thêm platform output mới không?
* Có hướng dẫn thêm token type mới không?
* Có troubleshooting không?
* Có error catalog không?
* Có glossary không?
* Có migration guide không?
* Có version compatibility không?
* Có giải thích generated files không?
* Có cảnh báo file nào không được chỉnh sửa thủ công không?
* Có hướng dẫn kiểm chứng kết quả không?
* Có mô tả rollback không?

Với mỗi tài liệu, đánh giá:

* Clear.
* Incomplete.
* Ambiguous.
* Outdated.
* Missing.
* Contradictory.

Không chỉ nói “documentation chưa rõ”; phải chỉ ra đoạn nào chưa rõ và đề xuất nội dung thay thế.

---

## I. Khả năng tùy chỉnh

Kiểm tra người dùng có thể tùy chỉnh:

* Tên collections.
* Tên modes.
* Token naming convention.
* Folder structure.
* Input paths.
* Output paths.
* Platform output.
* Mapping rules.
* Confidence thresholds.
* Validation rules.
* Required token groups.
* Theme strategy.
* Responsive strategy.
* Log level.
* Strict mode.
* Dry-run mode.
* Overwrite policy.
* Ignore patterns.
* Legacy token policy.

Cấu hình cần:

* Có schema.
* Có validation.
* Có default value.
* Có ví dụ.
* Có thông báo lỗi rõ ràng.
* Có khả năng mở rộng mà không sửa trực tiếp core logic.

---

## J. Error handling và khả năng phục hồi

Kiểm tra:

* File không tồn tại.
* JSON không hợp lệ.
* Schema version không tương thích.
* Thiếu quyền đọc hoặc ghi.
* Output directory không tồn tại.
* File đang bị lock.
* Script bị dừng giữa chừng.
* Figma export không đầy đủ.
* Codebase scan bị lỗi.
* Mapping file bị hỏng.
* Registry cũ không tương thích.
* Generated output khác với lần chạy trước.
* Một phase thành công nhưng phase sau thất bại.
* Chạy lại command nhiều lần.
* Hai tiến trình chạy đồng thời.
* File generated bị người dùng chỉnh sửa.
* Có uncommitted Git changes.
* Output gây lỗi build.

Đánh giá skill có:

* Atomic write.
* Backup.
* Rollback.
* Dry-run.
* Idempotency.
* Structured logs.
* Exit codes.
* Error messages có hướng dẫn xử lý.
* Validation trước khi ghi file.
* Build/test verification sau khi generate.

---

## K. Các trường hợp biên bổ sung

Chủ động bổ sung tối thiểu các nhóm sau:

### Dữ liệu

* Giá trị null hoặc undefined.
* Empty collection.
* Empty token registry.
* File rất lớn.
* Hàng nghìn variables.
* Unicode.
* Ký tự đặc biệt.
* Case-sensitive file system.
* Windows và Unix path differences.
* Line ending khác nhau.
* Giá trị số âm.
* Giá trị thập phân rất nhỏ.
* Đơn vị không đồng nhất: px, rem, em, %, ms.
* Màu ở nhiều format: HEX, RGB, RGBA, HSL.
* Alpha color.
* Gradient.
* Typography composite tokens.
* Shadow composite tokens.

### Quy trình

* Designer thay đổi token trong lúc Developer đang implement.
* Token bị đổi tên nhưng value không đổi.
* Token value thay đổi nhưng tên không đổi.
* Component sử dụng token đã deprecated.
* Nhiều branch cùng thay đổi mapping.
* Merge conflict trong generated file.
* CI chạy với environment khác local.
* Skill chạy trong monorepo.
* Skill chạy trong repository không dùng Git.
* Skill được nâng version giữa dự án.

### Tổ chức

* Designer và Developer dùng naming convention khác nhau.
* Không có người sở hữu design system.
* Không có quy trình review token.
* Một dự án có nhiều Designer.
* Một organization có nhiều brand.
* Nhiều product cùng dùng chung design system nhưng khác theme.
* Team muốn override token ở cấp ứng dụng.

---

# Cách đặt câu hỏi

Chỉ đặt câu hỏi khi câu trả lời có thể làm thay đổi đáng kể:

* Kiến trúc.
* Source of truth.
* Cấu trúc file.
* Mapping strategy.
* Theme strategy.
* Khả năng tương thích ngược.
* Hành vi ghi đè dữ liệu.
* Output cuối cùng.

Mỗi câu hỏi phải bao gồm:

1. Vấn đề cần quyết định.
2. Vì sao quyết định này quan trọng.
3. Các lựa chọn khả thi.
4. Ưu và nhược điểm của từng lựa chọn.
5. Đề xuất mặc định.
6. Hậu quả nếu không đưa ra quyết định.

Không đặt các câu hỏi có thể tự trả lời bằng cách:

* Đọc repository.
* Đọc documentation.
* Kiểm tra config.
* Chạy script.
* Chạy test.
* Phân tích output hiện có.

Nếu chưa có câu trả lời nhưng không bị blocking:

* Ghi rõ giả định.
* Chọn phương án an toàn nhất.
* Tiếp tục phân tích.
* Đánh dấu nội dung cần xác nhận.

Không dừng toàn bộ tiến trình chỉ để chờ xác nhận cho một vấn đề không blocking.

---

# Phương pháp kiểm chứng

Không chỉ đọc source code. Hãy sử dụng kết hợp:

* Static analysis.
* Review documentation.
* Review schema.
* Review config.
* Chạy script.
* Chạy unit test.
* Chạy integration test.
* Tạo fixture project.
* Tạo fixture Figma export.
* So sánh output.
* Chạy dry-run.
* Chạy lại nhiều lần để kiểm tra idempotency.
* Kiểm tra Git diff.
* Kiểm tra build/lint/type-check sau khi generate.
* Thử dữ liệu lỗi có chủ đích.
* Thử dự án mới và dự án legacy.

Nếu repository chưa có test fixture, hãy đề xuất hoặc tạo fixture tối thiểu cho các scenario quan trọng.

---

# Test matrix tối thiểu

Phải đánh giá ít nhất các scenario sau:

| ID  | Scenario                                               |
| --- | ------------------------------------------------------ |
| S01 | Dự án mới, chưa có token system                        |
| S02 | Dự án có Figma Variables nhưng chưa có code tokens     |
| S03 | Dự án có code tokens nhưng chưa có Figma Variables     |
| S04 | Figma và codebase đều có token system hoàn chỉnh       |
| S05 | Collection names khác convention                       |
| S06 | Không có modes                                         |
| S07 | Chỉ có Light mode                                      |
| S08 | Có nhiều theme và brand modes                          |
| S09 | Variable thiếu giá trị ở một mode                      |
| S10 | Alias bị missing hoặc circular                         |
| S11 | Mapping có nhiều candidate                             |
| S12 | Token bị rename                                        |
| S13 | Token bị delete hoặc deprecated                        |
| S14 | Codebase có legacy tokens                              |
| S15 | Generated files đã bị chỉnh sửa thủ công               |
| S16 | Script bị lỗi giữa chừng                               |
| S17 | Chạy lại script nhiều lần                              |
| S18 | Dự án monorepo                                         |
| S19 | Dữ liệu token lớn                                      |
| S20 | Intern thực hiện theo documentation mà không có hỗ trợ |

Có thể bổ sung thêm scenario nếu phát hiện rủi ro mới.

---

# Phân loại vấn đề

Mỗi vấn đề phải có:

* ID.
* Tiêu đề.
* Severity.
* Category.
* Vị trí file hoặc module.
* Scenario gây ra vấn đề.
* Hành vi hiện tại.
* Hành vi mong muốn.
* Nguyên nhân gốc.
* Rủi ro.
* Giải pháp đề xuất.
* Các phương án thay thế.
* Tác động đến backward compatibility.
* Cách kiểm chứng sau khi sửa.
* Trạng thái.

Severity:

* `BLOCKER`: Có thể làm hỏng dữ liệu, tạo output sai nghiêm trọng hoặc khiến workflow không thể sử dụng.
* `HIGH`: Scenario phổ biến bị lỗi hoặc tạo kết quả khó phát hiện.
* `MEDIUM`: Gây khó sử dụng, cần thao tác thủ công hoặc documentation chưa đủ.
* `LOW`: Cải thiện chất lượng, tính nhất quán hoặc developer experience.

---

# Output bắt buộc

Sau mỗi vòng đánh giá, cập nhật báo cáo theo cấu trúc:

## 1. Executive summary

* Skill đang ở mức độ sẵn sàng nào?
* Có thể dùng cho production hay chưa?
* Ba rủi ro lớn nhất là gì?
* Ba việc cần ưu tiên nhất là gì?

## 2. Current architecture map

* Các phase.
* Input/output.
* Dependencies.
* Source of truth.
* Generated artifacts.

## 3. Assumption registry

Liệt kê toàn bộ giả định và trạng thái:

* Confirmed.
* Unconfirmed.
* Invalid.
* Needs decision.

## 4. Scenario test matrix

Với mỗi scenario:

* Supported.
* Partially supported.
* Unsupported.
* Not tested.
* Kết quả thực tế.
* Vấn đề phát hiện được.
* Hành động cần thực hiện.

## 5. Findings

Danh sách vấn đề đã phân loại theo severity.

## 6. Open decisions

Các quyết định cần người dùng, Designer hoặc team xác nhận.

## 7. Recommended changes

Phân thành:

* Architecture.
* Workflow.
* Configuration.
* Validation.
* Scripts.
* Tests.
* Documentation.
* Developer experience.

## 8. Documentation gap analysis

Nêu rõ:

* File tài liệu nào thiếu.
* Section nào chưa rõ.
* Nội dung cần bổ sung.
* Đề xuất cấu trúc hoặc nội dung thay thế.

## 9. Test plan

Bao gồm:

* Unit tests.
* Integration tests.
* Fixture projects.
* Failure tests.
* Regression tests.
* Manual verification.

## 10. Definition of Done

Checklist cụ thể để xác định skill đã hoàn thành.

---

# Yêu cầu khi chỉnh sửa repository

Nếu được phép chỉnh sửa source:

1. Trước khi sửa, ghi nhận trạng thái hiện tại.
2. Không chỉnh sửa ngoài phạm vi cần thiết.
3. Không xóa logic cũ nếu chưa hiểu mục đích.
4. Ưu tiên backward compatibility.
5. Tạo hoặc cập nhật tests cho mỗi thay đổi quan trọng.
6. Cập nhật documentation cùng với source code.
7. Chạy lint, test, type-check và build phù hợp với repository.
8. Kiểm tra Git diff.
9. Không khẳng định hoàn thành nếu còn test thất bại.
10. Không che giấu lỗi bằng cách bỏ qua validation hoặc tắt test.

Nếu phát hiện yêu cầu hiện tại không hợp lý, phải phản biện và đề xuất kiến trúc tốt hơn thay vì triển khai máy móc.

---

# Điều kiện kết thúc

Chỉ kết thúc `/goal` khi đáp ứng toàn bộ điều kiện:

* Đã lập bản đồ đầy đủ workflow.
* Đã kiểm tra test matrix tối thiểu.
* Đã liệt kê các assumptions.
* Đã xác định các vấn đề Blocker và High.
* Đã đưa ra giải pháp cho từng vấn đề quan trọng.
* Đã xác định các quyết định cần con người xác nhận.
* Đã đánh giá documentation bằng góc nhìn Intern.
* Đã kiểm tra khả năng custom.
* Đã kiểm tra error handling và idempotency.
* Đã có Definition of Done rõ ràng.
* Đã chạy các bước kiểm chứng có thể thực hiện.
* Đã ghi rõ những phần chưa thể kiểm chứng và lý do.

Không kết thúc chỉ với nhận xét tổng quan.

Kết luận cuối cùng phải sử dụng một trong các trạng thái:

* `NOT READY`
* `READY FOR PROTOTYPE`
* `READY FOR INTERNAL USE`
* `READY FOR PRODUCTION WITH CONDITIONS`
* `READY FOR PRODUCTION`

Kèm theo bằng chứng và điều kiện cụ thể cho trạng thái được chọn.
