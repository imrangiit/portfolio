import { useEffect, useRef, useState } from 'react';
import { useGitHubRepositories } from '../../hooks/useGitHubRepositories';
import { setReducedMotion, useReducedMotion } from '../../utils/reducedMotion';
import '../../styles/PortfolioHub.scss';

const GITHUB = 'imrangiit';
const GAMES = ['Call of Duty', 'Resident Evil 1–3 & 7', 'BGMI Mobile', 'PUBG PC', 'Minecraft', 'Roblox'];
const dateLabel = (date) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(date));
const timeLabel = (date) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date));

function PortfolioHub() {
    const [open, setOpen] = useState(false);
    const [github, setGithub] = useState({ status: 'idle', profile: null, events: [], updatedAt: null, reason: '' });
    const [copied, setCopied] = useState(false);
    const dialog = useRef(null);
    const trigger = useRef(null);
    const repositoryState = useGitHubRepositories();
    const { repos: repositories, status: repositoriesStatus, error: repositoriesError, refresh: refreshRepositories } = repositoryState;
    const repositoryLanguages = [...new Set(repositories.map((repo) => repo.language).filter(Boolean))].slice(0, 6);
    const reducedMotion = useReducedMotion();

    useEffect(() => {
        document.documentElement.classList.toggle('reduce-motion', reducedMotion);
    }, [reducedMotion]);

    const loadGitHub = async (signal) => {
        setGithub((current) => ({ ...current, status: 'loading', reason: '' }));
        try {
            const responses = await Promise.all([
                fetch(`https://api.github.com/users/${GITHUB}`, { signal, headers: { Accept: 'application/vnd.github+json' } }),
                fetch(`https://api.github.com/users/${GITHUB}/events?per_page=8`, { signal, headers: { Accept: 'application/vnd.github+json' } }),
            ]);
            const failed = responses.find((response) => !response.ok);
            if (failed) {
                const rateLimited = failed.status === 403 || failed.status === 429;
                throw Object.assign(new Error(rateLimited ? 'GitHub rate limit reached. Please try again in a little while.' : `GitHub returned ${failed.status}. Please try again.`), { rateLimited });
            }
            const [profile, events] = await Promise.all(responses.map((response) => response.json()));
            setGithub({ status: 'ready', profile, events: events.slice(0, 6), updatedAt: new Date(), reason: '' });
        } catch (error) {
            if (error.name === 'AbortError') return;
            setGithub({
                status: 'error', profile: null, events: [], updatedAt: null,
                reason: !navigator.onLine ? 'You appear to be offline. Check your connection and retry.' : error.message,
            });
        }
    };

    useEffect(() => {
        if (!open) return undefined;
        const controller = new AbortController();
        if (github.status === 'idle') loadGitHub(controller.signal);
        const focusable = 'button:not([disabled]), a[href]';
        const first = dialog.current?.querySelector(focusable);
        first?.focus();
        const onKeyDown = (event) => {
            if (event.key === 'Escape') { event.preventDefault(); close(); }
            if (event.key === 'Tab' && dialog.current) {
                const elements = [...dialog.current.querySelectorAll(focusable)];
                if (!elements.length) return;
                if (event.shiftKey && document.activeElement === elements[0]) { event.preventDefault(); elements.at(-1).focus(); }
                if (!event.shiftKey && document.activeElement === elements.at(-1)) { event.preventDefault(); elements[0].focus(); }
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => { controller.abort(); window.removeEventListener('keydown', onKeyDown); };
    }, [open]);

    const close = () => {
        setOpen(false);
        setGithub((current) => current.status === 'loading' ? { ...current, status: 'idle' } : current);
        requestAnimationFrame(() => trigger.current?.focus());
    };
    const retry = () => {
        refreshRepositories();
        const controller = new AbortController();
        loadGitHub(controller.signal);
    };
    const copyEmail = async () => {
        try {
            await navigator.clipboard.writeText('imranashrafdev@outlook.com');
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1800);
        } catch { window.location.href = 'mailto:imranashrafdev@outlook.com'; }
    };
    const goTo = (id) => dialog.current?.querySelector(`#${id}`)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });

    const activities = github.events.map((event) => {
        const repo = event.repo?.name?.replace(`${GITHUB}/`, '') || 'a repository';
        const labels = { PushEvent: `Pushed code to ${repo}`, CreateEvent: `Created something in ${repo}`, PullRequestEvent: `Worked on a pull request in ${repo}`, IssuesEvent: `Updated an issue in ${repo}`, WatchEvent: `Starred ${repo}`, ForkEvent: `Forked ${repo}` };
        return { id: event.id, label: labels[event.type] || `Activity in ${repo}`, date: event.created_at };
    });

    return <>
        <button ref={trigger} type="button" className="nav-btn profile-hub-trigger" onClick={() => setOpen(true)} aria-label="Open Imran’s profile details" aria-haspopup="dialog" aria-expanded={open} title="Profile & details">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.6-3.5 3-5.4 7-5.4s6.4 1.9 7 5.4"/></svg>
        </button>
        {open && <div className="portfolio-hub-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
            <section className="portfolio-hub" ref={dialog} role="dialog" aria-modal="true" aria-labelledby="hub-title" tabIndex={-1}>
                <header className="portfolio-hub__header"><div><p className="hub-eyebrow">BCA STUDENT · BEGINNER DEVELOPER · GAMING CREATOR</p><h2 id="hub-title">Imran’s profile</h2></div><button className="hub-close" type="button" onClick={close} aria-label="Close profile">×</button></header>
                <nav className="hub-quick-links" aria-label="Profile sections">{[['github','GitHub'],['roadmap','Roadmap'],['youtube','YouTube'],['setup','My setup'],['contact','Contact'],['accessibility','Accessibility']].map(([id, label]) => <button key={id} type="button" onClick={() => goTo(`hub-${id}`)}>{label}</button>)}</nav>
                <div className="portfolio-hub__content">
                    <section className="hub-section" id="hub-github"><div className="hub-heading"><div><p className="hub-eyebrow">LIVE PUBLIC PROFILE</p><h3>GitHub projects & activity</h3></div><a href={`https://github.com/${GITHUB}`} target="_blank" rel="noreferrer">Open profile ↗</a></div>
                        {github.status === 'loading' && <p role="status">Loading GitHub profile…</p>}
                        {github.status === 'error' && <div className="hub-error" role="status"><p>{github.reason}</p><button type="button" onClick={retry}>Retry GitHub</button></div>}
                        {github.status === 'ready' && <>
                            <div className="hub-profile"><img src={github.profile.avatar_url} alt="" width="48" height="48"/><p>{github.profile.bio || `Public profile for ${github.profile.login}. Follow along as I learn and build.`}</p></div>
                            <p className="hub-stats"><strong>{github.profile.public_repos}</strong> public repos <span>·</span> <strong>{github.profile.followers}</strong> followers</p>
                            <p className="hub-languages"><strong>Languages in my public repos:</strong> {repositoryLanguages.length ? repositoryLanguages.join(' · ') : 'Loading from GitHub…'}</p>
                            <div className="hub-repos">{repositories.length ? repositories.slice(0, 6).map((repo) => <a key={repo.id} href={repo.url} target="_blank" rel="noreferrer"><strong>{repo.title}</strong><span>{repo.description}</span><small>{repo.language || 'Code'}</small></a>) : <div className="hub-repo-empty"><p>{repositoriesStatus === 'loading' ? 'Loading public repositories…' : repositoriesError || 'No public repositories are available yet.'}</p>{repositoriesStatus === 'error' && <button type="button" onClick={refreshRepositories}>Retry repositories</button>}</div>}</div>
                            <h4>Recent public activity</h4><ul className="hub-activity">{activities.map((item) => <li key={item.id}><span>{item.label}</span><time dateTime={item.date}>{dateLabel(item.date)}</time></li>)}</ul>
                            <p className="hub-footnote">Last refreshed {timeLabel(repositoryState.updatedAt || github.updatedAt)} · Public GitHub events are shown; private contribution data isn’t available without account authorization.</p>
                        </>}
                    </section>
                    <section className="hub-section" id="hub-roadmap"><p className="hub-eyebrow">LEARNING IN PUBLIC</p><h3>My learning roadmap</h3><div className="hub-roadmap">
                        <article><b>NOW</b><h4>Build the foundations</h4><p>Practice Python, C, C++, HTML, Git and GitHub; get comfortable with Ubuntu Linux; and understand how the code behind my tools and bots works while exploring vibe coding.</p></article>
                        <article><b>NEXT</b><h4>Make projects more complete</h4><p>Keep building Telegram and Discord bots, improve web development, and learn more about APIs, testing, and deploying projects.</p></article>
                        <article><b>ALWAYS</b><h4>Learn by making</h4><p>Turn ideas into small useful projects, share what I learn, and improve them over time.</p></article>
                    </div></section>
                    <section className="hub-section" id="hub-youtube"><p className="hub-eyebrow">GAMING & VIDEOS</p><h3>Dxeonix on YouTube</h3><p>I’m a small gaming creator who enjoys trying different games and sharing the fun. Visit my channel for my videos and latest uploads.</p><div className="hub-tags">{GAMES.map((game) => <span key={game}>{game}</span>)}</div><a className="hub-primary" href="https://youtube.com/@dxeonix" target="_blank" rel="noreferrer">Visit my YouTube channel ↗</a></section>
                    <section className="hub-section" id="hub-setup"><p className="hub-eyebrow">MY WORKSPACE</p><h3>PC & Ubuntu setup</h3><dl className="hub-specs">{[['System','MSI MS-7C96 motherboard'],['Processor','AMD Ryzen 5 5500 · 12 threads'],['Graphics','AMD Radeon RX 580 2048SP'],['Memory','16 GiB RAM'],['Storage','1 TB Crucial NVMe SSD'],['Operating system','Ubuntu Linux · 64-bit · kernel 7.0.0-38-generic'],['Previously used','Windows 7, 10, and 11']].map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}</dl></section>
                    <section className="hub-section" id="hub-contact"><p className="hub-eyebrow">SAY HELLO</p><h3>Contact & socials</h3><div className="hub-contact-links">
                        <a href="mailto:imranashrafdev@outlook.com"><span>Email</span><strong>imranashrafdev@outlook.com</strong></a><button type="button" onClick={copyEmail}>{copied ? 'Email copied ✓' : 'Copy primary email'}</button>
                        <a href="mailto:doyouknowdyeson@yahoo.com"><span>Alternate email</span><strong>doyouknowdyeson@yahoo.com</strong></a>
                        <a href="https://www.instagram.com/cigarette.afterwhattt" target="_blank" rel="noreferrer"><span>Instagram</span><strong>@cigarette.afterwhattt ↗</strong></a>
                        <a href="https://t.me/Dxliox" target="_blank" rel="noreferrer"><span>Telegram</span><strong>@Dxliox ↗</strong></a>
                        <a href="https://t.me/join_peko" target="_blank" rel="noreferrer"><span>Telegram group</span><strong>Join the group ↗</strong></a>
                        <a href="https://discord.com/app" target="_blank" rel="noreferrer"><span>Discord</span><strong>zeelinux · open Discord ↗</strong></a>
                    </div><p className="hub-footnote">The contact form opens a prefilled email draft in your mail app. You still need to press Send there.</p></section>
                    <section className="hub-section hub-accessibility" id="hub-accessibility"><div><p className="hub-eyebrow">COMFORT & ACCESS</p><h3>Accessibility</h3><p>Use Tab to move, Enter or Space to activate, and Escape to close this panel. Arrow keys and Page Up/Down also navigate the corridor. Reduced motion follows your device setting.</p></div><button type="button" role="switch" aria-checked={reducedMotion} onClick={() => setReducedMotion(!reducedMotion)}><span>{reducedMotion ? 'On' : 'Off'}</span> Reduce motion</button></section>
                </div>
            </section>
        </div>}
    </>;
}

export default PortfolioHub;
