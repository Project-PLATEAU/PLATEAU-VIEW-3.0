type Callback<T> = (v: T) => void;

export class Event<T> {
  private _value: T | undefined;
  private _queue: Callback<T | undefined>[] = [];
  constructor(initialValue?: T) {
    this._value = initialValue;
  }

  get value() {
    return this._value;
  }

  set value(v: T | undefined) {
    this._value = v;
  }

  addEventListener(cb: Callback<T | undefined>) {
    this._queue.push(cb);
    return () => {
      const index = this._queue.indexOf(cb);
      if (index > -1) {
        this._queue.splice(index, 1);
      }
    };
  }

  dispatch(v?: T) {
    this._value = v ?? this._value;
    this._queue.forEach(cb => {
      cb(this.value);
    });
  }
}
