<script lang="ts" setup>

import { ref, computed, HTMLAttributes, useAttrs, watch } from 'vue';
import { useFocus } from '@vueuse/core';
import { ChevronsUpDown } from 'lucide-vue-next';
import { cn } from '@/shadcn/lib/utils';
import { createPhoneInputMachineState, reducePhoneInputMachineState, PhoneInputMachineEvent } from './state';
import { createBasePhoneInputUpdatePayload, pushCountryUpdateToBase, pushPhoneUpdateToBase, resolveMachineConfigFromPolicy, BasePhoneInputUpdateHandler } from './adapter';
import { resolvePhoneInputPolicy, PartialPhoneInputPolicy, PhoneDisplayFormat } from './policies';
import { Button } from '@/shadcn/components/ui/button';
import { Input } from '@/shadcn/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/shadcn/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/shadcn/components/ui/command';
import PhoneInput from 'vue-phone-input-base';
import Flag from './Flag.vue';


// Types

type Format = PhoneDisplayFormat;

type Translations = {
  searchCountry?: string|null,
  noCountryFound?: string|null,
};


// Constants

const DEFAULT_EXCLUDE = [ 'AC' ];

const DEFAULT_TRANSLATIONS: Required<Translations> = {
  searchCountry: 'Search country...',
  noCountryFound: 'No country found.',
};


// Defining the emits

const emit = defineEmits<{
  (_e: 'change', _val: string|null): void,
  (_e: 'changeCountry', _val: string|null): void,
  (_e: 'update:country', _val: string|null): void,
  (_e: 'update:modelValue', _val: string|null): void,
}>();


// Defining the props

const props = defineProps<{
  class?: HTMLAttributes['class'] | null,

  hint?: string|null,
  maxDigits?: number | null,
  format?: Format | null,
  modelValue?: string|null,

  country?: string|null,
  exclude?: string[] | null,
  locale?: string|null,
  translations?: Translations | null,
  policy?: PartialPhoneInputPolicy | null,

  disabled?: boolean | null,
  fetch?: boolean | null,
  plus?: boolean | null,
  forcePlus?: boolean | null,
  digitsOnly?: boolean | null,
  popoverFlags?: boolean | null,
  noFlags?: boolean | null,
}>();


// Defining the variables

const attrs = useAttrs();

const inputEl = ref(null);

const { focused } = useFocus(inputEl);


// Defining the functions

function getRawInputValue(_val: Event | string): string {
  if (typeof _val === 'string') return _val;

  const target = _val?.target as HTMLInputElement | null;
  return target?.value ?? '';
}

function resolvePolicy() {
  return resolvePhoneInputPolicy({
    attrs,
    policy: props.policy,
    legacy: {
      maxDigits: props.maxDigits,
      digitsOnly: props.digitsOnly,
      plus: props.plus,
      enforceLeadingPlus: props.forcePlus,
      format: props.format,
      fetch: props.fetch,
      noFlags: props.noFlags,
      showFlagsInPopover: props.popoverFlags,
    },
  });
}


// Main flow

const resolvedPolicy = computed(() => {
  return resolvePolicy();
});

const machineConfig = computed(() => {
  return resolveMachineConfigFromPolicy(resolvedPolicy.value);
});

const state = ref(
  createPhoneInputMachineState({
    modelValue: props.modelValue ?? null,
    country: props.country ?? null,
    config: machineConfig.value,
  }),
);

function dispatch(_event: PhoneInputMachineEvent): void {
  state.value = reducePhoneInputMachineState(state.value, _event);
}

watch(
  () => props.modelValue,
  (_val) => {
    dispatch({ type: 'EXTERNAL_MODEL_CHANGED', value: _val ?? null });
  },
);

watch(
  () => props.country,
  (_val) => {
    dispatch({ type: 'EXTERNAL_COUNTRY_CHANGED', value: _val ?? null });
  },
);

watch(
  resolvedPolicy,
  () => {
    dispatch({ type: 'SYNC_CONFIG', config: machineConfig.value });
  },
  { deep: true },
);

const val = computed<string|null>({
  get(): string|null {
    return state.value.modelValue;
  },
  set(_val: string|null): void {
    dispatch({ type: 'BASE_MODEL_UPDATED', value: _val ?? null });

    emit('change', _val ?? null);
    emit('update:modelValue', _val ?? null);
  },
});

const country = computed<string|null>({
  get(): string|null {
    return state.value.country;
  },
  set(_val: string|null): void {
    dispatch({ type: 'COUNTRY_SELECTED', value: _val ?? null });

    emit('changeCountry', _val ?? null);
    emit('update:country', _val ?? null);
  },
});

const isPopoverShown = computed<boolean>({
  get(): boolean {
    return state.value.ui.isPopoverShown;
  },
  set(_val: boolean): void {
    dispatch({ type: 'POPOVER_VISIBILITY_CHANGED', value: _val });
  },
});

const hasNoFlags = computed<boolean>(() => {
  return !resolvedPolicy.value.ui.showFlagsInPopover;
});

function updatePhoneInput(_updateInputValue: BasePhoneInputUpdateHandler, _eventOrValue: Event | string): void {
  const rawInput = getRawInputValue(_eventOrValue);

  dispatch({ type: 'USER_TYPED', rawInput });

  const payload = createBasePhoneInputUpdatePayload({
    normalizedInput: state.value.normalizedInput,
    config: state.value.config,
  });

  pushPhoneUpdateToBase(_updateInputValue, payload);
}

function selectCountry(_updateInputValue: (_val: string) => void, _countryCode: string|null): void {
  if (props.disabled) return;

  const nextCountry = _countryCode ?? null;

  dispatch({ type: 'COUNTRY_SELECTED', value: nextCountry });
  pushCountryUpdateToBase(_updateInputValue, nextCountry);

  isPopoverShown.value = false;
  focused.value = true;
}

</script>

<template>
  <PhoneInput
      :class="cn([ 'phone_input_kz flex', props.class ])"
      :country-code="country"
      :ignored-countries="exclude ?? DEFAULT_EXCLUDE"
      :phone-number-display-format="resolvedPolicy.formatting.displayFormat"
      :country-locale="props.locale"
      :fetch-country="resolvedPolicy.country.fetchCountry"
      :no-use-browser-locale="resolvedPolicy.country.fetchCountry"
      :auto-detect-country-from-prefix="resolvedPolicy.country.autoDetectCountryFromPrefix"
      :auto-detect-country-local-trunk-prefix="resolvedPolicy.country.autoDetectCountryLocalTrunkPrefix"
      :auto-detect-country-local-calling-codes="resolvedPolicy.country.autoDetectCountryLocalCallingCodes"
      :disabled="!!props.disabled"
      :data-disabled="Number(props.disabled)"
      v-model="val"
  >
    <template #selector="{ inputValue, updateInputValue, countries }">
      <slot name="countrySelect">
        <Popover v-model:open="isPopoverShown">
          <PopoverTrigger as-child>
            <Button
                variant="outline"
                class="flex gap-1 rounded-e-none rounded-s-lg px-3"
                :disabled="!!props.disabled"
            >
              <Flag :country="inputValue" />
              <ChevronsUpDown class="-mr-2 h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>

          <slot
              name="popover"
              :country="inputValue"
              :countries="countries"
              :setCountry="updateInputValue"
          >
            <PopoverContent class="phone_input_kz_popover w-86 p-0 bg-white">
              <Command>
                <CommandInput
                    :placeholder="props.translations?.searchCountry ?? DEFAULT_TRANSLATIONS.searchCountry"
                    :disabled="!!props.disabled"
                />

                <CommandEmpty>
                  {{ props.translations?.noCountryFound ?? DEFAULT_TRANSLATIONS.noCountryFound }}
                </CommandEmpty>

                <CommandList>
                  <CommandGroup>
                    <CommandItem
                        v-for="country in countries"
                        :key="country.iso2"
                        :value="country.name"
                        :class="hasNoFlags ? 'gap-1' : 'gap-2'"
                        :disabled="!!props.disabled"
                        @select="() => selectCountry(updateInputValue, country?.iso2 || null)"
                    >
                      <Flag
                          v-if="!hasNoFlags"
                          :country="country?.iso2"
                      />

                      <span class="flex-1 text-sm">
                        {{ country?.name ?? 'Unknown Country' }}
                      </span>

                      <span class="text-foreground/50 text-sm">
                        {{ country?.dialCode || '' }}
                      </span>
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </slot>
        </Popover>
      </slot>
    </template>

    <template #input="{ inputValue, updateInputValue, placeholder }">
      <slot
          name="input"
          :val="inputValue"
          :hint="props.hint ?? placeholder"
          :set="_val => updatePhoneInput(updateInputValue, _val)"
      >
        <Input
            class="rounded-e-lg rounded-s-none"
            type="text"
            :model-value="inputValue"
            :placeholder="props.hint ?? placeholder"
            :disabled="!!props.disabled"
            inputmode="numeric"
            @input="event => updatePhoneInput(updateInputValue, event)"
            ref="inputEl"
        />
      </slot>
    </template>
  </PhoneInput>
</template>

<style scoped>

.phone_input_kz {
  &[data-disabled="1"] {
    opacity: 0.75;
  }
}

</style>
