import { Link, useNavigate, useSearchParams } from "react-router-dom";

import FormAlert from "../../components/form/FormAlert";
import FormField from "../../components/form/FormField";
import SubmitButton from "../../components/form/SubmitButton";
import Icon from "../../components/Icon";
import AuthLayout from "../../components/layout/AuthLayout";
import { useAuth } from "../../contexts/useAuth";
import { useToast } from "../../contexts/useToast";
import { useForm } from "../../hooks/useForm";
import { usePageTitle } from "../../hooks/usePageTitle";
import { authService } from "../../services/authService";
import { toUserMessage } from "../../shared/apiErrorMessages";
import { handleApiError } from "../../shared/handleApiError";
import { ROUTES } from "../../shared/routes";
import { PASSWORD_HELP, matches, newPassword } from "../../shared/validators";

const INVALID_LINK =
  "Link đặt lại mật khẩu không hợp lệ, đã hết hạn hoặc đã được dùng. Hãy yêu cầu link mới.";

/**
 * Opened from the email link: /reset-password?token=<jwt>
 * (PASSWORD_RESET_URL on the backend). POST /api/auth/reset-password.
 */
const ResetPasswordPage = () => {
  usePageTitle("Đặt lại mật khẩu");
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const form = useForm({
    idPrefix: "rp",
    initial: { newPassword: "", confirm: "" },
    rules: {
      newPassword: newPassword("mật khẩu mới"),
      confirm: (value, all) => matches(() => all.newPassword)(value),
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await authService.resetPassword({
        token,
        newPassword: values.newPassword,
      });
      // The backend just revoked every session of this account.
      if (user) await logout();
      showToast("Đã đặt lại mật khẩu. Hãy đăng nhập bằng mật khẩu mới.");
      navigate(ROUTES.login, { replace: true });
    } catch (error) {
      const apiError = handleApiError(error);
      if (apiError.fieldErrors.token) {
        form.setFormError(INVALID_LINK);
        return;
      }
      form.applyServerErrors(apiError.fieldErrors);
      form.setFormError(toUserMessage(apiError));
    }
  });

  return (
    <AuthLayout
      title="Đặt lại mật khẩu"
      lead="Chọn mật khẩu mới cho tài khoản PathWise của bạn."
    >
      {token ? (
        <form className="form-stack" noValidate onSubmit={onSubmit}>
          <FormAlert issues={form.issues} formError={form.formError} />
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
          <SubmitButton loading={form.submitting} loadingText="Đang lưu…" block>
            Đặt lại mật khẩu
          </SubmitButton>
        </form>
      ) : (
        <div className="form-stack">
          <div className="alert alert-danger" role="alert">
            <Icon name="alert" />
            <div>{INVALID_LINK}</div>
          </div>
          <div>
            <Link className="btn btn-primary" to={ROUTES.forgotPassword}>
              Yêu cầu link mới
            </Link>
          </div>
        </div>
      )}
    </AuthLayout>
  );
};

export default ResetPasswordPage;
