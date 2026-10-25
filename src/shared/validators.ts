// Client-side rules mirror PathWise-BE auth DTOs (auth.request.dto.ts) so most
// mistakes are caught before a request. Messages follow the design's copy.
// Each validator returns "" when the value is valid.

export type Validator = (value: string) => string;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const USERNAME = /^[A-Za-z0-9_.]+$/;
const PASSWORD_POLICY = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;
export const PASSWORD_MAX_LENGTH = 72;

export const PASSWORD_HELP =
  "Ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.";

export const required =
  (label: string): Validator =>
  (value) =>
    value.trim() ? "" : `Vui lòng nhập ${label}.`;

export const email: Validator = (value) => {
  const v = value.trim();
  if (!v) return "Vui lòng nhập email.";
  if (v.length > 255) return "Email tối đa 255 ký tự.";
  if (!EMAIL.test(v)) {
    return "Email chưa đúng định dạng, ví dụ: ten@truong.edu.vn.";
  }
  return "";
};

export const username: Validator = (value) => {
  const v = value.trim();
  if (!v) return "Vui lòng nhập tên đăng nhập.";
  if (v.length < 3) return "Tên đăng nhập cần ít nhất 3 ký tự.";
  if (v.length > 50) return "Tên đăng nhập tối đa 50 ký tự.";
  if (!USERNAME.test(v)) {
    return "Tên đăng nhập chỉ gồm chữ không dấu, số, dấu gạch dưới (_) và dấu chấm (.).";
  }
  return "";
};

/** For a password the user chooses (register, reset, change). */
export const newPassword =
  (label = "mật khẩu"): Validator =>
  (value) => {
    if (!value) return `Vui lòng nhập ${label}.`;
    if (value.length < 8) return "Mật khẩu cần ít nhất 8 ký tự.";
    if (value.length > PASSWORD_MAX_LENGTH) {
      return `Mật khẩu tối đa ${PASSWORD_MAX_LENGTH} ký tự.`;
    }
    if (!PASSWORD_POLICY.test(value)) {
      return "Mật khẩu cần có chữ hoa, chữ thường, số và ký tự đặc biệt.";
    }
    return "";
  };

export const matches =
  (getOther: () => string, label = "mật khẩu nhập lại"): Validator =>
  (value) => {
    if (!value) return `Vui lòng nhập ${label}.`;
    return value === getOther() ? "" : "Mật khẩu nhập lại chưa khớp.";
  };
