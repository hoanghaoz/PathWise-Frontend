import { useState } from "react";
import { Link } from "react-router-dom";

import FormAlert from "../../components/form/FormAlert";
import FormField from "../../components/form/FormField";
import SubmitButton from "../../components/form/SubmitButton";
import Icon from "../../components/Icon";
import AuthLayout from "../../components/layout/AuthLayout";
import { useForm } from "../../hooks/useForm";
import { usePageTitle } from "../../hooks/usePageTitle";
import { authService } from "../../services/authService";
import { toUserMessage } from "../../shared/apiErrorMessages";
import { handleApiError } from "../../shared/handleApiError";
import { ROUTES } from "../../shared/routes";
import { email } from "../../shared/validators";

/**
 * POST /api/auth/forgot-password. The backend answers the same way whether
 * or not the email exists, so the success text never confirms an account.
 */
const ForgotPasswordPage = () => {
  usePageTitle("Quên mật khẩu");
  const [sentTo, setSentTo] = useState("");
  const form = useForm({
    idPrefix: "fp",
    initial: { email: "" },
    rules: { email },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await authService.forgotPassword(values.email.trim());
      setSentTo(values.email.trim());
    } catch (error) {
      const apiError = handleApiError(error);
      form.applyServerErrors(apiError.fieldErrors);
      form.setFormError(toUserMessage(apiError));
    }
  });

  return (
    <AuthLayout
      title="Quên mật khẩu"
      lead="Nhập email đã đăng ký, Pathwise sẽ gửi cho bạn link đặt lại mật khẩu."
    >
      {sentTo ? (
        <div className="form-stack">
          <div className="alert alert-ok" role="status">
            <Icon name="check" />
            <div className="alert-body">
              <span className="alert-title">Đã gửi yêu cầu</span>
              <span>
                Nếu <strong>{sentTo}</strong> đã được đăng ký, link đặt lại mật
                khẩu đã được gửi tới email đó. Link có hiệu lực trong 15 phút và
                chỉ dùng được một lần.
              </span>
            </div>
          </div>
          <div className="od-cluster">
            <Link className="btn btn-primary" to={ROUTES.login}>
              Quay lại đăng nhập
            </Link>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setSentTo("")}
            >
              Gửi lại
            </button>
          </div>
        </div>
      ) : (
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
          <SubmitButton loading={form.submitting} loadingText="Đang gửi…" block>
            Gửi link đặt lại mật khẩu
          </SubmitButton>
          <p className="small">
            <Link to={ROUTES.login}>Quay lại đăng nhập</Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
