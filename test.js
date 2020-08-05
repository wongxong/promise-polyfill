const MyPromise = require('./src/polyfill');
const tests = require('promises-aplus-tests');

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