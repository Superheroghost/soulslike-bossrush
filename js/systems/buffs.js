export const BUFF_POOL = [
    {
        id: 'dodge_iframes',
        name: 'Shadow Step',
        desc: '+3 dodge i-frames',
        apply: (player) => { player.dodgeIFrames += 3; }
    },
    {
        id: 'heavy_heal',
        name: 'Vampiric Cleave',
        desc: 'Heavy attacks heal 5% HP',
        apply: () => {}
    },
    {
        id: 'parry_window',
        name: "Duelist's Eye",
        desc: '+2 parry window frames',
        apply: (player) => { player.parryWindow += 2; }
    },
    {
        id: 'flask_heal',
        name: 'Blessed Flask',
        desc: 'Flask heals 30% more',
        apply: (player) => { player.flaskHealBonus += 0.3; }
    },
    {
        id: 'stamina_regen',
        name: 'Second Wind',
        desc: 'Stamina regens 25% faster',
        apply: (player) => { player.stamina.regenRate *= 1.25; }
    },
    {
        id: 'damage_up',
        name: 'Wrath',
        desc: '+20% attack damage',
        apply: (player) => { player.damageMultiplier += 0.2; }
    },
    {
        id: 'parry_poise',
        name: 'Deflecting Force',
        desc: 'Parries deal more poise damage',
        apply: () => {}
    },
    {
        id: 'crit_chance',
        name: 'Precision',
        desc: '15% chance for 1.5x damage',
        apply: () => {}
    },
    {
        id: 'max_hp',
        name: 'Vitality',
        desc: '+25% max HP',
        apply: (player) => {
            player.maxHp = Math.floor(player.maxHp * 1.25);
            player.hp = player.maxHp;
        }
    },
    {
        id: 'instant_flask',
        name: 'Quick Drink',
        desc: 'First flask use is 50% faster',
        apply: (player) => { player.firstFlaskFast = true; }
    },
    {
        id: 'combo_damage',
        name: 'Relentless',
        desc: 'Each hit in combo does +10% more',
        apply: (player) => { player.comboDamageBonus = true; }
    },
    {
        id: 'dodge_attack',
        name: 'Counter Strike',
        desc: 'Attacks after dodge do +30% damage for 30 frames',
        apply: (player) => { player.dodgeAttackBonus = true; }
    }
];

export function getRandomBuffs(count = 3, excludeIds = []) {
    const available = BUFF_POOL.filter(b => !excludeIds.includes(b.id));
    const selected = [];
    const pool = [...available];

    for (let i = 0; i < Math.min(count, pool.length); i++) {
        const idx = Math.floor(Math.random() * pool.length);
        selected.push(pool[idx]);
        pool.splice(idx, 1);
    }

    return selected;
}
