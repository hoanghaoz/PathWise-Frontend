/**
 * Joins class names, skipping falsy ones: cx("btn", block && "btn-block").
 * Use this instead of template literals in className — prettier's Tailwind
 * plugin trims the leading space inside `${cond ? " x" : ""}` and glues
 * class names together.
 */
export const cx = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(" ");
