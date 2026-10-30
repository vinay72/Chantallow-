// src/api/useCachedApi.js
// Loads a storefront API path (e.g. "/combos"), remembering the last good
// answer in this browser. On the next visit the saved copy shows straight
// away while a fresh one loads; a failed request is retried a few times.
//
//   const { data, status } = useCachedApi("/combos");
//   status: "loading" (nothing yet) | "stale" (saved copy, refreshing)
//         | "ready" (fresh) | "error" (gave up; data is the saved copy or null)

import { useEffect, useState } from "react";
import { api } from "./client";

const PREFIX = "chantallow_cache:";

function readSaved(path) {
    try {
        const raw = localStorage.getItem(PREFIX + path);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function save(path, data) {
    try {
        localStorage.setItem(PREFIX + path, JSON.stringify(data));
    } catch {
        /* storage unavailable — the page still works, just without the saved copy */
    }
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Retries server / network failures (the database is sometimes slow to answer),
// but not 4xx answers, which won't change on retry.
async function fetchWithRetry(path, attempts = 3) {
    for (let i = 1; ; i++) {
        try {
            return await api(path);
        } catch (err) {
            if (i >= attempts || (err.status && err.status < 500)) throw err;
            await wait(1000 * i);
        }
    }
}

export function useCachedApi(path) {
    const [state, setState] = useState(() => {
        const saved = readSaved(path);
        return { data: saved, status: saved ? "stale" : "loading" };
    });

    useEffect(() => {
        let cancelled = false;
        fetchWithRetry(path)
            .then((data) => {
                if (cancelled) return;
                save(path, data);
                setState({ data, status: "ready" });
            })
            .catch(() => !cancelled && setState((s) => ({ ...s, status: "error" })));
        return () => {
            cancelled = true;
        };
    }, [path]);

    return state;
}
