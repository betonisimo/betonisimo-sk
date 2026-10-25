"use client";
import { useCallback, useState } from "react";

export function draftValue(snapshot, source) {
  return Object.is(snapshot.source, source) ? snapshot.value : source;
}

export function updateDraft(snapshot, source, update) {
  const current = draftValue(snapshot, source);
  return { source, value: typeof update === "function" ? update(current) : update };
}

// Keep event-driven edits until new server props arrive, without an effect or
// a stale frame after router.refresh(). Only event handlers update this state.
export function usePropDraft(source) {
  const [snapshot, setSnapshot] = useState(() => ({ source, value: source }));
  const setValue = useCallback((update) => {
    setSnapshot((previous) => updateDraft(previous, source, update));
  }, [source]);
  return [draftValue(snapshot, source), setValue];
}
