<script setup lang="ts">

import { computed, ref } from 'vue';
import PhoneInputKz from '@phone-input-kz/index.ts';


// Variables

const phone = ref('');
const countryCode = ref<string | null>('KZ');
const autoFormat = ref(true);
const noFormattingAsYouType = ref(false);
const meta = ref<Record<string, unknown> | null>(null);


// Constants

const presets = [
  { label: 'KZ mobile (8...)', value: '87761234567' },
  { label: 'KZ mobile (7...)', value: '77761234567' },
  { label: 'KZ mobile (+7...)', value: '+77761234567' },
  { label: 'Switch country demo', value: '+77767211181' },
  { label: 'Noisy invalid input', value: 'abc!!!' },
];


// Defining the functions

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

const normalizedE164 = computed(() => {
  const value = meta.value?.e164;

  return typeof value === 'string' ? value : '—';
});

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
          v-model="phone"
          v-model:country="countryCode"
          locale="ru-RU"
          :auto-format="autoFormat"
          :no-formatting-as-you-type="noFormattingAsYouType"
          @update="updateMeta"
          @data="updateMeta"
          @country-code="updateCountryCode"
        />
      </div>

      <div class="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-700">
        <label class="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-slate-50 px-3 py-2">
          <input v-model="autoFormat" type="checkbox" class="size-4 rounded border-slate-300 text-slate-900">
          autoFormat
        </label>

        <label class="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-slate-50 px-3 py-2">
          <input v-model="noFormattingAsYouType" type="checkbox" class="size-4 rounded border-slate-300 text-slate-900">
          noFormattingAsYouType
        </label>
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
      </div>
    </section>
  </main>
</template>
