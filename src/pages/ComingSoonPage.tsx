import EmptyState from "../components/EmptyState";
import type { IconName } from "../components/Icon";
import PageHead from "../components/PageHead";
import { usePageTitle } from "../hooks/usePageTitle";
import { cx } from "../shared/cx";

interface ComingSoonPageProps {
  eyebrow: string;
  title: string;
  icon: IconName;
  /** What this screen will show once its backend API exists. */
  text: string;
  wide?: boolean;
}

/**
 * Placeholder for screens of the design whose backend API is not built yet
 * (roadmap, progress, assessment result, admin). Keeps the navigation real.
 */
const ComingSoonPage = ({
  eyebrow,
  title,
  icon,
  text,
  wide = false,
}: ComingSoonPageProps) => {
  usePageTitle(title);
  return (
    <div className={cx("page", wide && "page-wide")}>
      <PageHead eyebrow={eyebrow} title={title} />
      <EmptyState icon={icon} title="Màn hình đang được xây dựng" text={text} />
    </div>
  );
};

export default ComingSoonPage;
