<script lang="ts" setup>

import { ref, computed, HTMLAttributes } from 'vue';
import { useFocus } from '@vueuse/core';
import { ChevronsUpDown } from 'lucide-vue-next';
import { cn } from '@/shadcn/lib/utils';
import { Button } from '@/shadcn/components/ui/button';
import { Input } from '@/shadcn/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/shadcn/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/shadcn/components/ui/command';
import PhoneInput from 'base-vue-phone-input';
import Flag from './Flag.vue';


// Constants

const DEFAULT_EXCLUDE = [ 'AC' ];


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
  modelValue?: string|null,

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
      :fetchCountry="!!props.fetch"
      :noUseBrowserLocale="!!props.fetch"
      v-model="val"
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
            >
              <Flag :country="inputValue" />
              <ChevronsUpDown class="-mr-2 h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent class="w-86 p-0">
            <Command>
              <CommandInput placeholder="Search country..." />
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandList>
                <CommandGroup>
                  <CommandItem
                      v-for="country in countries"
                      :key="country.iso2"
                      :value="country.name"
                      class="gap-2"
                      @select="() => {
                      updateInputValue(country.iso2);
                      isPopoverShown = false;
                      focused = true;
                    }"
                  >
                    <Flag :country="country?.iso2" />

                    <span class="flex-1 text-sm">
                    {{ country.name }}
                  </span>

                    <span class="text-foreground/50 text-sm">
                    {{ country.dialCode }}
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
      <Input
          class="rounded-e-lg rounded-s-none"
          type="text"
          :model-value="inputValue"
          :placeholder="placeholder"
          @input="updateInputValue"
          ref="inputEl"
      />
    </template>
  </PhoneInput>
</template>