import { Writable } from 'node:stream';
import { AppLogger } from '../src/common/logger/app-logger.service.js';

function captureStream(): { stream: Writable; get(): string[] } {
  const chunks: string[] = [];
  const stream = new Writable({
    write(chunk: Buffer, _enc: BufferEncoding, cb: () => void) {
      chunks.push(chunk.toString());
      cb();
    },
  });
  return { stream, get: () => chunks };
}

describe('AppLogger', () => {
  it('redacts sensitive fields from emitted JSON output', () => {
    process.env.NODE_ENV = 'test';
    const { stream, get } = captureStream();
    const logger = new AppLogger(stream);

    logger.log({ passwordHash: 'supersecret', name: 'ok' }, 'Test');
    logger.log('plain message', 'Test');
    stream.end();

    const output = get().join('');
    expect(output).not.toContain('supersecret');
    expect(output).toContain('[REDACTED]');
    expect(output).toContain('uakari-api');
  });
});