import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { remoteApiErrorMessage } from './admin-remote';

describe('remoteApiErrorMessage', () => {
  it('surfaces the backend unified error message with the status', () => {
    const msg = remoteApiErrorMessage({
      status: 400,
      data: { code: 400, message: '暂不可上架：市场已过 endDate' },
    });
    assert.equal(msg, '远程API错误: 400 暂不可上架：市场已过 endDate');
  });

  it('falls back to FastAPI detail when message is absent', () => {
    const msg = remoteApiErrorMessage({ status: 422, data: { detail: 'bad input' } });
    assert.equal(msg, '远程API错误: 422 bad input');
  });

  it('parses the reason from raw text when data is null (fetch-based callers)', () => {
    const msg = remoteApiErrorMessage({
      status: 500,
      text: '{"code":500,"message":"内部错误"}',
    });
    assert.equal(msg, '远程API错误: 500 内部错误');
  });

  it('ignores empty message and non-JSON HTML gateway bodies', () => {
    assert.equal(
      remoteApiErrorMessage({ status: 502, data: { message: '  ' }, text: '<html>Bad Gateway</html>' }),
      '远程API错误: 502'
    );
  });

  it('shows a trimmed non-JSON text body instead of just the status', () => {
    const msg = remoteApiErrorMessage({ status: 504, text: 'gateway timeout' });
    assert.equal(msg, '远程API错误: 504 gateway timeout');
  });

  it('caps the detail at 200 chars', () => {
    const msg = remoteApiErrorMessage({ status: 400, data: { message: 'x'.repeat(500) } });
    assert.equal(msg.length, '远程API错误: 400 '.length + 200);
  });
});
