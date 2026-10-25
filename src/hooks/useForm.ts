import { useCallback, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

/** Returns "" when valid. Gets all values for cross-field rules (confirm password). */
export type FieldRule<K extends string> = (
  value: string,
  values: Record<K, string>,
) => string;

export interface FieldIssue {
  /** DOM id of the input (used to focus it). */
  id: string;
  message: string;
}

interface UseFormOptions<K extends string> {
  initial: Record<K, string>;
  rules: Partial<Record<K, FieldRule<K>>>;
  /** Prefix for input ids, e.g. "lg" → "lg-email". Keeps ids unique per page. */
  idPrefix: string;
}

/**
 * Form state + validation with the design's behavior (app.js validateForm):
 * - validate everything on submit; one error focuses its field, several show
 *   a summary ("Có N mục cần sửa") that receives focus;
 * - an invalid field re-validates while typing;
 * - a field validates on blur once it has a value or was touched.
 */
export function useForm<K extends string>({
  initial,
  rules,
  idPrefix,
}: UseFormOptions<K>) {
  const [values, setValues] = useState(initial);
  const [errors, setErrorsState] = useState<Partial<Record<K, string>>>({});
  const [issues, setIssues] = useState<FieldIssue[]>([]);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const touched = useRef(new Set<K>());

  const idOf = useCallback((name: K) => `${idPrefix}-${name}`, [idPrefix]);

  const check = (name: K, all: Record<K, string>) =>
    rules[name]?.(all[name], all) ?? "";

  const setErrors = (next: Partial<Record<K, string>>) => {
    setErrorsState((prev) => ({ ...prev, ...next }));
  };

  const onChange = (name: K) => (e: ChangeEvent<HTMLInputElement>) => {
    const next = { ...values, [name]: e.target.value };
    setValues(next);
    if (errors[name])
      setErrors({ [name]: check(name, next) } as Partial<Record<K, string>>);
  };

  const onBlur = (name: K) => () => {
    if (values[name] || errors[name] || touched.current.has(name)) {
      setErrors({ [name]: check(name, values) } as Partial<Record<K, string>>);
    }
    touched.current.add(name);
  };

  /** Props for <FormField>: value, handlers, error and id. */
  const field = (name: K) => ({
    id: idOf(name),
    name,
    value: values[name],
    onChange: onChange(name),
    onBlur: onBlur(name),
    error: errors[name] ?? "",
  });

  const validateAll = (): FieldIssue[] => {
    const next: Partial<Record<K, string>> = {};
    const found: FieldIssue[] = [];
    (Object.keys(rules) as K[]).forEach((name) => {
      const message = check(name, values);
      next[name] = message;
      if (message) found.push({ id: idOf(name), message });
    });
    setErrorsState(next);
    return found;
  };

  /** Shows server-side errors next to their fields (backend field names = keys). */
  const applyServerErrors = (fieldErrors: Partial<Record<string, string>>) => {
    const next: Partial<Record<K, string>> = {};
    (Object.keys(initial) as K[]).forEach((name) => {
      const message = fieldErrors[name];
      if (message) next[name] = message;
    });
    setErrors(next);
  };

  const handleSubmit =
    (onValid: (values: Record<K, string>) => Promise<void> | void) =>
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (submitting) return;
      setFormError("");
      const found = validateAll();
      setIssues(found);
      if (found.length === 1) document.getElementById(found[0].id)?.focus();
      if (found.length) return;
      setSubmitting(true);
      try {
        await onValid(values);
      } finally {
        setSubmitting(false);
      }
    };

  const reset = () => {
    setValues(initial);
    setErrorsState({});
    setIssues([]);
    setFormError("");
    touched.current.clear();
  };

  return {
    values,
    field,
    issues,
    formError,
    setFormError,
    setErrors,
    applyServerErrors,
    submitting,
    handleSubmit,
    reset,
  };
}
