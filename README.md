# promise-polyfill

手写一个符合 A+ 规范的 promise


# Promise/A+ 规范

[Promise/A+规范英文地址](https://promisesaplus.com/)

[Promise/A+规范中文翻译](https://juejin.im/post/5b6161e6f265da0f8145fb72)

# Promise/A+ [2.1]

## 2.1 Promise 状态

Promise 必须处于三种状态之一: 请求状态（pending），完成状态（fulfilled）或者拒绝状态（rejected）。

- 2.1.1 当Promise处于请求状态（pending）时：
   - 2.1.1.1 Promise 可以转为 完成状态（fulfilled）或者拒绝状态（rejected）。

- 2.1.2 当Promise处于完成状态（fulfilled）时：
   - 2.1.2.1 Promise 不能转为任何其他状态。
   - 2.1.2.2 必须有一个值，且此值不能改变。

- 2.1.3 当Promise处于拒绝状态（rejected）时：
   - 2.1.3.1 Promise 不能转为任何其他状态。
   - 2.1.3.2 必须有一个原因，且此原因不能改变。
   


先按照需求完成这部分代码，实例化Promise对象时必须传入一个函数作为执行器，有两个参数（resolve 和 reject）分别将结果转为成功状态和失败状态：

```
// promise 的三种状态
const STATE = {
   0: "pending",
   1: "fulfilled",
   2: "rejected"
};

class MyPromise {
   constructor(resolver) {
      this._status = STATE["0"];
      this._value = undefined;
      this._callbacks = [];
      
      // new Promise 后，同步执行 resolver 函数
      doFunc(this, resolver);
   }
   
   resolve(value) {
      // promise 的状态只能由 pending 改成 fulfilled or rejected
      if(this._status !== STATE["0"]) return;
      this._status = STATE["1"];
      this._value = value;
      // promise 状态改变以后，执行缓存的 回调函数
      this._callbacks.forEach(doHandler);
   }
   
   reject(reason) {
      // promise 的状态只能由 pending 改成 fulfilled or rejected
      if(this._status !== STATE["0"]) return;
      this._status = STATE["2"];
      this._value = reason;
      // promise 状态改变以后，执行缓存的 回调函数
      this._callbacks.forEach(doHandler);
   }
}

function doHandler(handler) {
   // ...
}

function doFunc(ctx, fn) {
   // 声明一个变量, 用于判断保证 promise 只会 【完成】 或 【被拒绝】 一次
   let called = false;
   
   try {
      resolver(
         // resolve 参数
         v => {
            if(called) return;
            called = true;
            ctx.resolve(v);
         },
         // reject 参数
         r => {
            if(called) return;
            called = true;
            ctx.reject(r);
         }
      );
   } catch(e) {
      if(called) return;
      called = true;
      ctx.reject(e);
   }
}

module.exports = MyPromise;

```

上面这段代码完成了Promise构造函数的初步搭建，包含：
- 三个状态的声明【请求状态、完成状态、拒绝状态】
- this._status 保存状态、this._value 保存唯一值
- this._callbacks 保存 then 中的回调，因为当执行完 Promise 时状态可能还在等待中，这时候需要把 then 中的回调保存起来用于状态改变时使用
- 给 resolver 的参数 resolve、reject
- resolve、reject 确保只有 pending 状态才可以改变状态
- 执行 resolver，在执行过程中可能会遇到报错，需要捕获错误传给 reject，确保只会 resolve 或 reject 一次


# Promise/A+ [2.2]

## 2.2 then 方法

Promise 必须提供then方法来存取它当前或最终的值或者原因。

Promise 的then方法接收两个参数：

```
class MyPromise {
   then(onFulfilled, onRejected) {
   
   }
}

```

- 2.2.1 onFullfilled和onRejected都是可选的参数：
   - 2.2.1.1 如果 onFulfilled 不是函数，必须忽略
   - 2.2.1.2 如果 onRejected 不是函数，必须忽略
   
- 2.2.2 如果 onFulfilled 是函数：
   - 2.2.2.1 此函数必须在Promise完成（fulfilled）后被调用，并把Promise的值作为它的第一个参数
   - 2.2.2.2 此函数在Promise完成（fulfilled）之前绝对不能被调用
   - 2.2.2.3 此函数绝对不能被调用超过一次

- 2.2.3 如果 onRejected 是函数：
   - 2.2.3.1 此函数必须在Promise拒绝（rejected）后被调用，并把Promise的值作为它的第一个参数
   - 2.2.3.2 此函数在Promise拒绝（rejected）之前绝对不能被调用
   - 2.2.3.3 此函数绝对不能被调用超过一次
   

- 2.2.4 在执行上下文堆栈（execution context）仅包含平台代码之前，不得调用 onFulfilled 和 onRejected

- 2.2.5 onFulfilled 和 onRejected 必须以函数来调用

- 2.2.6 then可以在同一个Promise里被多次调用
   - 2.2.6.1 当Promise完成（fulfilled）时，各个相应的onFulfilled回调必须根据最原始的then的顺序来调用
   - 2.2.6.2 当Promise拒绝（rejected）时，各个相应的onRejected回调必须根据最原始的then的顺序来调用

- 2.2.7 then必须返回一个新的Promise
   - 2.2.7.1 如果onFulfilled和onRejected返回一个值 x ，运行 Promise Resolution Procedure [[Resolve]](promise2, x)
   - 2.2.7.2 如果onFulfilled和onRejected抛出一个异常 e ，promise2 必须被拒绝（rejected），并把 e 作为原因
   - 2.2.7.3 如果onFulfilled不是一个函数，并且promise1已经完成（fulfilled），promise2必须使用与promise1相同的值来完成（fulfilled）
   - 2.2.7.4 如果onRejected不是一个函数，并且promise1已经被拒绝（rejected），promise2必须使用与promise1相同的原因被拒绝（rejected）
   
   
根据这些要求实现 then 函数：

```
function noop() {}

function isFunction(fn) {
   return typeof fn === "function";
}

class MyPromise {
   then(onFulfilled, onRejected) {
      const p = new MyPromise(noop);
      const handler = {
         p,
         x: this,
         onFulfilled,
         onRejected
      };
      
      if(this._status === STATE["0"]) {
         // 如果 promise 的状态 还在 pending, 先缓存 then 的 回调
         this._callbacks.push(handler);
      } else {
         // 如果 promise 已经 settled, 直接执行 then 的回调
         doHandler(handler);
      }
      
      // 返回一个新的 promise 对象
      return p;
   }
}

function doHandler({ p, x, onFulfilled, onRejected }) {
   // then 的回调是异步执行的，使用 setTimeout 模拟
   setTimeout(() => {
      const { _status, _value } = x;
      const fn = _status === STATE["1"] ? onFulfilled : onRejected;
      
      if(isFunction(fn)) {
         // 如果 onFulfilled or onRejected 是函数，运行 Promise Resolution Procedure [[Resolve]](promise2, fn(_value))
         try {
            resolvePromise(p, fn(_value));
         } catch(e) {
            p.reject(e);
         }
      } else {
         _status === STATE["1"] ? p.resolve(_value) : p.reject(_value);
      }
   });
}

// Promise Resolution Procedure
function resolvePromise(p, x) {
   // ...
}

```

# Promise/A+ [2.3]

## 2.3 Promise解决程序

- 2.3.1 如果 promise 和 x 引用同一个对象，则用 TypeError 作为原因拒绝（reject）promise。

- 2.3.2 如果 x 是 promise，采用 promise 的状态
   - 2.3.2.1 如果x的状态是 pending，promise 必须保持 pending 直到 x 的状态 fulfilled or rejected。
   - 2.3.2.2 如果x的状态是 fulfilled，用 x 相同的值 fulfill promise。
   - 2.3.2.3 如果x的状态是 rejected，用 x 相同的原因 reject promise。

- 2.3.3 如果 x 是对象或者函数
   - 2.3.3.1 尝试获取 x.then 的引用，then = x.then。
   - 2.3.3.2 如果获取 x.then 抛出异常 e ，用 e 作为原因 reject promise。
   - 2.3.3.3 如果 then 是一个函数，把 x 当作 this 来调用它，第一个参数为 resolvePromise，第二个参数为 rejectPromise，其中：
      - 2.3.3.3.1 如果 resolvePromise 被一个值 y 调用，运行 [[resolve]](promise, y)
      - 2.3.3.3.2 如果 rejectPromise 被一个原因 r 调用，用 r 作为原因 reject promise
      - 2.3.3.3.3 如果 resolvePromise 和 rejectPromise 都被调用，或者对同一个参数进行多次调用，第一次调用执行，任何进一步的调用都被忽略
      - 2.3.3.3.4 如果调用 then 抛出一个异常 e
         - 2.3.3.3.4.1 如果 resolvePromise 和 rejectPromise 都已被调用，则忽略
         - 2.3.3.3.4.2 或者 用 e 作为原因 reject promise
   - 2.3.3.4 如果 then 既不是对象也不是函数，用 x 作为值 resolve promise


```
function isObject(obj) {
   return Object.prototype.toString.call(obj) === "[object Object]";
}

function resolvePromise(p, x) {
   if(p === x) {
      // 如果循环引用，抛出 TypeError
      return p.reject(new TypeError("Chaining cycle detected for promise"));
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
         // 取出 x.then 的引用
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

```

修改一下 doFunc 函数，递归调用 resolvePromise

```
function doFunc(ctx, fn) {
   // 声明一个变量, 用于判断保证 promise 只会 【完成】 或 【被拒绝】 一次
   let called = false;
   
   try {
      resolver(
         // resolve 参数
         v => {
            if(called) return;
            called = true;
            resolvePromise(ctx, v);
         },
         // reject 参数
         r => {
            if(called) return;
            called = true;
            ctx.reject(r);
         }
      );
   } catch(e) {
      if(called) return;
      called = true;
      ctx.reject(e);
   }
}
```


# 测试Promise

安装测试脚本：

```
yarn add mocha promises-aplus-tests
```

新建一个 test.js 测试文件

```
const MyPromise = require("./src/polyfill.js");
const tests = require("promises-aplus-tests");

function deferred() {
   let resolve;
   let reject;
   const promise = new MyPromise((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
   });
   
   return {
      promise,
      resolve,
      reject
   }
}

const adapter = {
   deferred
};

tests.mocha(adapter);

```

在 package.json 里面添加 scripts 命令

```
{
   ...
   "scripts": {
      ...
      "test": "mocha ./test.js"
      ...
   }
   ...
}
```

执行 yarn test 查看测试结果




