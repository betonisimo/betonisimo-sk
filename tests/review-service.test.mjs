import test from 'node:test';
import assert from 'node:assert/strict';
import { createReviewService } from '../src/lib/review-service.js';

function fixture(session = null) {
  const calls = [];
  const paths = [];
  const review = Object.fromEntries(['create', 'update', 'delete', 'findMany'].map(method => [method, async args => {
    calls.push({ method, args });
    return method === 'findMany' ? [{ id: 1 }] : { id: 1 };
  }]));
  const service = createReviewService({ db: { review }, getSession: async () => session, revalidate: path => paths.push(path) });
  return { service, calls, paths };
}

test('anonymous clients cannot moderate or read pending reviews', async () => {
  const { service, calls, paths } = fixture();
  assert.equal((await service.approve(1)).success, false);
  assert.equal((await service.remove(1)).success, false);
  assert.deepEqual(await service.list(), []);
  assert.deepEqual(calls, []);
  assert.deepEqual(paths, []);
});

test('authenticated moderation validates IDs before touching the database', async () => {
  const { service, calls } = fixture({ user: { name: 'Admin' } });
  for (const id of [0, -1, 1.5, 'invalid', Number.MAX_SAFE_INTEGER + 1]) {
    assert.equal((await service.approve(id)).success, false);
    assert.equal((await service.remove(id)).success, false);
  }
  assert.deepEqual(calls, []);
});

test('authenticated moderation updates only the selected review and refreshes its consumers', async () => {
  const { service, calls, paths } = fixture({ user: { name: 'Admin' } });
  assert.deepEqual(await service.approve(7), { success: true });
  assert.deepEqual(await service.remove(8), { success: true });
  assert.deepEqual(await service.list(), [{ id: 1 }]);
  assert.deepEqual(calls, [
    { method: 'update', args: { where: { id: 7 }, data: { status: 'APPROVED' } } },
    { method: 'delete', args: { where: { id: 8 } } },
    { method: 'findMany', args: { orderBy: { createdAt: 'desc' } } },
  ]);
  assert.deepEqual([...new Set(paths)], ['/', '/admin/reviews', '/admin/editor']);
});

test('public submissions are always pending; invalid or excessive data never reaches storage', async () => {
  const { service, calls } = fixture();
  const form = new FormData();
  form.set('author', ' Test '); form.set('text', ' Review '); form.set('rating', '4'); form.set('status', 'APPROVED');
  assert.equal((await service.submit(form)).success, true);
  assert.deepEqual(calls[0], { method: 'create', args: { data: { author: 'Test', text: 'Review', rating: 4, status: 'PENDING' } } });
  for (const rating of ['0', '6', '2.5', 'NaN', '']) {
    form.set('rating', rating);
    assert.equal((await service.submit(form)).success, false);
  }
  form.set('rating', '5'); form.set('text', 'x'.repeat(5001));
  assert.equal((await service.submit(form)).success, false);
  form.set('text', 'Review'); form.set('author', ' ');
  assert.equal((await service.submit(form)).success, false);
  assert.equal(calls.length, 1);
});
