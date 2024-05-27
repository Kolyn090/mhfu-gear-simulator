const getter = require('./src/getter');
const get_valid_armors = getter.get_valid_armors;
const get_valid_decorations = getter.get_valid_decorations;
const get_required_skills = getter.get_required_skills;
const discard_outclassed_armors = getter.discard_outclassed_armors;
const discard_outclassed_armors_complete = getter.discard_outclassed_armors_complete;
const insert_decorations = require('./src/decoration_inserter').insert_decorations;
const get_decorated_equipment_complete = require('./src/equipment_processor').get_decorated_equipment_complete;
const categorize_equipment_complete = require('./src/equipment_processor').categorize_equipment_complete;


const get_data = (skill_names, armor_filter, weapon_slots) => {
    const required_skills = get_required_skills(skill_names);
    const valid_armors = armor_filter(get_valid_armors(required_skills));
    const valid_decorations = get_valid_decorations(required_skills);
    const optimal_armors = discard_outclassed_armors(valid_armors, required_skills);
    const decorated_armors = optimal_armors.map(armor => insert_decorations(armor, valid_decorations)).flat();
    const weapon = {
        "id": -1,
        "name": "Weapon",
        "slots": weapon_slots,
        "skill-points": []
    };
    const decorated_weapon = insert_decorations(weapon, valid_decorations);
    const decorated_armors_complete = decorated_armors.map((a, i) => {
        const result = get_decorated_equipment_complete(a, valid_armors, valid_decorations);
        result["id"] = i;
        return result;
    });
    const optimal_dec_armors = discard_outclassed_armors_complete(decorated_armors_complete, required_skills);
    const decorated_weapon_complete = decorated_weapon.map(w => get_decorated_equipment_complete(w, [weapon], valid_decorations));
    const parts = categorize_equipment_complete(optimal_dec_armors);
    const result = [];
    result.push(required_skills);
    result.push(decorated_weapon_complete);
    result.push(parts);

    print_decorated_armors_to_output(optimal_dec_armors);

    return result;
};

const print_decorated_armors_to_output = (dec_armors) => {
    require('fs').writeFileSync('./output.json', JSON.stringify(dec_armors.map(a=>{
        return {
            "armor": a["equipment"]["name"],
            "part": a["equipment"]["part"],
            "decorations": a["decorations-name"]
        }
    }), null, '    '));
};

const print_result = (helmet, plate, gauntlet, waist, legging, weapon) => {
    const get_total_points = (gear) => {
        const result = {};
        for (let i = 0; i < gear.length; i++) {
            const skill_points = gear[i]["skill-points"];
            skill_points.map(skill_point => {
                if (result[skill_point["name"]] !== undefined)
                    result[skill_point["name"]] += skill_point["points"];
                else 
                result[skill_point["name"]] = skill_point["points"];
            });
        }
        return result;
    };
    
    console.log(helmet["equipment"]["name"] + ", ", 
                plate["equipment"]["name"] + ", ", 
                gauntlet["equipment"]["name"] + ", ", 
                waist["equipment"]["name"] + ", ", 
                legging["equipment"]["name"]);
    console.log("\n helmet: \t", helmet["decorations-name"], "\n",
                "plate: \t", plate["decorations-name"], "\n",
                "gauntlet: \t", gauntlet["decorations-name"], "\n",
                "waist: \t", waist["decorations-name"], "\n",
                "legging: \t", legging["decorations-name"], "\n",
                "weapon: \t", weapon["decorations-name"], "\n");
    
    console.log(get_total_points([helmet, plate, gauntlet, waist, legging, weapon]));
};

const brute_force = (skill_names, armor_filter, weapon_slots) => {
    const data = get_data(skill_names, armor_filter, weapon_slots);
    const required_skills = data[0];
    const decorated_weapon_complete = data[1];
    const parts = data[2];

    const is_gear_satisfy_requirement = (gear, required_skills) => {
        const temp = {};
        required_skills.map(required_skill => {
            temp[required_skill["skill-point"]] = required_skill["points"];
        });
    
        for (let i = 0; i < gear.length; i++) {
            const skill_points = gear[i]["skill-points"];
            skill_points.map(skill_point => {
                if (temp[skill_point["name"]] !== undefined)
                    temp[skill_point["name"]] -= skill_point["points"];
            });
        }
        return Object.values(temp).every(v => v <= 0);
    };

    for (helmet of parts["helmet"]) {
        for (plate of parts["plate"]) {
            for (gauntlet of parts["gauntlet"]) {
                for (waist of parts["waist"]) {
                    for (legging of parts["legging"]) {
                        for (m_weapon of decorated_weapon_complete) {
                            if (is_gear_satisfy_requirement([helmet, plate, gauntlet, waist, legging, m_weapon], 
                                required_skills)) {
                                print_result(helmet, plate, gauntlet, waist, legging, m_weapon);
                                return;
                            }
                        }
                    }
                }
            }
        }
    }
};

const optimized = (skill_names, armor_filter, weapon_slots) => {
    const data = get_data(skill_names, armor_filter, weapon_slots);
    const required_skills = data[0];
    const decorated_weapon_complete = data[1];
    const parts = data[2];

    const get_skill_points_so_far = (prev, armor, required_skills) => {
        const result = {};
        Object.assign(result, prev);
        armor["skill-points"].map(skill_point => {
            if (required_skills.find(required_skill => required_skill["skill-point"] === skill_point["name"])) {
                if (result[skill_point["name"]] !== undefined) {
                    result[skill_point["name"]] += skill_point["points"];
                }
                else {
                    result[skill_point["name"]] = skill_point["points"];
                }
            }
        });
        return result;
    }

    const is_gear_satisfy_requirement = (so_far, required_skills) => {
        return required_skills.every(required_skill => {
            return Object.keys(so_far).some(skill_name => {
                if (required_skill["skill-point"] === skill_name) {
                    if (required_skill["points"] > 0) {
                        return so_far[skill_name] >= required_skill["points"];
                    } else {
                        return so_far[skill_name] <= required_skill["points"];
                    }
                }
                else {
                    return false;
                }
            });
        });
    };

    for (helmet of parts["helmet"]) {
        const so_far0 = get_skill_points_so_far({}, helmet, required_skills);
        for (plate of parts["plate"]) {
            const so_far1 = get_skill_points_so_far(so_far0, plate, required_skills);
            for (gauntlet of parts["gauntlet"]) {
                const so_far2 = get_skill_points_so_far(so_far1, gauntlet, required_skills);
                for (waist of parts["waist"]) {
                    const so_far3 = get_skill_points_so_far(so_far2, waist, required_skills);
                    for (legging of parts["legging"]) {
                        const so_far4 = get_skill_points_so_far(so_far3, legging, required_skills);
                        for (m_weapon of decorated_weapon_complete) {
                            const so_far5 = get_skill_points_so_far(so_far4, m_weapon, required_skills);
                            if (is_gear_satisfy_requirement(so_far5, required_skills)) {
                                print_result(helmet, plate, gauntlet, waist, legging, m_weapon);
                                return;
                            }
                        }
                    }
                }
            }
        }
    }
};

const skill_names = ["Defense -40", "Sharpening Skl Inc", "Flute Expert"];
const filter = (armor) => armor.filter(a=>a["hunter-type"] !== "G").filter(a=>a["rare"]>=5);
const weapon_slots = 1;

// console.time("Brute Force");
// brute_force(skill_names, filter, weapon_slots);
// console.timeEnd("Brute Force");

console.time('Optimized');
optimized(skill_names, filter, weapon_slots);
console.timeEnd('Optimized');
