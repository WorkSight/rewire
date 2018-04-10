export default function delay(value: number) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, value);
  });
}
