import test from 'node:test';
import assert from 'node:assert/strict';
import { draftValue, updateDraft } from '../src/hooks/usePropDraft.js';

test('an event-driven draft survives unrelated renders with the same server props', () => {
  const source = { title: 'Saved' };
  const edited = updateDraft({ source, value: source }, source, { title: 'Draft' });
  assert.deepEqual(draftValue(edited, source), { title: 'Draft' });
  assert.deepEqual(source, { title: 'Saved' });
});

test('a server refresh replaces stale drafts immediately, without an effect', () => {
  const source = { title: 'Saved' };
  const snapshot = { source, value: { title: 'Draft' } };
  const refreshed = { title: 'Server update' };
  assert.equal(draftValue(snapshot, refreshed), refreshed);
  assert.deepEqual(updateDraft(snapshot, refreshed, value => ({ ...value, extra: true })), {
    source: refreshed, value: { title: 'Server update', extra: true },
  });
});

test('drafts support missing props, functional updates and primitive values', () => {
  const snapshot = { source: undefined, value: undefined };
  assert.deepEqual(updateDraft(snapshot, undefined, previous => ({ ...previous, title: 'New' })).value, { title: 'New' });
  const edited = updateDraft({ source: 'Saved', value: 'Saved' }, 'Saved', 'Draft');
  assert.equal(draftValue(edited, 'Saved'), 'Draft');
  assert.equal(draftValue(edited, 'Updated'), 'Updated');
});
