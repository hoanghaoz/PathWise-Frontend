# Auth UI — PathWise Frontend

Giao diện đăng nhập/đăng ký/khôi phục mật khẩu, khung app và màn Hồ sơ. Giao diện bám theo bản thiết kế (`Giao-diện-Pathwise`), còn dữ liệu nối với API auth của PathWise-BE (`PathWise-BE/docs/auth-module.md`).

## Chạy thử

```bash
cp .env.example .env              # VITE_API_BASE_URL=http://localhost:3000/api
npm ci
npm run dev                       # http://localhost:5173
```

Backend phải chạy ở cổng 3000. CORS của backend đã cho phép `http://localhost:5173`.

## Màn hình

| Route                              | Màn                                                            | API                                                               |
| :--------------------------------- | :------------------------------------------------------------- | :---------------------------------------------------------------- |
| `/`                                | Landing (hero + skill graph minh họa, 4 bước, nguyên tắc, CTA) | —                                                                 |
| `/login`                           | Đăng nhập bằng email **hoặc** tên đăng nhập                    | `POST /auth/login`                                                |
| `/register`                        | Đăng ký, xong tự đăng nhập                                     | `POST /auth/register` → `POST /auth/login`                        |
| `/forgot-password`                 | Gửi link đặt lại mật khẩu                                      | `POST /auth/forgot-password`                                      |
| `/reset-password?token=…`          | Đặt mật khẩu mới từ link trong email                           | `POST /auth/reset-password`                                       |
| `/profile`                         | Thông tin tài khoản, đổi mật khẩu, đăng xuất                   | `GET /auth/me`, `POST /auth/change-password`, `POST /auth/logout` |
| `/roadmap`, `/progress`, `/result` | Trang chờ: backend chưa có API                                 | —                                                                 |
| `/admin/*`                         | Trang chờ cho Admin                                            | —                                                                 |

Khác bản thiết kế, có chủ đích:

- Ô "Họ và tên" thay bằng **Tên đăng nhập**, vì DB có `username` mà không có cột tên.
- Bỏ khung "tài khoản dùng thử", vì đó là phần riêng của prototype.
- Thiết kế chưa có màn quên/đặt lại mật khẩu, nên hai màn này được dựng cùng bố cục thẻ của màn đăng nhập.

## Cấu trúc

```
src/
├── styles/pathwise.css       # CSS gốc của thiết kế, chép nguyên (đừng sửa tay)
├── styles/od-layout.css      # layout primitives (.od-stack, .od-row…) của thiết kế
├── index.css                 # Tailwind (không preflight) + 2 file trên + token
├── App.tsx                   # Toàn bộ route
├── services/
│   ├── tokenStorage.ts       # access/refresh token trong localStorage
│   ├── api.ts                # axios: gắn Bearer, tự refresh khi 401
│   └── authService.ts        # 8 hàm gọi /api/auth
├── contexts/
│   ├── ToastProvider.tsx     # toast theo style .toast của thiết kế
│   └── AuthProvider.tsx      # user hiện tại, login/logout/changePassword
├── hooks/
│   ├── useForm.ts            # state + validate form theo hành vi của thiết kế
│   └── usePageTitle.ts       # đặt <title>, focus vào h1 khi đổi trang
├── shared/
│   ├── validators.ts         # rule khớp DTO của backend
│   ├── apiErrorMessages.ts   # dịch message của backend sang tiếng Việt
│   ├── handleApiError.ts     # AxiosError → { statusCode, code, message, fieldErrors }
│   ├── skillGraph.ts         # xếp tầng skill graph (port từ graphSVG)
│   ├── routes.ts             # đường dẫn + trang chủ theo role
│   └── cx.ts                 # ghép className (xem lưu ý bên dưới)
├── components/
│   ├── layout/               # AppShell (menu ngang), AuthLayout, SkipLink
│   ├── routing/              # RequireAuth (đúng role), GuestOnly
│   ├── form/                 # FormField, FormAlert, SubmitButton
│   ├── graph/                # SkillGraph (SVG), GraphLegend
│   └── Brand, Mascot, Icon, PageHead, EmptyState
└── pages/                    # landing, auth/*, profile, ComingSoonPage
```

## Các luồng

**Mở app / F5.** Nếu `localStorage` có token, `AuthProvider` gọi `GET /auth/me`. Trong lúc chờ, `RequireAuth` hiện "Đang tải phiên đăng nhập…".

- Thành công: lưu `user`.
- Thất bại: xóa token, trạng thái thành `guest`.

**Đăng nhập.** Các bước:

1. `useForm` validate phía client: một lỗi thì focus vào ô đó; từ 2 lỗi trở lên thì hiện hộp "Có N mục cần sửa".
2. `login()` lưu token và `user`.
3. `GuestOnly` thấy đã có user, chuyển về trang người dùng định vào trước đó, hoặc trang chủ theo role (`/roadmap` cho USER, `/admin/graph` cho ADMIN).

Lỗi từ server được dịch qua `toUserMessage`. Sau 5 lần đăng nhập trong 1 phút, backend trả 429 và form hiện "Bạn đã thử đăng nhập quá nhiều lần…".

**Đăng ký.** Các bước:

1. `POST /register`. Nếu email hoặc username đã có, lỗi hiện ngay dưới ô tương ứng.
2. Tự đăng nhập bằng thông tin vừa nhập. Nếu bước này lỗi (ví dụ dính rate limit), chuyển sang `/login` kèm thông báo "Đã tạo tài khoản".

**Access token hết hạn (15 phút).** Interceptor trong `api.ts` xử lý:

1. Request nhận 401 thì gọi `/auth/refresh` **một lần**. Mọi request đang lỗi cùng lúc dùng chung lượt refresh này, vì backend chỉ cho mỗi refresh token dùng một lần.
2. Lưu cặp token mới rồi gửi lại request ban đầu.
3. Nếu refresh cũng lỗi: xóa token và phát sự kiện `pathwise:session-expired`. `AuthProvider` nhận sự kiện, xóa user và hiện toast; `RequireAuth` đưa người dùng về `/login`.

**Quên mật khẩu.**

1. `/forgot-password` gửi email đi. Màn hình luôn báo "nếu email đã đăng ký…", không xác nhận tài khoản có tồn tại hay không.
2. Link trong email (lúc dev thì nằm trong log backend) mở `/reset-password?token=…`. Thiếu token thì hiện báo lỗi kèm nút "Yêu cầu link mới".
3. Đặt mật khẩu mới xong thì chuyển về `/login`.

**Đổi mật khẩu (Hồ sơ).** Backend thu hồi mọi phiên khác và trả cặp token mới; FE lưu cặp đó nên thiết bị đang dùng vẫn giữ phiên.

**Đăng xuất.** Xóa token trên máy trước, rồi gọi `POST /auth/logout` để thu hồi refresh token. Nếu lời gọi này lỗi thì bỏ qua.

## Lưu ý khi code tiếp

- Dùng class của thiết kế (`.btn`, `.field`, `.card`, `.page`…) cho UI; Tailwind chỉ dùng cho vài chỉnh nhỏ. Tailwind được nạp **không có preflight** để không phá CSS gốc.
- **Không** viết ``className={`a${cond ? " b" : ""}`}``. Plugin `prettier-plugin-tailwindcss` sẽ cắt mất dấu cách và dính hai class vào nhau. Hãy dùng `cx("a", cond && "b")`.
- Token nằm trong `localStorage`, nên đừng render HTML không tin cậy (`dangerouslySetInnerHTML`).
- Thêm màn mới có API: tạo `services/xxxService.ts`, dùng `handleApiError` + `toUserMessage`, rồi thay `ComingSoonPage` trong `App.tsx`.
