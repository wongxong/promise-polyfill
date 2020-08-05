
const STATE = {
  0: 'pending',
  1: 'fulfilled',
  2: 'rejected'
};

function isFunction(fn) {
  return typeof fn === 'function';
}

function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

function noop() {}


class MyPromise {
  static resolve(value) {
    return new MyPromise((resolve, reject) => {
      return resolve(value);
    });
  }

  static reject(reason) {
    return new MyPromise((resolve, reject) => {
      return reject(reason);
    });
  }

  static all(promises) {
    const array = new Array(promises.length);
    let resolvedCount = 0;

    return new Promise((resolve, reject) => {
      try {
        promises.forEach((p, index) => {
          p.then(val => {
            resolvedCount += 1;
            array[index] = val;

            if(promises.length <= resolvedCount) {
              resolve(array);
            }
          }).catch(reason => {
            reject(reason);
          });
        });
      } catch(err) {
        reject(err);
      }
    });
  }

  static allSettled(promises) {
    const array = new Array(promises.length);
    let resolvedCount = 0;

    return new Promise((resolve, reject) => {
      try {
        promises.forEach((p, index) => {
          const cb = (val, status) => {
            resolvedCount += 1;
            const k = status === 'fulfilled' ? 'value' : 'reason';
            array[index] = {
              status,
              [k]: val
            };

            if(promises.length <= resolvedCount) {
              resolve(array);
            }
          };
          p.then(val => {
            cb(val, 'fulfilled');
          })
          .catch(reason => {
            cb(reason, 'rejected');
          });
        });
      } catch(err) {
        reject(err);
      }
    });
  }

  static race(promises) {
    return new MyPromise((resolve, reject) => {
      promises.forEach(p => {
        p.then(resolve)
        .catch(reject);
      });
    });
  }

  static any(promises) {
    return new MyPromise((resolve, reject) => {
      let count = 0;
      let errorArray = new Array(promises.length);

      promises.forEach((p, index) => {
        p.then(resolve)
        .catch(err => {
          count += 1;
          errorArray[index] = err;

          if(count >= promises.length) {
            reject(errorArray);
          }
        });
      });
    });
  }

  constructor(resolver) {
    if(!isFunction(resolver)) {
      throw new TypeError('resolver should be a function');
    }

    this._status = STATE['0'];
    this._value = undefined;
    this._callbacks = [];

    // 安全执行 resolver
    doFunc(this, resolver);
  }

  then(onFulfilled, onRejected) {
    const p = new MyPromise(noop);
    const handler = {
      p,
      x: this,
      onFulfilled,
      onRejected
    };

    if(this._status === STATE['0']) {
      this._callbacks.push(handler);
    } else {
      doHandler(handler);
    }

    return p;
  }

  catch(onRejected) {
    return this.then(undefined, onRejected);
  }

  resolve(value) {
    if(this._status !== STATE['0']) return;

    if(this === value) {
      return this.reject(new TypeError('Chaining cycle detected for promise'));
    }

    if(value !== null && (isFunction(value) || isObject(value))) {
      // 可能是个对象或是函数
      try {
        const then = value.then;

        if(isFunction(then)) {
          // 如果 value.then 是函数，执行 value.then 
          return doFunc(this, then.bind(value));
        }
      } catch(err) {
        return this.reject(err);
      }
    }

    this._status = STATE['1'];
    this._value = value;
    this._callbacks.forEach(handler => {
      doHandler(handler);
    });
  }

  reject(reason) {
    if(this._status !== STATE['0']) return;
    this._status = STATE['2'];
    this._value = reason;
    this._callbacks.forEach(handler => {
      doHandler(handler);
    });
  }
}

function doFunc(ctx, fn) {
  let called = false;

  try {
    fn(
      v => {
        if(called) return;
        called = true;
        ctx.resolve(v);
      },
      r => {
        if(called) return;
        called = true;
        ctx.reject(r);
      }
    );
  } catch(err) {
    if(called) return;
    called = true;
    ctx.reject(err);
  }
}

function doHandler({ p, x, onFulfilled, onRejected }) {
  setTimeout(() => {
    const { _status, _value } = x;
    const fn = _status === STATE['1'] ? onFulfilled : onRejected;

    if(isFunction(fn)) {
      try {
        p.resolve(fn(_value));
      } catch(err) {
        p.reject(err);
      }
    } else {
      _status === STATE['1'] ? p.resolve(_value) : p.reject(_value);
    }
  });
}

module.exports = MyPromise;