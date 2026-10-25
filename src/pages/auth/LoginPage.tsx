import { Link } from "react-router-dom";

import FormAlert from "../../components/form/FormAlert";
import FormField from "../../components/form/FormField";
import SubmitButton from "../../components/form/SubmitButton";
import AuthLayout from "../../components/layout/AuthLayout";
import { useAuth } from "../../contexts/useAuth";
import { useForm } from "../../hooks/useForm";
import { usePageTitle } from "../../hooks/usePageTitle";
import { toUserMessage } from "../../shared/apiErrorMessages";
import { handleApiError } from "../../shared/handleApiError";
import { ROUTES } from "../../shared/routes";
import { required } from "../../shared/validators";

/** POST /api/auth/login. On success GuestOnly redirects to the app. */
const LoginPage = () => {
  usePageTitle("Đăng nhập");
  const { login } = useAuth();
  const form = useForm({
    idPrefix: "lg",
    initial: { identifier: "", password: "" },
    rules: {
      identifier: required("email hoặc tên đăng nhập"),
      password: required("mật khẩu"),
    },
  });

  const onSubmit = form.handleSubmit(async ({ identifier, password }) => {
    try {
      await login({ identifier: identifier.trim(), password });
    } catch (error) {
      const apiError = handleApiError(error);
      form.applyServerErrors(apiError.fieldErrors);
      form.setFormError(toUserMessage(apiError));
    }
  });

  return (
    <AuthLayout
      title="Đăng nhập"
      lead="Tiếp tục lộ trình học của bạn."
      withTabs
    >
      <form className="form-stack" noValidate onSubmit={onSubmit}>
        <FormAlert issues={form.issues} formError={form.formError} />
        <FormField
          {...form.field("identifier")}
          label="Email hoặc tên đăng nhập"
          required
          autoComplete="username"
        />
        <FormField
          {...form.field("password")}
          label="Mật khẩu"
          type="password"
          required
          autoComplete="current-password"
        />
        <p className="small">
          <Link to={ROUTES.forgotPassword}>Quên mật khẩu?</Link>
        </p>
        <SubmitButton
          loading={form.submitting}
          loadingText="Đang đăng nhập…"
          block
        >
          Đăng nhập
        </SubmitButton>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
