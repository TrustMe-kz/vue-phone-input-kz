
// Types

export type PhoneDisplayFormat = 'international' | 'national';

export type PhoneInputPolicy = {
  input: {
    maxDigits: number,
    digitsOnly: boolean,
    plus: boolean,
  },
  formatting: {
    displayFormat: PhoneDisplayFormat,
    autoFormat: boolean,
    noFormattingAsYouType: boolean,
  },
  country: {
    fetchCountry: boolean,
    autoDetectCountryFromPrefix: boolean,
    autoDetectCountryLocalTrunkPrefix: string,
    autoDetectCountryLocalCallingCodes: string[],
  },
  ui: {
    showFlagsInPopover: boolean,
  },
};

export type PartialPhoneInputPolicy = {
  input?: Partial<PhoneInputPolicy['input']>,
  formatting?: Partial<PhoneInputPolicy['formatting']>,
  country?: Partial<PhoneInputPolicy['country']>,
  ui?: Partial<PhoneInputPolicy['ui']>,
};

export type ResolvePhoneInputPolicyInput = {
  attrs: Record<string, unknown>,
  policy?: PartialPhoneInputPolicy | null,
  legacy: {
    maxDigits?: number | null,
    digitsOnly?: boolean | null,
    plus?: boolean | null,
    enforceLeadingPlus?: boolean | null,
    format?: PhoneDisplayFormat | null,
    fetch?: boolean | null,
    noFlags?: boolean | null,
    showFlagsInPopover?: boolean | null,
  },
};


// Constants

export const DEFAULT_PHONE_INPUT_POLICY: PhoneInputPolicy = {
  input: {
    maxDigits: 15,
    digitsOnly: true,
    plus: true,
  },
  formatting: {
    displayFormat: 'international',
    autoFormat: true,
    noFormattingAsYouType: false,
  },
  country: {
    fetchCountry: false,
    autoDetectCountryFromPrefix: true,
    autoDetectCountryLocalTrunkPrefix: '8',
    autoDetectCountryLocalCallingCodes: [ '7' ],
  },
  ui: {
    showFlagsInPopover: true,
  },
};


// Functions

function parseBoolean(_value: unknown, _defaultValue: boolean): boolean {
  if (_value === undefined || _value === null) return _defaultValue;
  if (_value === '') return true;
  if (_value === true || _value === false) return _value;

  if (typeof _value === 'string') {
    const normalized = _value.trim().toLowerCase();
    return normalized === 'true';
  }

  return Boolean(_value);
}

function parseDisplayFormat(_value: unknown, _defaultValue: PhoneDisplayFormat): PhoneDisplayFormat {
  if (_value === 'national' || _value === 'international') return _value;
  return _defaultValue;
}

function parseStringArray(_value: unknown, _defaultValue: string[]): string[] {
  if (Array.isArray(_value)) {
    const values = _value.filter((item): item is string => typeof item === 'string' && !!item.trim());
    return values.length ? values : _defaultValue;
  }

  if (typeof _value === 'string') {
    const values = _value.split(',').map(item => item.trim()).filter(Boolean);
    return values.length ? values : _defaultValue;
  }

  return _defaultValue;
}

export function resolvePhoneInputPolicy(_input: ResolvePhoneInputPolicyInput): PhoneInputPolicy {
  const attrs = _input?.attrs;
  const externalPolicy = _input?.policy ?? {};

  const autoFormatAttr = attrs['auto-format'] ?? attrs.autoFormat;
  const noFormattingAttr = attrs['no-formatting-as-you-type'] ?? attrs.noFormattingAsYouType;
  const autoDetectCountryFromPrefixAttr = attrs['auto-detect-country-from-prefix'] ?? attrs.autoDetectCountryFromPrefix;
  const autoDetectCountryLocalTrunkPrefixAttr = attrs['auto-detect-country-local-trunk-prefix'] ?? attrs.autoDetectCountryLocalTrunkPrefix;
  const autoDetectCountryLocalCallingCodesAttr = attrs['auto-detect-country-local-calling-codes'] ?? attrs.autoDetectCountryLocalCallingCodes;

  const legacyPlus = _input?.legacy?.plus ?? _input?.legacy?.enforceLeadingPlus;

  const resolvedShowFlagsInPopover = _input?.legacy?.noFlags != null
    ? !_input?.legacy?.noFlags
    : _input?.legacy?.showFlagsInPopover;

  return {
    input: {
      maxDigits: Math.max(
        1,
        Number(
          _input?.legacy?.maxDigits
            ?? externalPolicy.input?.maxDigits
            ?? DEFAULT_PHONE_INPUT_POLICY.input.maxDigits,
        ),
      ),
      digitsOnly: _input?.legacy?.digitsOnly
        ?? externalPolicy.input?.digitsOnly
        ?? DEFAULT_PHONE_INPUT_POLICY.input.digitsOnly,
      plus: legacyPlus
        ?? externalPolicy.input?.plus
        ?? DEFAULT_PHONE_INPUT_POLICY.input.plus,
    },
    formatting: {
      displayFormat: parseDisplayFormat(
        _input?.legacy?.format
          ?? externalPolicy.formatting?.displayFormat
          ?? DEFAULT_PHONE_INPUT_POLICY.formatting.displayFormat,
        DEFAULT_PHONE_INPUT_POLICY.formatting.displayFormat,
      ),
      autoFormat: parseBoolean(
        autoFormatAttr
        ?? externalPolicy.formatting?.autoFormat,
        DEFAULT_PHONE_INPUT_POLICY.formatting.autoFormat,
      ),
      noFormattingAsYouType: parseBoolean(
        noFormattingAttr
        ?? externalPolicy.formatting?.noFormattingAsYouType,
        DEFAULT_PHONE_INPUT_POLICY.formatting.noFormattingAsYouType,
      ),
    },
    country: {
      fetchCountry: _input?.legacy?.fetch
        ?? externalPolicy.country?.fetchCountry
        ?? DEFAULT_PHONE_INPUT_POLICY.country.fetchCountry,
      autoDetectCountryFromPrefix: parseBoolean(
        autoDetectCountryFromPrefixAttr
        ?? externalPolicy.country?.autoDetectCountryFromPrefix,
        DEFAULT_PHONE_INPUT_POLICY.country.autoDetectCountryFromPrefix,
      ),
      autoDetectCountryLocalTrunkPrefix: String(
        autoDetectCountryLocalTrunkPrefixAttr
        ?? externalPolicy.country?.autoDetectCountryLocalTrunkPrefix
        ?? DEFAULT_PHONE_INPUT_POLICY.country.autoDetectCountryLocalTrunkPrefix,
      ),
      autoDetectCountryLocalCallingCodes: parseStringArray(
        autoDetectCountryLocalCallingCodesAttr
        ?? externalPolicy.country?.autoDetectCountryLocalCallingCodes,
        DEFAULT_PHONE_INPUT_POLICY.country.autoDetectCountryLocalCallingCodes,
      ),
    },
    ui: {
      showFlagsInPopover: resolvedShowFlagsInPopover
        ?? externalPolicy.ui?.showFlagsInPopover
        ?? DEFAULT_PHONE_INPUT_POLICY.ui.showFlagsInPopover,
    },
  };
}
