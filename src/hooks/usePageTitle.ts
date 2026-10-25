import { useEffect } from "react";

/**
 * Sets "<title> · PathWise" and, like the design's render(), scrolls to the
 * top and moves focus to the page heading (#page-title) so keyboard and
 * screen-reader users start at the new page.
 */
export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} · PathWise`;
    window.scrollTo(0, 0);
    document.getElementById("page-title")?.focus({ preventScroll: true });
  }, [title]);
}
