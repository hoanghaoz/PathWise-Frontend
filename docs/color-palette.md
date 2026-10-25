# Bảng màu & quy ước — PathWise Frontend

Rút từ bản thiết kế `Giao-diện-Pathwise` (`styles.css`). File đó gồm 3 lớp chồng nhau, lớp sau ghi đè lớp trước:

| Lớp             | Nội dung                                                                                        |
| :-------------- | :---------------------------------------------------------------------------------------------- |
| Design Spec 1.0 | Bộ token gốc: nền xám `#F5F7FA`, primary **xanh dương** `#1E4FD8`, 3 màu trạng thái học, danger |
| Design Spec 2.0 | "Bàn làm việc yên tĩnh": nền trắng, bỏ shadow, bo góc 4px, dùng đường kẻ mảnh thay cho thẻ      |
| Design Spec 2.1 | Màu thương hiệu lấy từ **icon gấu**: primary đổi sang **navy** `#13223F`, accent **mint**       |

`src/styles/pathwise.css` là bản chép nguyên `styles.css`, giữ đúng thứ tự trên. **Giá trị có hiệu lực là giá trị của Spec 2.1.** Xanh dương `#1E4FD8` của Spec 1.0 đã bị thay hết, không dùng nữa.

## 1. Màu thương hiệu (từ icon gấu)

| Token           | Hex       | Nguồn trên icon      | Dùng cho                                                                     |
| :-------------- | :-------- | :------------------- | :--------------------------------------------------------------------------- |
| `--brand-navy`  | `#13223F` | Áo hoodie            | Màu chủ đạo: chữ, nút chính, số liệu lớn, tuần hiện tại, node đang học       |
| `--brand-mint`  | `#5FCF9B` | Màn hình, chữ "Path" | Điểm nhấn trang trí. **Không dùng làm chữ trên nền trắng** (tương phản 1.93) |
| `--brand-slate` | `#4E5D72` | Mặt gấu              | Chỉ có trong hình minh họa, UI chưa dùng                                     |
| `--brand-tan`   | `#B9853F` | Lông gấu             | Chỉ có trong hình minh họa, UI chưa dùng                                     |

Logo chữ: `Path` dùng `#3FB984`, `Wise` dùng `--brand-navy`. Đây là logo nên được miễn yêu cầu tương phản, nhưng không lấy `#3FB984` cho chữ thường.

## 2. Token ngữ nghĩa

### Nền & bề mặt

| Token           | Hex       | Dùng cho                                                                    |
| :-------------- | :-------- | :-------------------------------------------------------------------------- |
| `--bg`          | `#FFFFFF` | Nền trang                                                                   |
| `--surface`     | `#FFFFFF` | Modal, ô nhập, canvas graph, nút secondary                                  |
| `--surface-alt` | `#F3F5F8` | Nền hover, tab bar, thanh tiến độ rỗng, khung user, ô số tuần, mục disabled |

### Chữ

| Token          | Hex       | Trên trắng | Dùng cho                         |
| :------------- | :-------- | :--------- | :------------------------------- |
| `--ink`        | `#13223F` | 15.81      | Chữ chính, tiêu đề               |
| `--ink-muted`  | `#46546A` | 7.67       | Chữ phụ, mô tả, nhãn             |
| `--ink-subtle` | `#5B6A7F` | 5.51       | Meta, header bảng, chú thích nhỏ |

### Đường viền

| Token             | Hex       | Dùng cho                                           |
| :---------------- | :-------- | :------------------------------------------------- |
| `--border`        | `#DDE3EA` | Đường kẻ phân section (`--rule`), viền mảnh        |
| `--border-strong` | `#B7C1CD` | Viền ô nhập, nút secondary, cạnh graph, viền hover |

### Primary & accent

| Token             | Hex       | Trên trắng | Dùng cho                                                                                          |
| :---------------- | :-------- | :--------- | :------------------------------------------------------------------------------------------------ |
| `--primary`       | `#13223F` | 15.81      | Nút chính (`.btn-primary`), avatar, phím đáp án đã chọn                                           |
| `--primary-hover` | `#0A1630` | —          | Hover nút chính                                                                                   |
| `--primary-ink`   | `#FFFFFF` | —          | Chữ trên nền primary                                                                              |
| `--primary-soft`  | `#E8F7F0` | —          | Nền mint nhạt: chip info, alert info, nav đang chọn, hover nút ghost (`--info-soft` cùng giá trị) |
| `--accent`        | `#5FCF9B` | 1.93       | Chỉ trang trí, không dùng cho chữ                                                                 |
| `--accent-strong` | `#1E9A6B` | 3.57       | Thành phần không phải chữ: thanh tiến độ, gạch chân tab đang chọn, viền focus, checkbox           |
| `--accent-ink`    | `#0E6A4C` | 6.59       | Chữ xanh: link, eyebrow, nút ghost, mục đã chọn                                                   |

Vòng focus của ô nhập: viền `--accent-strong` + `box-shadow: 0 0 0 3px rgba(30, 154, 107, 0.22)`.

### Trạng thái học (skill graph, chip, legend)

Ba trạng thái khớp enum `MASTERED / PARTIAL / NOT_MASTERED` trong DB.

| Trạng thái               | Đậm (viền node, icon)  | Nhạt (nền)                  | Chữ trên nền nhạt | Class                                   |
| :----------------------- | :--------------------- | :-------------------------- | :---------------- | :-------------------------------------- |
| Đã nắm vững              | `--mastered` `#15803D` | `--mastered-soft` `#DCF3E4` | `#11632F` (6.31)  | `.chip-mastered`, `.g-node.st-MASTERED` |
| Nắm một phần             | `--partial` `#B45309`  | `--partial-soft` `#FDF0DC`  | `#8A4006` (6.63)  | `.chip-partial`, `.g-node.st-PARTIAL`   |
| Chưa nắm                 | `--not-node` `#6B7280` | `--not-soft` `#EDEFF2`      | `#374151` (8.95)  | `.chip-not`, `.g-node.st-NOT_MASTERED`  |
| Đang học (node hiện tại) | `--brand-navy`         | —                           | —                 | `.g-node.rs-current`, `.sw-cur`         |

`--partial` cũng là màu cảnh báo (`.g-warn`, `.sw-warn`, `.alert-warn`).

### Phản hồi (alert, lỗi)

| Loại       | Nền                         | Chữ       | Class           |
| :--------- | :-------------------------- | :-------- | :-------------- |
| Thông tin  | `--primary-soft` `#E8F7F0`  | `--ink`   | `.alert`        |
| Thành công | `--mastered-soft` `#DCF3E4` | `#11552A` | `.alert-ok`     |
| Cảnh báo   | `--partial-soft` `#FDF0DC`  | `#7A3A06` | `.alert-warn`   |
| Lỗi        | `--danger-soft` `#FDE7E7`   | `#8F1A1A` | `.alert-danger` |

Danger: `--danger` `#B91C1C` (6.47) cho chữ lỗi, viền ô `aria-invalid`, dấu `*` bắt buộc, nút `.btn-danger-solid`. Hover nút đó: `#991B1B`. Viền nút `.btn-danger` (dạng outline): `#E7B4B4`.

### Màu viết cứng trong CSS (không có token)

| Hex                                | Ở đâu                                       |
| :--------------------------------- | :------------------------------------------ |
| `#FAFBFC`                          | Header bảng, mục checklist đã xong          |
| `#FFF7F7`                          | Dòng bảng bị lỗi (màn import của Admin)     |
| `#DCE1E8`                          | Lưới chấm của canvas graph                  |
| `#E3E7ED`                          | Cạnh graph bị làm mờ                        |
| `rgba(17, 24, 39, 0.45)`           | Nền mờ sau modal                            |
| `rgba(255, 255, 255, 0.86 – 0.96)` | Thanh menu dính đầu trang (kèm `blur(8px)`) |

## 3. Quy ước sử dụng

1. **Không viết mã hex trong component.** Dùng class có sẵn của design (`.btn`, `.chip-*`, `.alert-*`…) hoặc `var(--token)`. Khi cần utility của Tailwind thì dùng token đã khai báo trong `src/index.css` (bảng ở mục 4).
2. **Navy cho hành động chính, mint cho điểm nhấn.** Mỗi màn chỉ nên có một nút `.btn-primary`. Mint (`--accent`) không bao giờ làm màu chữ. Chữ màu xanh lá dùng `--accent-ink`, còn đường/viền/thanh dùng `--accent-strong`.
3. **Không lẫn accent với "mastered".** Hai màu đều xanh lá nhưng khác nghĩa: accent là thương hiệu/tương tác (link, focus, tab đang chọn, tiến độ chung), còn `--mastered` chỉ nói về trạng thái học của một kỹ năng.
4. **Trạng thái luôn dùng theo cặp:** nền `*-soft` + viền/chữ đậm. Không tô cả khối bằng màu đậm.
5. **Không phân biệt chỉ bằng màu.** Node, chip và legend luôn kèm nhãn chữ hoặc icon (ví dụ dấu `!` ở node cảnh báo), để người mù màu vẫn đọc được.
6. **Tương phản tối thiểu WCAG AA:** chữ thường ≥ 4.5:1, chữ lớn và thành phần UI ≥ 3:1. Mọi cặp chữ/nền ở bảng trên đều đạt. Màu dưới 4.5 (`--accent`, `--accent-strong`, `#3FB984`, `--border*`) không dùng cho chữ thường.
7. **Nền giữ trắng/xám lạnh.** Không thêm nền be, kem, hồng hay cam (yêu cầu trong `DESIGN-HANDOFF.md`). Nâu `--brand-tan` chỉ nằm trong hình gấu.
8. **Chưa có dark mode.** Thiết kế chỉ có giao diện sáng (`theme-color` là `#FFFFFF`). Nếu sau này làm dark mode thì thêm bộ token riêng, không sửa giá trị ở `:root`.
9. **Đổi màu thì đổi token, không đổi từng chỗ.** Thêm hoặc sửa token ở cuối `pathwise.css` (sau khối Spec 2.1) và cập nhật `@theme` trong `src/index.css` cùng lúc để hai bên không lệch nhau.

## 4. Token cho Tailwind (`src/index.css`)

| Utility (`bg-*`, `text-*`, `border-*`) | Hex       | Tương ứng CSS var |
| :------------------------------------- | :-------- | :---------------- |
| `background`                           | `#FFFFFF` | `--bg`            |
| `foreground`                           | `#13223F` | `--ink`           |
| `muted`                                | `#46546A` | `--ink-muted`     |
| `subtle`                               | `#5B6A7F` | `--ink-subtle`    |
| `border`                               | `#DDE3EA` | `--border`        |
| `primary`                              | `#13223F` | `--primary`       |
| `primary-foreground`                   | `#FFFFFF` | `--primary-ink`   |
| `primary-soft`                         | `#E8F7F0` | `--primary-soft`  |
| `accent`                               | `#5FCF9B` | `--accent`        |
| `accent-strong`                        | `#1E9A6B` | `--accent-strong` |
| `success`                              | `#15803D` | `--mastered`      |
| `warning`                              | `#B45309` | `--partial`       |
| `danger`                               | `#B91C1C` | `--danger`        |

Ví dụ: `text-muted`, `bg-primary-soft`, `border-border`. Hiện `@theme` chưa có `--accent-ink`, `--surface-alt`, `--border-strong` và các màu `*-soft` của trạng thái. Khi cần thì thêm vào `@theme` thay vì viết hex.
