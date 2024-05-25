const insert_decorations = require('../src/decoration_inserter').insert_decorations;

const test_armor = {
    "id": 3852,
    "part": "gauntlet",
    "name": "White Fatalis Fist Z",
    "rare": 10,
    "price": 66666,
    "hunter-type": "G",
    "defense": 54,
    "skill-points": [
        {
            "name": "SteadyHand",
            "points": 2
        },
        {
            "name": "Fate",
            "points": -3
        },
        {
            "name": "Constitutn",
            "points": 2
        }
    ],
    "description": "",
    "slots": 3,
    "fire-res": 2,
    "thundr-res": 4,
    "dragon-res": -2,
    "water-res": 4,
    "ice-res": 3,
    "materials": [
        {
            "name": "HrdWhtFatlisHorn",
            "amount": 2
        },
        {
            "name": "HvyWhtFatalisShl",
            "amount": 1
        },
        {
            "name": "StrWhtFatalisWng",
            "amount": 3
        },
        {
            "name": "BigEDragonJewel",
            "amount": 1
        }
    ]
};

const test_decoration1 = {
    "id": 0,
    "name": "Attack Jewel",
    "rare": 4,
    "slots": 1,
    "price": 200,
    "description": "",
    "skill-points": [
        {
            "name": "Attack",
            "points": 1
        }
    ],
    "materials": [
        {
            "name": "Suiko Jewel",
            "amount": 1
        },
        {
            "name": "Power Seed",
            "amount": 1
        },
        {
            "name": "Kut-Ku Scale",
            "amount": 1
        }
    ]
};

const test_decoration2 = {
    "id": 1,
    "name": "Fierce Jewel",
    "rare": 5,
    "slots": 2,
    "price": 375,
    "description": "",
    "skill-points": [
        {
            "name": "Attack",
            "points": 3
        },
        {
            "name": "Defense",
            "points": -1
        }
    ],
    "materials": [
        {
            "name": "Akito Jewel",
            "amount": 1
        },
        {
            "name": "Fire Wyvern Claw",
            "amount": 1
        },
        {
            "name": "Demondrug",
            "amount": 2
        }
    ]
};

const test_decoration3 = {
    "id": 2,
    "name": "Strongest Jewel",
    "rare": 5,
    "slots": 3,
    "price": 375,
    "description": "",
    "skill-points": [
        {
            "name": "Attack",
            "points": 5
        },
        {
            "name": "Defense",
            "points": -1
        }
    ],
    "materials": [
        {
            "name": "LapisLazuliJewel",
            "amount": 1
        },
        {
            "name": "HrdFireWyvernClw",
            "amount": 4
        },
        {
            "name": "Mega Demondrug",
            "amount": 3
        },
        {
            "name": "Lthr Pelagus Plt",
            "amount": 2
        }
    ]
};

const expecting_points = (skill_points, skill_name, expect_val) => {
    expect(skill_points.find(skill_point => skill_point["name"] === skill_name)["points"]).toBe(expect_val);
}

it('insertes three same slot-1 decoration on a slot-3 armor', () => {
    const insert1 = insert_decorations(test_armor, [test_decoration1]);
    expect(insert1[0]["armor-id"]).toBe(3852);
    expect(insert1[0]["decoration-ids"][0]).toBe(0);
    
    const skill_points = insert1[0]["skill-points"];
    expecting_points(skill_points, "SteadyHand", 2);
    expecting_points(skill_points, "Fate", -3);
    expecting_points(skill_points, "Constitutn", 2);
    expecting_points(skill_points, "Attack", 3);
});

