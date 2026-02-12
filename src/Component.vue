<script lang="ts" setup>

import { ref, computed, HTMLAttributes } from 'vue';
import { useFocus } from '@vueuse/core';
import { ChevronsUpDown } from 'lucide-vue-next';
import { cn } from '@/shadcn/lib/utils';
import { Button } from '@/shadcn/components/ui/button';
import { Input } from '@/shadcn/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/shadcn/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/shadcn/components/ui/command';
import PhoneInput from 'vue-phone-input-base';
import Flag from './Flag.vue';


// Types

type Format = 'international' | 'national';

type Translations = {
  searchCountry?: string|null,
  noCountryFound?: string|null,
};


// Constants

const DEFAULT_EXCLUDE = [ 'AC' ];

const DEFAULT_FORMAT: Format = 'international';

const DEFAULT_TRANSLATIONS: Required<Translations> = {
  searchCountry: 'Search country...',
  noCountryFound: 'No country found.',
};


// Defining the emits

const emit = defineEmits<{
  (e: 'change', _val: string|null),
  (e: 'changeCountry', _val: string|null),
  (e: 'update:country', _val: string|null),
  (e: 'update:modelValue', _val: string|null),
}>();


// Defining the props

const props = defineProps<{
  class?: HTMLAttributes['class'] | null,

  country?: string|null,
  exclude?: string[] | null,

  hint?: string|null,
  format?: Format | null,
  modelValue?: string|null,
  translations?: Translations | null,

  disabled?: boolean|null,
  fetch?: boolean|null,
}>();


// Defining the variables

const inputEl = ref(null);
const { focused } = useFocus(inputEl);
const isPopoverShown = ref(false);


// Defining the computed

const val = computed<string|null>({
  get(): string|null {
    return props.modelValue ?? null;
  },
  set(_val: string|null): void {
    emit('change', _val);
    emit('update:modelValue', _val);
  },
});

const country = computed<string|null>({
  get(): string|null {
    return props.country ?? null;
  },
  set(_val: string|null): void {
    emit('changeCountry', _val);
    emit('update:country', _val);
  },
});

</script>

<template>
  <PhoneInput
      :class="cn([ 'phone_input_kz flex', props.class ])"
      :country-locale="country"
      :ignored-countries="exclude ?? DEFAULT_EXCLUDE"
      :phone-number-display-format="props.format ?? DEFAULT_FORMAT"
      :fetchCountry="!!props.fetch"
      :noUseBrowserLocale="!!props.fetch"
      :disabled="!!props.disabled"
      :data-disabled="Number(props.disabled)"
      v-model="val"
      auto-detect-country-from-prefix
  >
    <template #selector="{ inputValue, updateInputValue, countries }">
      <slot
          name="popover"
          :country="inputValue"
          :countries="countries"
          :setCountry="updateInputValue"
      >
        <Popover v-model:open="isPopoverShown">
          <PopoverTrigger>
            <Button
                variant="outline"
                class="flex gap-1 rounded-e-none rounded-s-lg px-3"
                :disabled="!!props.disabled"
            >
              <Flag :country="inputValue" />
              <ChevronsUpDown class="-mr-2 h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent class="w-86 p-0">
            <Command>
              <CommandInput
                  :placeholder="props.translations.searchCountry ?? DEFAULT_TRANSLATIONS.searchCountry"
                  :disabled="!!props.disabled"
              />

              <CommandEmpty>
                {{ props.translations.noCountryFound ?? DEFAULT_TRANSLATIONS.noCountryFound }}
              </CommandEmpty>

              <CommandList>
                <CommandGroup>
                  <CommandItem
                      v-for="country in countries"
                      :key="country.iso2"
                      :value="country.name"
                      class="gap-2"
                      :disabled="!!props.disabled"
                      @select="() => {
                        if (props.disabled) return;

                        updateInputValue(country?.iso2 || '--');

                        isPopoverShown = false;
                        focused = true;
                      }"
                  >
                    <Flag :country="country?.iso2" />

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
        </Popover>
      </slot>
    </template>

    <template #input="{ inputValue, updateInputValue, placeholder }">
      <slot
          :val="inputValue"
          :hint="props.hint ?? placeholder"
          :set="updateInputValue"
      >
        <Input
            class="rounded-e-lg rounded-s-none"
            type="text"
            :model-value="inputValue"
            :placeholder="props.hint ?? placeholder"
            :disabled="!!props.disabled"
            @input="updateInputValue"
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