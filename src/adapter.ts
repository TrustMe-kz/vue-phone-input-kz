import { PhoneInputMachineConfig } from './state';
import { PhoneInputPolicy } from './policies';


// Types

export type BasePhoneInputUpdatePayload = {
  newPhoneNumber: string,
  autoFormat: boolean,
  noFormattingAsYouType: boolean,
  updateResults: boolean,
};

export type BasePhoneInputUpdateValue = Event | BasePhoneInputUpdatePayload;

export type BasePhoneInputUpdateHandler = (_value: BasePhoneInputUpdateValue) => void;

export type BaseCountryUpdateHandler = (_value: string) => void;


// Constants

export const DEFAULT_COUNTRY_CODE = '--';


// Functions

export function resolveMachineConfigFromPolicy(_policy: PhoneInputPolicy): PhoneInputMachineConfig {
  return {
    maxDigits: _policy?.input?.maxDigits,
    digitsOnly: _policy?.input?.digitsOnly,
    plus: _policy?.input?.plus,
    autoFormat: _policy?.formatting?.autoFormat,
    noFormattingAsYouType: _policy?.formatting?.noFormattingAsYouType,
  };
}

export function createBasePhoneInputUpdatePayload(_data: { normalizedInput: string, config: PhoneInputMachineConfig }): BasePhoneInputUpdatePayload {
  return {
    newPhoneNumber: _data?.normalizedInput,
    autoFormat: _data?.config?.autoFormat,
    noFormattingAsYouType: _data?.config?.noFormattingAsYouType,
    updateResults: true,
  };
}

export function pushPhoneUpdateToBase(_updateInputValue: BasePhoneInputUpdateHandler, _payload: BasePhoneInputUpdatePayload): void {
  _updateInputValue(_payload);
}

export function resolveCountryValueForBase(_countryCode: string|null): string {
  return _countryCode || DEFAULT_COUNTRY_CODE;
}

export function pushCountryUpdateToBase(_updateInputValue: BaseCountryUpdateHandler, _countryCode: string|null): void {
  _updateInputValue(resolveCountryValueForBase(_countryCode));
}
