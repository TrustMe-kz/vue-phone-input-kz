## vue-phone-input-kz

**vue-phone-input-kz** is a Vue 3 phone input component focused on Kazakhstan-first behavior for ambiguous `+7` numbers. It wraps [vue-phone-input-base](https://www.npmjs.com/package/vue-phone-input-base) and provides a custom UI (flag, country popover, country search) on top of the base parsing/formatting engine.

The library is built as a Vite library and published with ESM/UMD bundles and TypeScript declarations.

### Features

- Kazakhstan-priority behavior for ambiguous `+7` prefixes when plausible
- Country selector with search popover
- As-you-type formatting and normalized metadata via base engine events
- `v-model` support for phone value and country
- Optional country fetch mode (`fetch`) for initial country resolution
- Ready-to-use component styling via exported CSS

### Example

```vue
<script setup lang="ts">
import { ref } from 'vue';
import PhoneInputKz from 'vue-phone-input-kz';
import 'vue-phone-input-kz/index.css';

const phone = ref('');
const country = ref<string | null>('kz');
const meta = ref<Record<string, unknown> | null>(null);
</script>

<template>
  <PhoneInputKz
    v-model="phone"
    v-model:country="country"
    format="national"
    :fetch="false"
    @change="(value) => console.log('phone:', value)"
    @update="(payload) => (meta = payload)"
  />

  <pre>{{ meta }}</pre>
</template>
```

## Installation

1. Install **dependencies**:

```shell
npm i vue-phone-input-kz
```

2. If your app does not have **shadcn/vue** configured yet, follow [the official setup guide (https://www.shadcn-vue.com/docs/installation)](https://www.shadcn-vue.com/docs/installation)  

```bash
npx shadcn-vue@latest init
```

> 💡 **Minimal checklist:** install _Tailwind v4_, set up `@/*` aliases in your project, update your build config, then continue.

3. Import **component and styles**:

```ts
import PhoneInputKz from 'vue-phone-input-kz';
import 'vue-phone-input-kz/index.css';
```

## Component API

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` | `string \| null` | `null` | Phone value for `v-model` |
| `country` | `string \| null` | `null` | Country code for `v-model:country` |
| `exclude` | `string[] \| null` | `['AC']` | Countries excluded from selector |
| `format` | `'international' \| 'national' \| null` | `'international'` | Final display format for valid numbers |
| `fetch` | `boolean \| null` | `false` | Enables country fetch mode in base engine |
| `locale` | `string \| null` | `null` | Country locale forwarded to base engine (`country-locale`) |
| `hint` | `string \| null` | `null` | Custom input placeholder (fallbacks to base placeholder) |
| `disabled` | `boolean \| null` | `false` | Disables input and country selector with disabled styles |
| `popoverFlags` | `boolean \| null` | `true` | Enables/disables rendering country flags inside the popover list |
| `noFlags` | `boolean \| null` | `false` | Legacy inverse flag switch (`true` disables flags in popover) |
| `translations` | `{ searchCountry?: string; noCountryFound?: string } \| null` | `null` | UI text overrides for country search/empty state (fallback to English) |
| `maxDigits` | `number \| null` | `15` | Maximum count of digits allowed in the phone number (E.164-safe limit by default) |
| `digitsOnly` | `boolean \| null` | `true` | Strips all non-digit input characters before passing value to base engine |
| `plus` | `boolean \| null` | `true` | Adds `+` prefix automatically when there is at least one digit |
| `forcePlus` | `boolean \| null` | `true` | Backward-compatible alias for `plus` |
| `policy` | `Partial<PhoneInputPolicy> \| null` | `null` | Unified configuration object for input/format/country/ui policies |
| `class` | `HTMLAttributes['class'] \| null` | `null` | Extra classes for component root |

`maxDigits` is enforced by digits count (not by raw input string length), so formatted values with spaces/brackets can still be typed until digit limit is reached.

Policy merge order (highest priority first):
- legacy wrapper props (`maxDigits`, `plus`, `forcePlus`, `fetch`, `popoverFlags`, `noFlags`, etc.)
- `policy` object
- default policy values

`auto-format`, `no-formatting-as-you-type`, and country auto-detect attrs from `vue-phone-input-base` are still supported and merged into the resolved policy.

### Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:modelValue` | `string \| null` | Vue `v-model` update |
| `change` | `string \| null` | Mirrors phone value updates |
| `update:country` | `string \| null` | Vue `v-model:country` update |
| `changeCountry` | `string \| null` | Mirrors country updates |

### Internal

Unknown attributes/listeners are passed to `vue-phone-input-base` through the root component. This means you can use base props/events like:

- `auto-format`
- `no-formatting-as-you-type`
- `preferred-countries`
- `only-countries`
- `ignored-countries`
- `@update` / `@data` metadata events

Example:

```vue
<PhoneInputKz
  v-model="phone"
  @update="(result) => console.log(result.e164, result.isValid)"
  auto-format
/>
```

Localization example:

```vue
  <PhoneInputKz
  v-model="phone"
  hint="Номер телефона"
  :popover-flags="false"
  :max-digits="15"
  :digits-only="true"
  :plus="true"
  :translations="{
    searchCountry: 'Поиск страны...',
    noCountryFound: 'Страна не найдена.'
  }"
/>
```

Policy object example:

```vue
<PhoneInputKz
  v-model="phone"
  :policy="{
    input: { maxDigits: 15, digitsOnly: true, plus: true },
    formatting: { displayFormat: 'international', autoFormat: true },
    country: {
      autoDetectCountryFromPrefix: true,
      autoDetectCountryLocalTrunkPrefix: '8',
      autoDetectCountryLocalCallingCodes: ['7']
    },
    ui: { showFlagsInPopover: true }
  }"
/>
```

## Slots

| Slot              | Bindings                             | Description                                  |
|-------------------|--------------------------------------|----------------------------------------------|
| `countrySelector` | `{ country, countries, setCountry }` | Override default country selector popover UI |
| `input`           | `{ val, hint, set }`                 | Override default input                       |

## Development

- **Lint:**

```shell
npm run lint
```

- Build the **Library**:

```shell
npm run build
```

- Start the **Test App**:

```shell
npm run start:test-app
```

---
**vue-phone-input-kz by Kenny Romanov**  
TrustMe
