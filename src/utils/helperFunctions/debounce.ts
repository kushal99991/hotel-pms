type Procedure<T extends unknown[]> = (...args: T) => void;

const debounce = <F extends Procedure<Parameters<F>>>(
  func: F,
  wait: number
) => {
  let timeout: NodeJS.Timeout;
  return function (this: ThisParameterType<F>, ...args: Parameters<F>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

export default debounce;
