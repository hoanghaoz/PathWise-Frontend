import { useNavigate } from "react-router-dom";

import FormAlert from "../../components/form/FormAlert";
import FormField from "../../components/form/FormField";
import SubmitButton from "../../components/form/SubmitButton";
import AuthLayout from "../../components/layout/AuthLayout";
import { useAuth } from "../../contexts/useAuth";
import { useToast } from "../../contexts/useToast";
import { useForm } from "../../hooks/useForm";
import { usePageTitle } from "../../hooks/usePageTitle";
import { authService } from "../../services/authService";
import { toUserMessage } from "../../shared/apiErrorMessages";
import { handleApiError } from "../../shared/handleApiError";
import { ROUTES } from "../../shared/routes";
import {
  PASSWORD_HELP,
  email,
  matches,
  newPassword,
  username,
} from "../../shared/validators";

/**
 * POST /api/auth/register, then logs in with the same credentials.
 * On success GuestOnly redirects to the app.
 */
const RegisterPage = () => {
  usePageTitle("Đăng ký");
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const form = useForm({
    idPrefix: "rg",
    initial: { email: "", username: "", password: "", confirm: "" },
    rules: {
      email,
      username,
      password: newPassword(),
      confirm: (value, all) => matches(() => all.password)(value),
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const body = {
      email: values.email.trim(),
      username: values.username.trim(),
      password: values.password,
    };
    try {
      await authService.register(body);
    } catch (error) {
      const apiError = handleApiError(error);
      const message = toUserMessage(apiError);
      // A taken email/username is shown on its field, like the design.
      if (apiError.message === "Email already exists") {
        form.setErrors({ email: message });
        document.getElementById("rg-email")?.focus();
      } else if (apiError.message === "Username already exists") {
        form.setErrors({ username: message });
        document.getElementById("rg-username")?.focus();
      } else {
        form.applyServerErrors(apiError.fieldErrors);
        form.setFormError(message);
      }
      return;
    }

    try {
      await login({ identifier: body.email, password: body.password });
      showToast("Đã tạo tài khoản. Chào mừng bạn đến với PathWise!");
    } catch {
      // The account exists; only the automatic login failed (e.g. rate limit).
      showToast("Đã tạo tài khoản. Hãy đăng nhập để tiếp tục.");
      navigate(ROUTES.login, { replace: true });
    }
  });

  return (
    <AuthLayout
      title="Tạo tài khoản"
      lead="Tài khoản giúp lưu hồ sơ, kết quả đánh giá và tiến độ học của riêng bạn."
      withTabs
    >
      <form className="form-stack" noValidate onSubmit={onSubmit}>
        <FormAlert issues={form.issues} formError={form.formError} />
        <FormField
          {...form.field("email")}
          label="Email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
        />
        <FormField
          {...form.field("username")}
          label="Tên đăng nhập"
          required
          autoComplete="username"
          help="3–50 ký tự: chữ không dấu, số, dấu gạch dưới (_) hoặc dấu chấm (.)."
        />
        <FormField
          {...form.field("password")}
          label="Mật khẩu"
          type="password"
          required
          autoComplete="new-password"
          help={PASSWORD_HELP}
        />
        <FormField
          {...form.field("confirm")}
          label="Nhập lại mật khẩu"
          type="password"
          required
          autoComplete="new-password"
        />
        <SubmitButton
          loading={form.submitting}
          loadingText="Đang tạo tài khoản…"
          block
        >
          Tạo tài khoản
        </SubmitButton>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
