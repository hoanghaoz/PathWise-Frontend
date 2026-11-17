import type { NormalizedApiError } from "../types/commonTypes";
import { toUserMessage } from "./apiErrorMessages";

/**
 * Sentence for a failed create/update of the learning profile. The backend
 * has no dedicated text for some cases (unknown direction, invalid skills),
 * so those are recognised by status code.
 */
export const profileErrorMessage = (error: NormalizedApiError): string => {
  const known = toUserMessage(error);
  if (known !== error.message) return known; // translated or generic
  if (error.statusCode === 409) return "Bạn đã có hồ sơ học tập rồi.";
  if (error.statusCode === 404) {
    return "Không tìm thấy hướng học hoặc hồ sơ học tập. Hãy tải lại trang.";
  }
  if (error.statusCode === 400) {
    return "Kỹ năng đã chọn chưa hợp lệ: kỹ năng mục tiêu phải thuộc hướng học (hoặc kiến thức chung) và kỹ năng đã biết phải còn tồn tại.";
  }
  return error.message;
};
