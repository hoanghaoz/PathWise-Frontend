/** Success body produced by the backend (ApiSuccessResponse<T>). */
export interface ApiSuccessResponse<T> {
  statusCode: number;
  success: true;
  data: T;
  message: string;
  timestamp: string;
}
