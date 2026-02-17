
// Types

export type PhoneInputMachineConfig = {
  maxDigits: number,
  digitsOnly: boolean,
  plus: boolean,
  autoFormat: boolean,
  noFormattingAsYouType: boolean,
};

export type PhoneInputInputSnapshot = {
  rawInput: string,
  normalizedInput: string,
  digits: string,
};

export type PhoneInputMachineState = PhoneInputInputSnapshot & {
  modelValue: string|null,
  country: string|null,
  ui: {
    isPopoverShown: boolean,
  },
  config: PhoneInputMachineConfig,
};

export type PhoneInputMachineEvent =
  | { type: 'EXTERNAL_MODEL_CHANGED', value: string|null }
  | { type: 'EXTERNAL_COUNTRY_CHANGED', value: string|null }
  | { type: 'BASE_MODEL_UPDATED', value: string|null }
  | { type: 'COUNTRY_SELECTED', value: string|null }
  | { type: 'USER_TYPED', rawInput: string }
  | { type: 'SYNC_CONFIG', config: PhoneInputMachineConfig }
  | { type: 'POPOVER_VISIBILITY_CHANGED', value: boolean };


// Defining the functions

function getDigits(_rawInput: string): string {
  return _rawInput.replace(/\D+/g, '');
}

function resolvePlusUsage(_rawInput: string, _config: PhoneInputMachineConfig): boolean {
  if (_config.plus) return true;

  return /^\s*\+/.test(_rawInput);
}

export function getPhoneInputSnapshot( _rawInput: string, _config: PhoneInputMachineConfig ): PhoneInputInputSnapshot {
  const digits = getDigits(_rawInput).slice(0, Math.max(1, _config.maxDigits));
  const shouldUsePlus = resolvePlusUsage(_rawInput, _config);

  if (!digits.length) {
    return {
      rawInput: _rawInput,
      digits,
      normalizedInput: shouldUsePlus ? '+' : '',
    };
  }

  return {
    rawInput: _rawInput,
    digits,
    normalizedInput: shouldUsePlus ? `+${digits}` : digits,
  };
}

export function createPhoneInputMachineState(_data: { modelValue: string|null, country: string|null, config: PhoneInputMachineConfig }): PhoneInputMachineState {
  const snapshot = getPhoneInputSnapshot(_data?.modelValue ?? '', _data?.config);

  return {
    ...snapshot,

    modelValue: _data?.modelValue,
    country: _data?.country,
    config: _data?.config,
    ui: {
      isPopoverShown: false,
    },
  };
}

export function reducePhoneInputMachineState(_state: PhoneInputMachineState, _event: PhoneInputMachineEvent): PhoneInputMachineState {
  if (_event?.type === 'SYNC_CONFIG') {
    const baseValue = _state?.rawInput || _state?.modelValue || '';
    const snapshot = getPhoneInputSnapshot(baseValue, _event?.config);

    return { ..._state, ...snapshot, config: _event?.config };
  }

  if (_event?.type === 'USER_TYPED') {
    const snapshot = getPhoneInputSnapshot(_event?.rawInput, _state?.config);
    return { ..._state, ...snapshot };
  }

  if (_event?.type === 'BASE_MODEL_UPDATED') {
    const nextValue = _event?.value ?? null;
    const snapshot = getPhoneInputSnapshot(nextValue ?? '', _state?.config);

    return { ..._state, ...snapshot, modelValue: nextValue };
  }

  if (_event?.type === 'EXTERNAL_MODEL_CHANGED') {
    const nextValue = _event?.value ?? null;
    const snapshot = getPhoneInputSnapshot(nextValue ?? '', _state?.config);

    return { ..._state, ...snapshot, modelValue: nextValue };
  }

  if (_event?.type === 'COUNTRY_SELECTED') {
    return { ..._state, country: _event?.value ?? null };
  }

  if (_event?.type === 'EXTERNAL_COUNTRY_CHANGED') {
    return { ..._state, country: _event?.value ?? null };
  }

  if (_event?.type === 'POPOVER_VISIBILITY_CHANGED') {
    return {
      ..._state,
      ui: { ..._state?.ui, isPopoverShown: _event?.value },
    };
  }

  return _state;
}
