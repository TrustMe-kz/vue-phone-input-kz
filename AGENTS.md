# vue-phone input-kz

Instructions for AI agents working with the repository.

---

## 0) Quick facts about this repository

* Purpose: a **Vue 3** phone number input component with a custom UI (flag, country popover, country search) that **wraps** a base phone input engine (formatting/validation/metadata) rather than re-implementing parsing from scratch.
* Stack: `Vue 3`, `TypeScript`, `ShadCN`, `Vite` (library build), a base phone input dependency (libphonenumber-like metadata & “as-you-type” formatting).
* Core entities:
    * `PhoneInputKz` — main exported component (default export)
    * `Component.vue` — UI wrapper and integration layer around the base phone input
    * `Flag.vue` — country flag rendering (CDN-based by default)
    * Metadata layer — country calling codes, formats, validation rules (global), with **KZ behavior prioritized** when ambiguous.
* Runtime behavior (high-level):
    * Input is sanitized (keeps digits + common phone punctuation)
    * Formatting is applied “as-you-type” (configurable)
    * Validation and E.164 normalization are produced by the base engine and exposed via events
    * Optional async helpers: country auto-detection (IP-based) and dynamic placeholder example loading
* Structure overview:
    * `src/` — source code (Vue components, exports)
    * `dist/` — built output (ESM/CJS/types)
    * `test/` — demos and/or tests

> Agents: before making changes, read `README.md`, `package.json`, public docs, and the generated `dist/*.d.ts` to understand the public contract.

---

## 1) Agent protocol

1. **Understand the task:**
    * Create a concise plan (3–7 steps) and follow it
2. **Minimal diff:**
    * Modify only the files and sections required for the task.  
    ❌ No mass refactoring or formatting changes across unrelated code.
3. **Maintain public API stability:**
    * Preserve signatures and behavior of the exported component and its props/events unless a breaking change is explicitly required and approved
4. **Phone domain rules are the source of truth:**
    * Don’t change phone formatting/validation semantics casually. When rules must change, update implementation, tests, and docs/examples together.
5. **Tests and build:**
    * Run the repository build (and tests, if present) before committing
6. **Documentation:**
    * When functionality changes, update related docs and examples

---

## 2) Architecture and code placement

### 2.1. Wrapper vs base engine

This library is a **UI wrapper**. Parsing/formatting/validation comes from the base engine.

Responsibilities of the wrapper:

* Provide UI: flag, country selector popover, country search
* Connect UI state (selected country, input value) to the base engine
* Expose consistent events and metadata to consumers
* Enforce product-specific behavior, especially for Kazakhstan ambiguity cases

Requirements:

* Avoid re-implementing phone parsing/validation from scratch
* Keep integration logic explicit and testable
* Prefer dependency inversion: wrapper rules should be small, readable layers on top of the base engine

### 2.2. Main component `PhoneInputKz`

**`PhoneInputKz`** is the public integration point.

It must:

* Support `v-model` (model value) reliably
* Emit metadata on each meaningful change
* Keep `countryCode` observable/controllable
* Preserve predictable behavior across formatting modes

### 2.3. Flags and external resources

Default UI may rely on external resources (flags CDN, IP geo service).

Requirements:

* External fetches must be optional and failure-tolerant
* Provide fallbacks so the component remains usable offline / behind restrictive networks
* Do not make network dependencies mandatory for core input correctness

---

## 3) Public API contract

The public API is part of the library’s promise.

### 3.1. Props

Common props include (names may evolve, but the semantics must stay consistent):

* `modelValue`
* `countryCode`
* `onlyCountries`, `preferredCountries`, `ignoredCountries`
* `autoFormat`, `noFormattingAsYouType`
* `fetchCountry` (IP-based auto-detect toggle)

When introducing new props:

* Prefer backward-compatible defaults
* Document the prop
* Add usage examples

### 3.2. Events

The component emits change information via events such as:

* `update:model-value` (and/or the repository’s chosen v-model convention)
* `update` / `data` — emits a metadata object
* `country-code` / `update:country-code`

**Metadata object** must remain stable and predictable:

* `isValid`, `isPossible`
* `e164`
* `formatNational`, `formatInternational`
* `nationalNumber`
* `countryCode`

Rules:

* Never silently treat invalid input as valid
* Keep event payload shapes consistent
* If event names change, provide a migration path and update docs/examples

---

## 4) Domain rules: Kazakhstan-focused behavior

This component supports global phone formats via metadata, but product behavior prioritizes Kazakhstan in ambiguous cases.

### 4.1. Normalization and equivalence

Treat these as equivalent representations of the same KZ number where applicable:

* `+7XXXXXXXXXX`
* `7XXXXXXXXXX`
* `8XXXXXXXXXXX` (national prefix forms)

When the input is valid, the component must be able to produce a stable **E.164** representation.

### 4.2. +7 ambiguity (KZ vs RU)

Because `+7` is shared by multiple regions, the wrapper must enforce a product rule:

* If the number can plausibly be interpreted as Kazakhstan, **prefer KZ**.

Examples of problematic user inputs that must not lead to wrong interpretation:

* `8776...`, `7776...` should not become `+87...` or `+77...`

### 4.3. Formatting modes

* When `autoFormat=true`, prefer returning formatted national output in the visible input while maintaining correct metadata
* When `noFormattingAsYouType=true`, preserve raw/as-entered behavior while still emitting correct metadata where possible

---

## 5) UX expectations

The component is a UI widget, so UX is part of the contract.

Must-haves:

* Country selection popover
* Country search
* Placeholder/example support (may be dynamically loaded)
* Focus behavior after selecting a country (when applicable)

UX rules:

* UI changes must not break phone correctness
* UI should degrade gracefully if remote assets are unavailable

---

## 6) Code style

The code should be **straightforward, explicit, and predictable**.

### 6.1. General principles

* One function — one responsibility
* Prefer **early returns** instead of deep nesting
* Avoid hidden state and surprising side effects
* Prefer named helpers over long inline callbacks

### 6.2. Naming rules

* UI state --> nouns: `selectedCountry`, `query`, `open`, `flags`
* Actions --> verbs: `ensureInput`, `getCountry`, `applyFormatting`, `emit`
* No unclear abbreviations
* No humorous names — this is a long-lived UI library

### 6.3. Function structure pattern

Preferred 4-step pattern:

1. **Doing some checks** — validate input
2. **Getting the data** — prepare required variables
3. **Defining the functions** — local helpers if needed
4. **Main flow** — execute the core logic

Use the markers consistently:

* `// Constants`
* `// Variables`
* `// Doing some checks`
* `// Getting the data`
* `// Defining the functions`
* `// TODO:`
* `// FIXME:`

---

## 7) Tests and validation

Changes that affect parsing/formatting/events must be covered.

Recommended coverage:

* Unit tests for:
    * Sanitization rules
    * Event payload shapes
    * KZ preference behavior under +7 ambiguity
    * Formatting mode toggles
* Integration tests for:
    * `v-model` roundtrip
    * Country switching and persistence
    * Async fallbacks (fetchCountry failure)

Regression cases to include:

* Inputs with letters/symbols: `abc!!!` -> sanitized, `isValid=false`
* Ambiguous prefixes: `8776...`, `7776...` -> must **not** become `+87` or `+77`
* Equivalence: `+7776...`, `776...`, `8776...` -> same resulting E.164 when valid

---

## 8) Documentation & examples

Docs are part of the public contract.

When behavior changes:

* Update README
* Update examples/playground
* Provide at least one snippet for:
    * Basic usage (`v-model` + metadata)
    * KZ-only mode
    * Disabling async country detection

Recommended minimal example:

```vue
<template>
  <PhoneInputKz v-model="phone" @update="meta = $event" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import PhoneInputKz from 'vue-phone-input-kz';

const phone = ref('');
const meta = ref<any>(null);
</script>
```

---

## 9) Prohibitions & caution

* ❌ Don’t silently accept invalid numbers as valid — always respect `meta.isValid`
* ❌ Don’t hardcode business rules into UI masking alone — rely on metadata (`e164`, `isValid`, `isPossible`)
* ❌ Don’t introduce mandatory network dependencies (IP geo, CDN flags) for core correctness
* ❌ Don’t break event payload shapes or `v-model` behavior without a migration plan
* ❌ Don’t add heavy dependencies without justification
* ❌ Don’t “fix” +7 ambiguity by preferring RU; product behavior must prefer KZ when plausible

---

## 10) Pre-commit checklist

* [ ] Task is completed according to the plan
* [ ] Public API has not been broken unintentionally
* [ ] Event payload shapes are stable and tested
* [ ] +7 ambiguity behavior is covered by regression tests
* [ ] Docs/examples updated if behavior changed
* [ ] Build (and tests, if present) pass without errors
