import * as generate from 'nanoid/generate';

const guidAlphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const guidLength   = 32;

export default function guid(): string {
  const guid = generate(guidAlphabet, guidLength);
  return guid.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/g, `$1-$2-$3-$4-$5`);
}