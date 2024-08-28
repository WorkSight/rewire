// element to scroll, x-axis position to scroll to, y-axis position to scroll to, time in ms to animate, step in ms
export function scrollToSmooth(element: HTMLElement, scrollLeft: number, scrollTop: number, duration: number, step: number = 10) {
    if (!element || scrollLeft < 0 || scrollTop < 0 || duration <= 0 || step <= 0) return;
    const numOfScrolls  = duration / step;
    const currLeft      = element.scrollLeft;
    const currTop       = element.scrollTop;
    const leftRemaining = currLeft - scrollLeft;
    const topRemaining  = currTop - scrollTop;

    if (leftRemaining === 0 && topRemaining === 0) return;

    const leftIncr = leftRemaining / numOfScrolls;
    const topIncr  = topRemaining / numOfScrolls;

    let i = 1;
    const interval = setInterval(() => {
      const newScrollLeft  = i === numOfScrolls ? scrollLeft : element.scrollLeft + leftIncr;
      const newScrollTop   = i === numOfScrolls ? scrollTop : element.scrollTop + topIncr;
      element.scrollLeft = leftIncr > 0 ? Math.max(newScrollLeft, scrollLeft) : Math.min(newScrollLeft, scrollLeft);
      element.scrollTop  = topIncr > 0 ? Math.max(newScrollTop, scrollTop) : Math.min(newScrollTop, scrollTop);
      if (i === numOfScrolls) {
        clearInterval(interval);
      }
      i++;
    }, step);
}

// element to scroll, x-axis amount to scroll by, y-axis amount to scroll by, time in ms to animate, step in ms
export function scrollBySmooth(element: HTMLElement, x: number, y: number, duration: number, step: number = 10) {
  if (!element || duration <= 0 || step <= 0 || (x === 0 && y === 0)) return;
  const numOfScrolls  = duration / step;
  const endScrollLeft = element.scrollLeft + x;
  const endScrollTop  = element.scrollTop + y;
  const xIncr         = x / numOfScrolls;
  const yIncr         = y / numOfScrolls;

  let i = 1;
  const interval = setInterval(() => {
    const newScrollLeft  = i === numOfScrolls ? endScrollLeft : element.scrollLeft + xIncr;
    const newScrollTop   = i === numOfScrolls ? endScrollTop : element.scrollTop + yIncr;
    element.scrollLeft = xIncr > 0 ? Math.min(newScrollLeft, endScrollLeft) : Math.max(newScrollLeft, endScrollLeft);
    element.scrollTop  = yIncr > 0 ? Math.min(newScrollTop, endScrollTop) : Math.max(newScrollTop, endScrollTop);
    if (i === numOfScrolls) {
      clearInterval(interval);
    }
    i++;
  }, step);
}