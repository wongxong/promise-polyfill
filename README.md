# promise-polyfill
手写一个符合 A+ 规范的 promise


# Promise/A+ 规范
[Promise/A+规范英文地址](https://promisesaplus.com/)
[Promise/A+规范中文翻译](https://juejin.im/post/5b6161e6f265da0f8145fb72)

# Promise/A+ [2.1]
## Promise 状态
Promise 必须处于三种状态之一: 请求状态(pending), 完成状态(fulfilled) 或者 拒绝状态(rejected)。

2.1.1 当Promise处于请求状态(pending)时：
   2.1.1.1 Promise 可以转为 完成状态(fulfilled) 或者 拒绝状态(rejected)。
2.1.2 当Promise处于完成状态(fulfilled)时：
   2.1.2.1 Promise 不能转为任何其他状态。
2.1.3 当Promise处于拒绝状态(rejected)时：
   2.1.3.1 Promise 不能转为任何其他状态。
