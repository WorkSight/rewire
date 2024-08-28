import { customAlphabet } from 'nanoid';

const guidAlphabet  = '0123456789abcdef';
const guidLength    = 32;
const guidGenerator = customAlphabet(guidAlphabet, guidLength);

export default function guid(): string {
  return guidGenerator().replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/g, `$1-$2-$3-$4-$5`);
}