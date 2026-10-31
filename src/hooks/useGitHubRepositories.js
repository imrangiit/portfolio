import { useCallback, useEffect, useState } from 'react';

const USER = 'imrangiit';
const CACHE_MS = 5 * 60 * 1000;
let cachedRepos = null;
let cachedAt = 0;

export function useGitHubRepositories() {
    const [repositories, setRepositories] = useState({ status: cachedAt ? 'ready' : 'loading', repos: cachedRepos || [], updatedAt: cachedAt ? new Date(cachedAt) : null, error: '' });
    const [refreshKey, setRefreshKey] = useState(0);
    const refresh = useCallback(() => setRefreshKey((key) => key + 1), []);

    useEffect(() => {
        if (cachedAt && Date.now() - cachedAt < CACHE_MS && refreshKey === 0) {
            setRepositories({ status: 'ready', repos: cachedRepos || [], updatedAt: new Date(cachedAt), error: '' });
            return undefined;
        }

        const controller = new AbortController();
        const load = async () => {
            setRepositories((current) => ({ ...current, status: 'loading', error: '' }));
            try {
                const response = await fetch(`https://api.github.com/users/${USER}/repos?sort=updated&per_page=100`, {
                    headers: { Accept: 'application/vnd.github+json' },
                    signal: controller.signal,
                });
                if (!response.ok) {
                    const message = response.status === 403 || response.status === 429
                        ? 'GitHub’s public API rate limit was reached.'
                        : `GitHub returned error ${response.status}.`;
                    throw new Error(message);
                }
                const data = await response.json();
                const projects = data
                    .filter((repo) => !repo.fork)
                    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
                    .slice(0, 10)
                    .map((repo) => ({
                        id: repo.id,
                        title: repo.name.replace(/[-_]/g, ' ').toUpperCase(),
                        front: '/textures/gallery/imran-project.webp',
                        painted: '/textures/gallery/imran-project.webp',
                        url: repo.html_url,
                        description: repo.description || `${repo.name} — a project I’m exploring and improving as I learn.`,
                        techStack: [],
                        language: repo.language,
                    }));
                cachedRepos = projects;
                cachedAt = Date.now();
                setRepositories({ status: 'ready', repos: projects, updatedAt: new Date(cachedAt), error: '' });
            } catch (error) {
                if (controller.signal.aborted) return;
                const message = !navigator.onLine
                    ? 'You appear to be offline. Connect to the internet and retry.'
                    : error.message || 'GitHub repositories could not be loaded.';
                setRepositories({ status: 'error', repos: cachedRepos || [], updatedAt: cachedAt ? new Date(cachedAt) : null, error: message });
            }
        };
        load();
        return () => controller.abort();
    }, [refreshKey]);

    return { ...repositories, refresh };
}
