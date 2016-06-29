import test from 'ava';
import proxyquire from 'proxyquire';

const postMessage = proxyquire('./index', {
  daslib: {
    search: () => {}
  }
}).postMessage;

test('postMessage', () => {
  return postMessage('testing');
});
