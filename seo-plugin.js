const PROFILE = {
    title: 'Imran “Dyeson” | Beginner Developer Portfolio',
    description: 'Imran, known as Dyeson, is a beginner developer in Delhi learning Python, C, C++, and HTML while making tools and bots.',
    body: `# Imran (Dyeson)\n> Beginner developer and student in Delhi, India.\n\n## About\nI am 20 years old and learning programming from the beginning. I know some Python, C, C++, and HTML. I enjoy making tools, Telegram bots, and Discord bots. I study at Technia Institute (29010) and I am also an IGNOU student. I have used Windows 7, 10, and 11, and I am currently a beginner Ubuntu Linux user.\n\n## Links\n- GitHub: https://github.com/imrangiit\n- Instagram: https://www.instagram.com/cigarette.afterwhattt\n- Telegram: https://t.me/Dxliox\n- Telegram Group: https://t.me/join_peko\n- Discord: zeelinux\n- Email: mailto:imranashrafdev@outlook.com\n- Email: mailto:doyouknowdyeson@yahoo.com\n`
};

export function generateSeoHtml() {
    return {
        name: 'imran-profile-seo',
        configureServer(server) {
            server.middlewares.use((req, res, next) => {
                if (req.url?.split('?')[0] === '/llms.txt') {
                    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                    res.end(PROFILE.body);
                    return;
                }
                next();
            });
        },
        transformIndexHtml(html) {
            const person = {
                '@context': 'https://schema.org',
                '@type': 'Person',
                name: 'Imran',
                alternateName: 'Dyeson',
                jobTitle: 'Beginner Developer',
                description: PROFILE.description,
                address: { '@type': 'PostalAddress', addressLocality: 'Delhi', addressCountry: 'IN' },
                knowsAbout: ['Python', 'C', 'C++', 'HTML', 'Telegram bots', 'Discord bots', 'Ubuntu Linux'],
                email: 'imranashrafdev@outlook.com',
                sameAs: ['https://github.com/imrangiit', 'https://www.instagram.com/cigarette.afterwhattt', 'https://t.me/Dxliox']
            };
            const script = `<script type="application/ld+json">${JSON.stringify(person)}</script>`;
            return html.replace('</head>', `  ${script}\n</head>`);
        },
        generateBundle() {
            this.emitFile({ type: 'asset', fileName: 'llms.txt', source: PROFILE.body });
        }
    };
}
