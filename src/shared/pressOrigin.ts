/**
 * Remembers where a press started inside a button-like element, as the CSS
 * variables --px / --py, so the press ink in pathwise-polish.css grows from
 * the pointer instead of the centre. Purely visual; call once at startup.
 */
const PRESSABLE = ".btn, .dir-card, .check-row, .icon-btn";

export const installPressOrigin = () => {
  document.addEventListener(
    "pointerdown",
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const el = target.closest<HTMLElement>(PRESSABLE);
      if (!el) return;
      const box = el.getBoundingClientRect();
      el.style.setProperty("--px", `${event.clientX - box.left}px`);
      el.style.setProperty("--py", `${event.clientY - box.top}px`);
    },
    { passive: true },
  );
};
