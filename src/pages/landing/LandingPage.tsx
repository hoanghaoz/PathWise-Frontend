import type { CSSProperties } from "react";
import { Link } from "react-router-dom";

import Brand from "../../components/Brand";
import GraphLegend from "../../components/graph/GraphLegend";
import SkillGraph from "../../components/graph/SkillGraph";
import Icon from "../../components/Icon";
import SkipLink from "../../components/layout/SkipLink";
import Mascot from "../../components/Mascot";
import { useAuth } from "../../contexts/useAuth";
import { usePageTitle } from "../../hooks/usePageTitle";
import { ROUTES, homePathFor } from "../../shared/routes";
import { HERO_RESULTS, HERO_SKILLS, HERO_TARGETS } from "./heroGraph";

const STEPS = [
  [
    "Khai báo mục tiêu",
    "Chọn hướng học, kỹ năng muốn đạt, deadline và số giờ rảnh mỗi tuần.",
  ],
  [
    "Làm quiz thích ứng",
    "Mỗi kỹ năng tối đa 2 câu, cả phiên tối đa 30 câu. Chưa nắm kỹ năng nền thì các kỹ năng phụ thuộc được bỏ qua.",
  ],
  [
    "Xem vị trí trên graph",
    "Kỹ năng đã nắm, nắm một phần và chưa nắm hiện trực tiếp trên skill graph.",
  ],
  [
    "Nhận lộ trình theo tuần",
    "Kỹ năng còn thiếu theo đúng thứ tự tiên quyết, vừa quỹ giờ của bạn, kèm 3 tài liệu đã kiểm duyệt cho mỗi kỹ năng.",
  ],
];

const PRINCIPLES = [
  [
    "Graph do con người duyệt",
    "Kỹ năng và thứ tự tiên quyết được biên soạn và review bởi người có chuyên môn.",
  ],
  [
    "Thuật toán chọn, AI diễn giải",
    "Chọn kỹ năng và chia tuần là việc của thuật toán; AI chỉ viết phần giải thích.",
  ],
  [
    "Mọi ID đều được đối chiếu",
    "Kỹ năng và tài liệu trong lộ trình luôn có thật trong cơ sở dữ liệu.",
  ],
];

/** Sets the gap of an od-stack / od-cluster layout primitive. */
const odGap = (gap: string) => ({ "--od-gap": gap }) as CSSProperties;

const reducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

/** Scrolls to a section and focuses its heading (design's A.scrollTo). */
const scrollToSection = (id: string) => {
  const section = document.getElementById(id);
  if (!section) return;
  section.scrollIntoView({
    behavior: reducedMotion() ? "auto" : "smooth",
    block: "start",
  });
  section.querySelector("h2")?.focus({ preventScroll: true });
};

const LandingPage = () => {
  usePageTitle("Lộ trình học cá nhân hóa");
  const { user } = useAuth();
  const enter = user ? homePathFor(user.role) : ROUTES.register;

  return (
    <>
      <SkipLink />
      <div className="lp">
        <header className="lp-header">
          <div className="lp-header-in">
            <Brand to={ROUTES.landing} />
            <nav className="lp-links" aria-label="Trang chủ">
              <button
                type="button"
                className="lp-link"
                onClick={() => scrollToSection("how")}
              >
                Cách hoạt động
              </button>
              <button
                type="button"
                className="lp-link"
                onClick={() => scrollToSection("principles")}
              >
                Vì sao kiểm chứng được
              </button>
            </nav>
            {user ? (
              <Link className="btn btn-primary btn-sm" to={enter}>
                Vào ứng dụng
              </Link>
            ) : (
              <>
                <Link className="btn btn-ghost btn-sm" to={ROUTES.login}>
                  Đăng nhập
                </Link>
                <Link className="btn btn-primary btn-sm" to={ROUTES.register}>
                  Bắt đầu
                </Link>
              </>
            )}
          </div>
        </header>

        <main id="main" tabIndex={-1}>
          <section className="lp-section hero" aria-labelledby="page-title">
            <div className="od-stack" style={odGap("24px")}>
              <p className="eyebrow">
                Lộ trình học cá nhân hóa cho sinh viên CNTT
              </p>
              <h1 id="page-title" tabIndex={-1}>
                Biết mình đang ở đâu. Biết nên học gì tiếp theo.
              </h1>
              <p className="lead">
                Pathwise kiểm tra trình độ thực tế của bạn trên một skill graph
                do con người kiểm duyệt, rồi chia các kỹ năng còn thiếu thành kế
                hoạch theo tuần vừa với thời gian rảnh của bạn.
              </p>
              <div className="hero-cta">
                <Link className="btn btn-primary" to={enter}>
                  {user ? "Mở lộ trình của tôi" : "Tạo lộ trình của tôi"}
                  <Icon name="arrowR" />
                </Link>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => scrollToSection("how")}
                >
                  Xem cách hoạt động
                </button>
              </div>
            </div>
            <figure className="hero-visual">
              <figcaption
                className="od-row"
                style={{ justifyContent: "space-between" }}
              >
                <span className="small strong">Ví dụ kết quả đánh giá</span>
                <span className="chip">Backend Web</span>
              </figcaption>
              <SkillGraph
                id="hero"
                skills={HERO_SKILLS}
                results={HERO_RESULTS}
                targets={HERO_TARGETS}
                vertical
                label="Ví dụ kết quả đánh giá trên skill graph Backend Web"
              />
              <GraphLegend withTarget />
            </figure>
          </section>

          <div className="lp-alt" id="how">
            <section className="lp-section" aria-labelledby="how-h">
              <div className="section-head">
                <p className="eyebrow">Cách hoạt động</p>
                <h2 id="how-h" tabIndex={-1}>
                  Bốn bước từ mục tiêu đến kế hoạch tuần
                </h2>
              </div>
              <ol className="grid-4 list-reset">
                {STEPS.map(([title, text], i) => (
                  <li key={title} className="step-card principles-step">
                    <span className="step-n">0{i + 1}</span>
                    <h3>{title}</h3>
                    <p className="small muted">{text}</p>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          <section
            className="lp-section"
            id="principles"
            aria-labelledby="pr-h"
          >
            <div className="section-head">
              <p className="eyebrow">Vì sao kiểm chứng được</p>
              <h2 id="pr-h" tabIndex={-1}>
                AI chọn đường đi trong graph, không tự tạo nội dung
              </h2>
            </div>
            <div className="principles-row">
              {PRINCIPLES.map(([title, text]) => (
                <div key={title}>
                  <h3>{title}</h3>
                  <p className="muted">{text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="lp-section lp-cta" aria-labelledby="cta-h">
            <div className="cta-grid">
              <div className="od-stack" style={odGap("16px")}>
                <h2 id="cta-h">Bắt đầu từ chỗ bạn đang đứng</h2>
                <p className="lead">
                  Khai báo mục tiêu, làm quiz đầu vào và nhận lộ trình theo tuần
                  có thể theo dõi tiến độ.
                </p>
                <div>
                  <Link className="btn btn-primary" to={enter}>
                    {user ? "Mở lộ trình của tôi" : "Tạo tài khoản"}
                    <Icon name="arrowR" />
                  </Link>
                </div>
              </div>
              <Mascot
                className="cta-mascot"
                alt="Gấu PathWise đeo kính, mặc hoodie, đang lập trình trên laptop"
              />
            </div>
          </section>
        </main>

        <footer className="lp-footer">
          <div className="lp-section">
            <p className="subtle">
              Pathwise · Đồ án 1 — Hệ thống lộ trình học cá nhân hóa cho sinh
              viên CNTT, ứng dụng AI.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LandingPage;
