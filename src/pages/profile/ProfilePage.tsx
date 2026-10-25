import { useNavigate } from "react-router-dom";

import FormAlert from "../../components/form/FormAlert";
import FormField from "../../components/form/FormField";
import SubmitButton from "../../components/form/SubmitButton";
import Icon from "../../components/Icon";
import PageHead from "../../components/PageHead";
import { useAuth } from "../../contexts/useAuth";
import { useToast } from "../../contexts/useToast";
import { useForm } from "../../hooks/useForm";
import { usePageTitle } from "../../hooks/usePageTitle";
import { toUserMessage } from "../../shared/apiErrorMessages";
import { handleApiError } from "../../shared/handleApiError";
import { ROUTES } from "../../shared/routes";
import {
  PASSWORD_HELP,
  matches,
  newPassword,
  required,
} from "../../shared/validators";

const ROLE_LABEL = { USER: "Người học", ADMIN: "Quản trị viên" } as const;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

/**
 * Account section of the design's /profile screen: data from GET /auth/me
 * (kept in AuthProvider), POST /auth/change-password, and logout.
 * The learning-profile section is added when its read API exists.
 */
const ProfilePage = () => {
  usePageTitle("Hồ sơ");
  const { user, changePassword, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const form = useForm({
    idPrefix: "pw",
    initial: { currentPassword: "", newPassword: "", confirm: "" },
    rules: {
      currentPassword: required("mật khẩu hiện tại"),
      newPassword: newPassword("mật khẩu mới"),
      confirm: (value, all) => matches(() => all.newPassword)(value),
    },
  });

  if (!user) return null; // rendered inside RequireAuth

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      form.reset();
      showToast("Đã đổi mật khẩu. Các thiết bị khác đã được đăng xuất.");
    } catch (error) {
      const apiError = handleApiError(error);
      const message = toUserMessage(apiError);
      if (apiError.message === "Current password is incorrect") {
        form.setErrors({ currentPassword: message });
        document.getElementById("pw-currentPassword")?.focus();
      } else if (
        apiError.message ===
        "New password must be different from the current password"
      ) {
        form.setErrors({ newPassword: message });
        document.getElementById("pw-newPassword")?.focus();
      } else {
        form.applyServerErrors(apiError.fieldErrors);
        form.setFormError(message);
      }
    }
  });

  const onLogout = async () => {
    await logout();
    showToast("Đã đăng xuất.");
    navigate(ROUTES.landing);
  };

  return (
    <div className="page page-narrow">
      <PageHead eyebrow="Tài khoản" title="Hồ sơ" />
      <section className="card card-pad" aria-labelledby="ac-h">
        <form className="form-stack" noValidate onSubmit={onSubmit}>
          <h2 id="ac-h" className="h3">
            Tài khoản
          </h2>
          <dl className="kv">
            <dt>Tên đăng nhập</dt>
            <dd>{user.username}</dd>
            <dt>Email</dt>
            <dd>{user.email}</dd>
            <dt>Vai trò</dt>
            <dd>{ROLE_LABEL[user.role]}</dd>
            <dt>Ngày tạo</dt>
            <dd>{formatDate(user.createdAt)}</dd>
          </dl>
          <hr className="divider" />
          <h3 className="small strong">Đổi mật khẩu</h3>
          <FormAlert issues={form.issues} formError={form.formError} />
          <FormField
            {...form.field("currentPassword")}
            label="Mật khẩu hiện tại"
            type="password"
            required
            autoComplete="current-password"
          />
          <div className="grid-2">
            <FormField
              {...form.field("newPassword")}
              label="Mật khẩu mới"
              type="password"
              required
              autoComplete="new-password"
              help={PASSWORD_HELP}
            />
            <FormField
              {...form.field("confirm")}
              label="Nhập lại mật khẩu mới"
              type="password"
              required
              autoComplete="new-password"
            />
          </div>
          <p className="help">
            Sau khi đổi mật khẩu, các thiết bị khác đang đăng nhập sẽ bị đăng
            xuất.
          </p>
          <div
            className="od-cluster"
            style={{ justifyContent: "space-between" }}
          >
            <SubmitButton loading={form.submitting} loadingText="Đang lưu…">
              Đổi mật khẩu
            </SubmitButton>
            <button type="button" className="btn btn-danger" onClick={onLogout}>
              <Icon name="logout" className="icon-sm" />
              Đăng xuất
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default ProfilePage;
