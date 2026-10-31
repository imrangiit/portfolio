import { useEffect, useRef } from 'react';
import { useScene } from '../context/SceneContext';

/**
 * useDocumentMeta — Dynamic Meta Tags & Virtual Routing (History API)
 * 
 * Updates the browser URL, page title, and meta description
 * whenever the user enters/exits a 3D room. Also handles the
 * browser back/forward buttons for seamless navigation.
 */

const ROOM_META = {
    null: {
        path: '/',
        title: 'Imran | Beginner Developer Portfolio',
        description: 'Imran is a beginner developer from Delhi, India learning Python, C, C++, and HTML while building bots and tools.',
    },
    about: {
        path: '/about',
        title: 'About Imran',
        description: 'Meet Imran, a 20-year-old IGNOU student at Technia Institute in Delhi who is learning programming from the beginning.',
    },
    gallery: {
        path: '/gallery',
        title: 'Projects & Experiments — Imran',
        description: 'Explore Imran’s learning experiments with Python, C, C++, HTML, Telegram bots, and Discord bots.',
    },
    studio: {
        path: '/studio',
        title: 'Learning & Tools — Imran',
        description: 'Explore Imran\'s learning notes about coding, small tools, Telegram bots, Discord bots, and Ubuntu Linux.',
    },
    contact: {
        path: '/contact',
        title: 'Contact Imran',
        description: 'Contact Imran by email, Instagram, Telegram, Discord, or GitHub.',
    },
};

// Map URL paths back to room IDs for deep linking
const PATH_TO_ROOM = {
    '/': null,
    '/about': 'about',
    '/gallery': 'gallery',
    '/studio': 'studio',
    '/contact': 'contact',
};

/**
 * Returns the room ID that the initial URL points to (for deep linking).
 * Call this once at app startup to determine if we need to auto-teleport.
 */
export function getInitialRoomFromUrl() {
    const path = window.location.pathname.replace(/\/+$/, '') || '/';
    return PATH_TO_ROOM[path] !== undefined ? PATH_TO_ROOM[path] : null;
}

export function useDocumentMeta() {
    const { currentRoom, teleportTo, hasEntered } = useScene();
    const isHandlingPopState = useRef(false);
    const lastPushedRoom = useRef(undefined); // Track what we last pushed to avoid duplicates

    // Update document meta and URL when room changes
    useEffect(() => {
        const roomKey = currentRoom === null ? 'null' : currentRoom;
        const meta = ROOM_META[roomKey] || ROOM_META['null'];

        // Update the page title
        document.title = meta.title;

        // Update meta description
        const descTag = document.querySelector('meta[name="description"]');
        if (descTag) {
            descTag.setAttribute('content', meta.description);
        }

        // Update OG meta tags
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', meta.title);

        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) ogDesc.setAttribute('content', meta.description);

        const ogUrl = document.querySelector('meta[property="og:url"]');
        if (ogUrl) ogUrl.setAttribute('content', window.location.origin + meta.path);

        // Update canonical link to ensure virtual routes are correctly indexable as separate pages
        const canonicalTag = document.querySelector('link[rel="canonical"]');
        if (canonicalTag) {
            canonicalTag.setAttribute('href', window.location.origin + meta.path);
        }

        // Push to browser history (only if not handling a popstate event and room actually changed)
        if (!isHandlingPopState.current && lastPushedRoom.current !== currentRoom) {
            // Use replaceState for the very first load, pushState for subsequent navigations
            if (lastPushedRoom.current === undefined) {
                window.history.replaceState({ room: currentRoom }, '', meta.path);
            } else {
                window.history.pushState({ room: currentRoom }, '', meta.path);
            }
            lastPushedRoom.current = currentRoom;
        }

        isHandlingPopState.current = false;
    }, [currentRoom]);

    // Handle browser back/forward buttons
    useEffect(() => {
        const handlePopState = (event) => {
            isHandlingPopState.current = true;
            const targetRoom = event.state?.room ?? null;
            lastPushedRoom.current = targetRoom;

            if (targetRoom === null) {
                // Going back to corridor — we don't teleport, just need to trigger exit
                // The SceneContext requestExit will handle the animation
                // For now, we update meta immediately
                const meta = ROOM_META['null'];
                document.title = meta.title;
            } else if (hasEntered) {
                // Teleport to the target room
                teleportTo(targetRoom);
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [teleportTo, hasEntered]);
}
