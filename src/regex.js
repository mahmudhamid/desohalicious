import XRegExp from 'xregexp';

export const intTextOnlyNoSpaces = (value) => !value || XRegExp('^\\pL+$').test(value);
export const intTextOnly = (value) => !value || XRegExp('^[\\pL\\s]+$').test(value);
export const intTextOrNumbersNoSpaces = (value) => !value || XRegExp('^[\\pL\\pN]+$').test(value);

//Native JS Regex
export const rETextOnlyWithSpaces = /^[A-Za-z\s]+$/;
export const rETextNumbersWithSpaces = /^[A-Za-z\s\d\'\,\.\-_\&]+$/;
export const rPassword = /^(?=.*[a-z])(?=.*[0-9]).+$/;
export const rNoSpaces = /^(\S)+$/;