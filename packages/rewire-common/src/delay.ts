export default function delay(value: number) {
  return new Promise((resolve, _reject) => {
    setTimeout(resolve, value);
  });
}
