/** "Skip to main content" for keyboard users; visible only when focused. */
const SkipLink = () => (
  <button
    type="button"
    className="skip-link"
    onClick={() => document.getElementById("main")?.focus()}
  >
    Bỏ qua tới nội dung chính
  </button>
);

export default SkipLink;
