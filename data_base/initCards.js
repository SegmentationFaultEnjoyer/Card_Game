let Card = require('./models/card');
async function initCards() {
    await Card.setCards([{name: "smallGroot",
                    attack: 1,
                    defense: 2,
                    cost: 1,
                    ability: JSON.stringify({
                        key: 'summon',
                        value: 0,
                        spec: 'on_drop'
                    })},{
                    name: "drStrange",
                    attack: 2,
                    defense: 4,
                    cost: 2,
                    ability: JSON.stringify({
                        key: 'strike',
                        spec: 'end_turn'
                    })},{
                    name: "hulk",
                    attack: 5,
                    defense: 5,
                    cost: 4,
                    ability: JSON.stringify({
                        key: 'buff',
                        value: 2,
                        spec: 'health_depend'
                    })},
                    {name: "blackWidow",
                    attack: 3,
                    defense: 3,
                    cost: 2,
                    ability: JSON.stringify({
                        key: 'damage',
                        value: 1,
                        spec: 'on_drop'
                    })},{
                    name: "thor",
                    attack: 4,
                    defense: 4,
                    cost: 4,
                    ability: JSON.stringify({
                        key: 'damage',
                        value: 2,
                        spec: 'on_drop'
                    })},{
                    name: "loki",
                    attack: 6,
                    defense: 3,
                    cost: 3,
                    ability: JSON.stringify({
                        key: 'debuff',
                        value: 4,
                        spec: 'health_depend'
                    })},{
                    name: "tanos",
                    attack: 4,
                    defense: 6,
                    cost: 5,
                    ability: JSON.stringify({
                        key: 'destroy',
                        spec: 'on_drop'
                    })},
                    {name: "starLord",
                    attack: 1,
                    defense: 3,
                    cost: 1,
                    ability: JSON.stringify({
                        key: 'damage',
                        value: 1,
                        spec: 'on_drop'
                    })},
                    {name: "markI",
                    attack: 2,
                    defense: 4,
                    cost: 2,
                    ability: JSON.stringify({
                        key: 'damage',
                        value: 2,
                        spec: 'on_drop'
                    })},
                    {name: "captainAmerica",
                    attack: 2,
                    defense: 4,
                    cost: 2,
                    ability: JSON.stringify({
                        key: 'ignore_damage',
                        spec: 'on_drop'
                    })},
                    {name: "hulkbuster",
                    attack: 6,
                    defense: 6,
                    cost: 5,
                    ability: JSON.stringify({
                        key: 'buff',
                        value: 1,
                        spec: 'end_turn'
                    })},
                    {name: "spider-man",
                    attack: 1,
                    defense: 4,
                    cost: 2,
                    ability: JSON.stringify({
                        key: 'take_card',
                        value: 1,
                        spec: 'on_drop'
                    })},
                    {name: "scarletWitch",
                    attack: 3,
                    defense: 3,
                    cost: 4,
                    ability: JSON.stringify({
                        key: 'buff',
                        value: 3,
                        spec: 'on_drop',
                        target: 'pick',
                        stats: ['attack', 'health']
                    })},
                    {name: "cloakOfLevitation",
                    attack: 1,
                    defense: 2,
                    cost: 1,
                    ability: JSON.stringify({
                        key: 'heal',
                        value: 3,
                        spec: 'on_drop'
                    })},
                    {name: "vision",
                    attack: 2,
                    defense: 4,
                    cost: 3,
                    ability: JSON.stringify({
                        key: 'damage',
                        value: 3,
                        spec: 'on_drop'
                    })},
                    {name: "rocket",
                    attack: 4,
                    defense: 4,
                    cost: 3,
                    ability: JSON.stringify({
                        key: 'double_attack',
                        spec: 'on_drop'
                    })},
                    {name: "gamora",
                    attack: 2,
                    defense: 4,
                    cost: 3,
                    ability: JSON.stringify({
                        key: 'buff',
                        value: 2,
                        spec: 'on_drop',
                        target: 'all',
                        stats: ['attack']
                    })},
                    {name: "drax",
                    attack: 2,
                    defense: 4,
                    cost: 2,
                    ability: JSON.stringify({
                        key: 'take_card',
                        value: 0,
                        spec: 'on_drop'
                    })},
                    {name: "mantis",
                    attack: 2,
                    defense: 4,
                    cost: 2,
                    ability: JSON.stringify({
                        key: 'dissable',
                        spec: 'on_drop'
                    })},
                    {name: "nebula",
                    attack: 3,
                    defense: 4,
                    cost: 1,
                    ability: JSON.stringify({
                        key: 'summon',
                        value: 1,
                        spec: 'on_drop'
                    })},
                    {name: "ironMan",
                    attack: 4,
                    defense: 4,
                    cost: 4,
                    ability: JSON.stringify({
                        key: 'damage',
                        value: 2,
                        spec: 'on_drop'
                    })},
                    {name: "nickFury",
                    attack: 1,
                    defense: 2,
                    cost: 1,
                    ability: JSON.stringify({
                        key: 'take_card',
                        value: 1,
                        spec: 'on_drop'
                    })},
                    {name: "antMan",
                    attack: 2,
                    defense: 2,
                    cost: 1,
                    ability: JSON.stringify({
                        key: 'buff',
                        value: 2,
                        spec: 'end_turn'
                    })},
                    {name: "wasp",
                    attack: 2,
                    defense: 2,
                    cost: 1,
                    ability: JSON.stringify({
                        key: 'heal',
                        value: 2,
                        spec: 'on_drop'
                    })},
                    {name: "winterSoldier",
                    attack: 3,
                    defense: 4,
                    cost: 3,
                    ability: JSON.stringify({
                        key: 'ignore_damage',
                        spec: 'on_drop'
                    })},
                    {name: "ultron",
                    attack: 3,
                    defense: 5,
                    cost: 5,
                    ability: JSON.stringify({
                        key: 'buff',
                        value: 2,
                        spec: 'on_drop',
                        target: 'all',
                        stats: ['attack', 'health']
                    })},
                    {name: "blackPanther",
                    attack: 3,
                    defense: 4,
                    cost: 3,
                    ability: JSON.stringify({
                        key: 'strike',
                        spec: 'end_turn'
                    })},
                    {name: "goose",
                    attack: 2,
                    defense: 8,
                    cost: 5,
                    ability: JSON.stringify({
                        key: 'destroy',
                        spec: 'on_drop'
                    })}, 
                    {name: "yondu",
                    attack: 3,
                    defense: 5,
                    cost: 3,
                    ability: JSON.stringify({
                        key: 'buff',
                        value: 2,
                        spec: 'health_depend'
                    })}])

}

initCards();
module.exports = initCards;
