const getter = require('./src/getter');
const get_valid_armors = getter.get_valid_armors;
const get_valid_decorations = getter.get_valid_decorations;
const get_required_skills = getter.get_required_skills;
const discard_outclassed_armors = getter.discard_outclassed_armors;
const discard_outclassed_decorated_armors = getter.discard_outclassed_decorated_armors;
const insert_decorations = require('./src/decoration_inserter').insert_decorations;
const categorize_decorated_equipments = require('./src/equipment_processor').categorize_decorated_equipments;

/**
 * Get all necessary structured data to perform gear simulation.
 * 
 * @param {string[]} skill_names A list of required skill's names
 * @param {Func} armor_filter A filter for armor, can be specific via a closure
 * @param {int} weapon_slots How many slots should the weapon have?
 * @returns {object[]} All necessary structured data to perform gear simulation.
 */
const get_data = (skill_names, armor_filter, weapon_slots) => {
    const required_skills = get_required_skills(skill_names);
    const valid_armors = armor_filter(get_valid_armors(required_skills));
    const valid_decorations = get_valid_decorations(required_skills);
    const optimal_armors = discard_outclassed_armors(valid_armors, required_skills);
    const decorated_armors = optimal_armors.map(armor => insert_decorations(armor, valid_decorations))
                                            .flat()
                                            .map((a, i) => { a["id"] = i; return a; });
    const weapon = {
        "id": -1,
        "name": "Weapon",
        "slots": weapon_slots,
        "skill-points": []
    };
    const decorated_weapon = insert_decorations(weapon, valid_decorations);
    const optimal_decorated_armors = discard_outclassed_decorated_armors(decorated_armors, required_skills);
    const parts = categorize_decorated_equipments(optimal_decorated_armors);
    const result = [];
    result.push(required_skills);
    result.push(decorated_weapon);
    result.push(parts);

    print_decorated_armors_to_output(optimal_decorated_armors);

    return result;
};

/**
 * Print all decorated armors to a file called output.json for debug purpose.
 * 
 * @param {DecoratedEquipment[]} dec_armors A list of decorated armors;
 */
const print_decorated_armors_to_output = (dec_armors) => {
    require('fs').writeFileSync('./output.json', JSON.stringify(dec_armors.map(a=>{
        return {
            "armor": a["equipment"]["name"],
            "part": a["equipment"]["part"],
            "decorations": a["decorations"]["name"]
        }
    }), null, '    '));
};

/**
 * Print the found result by the simulator to console.
 * 
 * @param {Equipment} helmet The helmet
 * @param {Equipment} plate The plate
 * @param {Equipment} gauntlet The gauntlet
 * @param {Equipment} waist The waist
 * @param {Equipment} legging The legging
 * @param {Equipment} weapon The weapon
 */
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
    console.log("\n helmet: \t", helmet["decorations"]["name"], "\n",
                "plate: \t", plate["decorations"]["name"], "\n",
                "gauntlet: \t", gauntlet["decorations"]["name"], "\n",
                "waist: \t", waist["decorations"]["name"], "\n",
                "legging: \t", legging["decorations"]["name"], "\n",
                "weapon: \t", weapon["decorations"]["name"], "\n");

    console.log(get_total_points([helmet, plate, gauntlet, waist, legging, weapon]));
};

/**
 * Attempt to find solution by brute force, and print if it finds one.
 * 
 * @param {string[]} skill_names A list of required skill's names
 * @param {Func} armor_filter A filter for armor, can be specific via a closure
 * @param {int} weapon_slots How many slots should the weapon have?
 */
const brute_force = (skill_names, armor_filter, weapon_slots) => {
    const data = get_data(skill_names, armor_filter, weapon_slots);
    const required_skills = data[0];
    const decorated_weapon = data[1];
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
                        for (m_weapon of decorated_weapon) {
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

/**
 * Attempt to find solution in an optimized manner, and print if it finds one.
 * 
 * @param {string[]} skill_names A list of required skill's names
 * @param {Func} armor_filter A filter for armor, can be specific via a closure
 * @param {int} weapon_slots How many slots should the weapon have?
 */
const optimized_brute_force = (skill_names, armor_filter, weapon_slots) => {
    const data = get_data(skill_names, armor_filter, weapon_slots);
    const required_skills = data[0];
    const decorated_weapon = data[1];
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
                        for (m_weapon of decorated_weapon) {
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
optimized_brute_force(skill_names, filter, weapon_slots);
console.timeEnd('Optimized');
