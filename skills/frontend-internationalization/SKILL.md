---
name: frontend-internationalization
description: Engineer locale-aware React interfaces covering ICU messages, dates, numbers, currency, time zones, RTL, bidi and locale routing.
---

# Frontend Internationalization

## Activate when

Activate for user-facing localized text/data, locale routing, translations, RTL support, pluralization or date/time/currency behavior.

## Repository inspection

Inspect i18n library/config, locale catalogs, fallback locale, locale detection/routing, formatting APIs, extraction tooling and test fixtures.

## Decision rules

Never concatenate translated fragments when grammar can vary. Use locale-aware plural/select/date/number/currency formatting. Treat timezone explicitly for user-visible times.

RTL is a layout and interaction concern, not only a translation concern.

## Implementation contract

Define locale → message catalog → formatter → UI boundary. Ensure missing translations have a deterministic fallback. Keep IDs stable and source-owned.

## Failure handling

Watch for hardcoded strings, plural-rule bugs, timezone assumptions, bidi control issues, untranslated accessibility names and layout regressions in RTL.

## Review

Check text content, aria labels, truncation, numeric/date formatting, timezone semantics, RTL direction, and locale fallback.

## Verification

Test representative locales including a plural-rich locale and RTL where supported. Verify date/time/currency outputs with fixed test clocks.
