import { useEffect, useRef } from "react";

import type { FieldIssue } from "../../hooks/useForm";
import Icon from "../Icon";

interface FormAlertProps {
  /** Client validation issues; a summary is shown only when there are 2+. */
  issues: FieldIssue[];
  /** Error for the whole form, e.g. the server's answer. */
  formError?: string;
}

/**
 * The design's `[data-summary]` box: "Có N mục cần sửa" with links to each
 * field, or a single form-level error. Takes focus when it appears so screen
 * readers announce it.
 */
const FormAlert = ({ issues, formError = "" }: FormAlertProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const showSummary = issues.length > 1;
  const visible = showSummary || Boolean(formError);
  const key = showSummary ? issues.map((i) => i.message).join("|") : formError;

  useEffect(() => {
    if (visible) ref.current?.focus();
  }, [visible, key]);

  if (!visible) return null;

  if (showSummary) {
    return (
      <div className="alert alert-danger" role="alert" tabIndex={-1} ref={ref}>
        <Icon name="alert" />
        <div className="alert-body">
          <span className="alert-title">Có {issues.length} mục cần sửa</span>
          <ul className="err-list">
            {issues.map((issue) => (
              <li key={issue.id}>
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => document.getElementById(issue.id)?.focus()}
                >
                  {issue.message}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="alert alert-danger" role="alert" tabIndex={-1} ref={ref}>
      <Icon name="alert" />
      <div>{formError}</div>
    </div>
  );
};

export default FormAlert;
