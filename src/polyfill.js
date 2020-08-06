
// promise 三种状态
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
            const k = status === STATE['1'] ? 'value' : 'reason';
            array[index] = {
              status,
              [k]: val
            };

            if(promises.length <= resolvedCount) {
              resolve(array);
            }
          };
          p.then(val => {
            cb(val, STATE['1']);
          })
          .catch(reason => {
            cb(reason, STATE['2']);
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
      // resolver must be a function
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
      // 如果 promise pending 缓存回调函数
      this._callbacks.push(handler);
    } else {
      // 如果 promise settled
      doHandler(handler);
    }

    // 返回一个新的 promise
    return p;
  }

  catch(onRejected) {
    return this.then(undefined, onRejected);
  }

  resolve(value) {
    if(this._status !== STATE['0']) return;
    this._status = STATE['1'];
    this._value = value;
    this._callbacks.forEach(doHandler);
  }

  reject(reason) {
    if(this._status !== STATE['0']) return;
    this._status = STATE['2'];
    this._value = reason;
    this._callbacks.forEach(doHandler);
  }
}

function doFunc(ctx, fn) {
  let called = false;

  try {
    fn(
      v => {
        if(called) return;
        called = true;
        resolvePromise(ctx, v);
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
  // then 的回调是异步执行的，使用 setTimeout 模拟
  setTimeout(() => {
    const { _status, _value } = x;
    const fn = _status === STATE['1'] ? onFulfilled : onRejected;

    if(isFunction(fn)) {
      // 如果 onFulfilled or onRejected 是函数，运行 Promise Resolution Procedure [[Resolve]](promise2, fn(_value))
      try {
        resolvePromise(p, fn(_value));
      } catch(err) {
        p.reject(err);
      }
    } else {
      _status === STATE['1'] ? p.resolve(_value) : p.reject(_value);
    }
  });
}


// Promise Resolution Procedure
function resolvePromise(p, x) {
  if(p === x) {
    // 如果循环引用，抛出 TypeError
    return p.reject(new TypeError('chaining'));
  }

  // 如果 x 是 promise, 根据 x 的状态 执行
  if(x instanceof MyPromise) {
    return x.then(
       v => resolvePromise(p, v),
       r => p.reject(r)
    );
 }

  // 如果 x 是函数 或者 对象
  if(x !== null && (isFunction(x) || isObject(x))) {
    try {
      const then = x.then;

      if(isFunction(then)) {
        doFunc(p, then.bind(x));
      } else {
        p.resolve(x);
      }
    } catch(e) {
      // 如果 访问 x.then 抛出异常 e, p.reject(e)
      p.reject(e);
    }
  } else {
    // 直接 p.resolve(x)
    p.resolve(x);
  }
}

module.exports = MyPromise;