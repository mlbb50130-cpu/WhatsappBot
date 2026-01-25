// Mobile Legends: Bang Bang Database
// Données complètes: Héros, Builds, Counters, Combos, Meta, Lanes

module.exports = {
  // HÉROS MLBB
  heroes: {
    aamon: {
      name: 'Aamon',
      role: 'Assassin',
      specialty: 'Burst/Chase',
      difficulty: 'Medium',
      skills: {
        passive: 'Aamon\'s presence reduces enemy vision in bushes',
        skill1: 'Ambush - Dash to target, dealing damage',
        skill2: 'Blade Mark - Mark enemy, deal continuous damage',
        ultimate: 'Massacre - Multi-dash attack, high burst damage'
      },
      weakness: ['CC Control', 'Early game pressure'],
      strength: ['Late game', 'Mobility', 'Solo kills']
    },
    ling: {
      name: 'Ling',
      role: 'Assassin',
      specialty: 'Mobility/Chase',
      difficulty: 'Hard',
      skills: {
        passive: 'Wall Jump - Can dash on walls',
        skill1: 'Sonic Blade - Ranged dash attack',
        skill2: 'Shadow Werewolf - Transform for enhanced mobility',
        ultimate: 'Tempest Slash - AOE burst damage'
      },
      weakness: ['Flat terrain limitations', 'Setup time'],
      strength: ['Wall map control', 'Chase potential', 'Rotation speed']
    },
    gusion: {
      name: 'Gusion',
      role: 'Assassin',
      specialty: 'Burst Damage',
      difficulty: 'Hard',
      skills: {
        passive: 'Blade Abyss - Knives return and reset cooldowns',
        skill1: 'Sword Wave - Ranged slash',
        skill2: 'Dagger Throw - Multi-target knives',
        ultimate: 'Shadowblade Slash - Massive burst with reset potential'
      },
      weakness: ['High skill cap', 'Mana dependent'],
      strength: ['Mechanics potential', 'Burst damage', 'Resets']
    },
    chou: {
      name: 'Chou',
      role: 'Fighter',
      specialty: 'Control/Initiation',
      difficulty: 'High',
      skills: {
        passive: 'Kick Strike - Charged attacks',
        skill1: 'Jeet Kune Do - Dash strike',
        skill2: 'Shunpo - Gap close with damage',
        ultimate: 'The Way of the Dragon - Knockback and chase'
      },
      weakness: ['Early game weakness', 'Cooldown dependent'],
      strength: ['Team fight control', 'Initiation', 'Versatility']
    },
    fanny: {
      name: 'Fanny',
      role: 'Assassin',
      specialty: 'High Mobility',
      difficulty: 'Very Hard',
      skills: {
        passive: 'Cable Skill - Use cables for mobility',
        skill1: 'Claw - Cable attack',
        skill2: 'Kick - Damage and slow',
        ultimate: 'Cut Ties - Max cable damage'
      },
      weakness: ['Steep learning curve', 'No cables = stuck'],
      strength: ['Map control', 'Rotation', 'High skill ceiling']
    },
    kagura: {
      name: 'Kagura',
      role: 'Mage',
      specialty: 'Control/Burst',
      difficulty: 'Very Hard',
      skills: {
        passive: 'Seimei Umbrella - Umbrella placement mechanic',
        skill1: 'Seimei Umbrella - Dash and control',
        skill2: 'Ofuda Spell - Ranged damage',
        ultimate: 'Higanbana - Large AOE control'
      },
      weakness: ['Complex mechanics', 'Mana gated'],
      strength: ['Team fight control', 'Playmaking', 'Zoning']
    },
    lancelot: {
      name: 'Lancelot',
      role: 'Assassin',
      specialty: 'Burst/Mobility',
      difficulty: 'High',
      skills: {
        passive: 'Thrust - Bonus damage on consecutive hits',
        skill1: 'Puncture - Dash with damage',
        skill2: 'Thorns Attack - Spinning attack',
        ultimate: 'Rhapsody Thrust - Multi-hit burst'
      },
      weakness: ['Cooldown reliant', 'Positional play'],
      strength: ['Dueling', 'Quick rotations', 'Burst potential']
    },
    esmeralda: {
      name: 'Esmeralda',
      role: 'Tank/Fighter',
      specialty: 'Defense/Control',
      difficulty: 'Medium',
      skills: {
        passive: 'Barrier Link - Shield sharing',
        skill1: 'Stun Strike - Knockback and stun',
        skill2: 'Barrier Shield - Defensive buff',
        ultimate: 'Petrification Beam - AOE control'
      },
      weakness: ['Early game pressure', 'Gold reliant'],
      strength: ['Teamfight survival', 'CC resistance', 'Support potential']
    }
  },

  // BUILDS RECOMMANDÉS
  builds: {
    assassin_burst: {
      name: 'Assassin Burst Build',
      items: [
        'Warrior Boots / Tough Boots',
        'Bloodlust Axe',
        'Malefic Roar',
        'Divine Glaive',
        'Endless Battle / Demon Hunter Sword',
        'Blade of Despair'
      ],
      advantages: ['High burst damage', 'Quick elimination'],
      disadvantages: ['Low survivability', 'Needs skill']
    },
    assassin_sustain: {
      name: 'Sustain Assassin Build',
      items: [
        'Warrior Boots',
        'Bloodlust Axe',
        'Demon Hunter Sword',
        'Endless Battle',
        'Blade of Despair',
        'Immortality'
      ],
      advantages: ['Better survivability', 'Extended fights'],
      disadvantages: ['Less burst potential']
    },
    fighter_tank: {
      name: 'Fighter Tank Build',
      items: [
        'Warrior Boots / Tough Boots',
        'Bloodlust Axe',
        'Brute Force Breastplate',
        'Twilight Armor',
        'Blade of Despair',
        'Immortality'
      ],
      advantages: ['High tankiness', 'CC reduction'],
      disadvantages: ['Lower damage output']
    },
    mage_burst: {
      name: 'Mage Burst Build',
      items: [
        'Arcane Boots',
        'Concentrated Energy',
        'Holy Crystal',
        'Divine Glaive',
        'Ancient Glorified Gem',
        'Glowing Wand'
      ],
      advantages: ['High magic damage', 'Mana efficient'],
      disadvantages: ['Squishy', 'Needs positioning']
    },
    tank_support: {
      name: 'Tank Support Build',
      items: [
        'Tough Boots',
        'Brute Force Breastplate',
        'Antique Cuirass',
        'Athena\'s Shield',
        'Oracle / Dominance Ice',
        'Immortality'
      ],
      advantages: ['High team utility', 'CC reduction'],
      disadvantages: ['Low damage']
    }
  },

  // COUNTERS
  counters: {
    aamon: {
      hero: 'Aamon',
      counters: [
        { name: 'Ruby', reason: 'High CC, tankiness absorbs burst' },
        { name: 'Baxia', reason: 'Anti-dashes, high armor' },
        { name: 'Kaja', reason: 'Suppression ultimate, purge CC' },
        { name: 'Eudora', reason: 'Long range stun, burst damage' },
        { name: 'Lolita', reason: 'Reflect damage, CC immunity' }
      ]
    },
    ling: {
      hero: 'Ling',
      counters: [
        { name: 'Khufra', reason: 'Bounce to wall, CC control' },
        { name: 'Jawhead', reason: 'Throw ability interrupts mobility' },
        { name: 'Chou', reason: 'Can interrupt wall jumps' },
        { name: 'Kaja', reason: 'Grab ability prevents escapes' },
        { name: 'Barats', reason: 'Wide AOE, tank durability' }
      ]
    },
    gusion: {
      hero: 'Gusion',
      counters: [
        { name: 'Diggie', reason: 'Immunity frames, revive potential' },
        { name: 'Mathilda', reason: 'Long range, knock airborne' },
        { name: 'Natan', reason: 'Evasion, burst defense' },
        { name: 'Minotaur', reason: 'High tankiness, CC spam' },
        { name: 'Lolita', reason: 'Shield reflect, crowd control' }
      ]
    },
    chou: {
      hero: 'Chou',
      counters: [
        { name: 'Eudora', reason: 'Fast stun chain' },
        { name: 'Vale', reason: 'Ranged control, wind prison' },
        { name: 'Mathilda', reason: 'Superior range and mobility' },
        { name: 'Pharsa', reason: 'Airborne advantage, flying kicks' },
        { name: 'Valir', reason: 'Area control, burn damage' }
      ]
    }
  },

  // COMBOS HÉROS
  combos: {
    gusion: {
      hero: 'Gusion',
      combos: [
        {
          name: 'Full Burst Combo',
          sequence: 'Skill2 (Throw) → Ultimate → Skill1 (Wave) → Auto attacks',
          damage: 'Very High',
          difficulty: 'Hard'
        },
        {
          name: 'Quick Kill Combo',
          sequence: 'Skill1 → Ultimate → Skill2 → Auto',
          damage: 'High',
          difficulty: 'Medium'
        },
        {
          name: 'Chase Combo',
          sequence: 'Ultimate → Skill1 → Skill2 for reset',
          damage: 'Medium-High',
          difficulty: 'Hard'
        }
      ]
    },
    ling: {
      hero: 'Ling',
      combos: [
        {
          name: 'Wall Rotation',
          sequence: 'Wall Jump → Skill1 → Auto → Skill2 → Ultimate',
          damage: 'High',
          difficulty: 'Very Hard'
        },
        {
          name: 'Quick Chase',
          sequence: 'Skill1 → Skill2 (Transform) → Auto attacks',
          damage: 'Medium',
          difficulty: 'Medium'
        }
      ]
    },
    chou: {
      hero: 'Chou',
      combos: [
        {
          name: 'CC Chain',
          sequence: 'Skill1 → Skill2 → Ultimate (kick away)',
          damage: 'Medium-High',
          difficulty: 'Hard'
        },
        {
          name: 'Engage Combo',
          sequence: 'Ultimate → Skill1 → Skill2 → Auto attacks',
          damage: 'High',
          difficulty: 'Medium'
        }
      ]
    }
  },

  // META ACTUELLE
  meta: {
    tier: {
      S: ['Natan', 'Hilda', 'Mathilda', 'Ling', 'Kagura'],
      A: ['Aamon', 'Chou', 'Esmeralda', 'Gusion', 'Vale'],
      B: ['Lancelot', 'Fanny', 'Kaja', 'Johnson', 'Badang'],
      C: ['Older heroes need adjustments']
    },
    trends: {
      'Gold Lane': ['Hilda', 'Natan', 'Esmeralda'],
      'Mid Lane': ['Kagura', 'Vale', 'Yve'],
      'EXP Lane': ['Chou', 'Aamon', 'Lancelot'],
      'Roam': ['Mathilda', 'Kaja', 'Lolita'],
      'Carry': ['Natan', 'Ling', 'Gusion']
    },
    notes: 'Meta shifts with balance patches. Focus on champions you master.'
  },

  // LANES
  lanes: {
    gold: {
      name: 'Gold Lane (Exp Lane Hybrid)',
      role: 'Fighter/Mage with sustain',
      champions: ['Hilda', 'Natan', 'Esmeralda', 'Roger', 'Fredrinn'],
      objectives: 'Farm, 1v1 dominance, rotate for teamfights',
      tips: ['High CS priority', 'Trading combos', 'Map awareness']
    },
    mid: {
      name: 'Mid Lane',
      role: 'Mage/Burst Damage',
      champions: ['Kagura', 'Vale', 'Yve', 'Zhask', 'Lunox'],
      objectives: 'Magic damage, crowd control, team fight initiation',
      tips: ['Vision control', 'Roam with jungler', 'Mana management']
    },
    exp: {
      name: 'EXP Lane (Jungle)',
      role: 'Assassin/Jungler',
      champions: ['Chou', 'Aamon', 'Lancelot', 'Ling', 'Gusion'],
      objectives: 'Ganks, rotations, objective control',
      tips: ['Healthy pathing', 'Timing ganks', 'Vision denial']
    },
    roam: {
      name: 'Roam Support',
      role: 'Tank/Support',
      champions: ['Mathilda', 'Kaja', 'Lolita', 'Diggie', 'Minotaur'],
      objectives: 'CC, protection, vision, playmaking',
      tips: ['Map control', 'Warding', 'Team positioning']
    },
    carry: {
      name: 'Carry (Core Lane)',
      role: 'Marksman/ADC equivalent',
      champions: ['Natan', 'Ling', 'Gusion', 'Estes (mage carry)'],
      objectives: 'Farm safely, scale into late game',
      tips: ['Positioning', 'Last hitting', 'Teamfight positioning']
    }
  },

  // SALAIRES/RANGS
  ranks: [
    'Warrior',
    'Elite',
    'Master',
    'Grandmaster',
    'Epic',
    'Legend',
    'Mythic',
    'Mythic Honor'
  ],

  // RÔLES
  roles: [
    'Assassin',
    'Fighter',
    'Mage',
    'Marksman',
    'Tank',
    'Support'
  ]
};
