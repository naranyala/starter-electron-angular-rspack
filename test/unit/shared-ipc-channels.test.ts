import { describe, expect, it } from 'bun:test';
import { IPC_CHANNELS, getAllChannels, isValidChannel } from '../../src/shared/ipc/channels';

describe('shared IPC channels', () => {
  it('returns a flat list of all channels', () => {
    const all = getAllChannels();
    expect(Array.isArray(all)).toBe(true);
    expect(all.length).toBeGreaterThan(0);
    expect(all).toContain(IPC_CHANNELS.LOG.WRITE);
  });

  it('validates known and unknown channels', () => {
    expect(isValidChannel(IPC_CHANNELS.APP.INFO)).toBe(true);
    expect(isValidChannel('non-existent-channel')).toBe(false);
  });
});
