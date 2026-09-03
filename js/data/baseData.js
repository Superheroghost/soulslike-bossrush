export const BOSS_DATA = {
    fallen_knight: {
        id: 'fallen_knight',
        name: 'The Fallen Knight',
        title: 'Once a Hero, Now Ash',
        icon: '⚔️',
        order: 0,
        unlocked: true,
        lore: 'A knight who fell defending the last flame. His loyalty endures beyond death, his blade still singing the song of a forgotten kingdom.',
        hp: 800,
        poise: 80,
        color: '#8090b0',
        accentColor: '#4060a0',
        phase2Color: '#a06040',
        phase2AccentColor: '#d04020'
    },
    beast_hunter: {
        id: 'beast_hunter',
        name: 'The Beast Hunter',
        title: 'Stalker of the Ashen Wilds',
        icon: '🐾',
        order: 1,
        unlocked: false,
        lore: 'She roamed the dying forests, hunting beasts twisted by the fading flame. In the end, she became what she hunted.',
        hp: 650,
        poise: 60,
        color: '#6a8a5a',
        accentColor: '#3a6a2a',
        phase2Color: '#8a4a2a',
        phase2AccentColor: '#ba3a1a'
    },
    crystal_sorceress: {
        id: 'crystal_sorceress',
        name: 'Crystal Sorceress',
        title: 'Keeper of Shattered Light',
        icon: '💎',
        order: 2,
        unlocked: false,
        lore: 'She sought to preserve beauty in crystal, freezing moments of the world before it crumbled. Now she exists between heartbeats.',
        hp: 550,
        poise: 50,
        color: '#8080c0',
        accentColor: '#6060d0',
        phase2Color: '#c060c0',
        phase2AccentColor: '#e040a0'
    },
    iron_juggernaut: {
        id: 'iron_juggernaut',
        name: 'Iron Juggernaut',
        title: 'The Unbreaking Wall',
        icon: '🛡️',
        order: 3,
        unlocked: false,
        lore: 'A living fortress, animated by the collective will of soldiers who refused to retreat. Every dent in its armor tells a tale of defiance.',
        hp: 1200,
        poise: 120,
        color: '#7a7a7a',
        accentColor: '#5a5a5a',
        phase2Color: '#aa4a2a',
        phase2AccentColor: '#dd3311'
    },
    twin_sentinels: {
        id: 'twin_sentinels',
        name: 'Twin Sentinels',
        title: 'Bound in Duty Eternal',
        icon: '👥',
        order: 4,
        unlocked: false,
        lore: 'Twin brothers who swore to guard each other even in death. Where one falls, the other rages. They cannot be separated.',
        hp: 500, // each
        poise: 45,
        color: '#b08040',
        accentColor: '#d0a060',
        phase2Color: '#c04040',
        phase2AccentColor: '#e02020'
    }
};

export const BOSS_ORDER = ['fallen_knight', 'beast_hunter', 'crystal_sorceress', 'iron_juggernaut', 'twin_sentinels'];
