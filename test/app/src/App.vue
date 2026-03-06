<script setup lang="ts">

import { computed, ref, watch } from 'vue';
import PhoneInputKz from '@phone-input-kz/index.ts';


// Variables

const phone = ref('');
const countryCode = ref<string | null>('KZ');
const autoFormat = ref(true);
const noFormattingAsYouType = ref(false);
const fetchCountry = ref(false);
const disabled = ref(false);
const digitsOnly = ref(true);
const plus = ref(false);
const forcePlus = ref(false);
const popoverFlags = ref(true);
const noFlags = ref(false);
const noAutocomplete = ref(false);
const useCustomTranslations = ref(false);
const usePolicy = ref(false);

const hint = ref('Номер телефона');
const locale = ref('ru-RU');
const maxDigitsInput = ref('15');
const formatMode = ref<'international' | 'national' | 'none'>('international');
const policyFormat = ref<'international' | 'national'>('international');
const preferredCountriesInput = ref('KZ,RU,KG');
const onlyCountriesInput = ref('');
const ignoredCountriesInput = ref('AC');

const meta = ref<Record<string, unknown> | null>(null);
const modelEmitLog = ref<string[]>([]);
const countryEmitLog = ref<string[]>([]);
const phoneRef = ref<InstanceType<typeof PhoneInputKz> | null>(null);


// Constants

const presets = [
  { label: 'KZ mobile (8...)', value: '87761234567' },
  { label: 'KZ mobile (7...)', value: '77761234567' },
  { label: 'KZ mobile (+7...)', value: '+77761234567' },
  { label: 'Switch country demo', value: '+77767211181' },
  { label: 'Noisy invalid input', value: 'abc!!!' },
];


// Defining the functions

function parseCountryList(value: string): string[] | null {
  const parsed = value
    .split(',')
    .map(item => item.trim().toUpperCase())
    .filter(Boolean);

  return parsed.length ? parsed : null;
}

function applyPreset(value: string): void {
  phone.value = value;
}

function resetDemo(): void {
  phone.value = '';
  countryCode.value = 'KZ';
  meta.value = null;
}

function updateMeta(payload: unknown): void {
  meta.value = (payload as Record<string, unknown>) ?? null;
}

function updateCountryCode(value: unknown): void {
  countryCode.value = typeof value === 'string' ? value : null;
}

function focusInput(): void {
  phoneRef.value?.focus();
}

function blurInput(): void {
  phoneRef.value?.blur();
}

function focusCountry(): void {
  phoneRef.value?.focusOnCountry();
}

function focusInputAlias(): void {
  phoneRef.value?.focusOnInput();
}

const normalizedE164 = computed(() => {
  const value = meta.value?.e164;

  return typeof value === 'string' ? value : '—';
});

const maxDigits = computed(() => {
  const parsed = Number.parseInt(maxDigitsInput.value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
});

const displayFormat = computed<'international' | 'national' | null>(() => {
  if (formatMode.value === 'none') return null;
  return formatMode.value;
});

const preferredCountries = computed(() => parseCountryList(preferredCountriesInput.value));
const onlyCountries = computed(() => parseCountryList(onlyCountriesInput.value));
const ignoredCountries = computed(() => parseCountryList(ignoredCountriesInput.value));

const translations = computed(() => {
  if (!useCustomTranslations.value) return null;

  return {
    searchCountry: 'Поиск страны...',
    noCountryFound: 'Страна не найдена.',
  };
});

const policy = computed(() => {
  if (!usePolicy.value) return null;

  return {
    input: {
      maxDigits: maxDigits.value ?? 15,
      digitsOnly: digitsOnly.value,
      plus: plus.value,
    },
    formatting: {
      displayFormat: policyFormat.value,
      autoFormat: autoFormat.value,
    },
    ui: {
      showFlagsInPopover: popoverFlags.value,
    },
  };
});

watch(
  phone,
  (newVal, oldVal) => {
    const nextValue = newVal ?? 'null';
    const prevValue = oldVal ?? 'null';
    const logEntry = `${nextValue} (prev: ${prevValue})`;

    modelEmitLog.value = [ logEntry, ...modelEmitLog.value ].slice(0, 15);
    console.log('[test-app:modelValue]', { newVal, oldVal });
  },
  { immediate: true },
);

watch(
  countryCode,
  (newVal, oldVal) => {
    const nextValue = newVal ?? 'null';
    const prevValue = oldVal ?? 'null';
    const logEntry = `${nextValue} (prev: ${prevValue})`;

    countryEmitLog.value = [ logEntry, ...countryEmitLog.value ].slice(0, 15);
    console.log('[test-app:countryCode]', { newVal, oldVal });
  },
  { immediate: true },
);

</script>

<template>
  <main class="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-slate-200 px-4 py-10 sm:px-6">
    <section class="mx-auto w-full max-w-5xl rounded-2xl border border-slate-300/70 bg-white/90 p-5 shadow-xl shadow-slate-900/10 backdrop-blur sm:p-7">
      <h1 class="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        vue-phone-input-kz test app
      </h1>
      <p class="mt-2 text-sm text-slate-600 sm:text-base">
        Validation of v-model, metadata events, and KZ behavior for the ambiguous +7 prefix.
      </p>

      <div class="mt-6 grid gap-2">
        <label for="phone-input" class="text-sm font-medium text-slate-700">
          Phone
        </label>

        <PhoneInputKz
          id="phone-input"
          ref="phoneRef"
          v-model="phone"
          v-model:country="countryCode"
          :hint="hint || null"
          :locale="locale || null"
          :format="displayFormat"
          :fetch="fetchCountry"
          :disabled="disabled"
          :popover-flags="popoverFlags"
          :no-flags="noFlags"
          :no-autocomplete="noAutocomplete"
          :digits-only="digitsOnly"
          :plus="plus"
          :force-plus="forcePlus"
          :max-digits="maxDigits"
          :translations="translations"
          :policy="policy"
          :preferred-countries="preferredCountries ?? undefined"
          :only-countries="onlyCountries ?? undefined"
          :ignored-countries="ignoredCountries ?? undefined"
          :auto-format="autoFormat"
          :no-formatting-as-you-type="noFormattingAsYouType"
          @update="updateMeta"
          @data="updateMeta"
          @country-code="updateCountryCode"
          @update:country="updateCountryCode"
        />
      </div>

      <div class="mt-4 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
        <label class="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-slate-50 px-3 py-2">
          <input v-model="autoFormat" type="checkbox" class="size-4 rounded border-slate-300 text-slate-900">
          autoFormat
        </label>

        <label class="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-slate-50 px-3 py-2">
          <input v-model="noFormattingAsYouType" type="checkbox" class="size-4 rounded border-slate-300 text-slate-900">
          noFormattingAsYouType
        </label>

        <label class="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-slate-50 px-3 py-2">
          <input v-model="fetchCountry" type="checkbox" class="size-4 rounded border-slate-300 text-slate-900">
          fetchCountry
        </label>

        <label class="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-slate-50 px-3 py-2">
          <input v-model="disabled" type="checkbox" class="size-4 rounded border-slate-300 text-slate-900">
          disabled
        </label>

        <label class="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-slate-50 px-3 py-2">
          <input v-model="digitsOnly" type="checkbox" class="size-4 rounded border-slate-300 text-slate-900">
          digitsOnly
        </label>

        <label class="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-slate-50 px-3 py-2">
          <input v-model="plus" type="checkbox" class="size-4 rounded border-slate-300 text-slate-900">
          plus
        </label>

        <label class="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-slate-50 px-3 py-2">
          <input v-model="forcePlus" type="checkbox" class="size-4 rounded border-slate-300 text-slate-900">
          forcePlus
        </label>

        <label class="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-slate-50 px-3 py-2">
          <input v-model="popoverFlags" type="checkbox" class="size-4 rounded border-slate-300 text-slate-900">
          popoverFlags
        </label>

        <label class="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-slate-50 px-3 py-2">
          <input v-model="noFlags" type="checkbox" class="size-4 rounded border-slate-300 text-slate-900">
          noFlags
        </label>

        <label class="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-slate-50 px-3 py-2">
          <input v-model="noAutocomplete" type="checkbox" class="size-4 rounded border-slate-300 text-slate-900">
          noAutocomplete
        </label>

        <label class="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-slate-50 px-3 py-2">
          <input v-model="useCustomTranslations" type="checkbox" class="size-4 rounded border-slate-300 text-slate-900">
          translations (ru)
        </label>

        <label class="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-slate-50 px-3 py-2">
          <input v-model="usePolicy" type="checkbox" class="size-4 rounded border-slate-300 text-slate-900">
          policy override
        </label>
      </div>

      <div class="mt-4 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
        <label class="grid gap-1">
          <span class="text-xs uppercase tracking-wide text-slate-500">hint</span>
          <input v-model="hint" type="text" class="h-9 rounded-md border border-slate-300 bg-white px-2">
        </label>

        <label class="grid gap-1">
          <span class="text-xs uppercase tracking-wide text-slate-500">locale</span>
          <input v-model="locale" type="text" class="h-9 rounded-md border border-slate-300 bg-white px-2">
        </label>

        <label class="grid gap-1">
          <span class="text-xs uppercase tracking-wide text-slate-500">maxDigits</span>
          <input v-model="maxDigitsInput" type="number" min="1" class="h-9 rounded-md border border-slate-300 bg-white px-2">
        </label>

        <label class="grid gap-1">
          <span class="text-xs uppercase tracking-wide text-slate-500">format</span>
          <select v-model="formatMode" class="h-9 rounded-md border border-slate-300 bg-white px-2">
            <option value="international">international</option>
            <option value="national">national</option>
            <option value="none">null</option>
          </select>
        </label>

        <label class="grid gap-1">
          <span class="text-xs uppercase tracking-wide text-slate-500">policy.formatting.displayFormat</span>
          <select v-model="policyFormat" class="h-9 rounded-md border border-slate-300 bg-white px-2">
            <option value="international">international</option>
            <option value="national">national</option>
          </select>
        </label>

        <label class="grid gap-1">
          <span class="text-xs uppercase tracking-wide text-slate-500">preferred-countries (csv)</span>
          <input v-model="preferredCountriesInput" type="text" class="h-9 rounded-md border border-slate-300 bg-white px-2">
        </label>

        <label class="grid gap-1">
          <span class="text-xs uppercase tracking-wide text-slate-500">only-countries (csv)</span>
          <input v-model="onlyCountriesInput" type="text" class="h-9 rounded-md border border-slate-300 bg-white px-2">
        </label>

        <label class="grid gap-1">
          <span class="text-xs uppercase tracking-wide text-slate-500">ignored-countries (csv)</span>
          <input v-model="ignoredCountriesInput" type="text" class="h-9 rounded-md border border-slate-300 bg-white px-2">
        </label>
      </div>

      <div class="mt-5 flex flex-wrap gap-2.5">
        <button
          type="button"
          class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-100"
          @click="focusInput"
        >
          focus()
        </button>

        <button
          type="button"
          class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-100"
          @click="blurInput"
        >
          blur()
        </button>

        <button
          type="button"
          class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-100"
          @click="focusInputAlias"
        >
          focusOnInput()
        </button>

        <button
          type="button"
          class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-100"
          @click="focusCountry"
        >
          focusOnCountry()
        </button>
      </div>

      <div class="mt-5 flex flex-wrap gap-2.5">
        <button
          v-for="preset in presets"
          :key="preset.label"
          type="button"
          class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-100"
          @click="applyPreset(preset.value)"
        >
          {{ preset.label }}
        </button>

        <button
          type="button"
          class="rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-100"
          @click="resetDemo"
        >
          Reset
        </button>
      </div>

      <div class="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
        <article class="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h2 class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
            Current value
          </h2>
          <pre class="mt-2 overflow-x-auto whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-slate-900">{{ phone || '—' }}</pre>
        </article>

        <article class="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h2 class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
            Selected countryCode
          </h2>
          <pre class="mt-2 overflow-x-auto whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-slate-900">{{ countryCode || '—' }}</pre>
        </article>

        <article class="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h2 class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
            Normalized E.164
          </h2>
          <pre class="mt-2 overflow-x-auto whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-slate-900">{{ normalizedE164 }}</pre>
        </article>

        <article class="rounded-xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
          <h2 class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
            Last metadata payload
          </h2>
          <pre class="mt-2 overflow-x-auto whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-slate-900">{{ meta ? JSON.stringify(meta, null, 2) : '—' }}</pre>
        </article>

        <article class="rounded-xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
          <h2 class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
            v-model emit log
          </h2>
          <pre class="mt-2 overflow-x-auto whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-slate-900">{{
            modelEmitLog.length ? modelEmitLog.join('\n') : '—'
          }}</pre>
        </article>

        <article class="rounded-xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
          <h2 class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
            country emit log
          </h2>
          <pre class="mt-2 overflow-x-auto whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-slate-900">{{
            countryEmitLog.length ? countryEmitLog.join('\n') : '—'
          }}</pre>
        </article>

        <article class="rounded-xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
          <h2 class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
            Effective playground config
          </h2>
          <pre class="mt-2 overflow-x-auto whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-slate-900">{{
            JSON.stringify({
              autoFormat,
              noFormattingAsYouType,
              fetchCountry,
              disabled,
              digitsOnly,
              plus,
              forcePlus,
              popoverFlags,
              noFlags,
              noAutocomplete,
              hint,
              locale,
              maxDigits,
              displayFormat,
              preferredCountries,
              onlyCountries,
              ignoredCountries,
              translations,
              policy,
            }, null, 2)
          }}</pre>
        </article>
      </div>
    </section>
  </main>
</template>
