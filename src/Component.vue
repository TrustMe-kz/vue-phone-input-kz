<script lang="ts" setup>

import { ref } from 'vue';
import { useFocus } from '@vueuse/core';
import { ChevronsUpDown } from 'lucide-vue-next';
import { Button } from '@/shadcn/components/ui/button';
import { Popover, PopoverTrigger } from '@/shadcn/components/ui/popover';
import { Command, CommandInput, CommandEmpty, CommandList, CommandGroup, CommandItem } from '@/shadcn/components/ui/command';
import PhoneInput from 'base-vue-phone-input';
import FlagComponent from './Flag.vue';

const inputEl = ref(null);
const { focused } = useFocus(inputEl);
const isPopoverShown = ref(false);

</script>

<template>
  <PhoneInput
      class="flex"
      country-locale="en-EN"
      :ignored-countries="['AC']"
      fetchCountry
      noUseBrowserLocale
  >
    <template #selector="{ inputValue, updateInputValue, countries }">
      <Popover v-model:open="isPopoverShown">
        <PopoverTrigger>
          <Button
              variant="outline"
              class="flex gap-1 rounded-e-none rounded-s-lg px-3"
          >
            <FlagComponent :country="inputValue" />
            <ChevronsUpDown class="-mr-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent class="w-5 p-0">
          <Command>
            <CommandInput placeholder="Search country..." />
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandList>
              <CommandGroup>
                <CommandItem
                    v-for="option in countries"
                    :key="option.iso2"
                    :value="option.name"
                    class="gap-2"
                    @select="() => {
                      updateInputValue(option.iso2);
                      isPopoverShown = false;
                      focused = true;
                    }"
                >
                  <FlagComponent :country="option?.iso2" />

                  <span class="flex-1 text-sm">
                    {{ option.name }}
                  </span>

                  <span class="text-foreground/50 text-sm">
                    {{ option.dialCode }}
                  </span>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
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