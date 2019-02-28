export type FuncType = (...args: any[]) => void;

export default function debounce(fn: FuncType, wait: number = 0, options: {leading: boolean, accumulate?: any} = {leading: true}) {
  let lastCallAt: number;
  let deferred: any;
  let timer: NodeJS.Timeout;
  let pendingArgs: any[] = [];
  return function debounced (...args: any[]) {
    const currentWait = wait;
    const currentTime = new Date().getTime();

    const isCold = !lastCallAt || (currentTime - lastCallAt) > currentWait;

    lastCallAt = currentTime;

    if (isCold && options.leading) {
      return options.accumulate ? fn.call(this, [args]).then((result: any) => result[0]) : fn.call(this, ...args);
    }

    if (deferred) {
      clearTimeout(timer);
    } else {
      deferred = defer();
    }

    pendingArgs.push(args);
    timer = setTimeout(flush.bind(this), currentWait);

    if (options.accumulate) {
      const argsIndex = pendingArgs.length - 1;
      return deferred.promise.then((results: any) => results[argsIndex]);
    }

    return deferred.promise;
  };

  function flush () {
    const thisDeferred: any = deferred;
    clearTimeout(timer);
    if (options.accumulate) {
      fn.call(this, pendingArgs)
        .then((res: any) => thisDeferred.resolve(res), (err: any) => thisDeferred.reject(err));
    } else {
      fn.apply(this, pendingArgs[pendingArgs.length - 1])
        .then((res: any) => thisDeferred.resolve(res), (err: any) => thisDeferred.reject(err));
    }

    pendingArgs = [];
    deferred = undefined;
  }
}

function defer () {
  const deferred: any = {};
  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });
  return deferred;
}