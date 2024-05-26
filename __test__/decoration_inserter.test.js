const insert_decorations = require('../src/decoration_inserter').insert_decorations;

const test_armor2 = {
    "id": 3853,
    "part": "waist",
    "name": "WhiteFatalisScaleZ",
    "rare": 10,
    "price": 66666,
    "hunter-type": "G",
    "defense": 54,
    "skill-points": [
        {
            "name": "Edgemaster",
            "points": 2
        },
        {
            "name": "Rec Speed",
            "points": 4
        },
        {
            "name": "Fate",
            "points": -3
        }
    ],
    "description": "",
    "slots": 2,
    "fire-res": 0,
    "thundr-res": 2,
    "dragon-res": -5,
    "water-res": 2,
    "ice-res": 2,
    "materials": [
        {
            "name": "HvyWhtFatalisShl",
            "amount": 3
        },
        {
            "name": "ThckWhtFatlisScl",
            "amount": 2
        },
        {
            "name": "StrWhtFatalisWng",
            "amount": 1
        },
        {
            "name": "BigEDragonJewel",
            "amount": 1
        }
    ]
};

const test_armor3 = {
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
    const insert1 = insert_decorations(test_armor3, [test_decoration1]);
    expect(insert1[0]["armor-id"]).toBe(3852);
    expect(insert1[0]["decoration-ids"][0]).toBe(0);
    
    const skill_points = insert1[0]["skill-points"];
    expecting_points(skill_points, "SteadyHand", 2);
    expecting_points(skill_points, "Fate", -3);
    expecting_points(skill_points, "Constitutn", 2);
    expecting_points(skill_points, "Attack", 3);
});

it('insertes one slot-3 decoration on a slot-3 armor', () => {
    const insert3 = insert_decorations(test_armor3, [test_decoration3]);
    expect(insert3[0]["armor-id"]).toBe(3852);
    expect(insert3[0]["decoration-ids"][0]).toBe(2);
    
    const skill_points = insert3[0]["skill-points"];
    expecting_points(skill_points, "SteadyHand", 2);
    expecting_points(skill_points, "Fate", -3);
    expecting_points(skill_points, "Constitutn", 2);
    expecting_points(skill_points, "Attack", 5);
});

it('insertes one slot-1 and one slot-2 decorations on a slot-3 armor', () => {
    const insert12 = insert_decorations(test_armor3, [test_decoration1, test_decoration2]);
    expect(insert12[0]["armor-id"]).toBe(3852);

    const dec_ids = insert12[0]["decoration-ids"];
    const slot2_and_slot1 = 
        dec_ids.length === 2 &&
        ((dec_ids[0] === 0 && dec_ids[1] === 1) ||
        (dec_ids[0] === 1 && dec_ids[1] === 0));
    const three_slot1 = 
        dec_ids.length === 3 &&
        dec_ids[0] === 0 && 
        dec_ids[1] === 0 && 
        dec_ids[2] === 0;
    expect(slot2_and_slot1 || three_slot1).toBe(true);
});

it('cannot insert a slot-3 decoration on a slot-2 armor', () => {
    const insert3 = insert_decorations(test_armor2, [test_decoration3]);
    expect(insert3.length).toBe(0);
});
