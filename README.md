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
   
# Promise代码基本结构

实例化Promise对象时必须传入一个函数作为执行器，有两个参数（resolve 和 reject）分别将结果转为成功状态和失败状态。我们可以写出基本结构
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
      
      resolver(
         v => this.resolve(v),
         r => this.reject(r)
      );
   }
   
   resolve(value) {
   
   }
   
   reject(reason) {
   
   }
}

module.exports = MyPromise;

```
