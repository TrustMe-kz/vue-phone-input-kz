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
npm i vue-phone-input-kz tailwindcss shadcn
```

`vue-phone-input-kz` uses **shadcn** primitives internally, so `shadcn` is required for stable rendering and behavior in host apps.

2. Import **Component & CSS**:

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
| `class` | `HTMLAttributes['class'] \| null` | `null` | Extra classes for component root |

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

## Slots

| Slot      | Bindings                             | Description                                  |
|-----------|--------------------------------------|----------------------------------------------|
| `popover` | `{ country, countries, setCountry }` | Override default country selector popover UI |
| `default` | `{ val, hint, set }`                 | Override default input                       |

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
