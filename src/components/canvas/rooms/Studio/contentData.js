/**
 * Learning log content for Imran's Studio scene.
 * These are areas of interest and practice, not claims of professional experience.
 */
export const PLATFORM_CONFIG = {
    youtube: { color: '#FF0000', accentColor: '#cc0000', icon: '▶', label: 'Video', shape: 'tv' },
    blog: { color: '#4A90D9', accentColor: '#2d6cb5', icon: '⌘', label: 'Learning log', shape: 'monitor' },
    tiktok: { color: '#00F2EA', accentColor: '#FF0050', icon: '✦', label: 'Idea', shape: 'phone' },
};

const learningNotes = [
    ['BCA · semester 1', 'I am studying for a BCA at Technia Institute (29010) in Delhi. I am also an IGNOU student. I passed Class 10 through CBSE in 2024 and completed Class 12 at Government Boys Senior Secondary School, Delhi.', '/textures/gallery/imran-project.webp'],
    ['Programming from the beginning', 'I am learning step by step and practicing with small programs. My current languages are Python, C, C++, and HTML.', '/textures/gallery/imran-python.webp'],
    ['Building useful tools', 'I enjoy coming up with small tools and trying to turn those ideas into working projects. I am exploring vibe coding while learning how the code works.', '/textures/gallery/imran-cpp.webp'],
    ['Telegram bot experiments', 'Telegram bots are one of the things I like building while I learn how code can solve everyday problems.', '/textures/gallery/imran-telegram.webp'],
    ['Discord bot experiments', 'I am exploring Discord bots and learning how to make useful community tools.', '/textures/gallery/imran-discord.webp'],
    ['Gaming & Dxeonix', 'I am a small YouTuber who plays Call of Duty, Resident Evil 1–3 and 7, BGMI Mobile, PUBG PC, Minecraft, and Roblox. In my free time I play with friends and enjoy anime, movies, and web series.', '/textures/gallery/imran-project.webp'],
    ['My Ubuntu workstation', 'My PC has an MSI MS-7C96 motherboard, AMD Ryzen 5 5500 processor (12 threads), Radeon RX 580 2048SP graphics, 16 GiB RAM, and a 1 TB Crucial NVMe SSD. I currently use 64-bit Ubuntu Linux, kernel 7.0.0-38-generic.', '/textures/gallery/imran-project.webp'],
];

export const CONTENT_DATA = learningNotes.map(([title, description, texture], index) => ({
    id: `learning-${index + 1}`,
    platform: 'blog',
    title,
    description,
    frontTexture: texture,
    paintedFrontTexture: texture,
    thumbnail: null,
    url: 'https://github.com/imrangiit',
    date: `2026-0${index + 1}-01`,
    device: 'monitor',
}));

export const getContentByPlatform = (platform) => platform === 'all'
    ? CONTENT_DATA
    : CONTENT_DATA.filter((item) => item.platform === platform);

export const getLatestContent = () => CONTENT_DATA[0];
