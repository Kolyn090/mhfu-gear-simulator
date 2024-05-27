const getter = require('./src/getter');
const get_valid_armors = getter.get_valid_armors;
const get_valid_decorations = getter.get_valid_decorations;
const get_required_skills = getter.get_required_skills;
const discard_outclassed_armors = getter.discard_outclassed_armors;
const discard_outclassed_armors_complete = getter.discard_outclassed_armors_complete;
const insert_decorations = require('./src/decoration_inserter').insert_decorations;
const get_decorated_armor_complete = require('./src/armor_processor').get_decorated_armor_complete;
const categorize_armor_complete = require('./src/armor_processor').categorize_armor_complete;
const determine_skill_points_of_complete = require('./src/armor_processor').determine_skill_points_of_complete;


const brute_force = () => {
    const skill_names = ["Sharpness +1", "Reckless Abandon +3", "Sharp Sword"];
    const required_skills = get_required_skills(skill_names);
    const valid_armors = get_valid_armors(required_skills).filter(a=>a["hunter-type"] !== "G");
    const valid_decorations = get_valid_decorations(required_skills);
    const optimal_armors = discard_outclassed_armors(valid_armors, required_skills);
    const decorated_armors = optimal_armors.map(armor => insert_decorations(armor, valid_decorations)).flat();
    const weapon = {
        "id": 432,
        "name": "Weapon",
        "slots": 1,
        "skill-points": []
    };
    const decorated_weapon = insert_decorations(weapon, valid_decorations);
    const decorated_armors_complete = decorated_armors.map((a, i) => {
        const result = get_decorated_armor_complete(a, valid_armors, valid_decorations);
        result["id"] = i;
        return result;
    });
    const optimal_dec_armors = discard_outclassed_armors_complete(decorated_armors_complete, required_skills);
    // console.log(decorated_armors_complete.length);
    // console.log(optimal_dec_armors.length);
    const decorated_weapon_complete = decorated_weapon.map(w => get_decorated_armor_complete(w, [weapon], valid_decorations));
    const parts = categorize_armor_complete(optimal_dec_armors);

    const is_gear_satisfy_requirement = (gear, required_skills) => {
        const total_points = get_total_points(gear);
        return required_skills.every(skill => {
            const from_total = total_points.find(x => x["name"] === skill["skill-point"]);
            if (from_total === undefined) 
            {
                // console.log(skill["name"]);
                // console.log("You have: " + 0);
                // console.log("Requires: " + skill["points"]);
                return false
            };
            const from_total_points = from_total["points"];
            const required_points = skill["points"];
            // console.log(skill["name"]);
            // console.log("You have: " + from_total_points);
            // console.log("Requires: " + required_points);
            if (from_total_points >= required_points) return true;
            return false;
        });
    };

    const get_total_points = (gear) => {
        const skill_map = new Map();
        for (let i = 0; i < gear.length; i++) {
            const skill_points = determine_skill_points_of_complete(gear[i], valid_armors, valid_decorations);
            skill_points.map(skill_point => {
                if (skill_map.has(skill_point["name"])) {
                    skill_map.set(skill_point["name"], skill_map.get(skill_point["name"])+ skill_point["points"]);
                } else {
                    skill_map.set(skill_point["name"], skill_point["points"]);
                }
            });
        }
        const result = [];
        for ([key, val] of skill_map.entries()) {
            result.push({
                "name": key,
                "points": val
            });
        }
        return result;
    };

    for (helmet of parts["helmet"]) {
        for (plate of parts["plate"]) {
            for (gauntlet of parts["gauntlet"]) {
                for (waist of parts["waist"]) {
                    for (legging of parts["legging"]) {
                        for (m_weapon of decorated_weapon_complete) {
                            if (is_gear_satisfy_requirement([helmet, plate, gauntlet, waist, legging, m_weapon], required_skills)) {
                                console.log(helmet["armor"]["name"] + ", ", 
                                            plate["armor"]["name"] + ", ", 
                                            gauntlet["armor"]["name"] + ", ", 
                                            waist["armor"]["name"] + ", ", 
                                            legging["armor"]["name"]);
                                console.log("helmet: ", helmet["decorations"],
                                            "plate: ", plate["decorations"],
                                            "gauntlet: ", gauntlet["decorations"],
                                            "waist: ", waist["decorations"],
                                            "legging: ", legging["decorations"],
                                            "weapon: ", m_weapon["decorations"]);
                                console.log(get_total_points([helmet, plate, gauntlet, waist, legging, m_weapon]))
                                return;
                            }
                        }
                    }
                }
            }
        }
    }
};

brute_force();
