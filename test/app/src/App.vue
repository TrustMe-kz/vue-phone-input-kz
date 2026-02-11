<script setup lang="ts">
import { computed, ref } from 'vue';
import PhoneInputKz from '@phone-input-kz/index.es';

// Variables
const phone = ref('');
const countryCode = ref<string | null>(null);
const autoFormat = ref(true);
const noFormattingAsYouType = ref(false);
const meta = ref<Record<string, unknown> | null>(null);

// Constants
const presets = [
  { label: 'KZ mobile (8...)', value: '87761234567' },
  { label: 'KZ mobile (7...)', value: '77761234567' },
  { label: 'KZ mobile (+7...)', value: '+77761234567' },
  { label: 'Noisy invalid input', value: 'abc!!!' },
] as const;

// Defining the functions
function applyPreset(value: string): void {
  phone.value = value;
}

function resetDemo(): void {
  phone.value = '';
  countryCode.value = null;
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
  <main class="demo-root">
    <section class="demo-card">
      <h1>vue-phone-input-kz test app</h1>
      <p class="subtitle">
        Validation of v-model, metadata events, and KZ behavior for the ambiguous +7 prefix.
      </p>

      <div class="input-block">
        <label for="phone-input">Phone</label>

        <PhoneInputKz
          id="phone-input"
          v-model="phone"
          v-model:country-code="countryCode"
          :auto-format="autoFormat"
          :no-formatting-as-you-type="noFormattingAsYouType"
          @update="updateMeta"
          @data="updateMeta"
          @country-code="updateCountryCode"
        />
      </div>

      <div class="controls">
        <label class="control-row">
          <input v-model="autoFormat" type="checkbox">
          autoFormat
        </label>

        <label class="control-row">
          <input v-model="noFormattingAsYouType" type="checkbox">
          noFormattingAsYouType
        </label>
      </div>

      <div class="presets">
        <button
          v-for="preset in presets"
          :key="preset.label"
          type="button"
          @click="applyPreset(preset.value)"
        >
          {{ preset.label }}
        </button>

        <button type="button" class="reset" @click="resetDemo">
          Reset
        </button>
      </div>

      <div class="state-grid">
        <article>
          <h2>Current value</h2>
          <pre>{{ phone || '—' }}</pre>
        </article>

        <article>
          <h2>Selected countryCode</h2>
          <pre>{{ countryCode || '—' }}</pre>
        </article>

        <article>
          <h2>Normalized E.164</h2>
          <pre>{{ normalizedE164 }}</pre>
        </article>

        <article class="meta-block">
          <h2>Last metadata payload</h2>
          <pre>{{ meta ? JSON.stringify(meta, null, 2) : '—' }}</pre>
        </article>
      </div>
    </section>
  </main>
</template>
