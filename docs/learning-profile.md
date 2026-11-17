# Learning Profile & Skill Graph — PathWise Frontend

Nối với API của PathWise-BE: hồ sơ học tập (onboarding, sửa) và skill graph (người học chọn hướng/kỹ năng, admin sửa quan hệ tiên quyết).

## API đã nối

| Endpoint                                            | Vai trò | Dùng ở                                         |
| :-------------------------------------------------- | :------ | :--------------------------------------------- |
| `GET /directions`                                   | user    | Chọn hướng (onboarding, Hồ sơ, admin graph)    |
| `GET /directions/:id/skills`                        | user    | Danh sách kỹ năng + cạnh của một hướng         |
| `POST /learning-profile`                            | user    | `OnboardingPage` (tạo, một lần)                |
| `GET /learning-profile/me`                          | user    | `LearningProfileProvider` (404 = chưa onboard) |
| `PATCH /learning-profile/me`                        | user    | `LearningProfileSection` trong Hồ sơ           |
| `GET /admin/skill-graph/directions/:id`             | ADMIN   | `AdminGraphPage`                               |
| `POST /admin/skill-graph/prerequisites`             | ADMIN   | `AdminGraphPage` (thêm cạnh)                   |
| `DELETE /admin/skill-graph/prerequisites/:publicId` | ADMIN   | `AdminGraphPage` (xóa cạnh, trả 204)           |

Service: `services/skillGraphService.ts`, `services/learningProfileService.ts`. Kiểu dữ liệu: `types/skillGraphTypes`, `types/learningProfileTypes`.

## Luồng

- **Đăng nhập (USER).** `LearningProfileProvider` gọi `GET /learning-profile/me`. 200 → `ready`; 404 → `missing`; lỗi khác → `error` (có nút thử lại). ADMIN không tải gì (`idle`).
- **Guard.** `RequireProfile` bọc các màn người học: `missing` → `/onboarding`. `OnboardingOnly` bọc `/onboarding`: đã có hồ sơ → `/roadmap`. Trang onboarding không tự điều hướng; sau `POST` (chỉ trả `publicId`) nó gọi `reload()`, rồi `OnboardingOnly` chuyển trang.
- **Sửa hồ sơ.** Chỉ gửi field khác với hồ sơ đang lưu. Hai danh sách kỹ năng thay toàn bộ. Đổi hướng thì luôn gửi kèm `targetSkillPublicIds` và UI xóa lựa chọn kỹ năng để người dùng chọn lại. `PATCH` trả hồ sơ mới nên chỉ `setProfile`, không GET lại.
- **Admin graph.** Mỗi lần thêm/xóa cạnh thì tải lại graph. 409 do vòng lặp: hiện nguyên chuỗi slug backend trả (`a -> b -> a`).

## Lưu ý

- `deadline` backend không chặn ngày quá khứ; FE cũng chưa chặn.
- Không có endpoint xóa hồ sơ. Đổi hướng/target không làm roadmap hay bài đánh giá tự cập nhật.
- Một kỹ năng có thể nằm ở cả mục tiêu lẫn đã biết; backend không chặn nên FE cũng không.
- Danh sách hướng không có hướng chung; kỹ năng chung đã được gộp sẵn vào `GET /directions/:id/skills` (`isShared`, chỉ để gắn nhãn).
- Chưa có API chi tiết một kỹ năng, liệt kê toàn bộ kỹ năng, hay tài liệu học: các màn "Hướng học" và "Tài liệu & câu hỏi" của admin vẫn là `ComingSoonPage`.
- Tài liệu API nhận được bị cắt ở vài chỗ (ví dụ `Direction.description`, các field giữa `slug` và `difficulty` của Skill). Types chỉ khai báo field nhìn thấy rõ.
