import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import AppShell from "./components/layout/AppShell";
import GuestOnly from "./components/routing/GuestOnly";
import RequireAuth from "./components/routing/RequireAuth";
import AuthProvider from "./contexts/AuthProvider";
import ToastProvider from "./contexts/ToastProvider";
import ComingSoonPage from "./pages/ComingSoonPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import LandingPage from "./pages/landing/LandingPage";
import ProfilePage from "./pages/profile/ProfilePage";
import { ROUTES } from "./shared/routes";

const App = () => (
  <BrowserRouter>
    <ToastProvider>
      <AuthProvider>
        <Routes>
          <Route path={ROUTES.landing} element={<LandingPage />} />

          {/* Login / register: a logged-in user is sent to the app */}
          <Route element={<GuestOnly />}>
            <Route path={ROUTES.login} element={<LoginPage />} />
            <Route path={ROUTES.register} element={<RegisterPage />} />
          </Route>
          <Route
            path={ROUTES.forgotPassword}
            element={<ForgotPasswordPage />}
          />
          <Route path={ROUTES.resetPassword} element={<ResetPasswordPage />} />

          {/* Learner app */}
          <Route element={<RequireAuth role="USER" />}>
            <Route element={<AppShell />}>
              <Route
                path={ROUTES.roadmap}
                element={
                  <ComingSoonPage
                    eyebrow="Lộ trình"
                    title="Lộ trình học"
                    icon="route"
                    text="Lộ trình theo tuần sẽ hiện ở đây sau khi bạn khai báo hồ sơ học tập và làm quiz đầu vào."
                  />
                }
              />
              <Route
                path={ROUTES.progress}
                element={
                  <ComingSoonPage
                    eyebrow="Tiến độ"
                    title="Tiến độ học"
                    icon="chart"
                    text="Phần trăm hoàn thành và trạng thái đúng hạn/chậm sẽ hiện ở đây khi bạn có lộ trình."
                  />
                }
              />
              <Route
                path={ROUTES.result}
                element={
                  <ComingSoonPage
                    eyebrow="Đánh giá đầu vào"
                    title="Kết quả đánh giá"
                    icon="graph"
                    text="Skill graph tô màu kỹ năng đã nắm, nắm một phần và chưa nắm sẽ hiện ở đây sau quiz đầu vào."
                  />
                }
              />
              <Route path={ROUTES.profile} element={<ProfilePage />} />
            </Route>
          </Route>

          {/* Admin app */}
          <Route element={<RequireAuth role="ADMIN" />}>
            <Route element={<AppShell />}>
              <Route
                path={ROUTES.adminDirections}
                element={
                  <ComingSoonPage
                    wide
                    eyebrow="Quản trị"
                    title="Hướng học"
                    icon="compass"
                    text="Danh sách hướng học, mức độ hoàn thiện và người review sẽ được quản lý ở đây."
                  />
                }
              />
              <Route
                path={ROUTES.adminGraph}
                element={
                  <ComingSoonPage
                    wide
                    eyebrow="Quản trị"
                    title="Skill graph"
                    icon="graph"
                    text="Xem và sửa kỹ năng, quan hệ tiên quyết của từng hướng học trên graph trực quan."
                  />
                }
              />
              <Route
                path={ROUTES.adminContent}
                element={
                  <ComingSoonPage
                    wide
                    eyebrow="Quản trị"
                    title="Tài liệu & câu hỏi"
                    icon="layers"
                    text="Quản lý bộ ba tài liệu và ba câu hỏi của mỗi kỹ năng, kèm import CSV."
                  />
                }
              />
              <Route
                path={ROUTES.adminStats}
                element={
                  <ComingSoonPage
                    wide
                    eyebrow="Quản trị"
                    title="Thống kê"
                    icon="chart"
                    text="Số người dùng, số lộ trình đã sinh, hướng học phổ biến và kỹ năng hay bị bỏ dở."
                  />
                }
              />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to={ROUTES.landing} replace />} />
        </Routes>
      </AuthProvider>
    </ToastProvider>
  </BrowserRouter>
);

export default App;
