import { useSyncExternalStore } from 'react';

const EVENT_NAME = 'imran-reduced-motion-change';
const STORAGE_KEY = 'imran-reduced-motion';

export function getReducedMotion() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved !== null) return saved === 'true';
    } catch { /* Continue with the system preference. */ }
    return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function setReducedMotion(value) {
    const reduced = Boolean(value);
    try { localStorage.setItem(STORAGE_KEY, String(reduced)); } catch { /* Storage may be disabled. */ }
    if (typeof document !== 'undefined') document.documentElement.classList.toggle('reduce-motion', reduced);
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: reduced }));
}

export function subscribeReducedMotion(callback) {
    if (typeof window === 'undefined') return () => {};
    window.addEventListener(EVENT_NAME, callback);
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onSystemChange = () => {
        try {
            if (localStorage.getItem(STORAGE_KEY) === null) callback();
        } catch { callback(); }
    };
    media.addEventListener?.('change', onSystemChange);
    return () => {
        window.removeEventListener(EVENT_NAME, callback);
        media.removeEventListener?.('change', onSystemChange);
    };
}
export function useReducedMotion() {
    return useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => true);
}
