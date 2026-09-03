export const RELICS = {
    none: {
        id: 'none',
        name: 'No Relic',
        desc: 'Fight with nothing but skill.',
        unlocked: true
    },
    heal_on_kill: {
        id: 'heal_on_kill',
        name: 'Siphon Ring',
        desc: 'Heal 20% HP on boss kill.',
        unlocked: false,
        onBossKill: (player) => {
            player.hp = Math.min(player.maxHp, player.hp + Math.floor(player.maxHp * 0.2));
        }
    },
    stamina_regen: {
        id: 'stamina_regen',
        name: 'Wind Talisman',
        desc: 'Stamina regens 20% faster.',
        unlocked: false,
        onEquip: (player) => {
            player.stamina.regenRate *= 1.2;
        }
    },
    poise_damage: {
        id: 'poise_damage',
        name: 'Hammer Sigil',
        desc: '+25% poise damage on all attacks.',
        unlocked: false
    },
    extra_flask: {
        id: 'extra_flask',
        name: 'Golden Flask',
        desc: '+1 flask charge.',
        unlocked: false,
        onEquip: (player) => {
            player.maxFlasks += 1;
            player.flasks += 1;
        }
    }
};
