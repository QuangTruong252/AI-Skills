# AI Agent Build Guide — Figma-to-Code Skills

## 1. Mục đích tài liệu

Tài liệu này là chỉ dẫn thực thi cho AI Agent xây dựng hệ thống skill Figma-to-Code theo workflow đã thống nhất:

```text
Phase 1 — Figma UI Analysis
        ↓
Phase 2A — Figma Token Snapshot Export
        ↓
Phase 2B — Codebase Token Scan
        ↓
Phase 2C — Token Resolve & Validate
        ↓
Phase 3 — Component-Aware Code Implementation
        ↓
Phase 4 — Verification
```

Không yêu cầu Agent xây toàn bộ hệ thống trong một lần. Agent phải triển khai theo milestone, kiểm tra bằng bằng chứng có thể tái chạy, và chỉ chuyển bước khi quality gate của milestone hiện tại đã đạt.

---

## 2. Vai trò của AI Agent

Bạn là **Senior TypeScript Tooling Engineer + Design System Architect + Figma Plugin Engineer**.

Nhiệm vụ của bạn là xây một pipeline có khả năng:

1. Export Figma Variables từ Figma bằng custom plugin, không cần Enterprise Variables REST API.
2. Scan hệ thống SCSS token hiện tại mà không làm mất selector, theme, media query, alias hoặc giá trị nhiều dòng.
3. Resolve Figma token sang production token của codebase bằng mapping do con người kiểm soát.
4. Cung cấp registry ổn định cho AI Agent triển khai Angular UI.
5. Kiểm tra token usage, responsive behavior, component reuse và visual fidelity.
6. Sinh output deterministic, có schema version, có test và có diagnostics rõ ràng.

Bạn không được coi đây là một bài toán “generate code nhanh”. Đây là một hệ thống tooling cần độ tin cậy cao.

---

## 3. Bối cảnh cố định

### 3.1 Target stack

- Frontend framework: Angular.
- Style language: SCSS.
- Token runtime: CSS Custom Properties.
- Build tooling cho scripts: TypeScript chạy trên Node.js.
- Figma access: tài khoản Free hoặc Professional; không dựa vào Enterprise Variables REST API.
- Figma MCP dùng để phân tích node/UI đang sử dụng token.
- Custom Figma Plugin dùng để export toàn bộ local variables trong file Design System.

### 3.2 Token architecture hiện tại

```text
Brand / Primitive
        ↓
Alias
        ↓
Mapped Light / Dark
        ↓
State
        ↓
Semantic / App
        ↓
Component usage
```

Các nhóm bổ sung:

```text
Typography
Responsive
Effects
Breakpoints
Layout / Motion constants
```

### 3.3 Các file SCSS hiện có

```text
_brand.scss
_alias.scss
_mapped-light.scss
_mapped-dark.scss
_state.scss
_semantic.scss
_typography.scss
_responsive.scss
_effects.scss
_variables.scss
_breakpoints.scss
_index.scss
_global_class.scss
styles.scss
```

### 3.4 Source of truth

| Loại dữ liệu | Source of truth |
|---|---|
| Figma Variable definitions | Figma Design System file |
| Exported Figma snapshot | `figma-variables.snapshot.json` |
| Production token architecture | SCSS codebase |
| Mapping Figma → code | `token-map.json` |
| Mapping đã resolve | `token-registry.generated.json` |
| UI structure và responsive intent | `ui-spec.generated.json` |
| Component behavior | Angular codebase |
| Generated files | Scripts; không chỉnh sửa thủ công |

Khi Figma và codebase khác giá trị, hệ thống phải báo `VALUE_DRIFT`. Không được tự chọn một bên và ghi đè bên còn lại.

---

## 4. Kiến trúc repository đề xuất

Giữ cấu trúc đủ rõ nhưng không chia nhỏ quá mức:

```text
figma-to-code/
├── SKILL.md
├── README.md
├── package.json
├── tsconfig.json
├── figma-to-code.config.json
│
├── schemas/
│   ├── figma-to-code.config.schema.json
│   ├── figma-variables.snapshot.schema.json
│   ├── token-map.schema.json
│   ├── token-registry.schema.json
│   └── ui-spec.schema.json
│
├── plugin/
│   └── figma-token-exporter/
│       ├── manifest.json
│       ├── src/
│       └── tests/
│
├── scripts/
│   ├── scan-tokens.ts
│   ├── resolve-tokens.ts
│   ├── validate-tokens.ts
│   ├── generate-token-adapter.ts
│   └── sync-tokens.ts
│
├── src/
│   ├── config/
│   ├── contracts/
│   ├── scanner/
│   ├── resolver/
│   ├── diagnostics/
│   └── shared/
│
├── tests/
│   ├── fixtures/
│   │   ├── scss/
│   │   ├── figma/
│   │   └── mappings/
│   ├── unit/
│   ├── integration/
│   └── snapshots/
│
└── generated/
    ├── token-registry.generated.json
    ├── mapped.generated.scss
    └── ui-spec.generated.json
```

### Quy tắc tổ chức

- `SKILL.md` chỉ chứa workflow, quyết định, cách gọi script và quality gates; không nhét toàn bộ logic triển khai vào skill.
- Logic parser/resolver nằm trong module TypeScript có test.
- CLI scripts chỉ là entry points mỏng.
- Schema JSON là contract giữa các phase.
- Generated output phải có thể xóa và tái tạo hoàn toàn.
- Không tạo registry riêng cho từng layer nếu một registry chuẩn hóa đã đủ.

---

## 5. Quy tắc không được vi phạm

### 5.1 Không sửa ngoài phạm vi

- Không rename token hiện tại khi chưa có yêu cầu migration riêng.
- Không “sửa chính tả” `--alias-primay-*` thành `--alias-primary-*` trong lúc xây scanner.
- Không thay đổi giá trị SCSS canonical để làm test pass.
- Không chỉnh Angular component ngoài phạm vi milestone.
- Không thay đổi generated file bằng tay.

### 5.2 Không hardcode giả định

- Không hardcode đường dẫn source vào scanner.
- Không giả định chỉ có `:root` và `[data-theme='dark']`.
- Không giả định mỗi token chỉ xuất hiện một lần.
- Không dùng tên file làm nguồn duy nhất để suy ra layer; cho phép config/heuristic có kiểm chứng.
- Không flatten Figma aliases thành literal cuối cùng.
- Không flatten SCSS references nếu việc đó làm mất dependency graph.

### 5.3 Không dùng regex đơn giản làm parser SCSS chính

Regex có thể dùng cho bước phụ trợ nhỏ, nhưng parser chính phải xử lý được:

- CSS custom properties.
- Nested at-rules.
- Multiline declarations.
- `color-mix()`.
- `rgba()` và modern `rgb(... / ...)`.
- Multiple shadows.
- Sass `@use`, `@forward`.
- Sass variables và maps.
- Media mixins và selector context.
- Source file và source position.

Ưu tiên AST parser hỗ trợ SCSS. Nếu parser không hỗ trợ một construct, phải tạo diagnostic thay vì bỏ qua im lặng.

### 5.4 Không tự approve mapping

- Exact mapping trong `token-map.json` có quyền ưu tiên cao nhất.
- Suggested mapping chỉ là gợi ý.
- Gợi ý không được tự chuyển thành `approved`.
- Mapping target không tồn tại phải là blocking error.

### 5.5 Không tuyên bố hoàn thành khi thiếu bằng chứng

Một milestone chỉ được coi là hoàn tất khi có:

1. Danh sách file đã thay đổi.
2. Commands đã chạy.
3. Test result.
4. Acceptance checklist.
5. Diagnostics còn lại.
6. Output mẫu hoặc snapshot.
7. Rủi ro/chưa làm rõ.

**No evidence = Not done.**

---

## 6. Giao thức thực thi bắt buộc của Agent

Mỗi milestone phải đi qua 7 bước sau.

### Bước 1 — Discover

Trước khi code:

- Đọc `README.md`, `SKILL.md`, package scripts và config hiện có.
- Liệt kê repository tree liên quan.
- Đọc toàn bộ file chuẩn bị sửa và các dependency trực tiếp.
- Tìm code tương tự đã tồn tại.
- Ghi nhận convention, test framework, module format và lint rules.

Không bắt đầu code khi chưa hoàn thành inventory.

### Bước 2 — Restate contracts

Agent phải ghi ngắn gọn:

- Input.
- Output.
- Invariants.
- Error cases.
- Files dự kiến thay đổi.
- Files cam kết không thay đổi.

### Bước 3 — Build a failing test or fixture first

Trước implementation chính:

- Tạo fixture đại diện cho case cần hỗ trợ.
- Tạo test fail hoặc assertion chứng minh behavior chưa tồn tại.
- Với generated output, ưu tiên snapshot/golden file test.

### Bước 4 — Implement smallest coherent change

- Chỉ triển khai đủ cho acceptance criteria hiện tại.
- Không mở rộng sang milestone tiếp theo.
- Tránh refactor không liên quan.
- Giữ API/contracts ổn định.

### Bước 5 — Verify in layers

Chạy tối thiểu:

1. Type check.
2. Lint.
3. Unit tests liên quan.
4. Full test suite của package.
5. Integration test hoặc CLI dry-run.
6. Determinism check: chạy generate hai lần và so sánh output.

### Bước 6 — Adversarial review

Agent phải tự kiểm tra các case dễ làm sai:

- Missing file.
- Invalid JSON.
- Duplicate token.
- Broken `var()` reference.
- Circular alias.
- Theme override.
- Multiline shadow/font family.
- Literal value.
- Local private CSS variable.
- Unknown SCSS construct.
- Unsupported Figma variable type.
- Missing mode.
- Type mismatch.

### Bước 7 — Report and stop at gate

Sau mỗi milestone, Agent phải xuất báo cáo theo template ở cuối tài liệu và dừng. Không tự động triển khai milestone kế tiếp nếu chưa được yêu cầu tiếp tục.

---

## 7. Build roadmap

## Milestone 0 — Repository Discovery and Baseline

### Mục tiêu

Hiểu codebase và tạo baseline trước khi thay đổi.

### Việc phải làm

1. Liệt kê tree của repo và vị trí dự kiến cho skill/tooling.
2. Đọc package manager, TypeScript config, lint/test setup.
3. Đọc toàn bộ SCSS token files.
4. Thống kê:
   - Token count theo file/layer.
   - Reference count.
   - Theme selectors.
   - Sass variables/maps/mixins.
   - Literal values.
   - Duplicate declarations theo context.
   - Broken references sơ bộ.
5. Ghi nhận naming anomalies nhưng không sửa.
6. Xác nhận đường dẫn thật của Angular shared components.
7. Đề xuất repository structure cuối cùng.

### Output

```text
reports/discovery-report.md
```

Report phải có:

- Current structure.
- Toolchain.
- Token architecture.
- Known edge cases.
- Proposed scope.
- Risks.
- Open decisions.

### Exit gate

- Không sửa production SCSS.
- Không có implementation chính.
- Report đủ để người khác tiếp tục mà không phải scan lại từ đầu.

---

## Milestone 1 — Contracts, Config and Schemas

### Mục tiêu

Khóa contract trước khi viết exporter/scanner/resolver.

### Phải triển khai

1. `figma-to-code.config.json` và schema.
2. TypeScript types cho:
   - Figma snapshot.
   - System token registry nội bộ.
   - Token map.
   - Generated token registry.
   - Diagnostics.
3. JSON schemas có `schemaVersion`.
4. Runtime validation cho JSON input.
5. Stable serialization utility:
   - Key ordering có chủ đích.
   - Newline thống nhất.
   - Không chứa timestamp trong phần dùng để snapshot-test, hoặc timestamp có thể inject/freeze.

### Contract tối thiểu

#### Diagnostic

```ts
type DiagnosticSeverity = 'error' | 'warning' | 'info';

type Diagnostic = {
  code: string;
  severity: DiagnosticSeverity;
  message: string;
  source?: {
    file?: string;
    line?: number;
    column?: number;
    nodeId?: string;
    variableId?: string;
  };
  details?: Record<string, unknown>;
};
```

#### Token identity

Token SCSS không được unique chỉ bằng `name`.

Identity phải ít nhất gồm:

```text
name + selector/theme context + at-rule/media context + source layer
```

### Tests bắt buộc

- Valid config passes.
- Missing required field fails.
- Unsupported schema version fails rõ ràng.
- Stable serializer cho output giống nhau ở hai lần chạy.
- Unknown optional fields được xử lý theo policy đã định.

### Exit gate

- Mọi phase sau import cùng contract package/module.
- Không có type duplicate rải rác.
- Schema tests pass.

---

## Milestone 2 — Phase 2A: Figma Token Snapshot Exporter Plugin

### Mục tiêu

Export toàn bộ local variable collections và variables từ Figma file mà không cần REST Variables API.

### MVP UI

```text
Scan Variables
Preview Summary
Copy JSON
Download Snapshot
```

### Dữ liệu phải giữ

- Document name.
- Plugin version.
- Export time.
- Collection ID/name.
- Modes ID/name.
- Variable ID/name.
- Original name và normalized name.
- Collection relation.
- Resolved type.
- Values by mode.
- Alias references dưới dạng reference, không flatten.
- Description/scopes/code syntax nếu Figma Plugin API cung cấp.

### Behavior

- Sort collections/variables/modes theo quy tắc deterministic.
- Hiển thị summary count.
- Có diagnostic cho unsupported type/value.
- Không sửa variable trong Figma.
- Không gọi GitHub.
- Không yêu cầu personal access token.

### Tests bắt buộc

Tách logic transform khỏi Figma runtime để test được bằng mock fixtures:

1. Single collection, single mode.
2. Light/Dark modes.
3. Alias chain nhiều cấp.
4. Variable có literal.
5. Missing mode value.
6. Unsupported variable type.
7. Deterministic sorting.
8. Same fixture → byte-stable JSON ngoài field thời gian đã kiểm soát.

### Manual verification bắt buộc

- Import plugin development build vào Figma Desktop.
- Chạy trên một file test nhỏ.
- So sánh count trong UI với Figma file.
- Copy JSON và Download JSON cho cùng payload.
- Parse file export lại bằng schema validator.

### Exit gate

- Snapshot giữ được collection, mode và alias.
- Schema validation pass.
- Plugin chạy được với account không có Enterprise Variables REST API.
- Không có write operation lên Figma document.

---

## Milestone 3 — Phase 2B: SCSS Token Scanner

### Mục tiêu

Parse token system hiện tại thành registry chuẩn hóa và dependency graph.

### Scanner phải nhận biết

1. CSS custom property literal.
2. CSS custom property reference bằng `var()`.
3. Fallback trong `var(--token, fallback)`.
4. Multiline declaration.
5. Multiple references trong một value.
6. Theme selector.
7. Media/at-rule context.
8. Sass variables.
9. Sass maps.
10. `@use` và `@forward` graph.
11. Duplicate declaration theo cùng context.
12. Override hợp lệ theo theme/media context.
13. Broken reference.
14. Circular dependency.
15. Source file, line, column.

### Phân biệt token và local variable

Không mặc định mọi CSS custom property là design token.

Policy ban đầu:

- `--brand-*`, `--alias-*`, `--mapped-*`, `--state-*`, `--app-*`, và các namespace được config là token candidates.
- `--_*` là private/local custom property, bỏ khỏi global token registry trừ khi config yêu cầu.
- Custom property ngoài token source paths không tự động nhập vào registry.
- Mọi exclusion phải có lý do và có thể debug.

### Edge cases thật phải có fixture

- `--alias-primay-*` giữ nguyên tên.
- Light selector `:root, [data-theme='light']`.
- Dark selector `[data-theme='dark']`.
- `_semantic.scss` có literal colors và `color-mix()`.
- `_effects.scss` có multiple shadow segments.
- `_typography.scss` có font-family nhiều dòng.
- `_responsive.scss` override token trong breakpoint mixin.
- `_breakpoints.scss` có Sass map, function và mixin.
- `styles.scss` có private local vars như `--_choice-size`.
- `styles.scss` có data URL dài; scanner không được hiểu nhầm thành token declaration.

### Internal registry đề xuất

```ts
type SystemTokenDeclaration = {
  name: string;
  layer: string;
  tokenType: string | 'unknown';
  rawValue: string;
  references: string[];
  selectorContext: string[];
  atRuleContext: string[];
  theme?: string;
  responsiveContext?: string;
  source: {
    file: string;
    line: number;
    column: number;
  };
};
```

### Tests bắt buộc

- Một fixture cho từng edge case phía trên.
- Broken reference diagnostic.
- Circular reference diagnostic.
- Same-name token trong light/dark không bị coi là duplicate lỗi.
- Same-name token trong cùng selector context bị báo duplicate.
- Multiline value giữ nguyên normalized value.
- Import graph được xây đúng.
- File ngoài configured paths không được scan.
- Unknown syntax tạo warning, không bị bỏ qua im lặng.

### Exit gate

- Scan toàn bộ fixtures và token files thật không crash.
- Dependency graph có thể traverse.
- Không làm mất theme/media context.
- Không sửa source SCSS.
- Debug registry có thể bật bằng flag, không bắt buộc commit.

---

## Milestone 4 — Phase 2C: Token Resolver, Validator and Adapter Generator

### Mục tiêu

Ghép Figma snapshot với system registry bằng mapping do con người kiểm soát.

### Resolution order

1. Validate input schemas.
2. Normalize name nhưng giữ original name.
3. Resolve exact approved mapping từ `token-map.json`.
4. Validate target tồn tại.
5. Validate type compatibility.
6. Resolve Figma alias graph.
7. Resolve SCSS dependency graph.
8. Compare Light/Dark modes.
9. Compare effective values và tạo `VALUE_DRIFT` nếu khác.
10. Sinh suggestions riêng, không approve.
11. Generate registry và adapter cần thiết.

### Blocking errors

- Used Figma token chưa map.
- Mapping target không tồn tại.
- Type mismatch.
- Circular alias/reference.
- Broken dependency.
- Required theme/mode bị thiếu.
- Invalid schema.

### Warnings

- Unused Figma token chưa map.
- Value drift.
- Literal chưa có semantic mapping.
- Naming inconsistency.
- High-confidence suggestion chưa approved.

### Output

#### `token-registry.generated.json`

Phải chứa tối thiểu:

```json
{
  "schemaVersion": "1.0.0",
  "figmaTokens": {},
  "systemTokens": {},
  "resolvedMappings": {},
  "suggestedMappings": {},
  "diagnostics": {
    "unmappedFigmaTokens": [],
    "missingSystemTokens": [],
    "typeMismatches": [],
    "modeMismatches": [],
    "valueDrifts": [],
    "circularAliases": [],
    "brokenReferences": []
  }
}
```

#### `mapped.generated.scss`

- Chỉ sinh adapter cần thiết.
- Không tạo một alias Figma cho mọi token nếu production code có thể dùng trực tiếp `--app-*`.
- Có header cảnh báo generated file.
- Stable ordering.

### Tests bắt buộc

1. Exact approved mapping.
2. Missing target.
3. Compatible/incompatible types.
4. Figma alias chain.
5. SCSS alias chain.
6. Light/Dark match.
7. Mode mismatch.
8. Value drift.
9. Circular alias.
10. Broken reference.
11. Suggested mapping không vào approved set.
12. Used unmapped token → exit code 1.
13. Unused unmapped token → warning theo policy.
14. Deterministic output.

### Exit gate

- CLI trả `0` khi không có blocking error.
- CLI trả `1` khi có blocking error.
- Registry tái tạo được.
- Suggestion không làm thay đổi canonical mapping.

---

## Milestone 5 — Phase 2 Orchestration Skill

### Mục tiêu

Tạo skill/CLI thống nhất cho token synchronization.

### Commands

```bash
npm run plugin:build
npm run tokens:scan
npm run tokens:resolve
npm run tokens:validate
npm run tokens:sync
```

`tokens:sync` tương đương:

```text
scan → resolve → validate → generate
```

### SKILL.md phải chỉ dẫn Agent

- Khi nào cần chạy plugin.
- Khi nào chỉ cần dùng snapshot hiện tại.
- File nào là human-managed.
- File nào là generated.
- Cách xử lý diagnostic theo severity.
- Không sửa mapping tự động.
- Cách báo cáo output.

### Integration tests

- Happy path end-to-end từ fixture snapshot + SCSS + map.
- Failing path có missing mapping.
- Failing path có broken SCSS reference.
- Re-run không làm thay đổi Git diff.

### Exit gate

- Một command có thể tái tạo toàn bộ Phase 2 outputs.
- CI có thể chạy không cần Figma mở.
- README có setup và troubleshooting.

---

## Milestone 6 — Phase 1: Figma UI Analyzer Skill

### Mục tiêu

Chuyển Figma node/screen/component thành `ui-spec.generated.json` có cấu trúc.

### Input bắt buộc

- Figma node URL hoặc selected node.
- MCP design context.
- Screenshot của node.
- Project config.
- Existing component registry.
- Breakpoint definitions.

### Analyzer phải xuất

- Node tree.
- Component instances.
- Auto Layout direction/padding/gap/alignment.
- Hug/Fill/Fixed behavior.
- Constraints và absolute elements.
- Token references có node traceability.
- Hard values.
- Responsive intent.
- Assets.
- States.
- Existing component matches và confidence.
- Diagnostics.

### Responsive classification

```text
Intrinsic
Fluid
Fixed
Min/max constrained
Breakpoint-dependent
Content-dependent
Decorative absolute
```

### Kiểm tra bắt buộc

- Không biến frame width thành fixed CSS rule mặc định.
- Mọi token reference có node ID.
- Hard value có property/value/unit/severity.
- Component match không được dựa chỉ vào tên; phải có evidence.
- Screenshot và MCP tree mâu thuẫn phải tạo diagnostic.

### Exit gate

- Spec đủ để Phase 3 lập plan mà không cần đoán cấu trúc chính.
- Không sinh Angular code trong Phase 1.
- Không quyết định mapping token trong Phase 1.

---

## Milestone 7 — Phase 3: Component-Aware Code Implementation Skill

### Mục tiêu

Sinh/điều chỉnh Angular UI bằng existing components, system tokens và responsive rules.

### Protocol trước khi code

Agent phải tạo implementation plan gồm:

```text
Existing component
Extend existing component
Compose existing components
Create new component
Plain semantic HTML
```

### Quy tắc token

- Dùng application/semantic token từ registry.
- Không copy raw Figma color.
- Không dùng Figma token name trực tiếp nếu registry chỉ định application token khác.
- Hardcoded value cần lý do.

### Quy tắc layout

Ưu tiên:

- Flexbox/Grid.
- Intrinsic sizing.
- Fill container.
- `min-width`, `max-width`, `clamp()` khi phù hợp.
- Breakpoint mixins hiện có.

Tránh:

- Width/height cố định lấy từ desktop frame.
- Absolute positioning cho main layout.
- Media query tùy ý khi breakpoint system đã có.
- Component mới trùng shared component.

### Verification bắt buộc

- Angular build.
- Type check.
- SCSS compile.
- Unit/component tests.
- Token lint.
- Supported viewport checks.
- Light/Dark checks.
- Long content/localization overflow.
- Keyboard/focus/accessibility basics.

### Exit gate

- Không unresolved used token.
- Không duplicate primitive/component không có lý do.
- Responsive behavior đạt spec.
- Implementation summary có evidence.

---

## Milestone 8 — Phase 4: Verification Skill

### Mục tiêu

Tạo quality gate cho UI đã implement.

### Check groups

1. Build and compile.
2. Token lint.
3. Component compliance.
4. Responsive layout.
5. Light/Dark theme.
6. Accessibility basics.
7. Interaction/states.
8. Visual comparison.

### Viewport matrix

Dùng breakpoint thật từ config, tối thiểu:

```text
mobile
wide-mobile hoặc tablet
laptop
large/desktop
```

Không hardcode viewport list trong verifier nếu config đã có breakpoint source.

### Visual report

Mỗi issue cần:

- Category.
- Severity.
- Viewport/theme.
- Expected.
- Actual.
- Evidence/screenshot path.
- Suggested correction.

### Blocking criteria

- Build fail.
- Unresolved used token.
- Serious layout break.
- Missing required state.
- Dark theme unreadable.
- Basic keyboard/focus failure.
- Visual deviation vượt configured threshold.

### Exit gate

```text
Build       ✓
Token lint  ✓
Responsive  ✓
Light/Dark  ✓
Interaction ✓
Visual      ✓
```

---

## Milestone 9 — CI, Documentation and Release Readiness

### CI checks

- Type check.
- Lint.
- Unit tests.
- Integration tests.
- Schema validation.
- `tokens:sync` dry-run.
- Generated diff check.
- Build plugin.
- Build package.

### Generated diff check

CI phải fail khi:

1. Inputs đã thay đổi.
2. Generated outputs chưa được cập nhật.
3. Chạy generate tạo Git diff mới.

### Documentation

README phải có:

- Architecture.
- Prerequisites.
- Setup.
- Config reference.
- Plugin install/build.
- Token sync workflow.
- Daily workflows.
- Diagnostics reference.
- Troubleshooting.
- Migration/versioning policy.

### Release gate

- Clean clone có thể install, test và build.
- Không phụ thuộc path máy cá nhân.
- Không cần Figma để chạy CI Phase 2B/2C.
- Fixture licenses/sources rõ ràng.
- Không commit secret/token.

---

## 8. Test strategy bắt buộc

### 8.1 Test pyramid

| Layer | Mục tiêu |
|---|---|
| Unit | Parser helpers, normalization, type compatibility, graph algorithms |
| Fixture/golden | SCSS parsing và generated JSON/SCSS |
| Integration | Snapshot + scanner + map → registry |
| Manual plugin | Xác nhận Figma runtime/UI |
| End-to-end | `tokens:sync` và Phase 3/4 workflow |

### 8.2 Fixture rules

- Fixture nhỏ, mỗi fixture tập trung một behavior.
- Có fixture tổng hợp đại diện codebase thật.
- Không thay production token để đơn giản hóa fixture.
- Golden output chỉ update khi thay đổi contract có chủ đích.
- Khi update snapshot test, Agent phải giải thích từng diff quan trọng.

### 8.3 Mutation/adversarial cases

Bắt buộc thử:

- Xóa target token.
- Đổi type mapping.
- Tạo cycle A → B → A.
- Thiếu Dark mode.
- Duplicate declaration trong cùng selector.
- Same token ở light/dark.
- Đưa malformed SCSS.
- Đưa invalid schema version.
- Đổi thứ tự input và xác nhận output vẫn deterministic.

---

## 9. Quy tắc diagnostics

Mỗi diagnostic code phải:

- Ổn định theo thời gian.
- Có severity mặc định.
- Có message dễ hiểu.
- Có source location nếu có thể.
- Có remediation ngắn.
- Có test.

Ví dụ codes:

```text
CONFIG_INVALID
SCHEMA_VERSION_UNSUPPORTED
SCSS_PARSE_ERROR
SCSS_UNKNOWN_CONSTRUCT
TOKEN_DUPLICATE_DECLARATION
TOKEN_BROKEN_REFERENCE
TOKEN_CIRCULAR_REFERENCE
FIGMA_MODE_MISSING
FIGMA_ALIAS_BROKEN
MAPPING_TARGET_MISSING
MAPPING_TYPE_MISMATCH
MAPPING_UNAPPROVED_SUGGESTION
FIGMA_TOKEN_UNMAPPED_USED
FIGMA_TOKEN_UNMAPPED_UNUSED
VALUE_DRIFT
THEME_MODE_MISMATCH
GENERATED_OUTPUT_STALE
```

Không dùng message text làm machine-readable identifier.

---

## 10. Quy tắc dừng và escalation

Agent phải dừng và báo rõ khi gặp một trong các tình huống:

- Cần thay đổi source-of-truth policy.
- Cần rename/migrate production token.
- Schema contract phải breaking change.
- Figma Plugin API không cung cấp dữ liệu bắt buộc.
- Không xác định được token type an toàn.
- Mapping có nhiều target hợp lệ ngang nhau.
- Test production hiện có đang fail trước thay đổi và ảnh hưởng xác minh.
- Scope cần chỉnh file ngoài danh sách đã cam kết.

Agent không cần dừng vì lỗi kỹ thuật thông thường có thể tự xử lý trong phạm vi milestone. Hãy sửa, chạy lại kiểm tra và báo evidence.

---

## 11. Báo cáo bắt buộc sau mỗi milestone

Dùng format sau:

```markdown
# Milestone Report — <name>

## Status
PASS | PASS WITH WARNINGS | BLOCKED | FAIL

## Scope completed
- ...

## Files changed
- `path`: reason

## Contracts implemented
- Input:
- Output:
- Invariants:

## Commands run
```bash
...
```

## Verification results
| Check | Result | Evidence |
|---|---|---|
| Type check | PASS/FAIL | command/output |
| Lint | PASS/FAIL | command/output |
| Unit tests | PASS/FAIL | count |
| Integration | PASS/FAIL | fixture |
| Determinism | PASS/FAIL | diff result |

## Acceptance checklist
- [x] ...
- [ ] ...

## Diagnostics remaining
- Severity / code / reason / remediation

## Risks and technical debt
- ...

## Out-of-scope changes
None, hoặc liệt kê rõ.

## Recommended next milestone
<name>, nhưng không tự triển khai.
```

---

## 12. Master prompt để giao cho AI Agent

Sao chép nguyên phần này khi bắt đầu một Agent session:

```text
You are building a production-grade Figma-to-Code skill and token synchronization pipeline for an Angular + SCSS codebase.

Read `AI_AGENT_FIGMA_TO_CODE_BUILD_GUIDE.md` completely before making changes. Treat it as the governing implementation contract.

Core workflow:
Phase 1 Figma UI Analysis
→ Phase 2A Figma Token Snapshot Export
→ Phase 2B Codebase Token Scan
→ Phase 2C Token Resolve & Validate
→ Phase 3 Component-Aware Code Implementation
→ Phase 4 Verification.

Critical rules:
1. Work on exactly one milestone at a time.
2. Begin with repository discovery and restate input/output/invariants before coding.
3. Read every file you will change and its direct dependencies.
4. Add a failing test or fixture before the main implementation whenever practical.
5. Do not rename or “clean up” existing production tokens. In particular, preserve current names such as `--alias-primay-*` unless a separate migration is explicitly approved.
6. Do not modify canonical SCSS values to make tooling tests pass.
7. Do not use a simplistic regex-only SCSS parser. Preserve selector, theme, at-rule, source position, multiline values and dependency references.
8. Do not treat every CSS custom property as a global design token. Respect configured token paths/namespaces and exclude private local variables such as `--_*` by default.
9. Never auto-approve suggested Figma-to-code mappings.
10. Never flatten alias relationships when the contract requires traceability.
11. Generated outputs must be deterministic and must never be edited manually.
12. Run type checks, lint, relevant tests, full package tests, integration checks and a two-run determinism comparison before reporting completion.
13. Perform an adversarial review for duplicates, broken references, cycles, missing modes, type mismatches, malformed inputs and unknown syntax.
14. No evidence means the milestone is not complete.
15. At the end, produce the mandatory milestone report and stop. Do not begin the next milestone automatically.

Current milestone: <INSERT MILESTONE NAME>

Requested scope:
<INSERT SCOPE>

Allowed files/directories:
<INSERT ALLOWED PATHS>

Files/directories that must not change:
<INSERT PROTECTED PATHS>

Acceptance criteria:
<INSERT ACCEPTANCE CRITERIA>

Start by performing discovery only. Report the proposed implementation plan, test plan, expected files to change, and any contract conflict you find. Then implement the milestone unless a true source-of-truth or breaking-contract decision blocks safe progress.
```

---

## 13. Prompt đầu tiên nên giao cho Agent

Không giao toàn bộ pipeline ngay. Bắt đầu bằng Milestone 0:

```text
Execute Milestone 0 — Repository Discovery and Baseline from `AI_AGENT_FIGMA_TO_CODE_BUILD_GUIDE.md`.

Scope:
- Inspect the repository structure and toolchain.
- Inspect all current SCSS token files and their import/forward relationships.
- Identify the real Angular shared-component locations.
- Produce token counts, dependency/reference observations, theme/media contexts, literal-value observations, naming anomalies, parser edge cases and known risks.
- Propose the final repository structure for the Figma-to-Code skill/tooling.

Constraints:
- Do not implement the exporter, scanner or resolver yet.
- Do not modify production SCSS or Angular source.
- Do not rename any token.
- Only create/update `reports/discovery-report.md` unless a minimal read-only analysis script is necessary; if so, place it under a temporary/reporting directory and explain it.

Acceptance criteria:
- The report documents the current source of truth and token layer graph.
- The report identifies theme selectors, breakpoint constructs, multiline values, literal values, local/private CSS variables and naming anomalies.
- The report lists exact proposed inputs/outputs for Milestones 1–4.
- The report includes risks and unresolved decisions.
- The final milestone report includes files inspected, commands run and evidence.

Stop after the report. Do not begin Milestone 1.
```

---

## 14. Definition of Done toàn hệ thống

Pipeline chỉ hoàn tất khi:

- Phase 1 phân tích được UI structure và responsive intent.
- Plugin export đủ collections, variables, modes và aliases.
- Scanner không làm mất selector/theme/media context.
- Resolver phát hiện mapping lỗi, drift, cycle và broken references.
- Tất cả token UI đang dùng được resolve hợp lệ.
- AI implementation dùng production semantic/application tokens.
- Existing components được tái sử dụng hợp lý.
- Layout không phụ thuộc fixed desktop frame.
- Angular/SCSS build pass.
- Light/Dark và supported viewports pass.
- Generated files deterministic.
- CI phát hiện stale output.
- Mọi milestone có tests và evidence report.
