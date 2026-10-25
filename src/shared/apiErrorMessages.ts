import type { NormalizedApiError } from "../types/commonTypes";

// The backend answers in English; the UI is Vietnamese. Known messages are
// translated here, everything else falls back to a status-based sentence.
const MESSAGES: Record<string, string> = {
  "Invalid email/username or password":
    "Email/tên đăng nhập hoặc mật khẩu không đúng.",
  "Email already exists":
    "Email này đã được đăng ký. Hãy đăng nhập thay vì tạo tài khoản mới.",
  "Username already exists": "Tên đăng nhập này đã có người dùng.",
  "Password must not be the same as your email or username":
    "Mật khẩu không được trùng với email hoặc tên đăng nhập.",
  "Too many login attempts. Please try again in a minute.":
    "Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau 1 phút.",
  "Invalid or expired password reset token":
    "Link đặt lại mật khẩu không hợp lệ, đã hết hạn hoặc đã được dùng. Hãy yêu cầu link mới.",
  "Current password is incorrect": "Mật khẩu hiện tại không đúng.",
  "New password must be different from the current password":
    "Mật khẩu mới phải khác mật khẩu hiện tại.",
  "This account has no password yet; use forgot password to set one":
    "Tài khoản này chưa có mật khẩu. Hãy dùng Quên mật khẩu để đặt mật khẩu.",
  "Invalid or expired refresh token":
    "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
};

/** Vietnamese sentence to show for a failed request. */
export const toUserMessage = (error: NormalizedApiError): string => {
  const known = MESSAGES[error.message];
  if (known) return known;
  if (error.statusCode === 0) {
    return "Không kết nối được máy chủ. Kiểm tra mạng hoặc thử lại sau.";
  }
  if (error.statusCode === 429) {
    return "Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.";
  }
  if (error.statusCode >= 500) {
    return "Máy chủ đang gặp sự cố. Vui lòng thử lại sau.";
  }
  if (error.statusCode === 400 && Object.keys(error.fieldErrors).length) {
    return "Một số thông tin chưa hợp lệ. Kiểm tra lại các ô được đánh dấu.";
  }
  return error.message;
};
