---
name: react-forms-validation
description: Use when building forms, multi-step workflows, validation, field errors, and submission behavior.
license: MIT
---

# React Forms and Validation

## Purpose

Make form state, validation, submission, and error ownership explicit while preserving accessible recovery. A form is a state machine with three failure classes — client-validation, server-field, and transport — each with different user meaning, and the form's job is to keep them distinct and recoverable.

## Activate when

- creating/modifying forms;
- adding client/server validation;
- implementing wizards or complex submission flows.

## Boundary with related skills

- Use `react-forms-validation` for the form model: state, validation timing, error mapping, submission.
- Use `react-actions-forms` (React 19) for action-state semantics (`useActionState`, `useFormStatus`).
- Use `react-async-ui` for the submission pending/error/retry rendering.
- Use `arktype` / `zod` / `valibot` for the schema tooling behind validation.
- Use `react-node-integration` / `react-rails-integration` for the backend's specific error envelope shape (problem details, Rails 422).

## Repository inspection

Inspect form library conventions (react-hook-form, Formik, or controlled state), schema validation, field components, API error shapes, validation timing (on-blur/on-change/on-submit), focus handling, autosave, and duplicate-submit prevention. Reuse the repository's field components and error conventions before writing new ones.

## Decision rules

- Separate validation errors from transport/system failures: field errors target a control; transport failures (timeout, 5xx) target the form-level error region and offer retry.
- Enforce authoritative business rules on the server; client validation is UX, not enforcement.
- Preserve user input on recoverable submission failure — never clear the form on a 500.
- Keep field names and error identifiers stable between client schema and server error keys (`email`, not `data.attributes.email`).
- Announce errors appropriately (`aria-describedby` per field, summary region with `role="alert"` on submit) and move focus to the first invalid field.
- Prevent unsafe duplicate submissions: disable while in flight AND reject mid-flight resubmission (in-flight guard), for non-idempotent submits.

Validation timing default: validate on submit first, then re-validate touched fields on change (error appears after the user has interacted). Validate-on-untouched-change is the noisy anti-state that trains users to ignore errors.

## Implementation procedure

1. Define form state.
2. Identify synchronous versus server rules.
3. Normalize server errors.
4. Prevent unsafe duplicate submissions.
5. Preserve input and provide recovery.
6. Test keyboard submit, invalid fields, server rejection, success, and retry.

**Reference example** — a login form with distinct error classes, focus management, and duplicate-submit guard:

```tsx
type FieldErrors = Partial<Record<"email" | "password", string>>;

function LoginForm() {
  const [values, setValues] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [transportError, setTransportError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;                                   // duplicate-submit guard
    setTransportError(null);

    const schema = z.object({                                 // client rules = UX only
      email: z.string().email("Enter a valid email"),
      password: z.string().min(8, "At least 8 characters"),
    });
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const errors = fieldErrorsFrom(parsed.error);           // keyed by stable field names
      setFieldErrors(errors);
      focusFirstInvalid(Object.keys(errors));                 // focus management
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      await submitLogin(parsed.data);                         // non-idempotent POST
    } catch (error) {
      if (error instanceof HttpError && error.status === 422) {
        setFieldErrors(serverFieldErrors(error.body));        // server-field class
      } else {
        setTransportError("Sign-in is unavailable. Try again.");  // transport class
      }
      return;                                                 // values preserved — never cleared
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      {transportError && <p role="alert" className="form-error">{transportError}</p>}
      <Field
        id="email" label="Email" error={fieldErrors.email}
        value={values.email}
        onChange={(v) => setValues((s) => ({ ...s, email: v }))} />
      <Field
        id="password" label="Password" type="password" error={fieldErrors.password}
        value={values.password}
        onChange={(v) => setValues((s) => ({ ...s, password: v }))} />
      <button type="submit" disabled={submitting}>
        {submitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

// Field wires the error into the accessible contract
function Field({ id, label, error, ...props }: FieldProps) {
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} aria-describedby={errorId} aria-invalid={!!error} {...props} />
      {error && <p id={errorId} className="field-error">{error}</p>}
    </div>
  );
}
```

## Anti-patterns / failure modes

- Browser-only validation for server rules (required-if-email-exists) — the client cannot know; show the server's answer.
- Clearing input on failure — the user retypes their password after a 502.
- Generic errors when field details are known ("Invalid submission" over "Email already registered").
- Inaccessible error messages: visual-only red borders, no programmatic association, no focus move.
- In-flight double submits from double-clicks on unchanged buttons.
- Validation timing that errors pristine fields on first paint.
- Mapping server errors by message text instead of stable field keys — breaks on i18n or copy edits.

## Agent review checklist

- [ ] Which layer owns each rule (client-UX vs server-authoritative) — documented in the change?
- [ ] Can keyboard users locate errors (focus to first invalid field, `aria-describedby` wiring)?
- [ ] Are validation and transport failures rendered as distinct classes?
- [ ] Is duplicate submission prevented (disabled + in-flight guard)?
- [ ] Do server error keys map to fields by stable identifiers?

## Verification

Accessible form tests (role/name queries, error association), validation tests, API error mapping tests, typecheck, and integration tests. Cover: keyboard submit (Enter in field), invalid field focus, server rejection preserving values, success navigation, and retry after transport failure.

## React 19 Actions

When React 19 Actions are supported, compose with `react-actions-forms` for useActionState, useFormStatus, useOptimistic and form action lifecycle semantics.
