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
      
      doFunc(this, resolver);
   }
   
   resolve(value) {
      if(this._status !== STATE["0"]) return;
      this._status = STATE["1"];
      this._value = value;
      this._callbacks.forEach(doHandler);
   }
   
   reject(reason) {
      if(this._status !== STATE["0"]) return;
      this._status = STATE["2"];
      this._value = reason;
      this._callbacks.forEach(doHandler);
   }
}

function doHandler(handler) {
   // ...
}

function doFunc(ctx, fn) {
   let called = false;
   
   try {
      resolver(
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
   
   
现根据这些要求先实现个简单的 then 函数：

```
class MyPromise {
   then(onFulfilled, onRejected) {
      if(this._status === STATE["0"]) {
         this._callbacks.push();
      }
   }
}

```




