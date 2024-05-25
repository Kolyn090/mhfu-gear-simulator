
/**
 * Get a list of permutations of given armor combined with 
 * all possible decorations to choose from.
 * 
 * SkillPoint {
 *  name,
 *  points
 * }
 * 
 * DecoratedArmor {
 *  SkillPoint[],
 *  armor_id,
 *  decoration_id[]
 * }
 * 
 * @param {*} armor 
 * @param {*} possible_decorations 
 * @return {DecoratedArmor[]} A list of decorated armors
 */
const insert_decorations = (armor, possible_decorations) => {
    const complete_decorations = get_complete_decorations(armor, 
                                                        possible_decorations);
    const slots = armor["slots"];
    const result = [];
    let curr_slots = slots;
    for (let i = 0; i < complete_decorations.length; i++) {
        curr_slots = slots;
        const i_slots = complete_decorations[i]["slots"];
        if (curr_slots - i_slots < 0) {
            continue;
        } else if (curr_slots - i_slots === 0) {
            // all decorations used so far
            result.push(make_decorated_armor(armor, [complete_decorations[i]]));
            continue;
        } else { // curr_slots > i_slots
            curr_slots -= i_slots;
        }
        for (let j = i+1; j < complete_decorations.length; j++) {
            const j_slots = complete_decorations[j]["slots"];
            if (curr_slots - j_slots < 0) {
                continue;
            } else if (curr_slots - j_slots === 0) {
                result.push(make_decorated_armor(armor, [complete_decorations[i], 
                                                        complete_decorations[j]]));
                continue;
            } else { // curr_slots > j_slots
                curr_slots -= j_slots;
            }
            for (let k = j+1; k < complete_decorations.length; k++) {
                const k_slots = complete_decorations[k]["slots"];
                if (curr_slots - k_slots < 0) {
                    continue;
                } else if (curr_slots - k_slots === 0) {
                    result.push(make_decorated_armor(armor, [complete_decorations[i], 
                                                            complete_decorations[j],
                                                            complete_decorations[k]]));
                    continue;
                } else {
                    curr_slots -= k_slots;
                }
            }
        }
    }
    return result;
};

// Add ('armor slot' - 1) additional decorations into the possible list for
// each slot-1 decorations.
const get_complete_decorations = (armor, possible_decorations) => {
    const result = [];
    possible_decorations.forEach((decoration) => {
        if (decoration["slots"] === 1) {
            for (let i = 0; i < armor["slots"]; i++) {
                result.push(decoration);
            }
        } else {
            result.push(decoration);
        }
    });
    return result;
};

// Returns a DecoratedArmor
const make_decorated_armor = (armor, used_decorations) => {
    const skill_map = new Map();
    
    armor["skill-points"].forEach(skill_point => {
        skill_map.set(skill_point["name"], skill_point["points"]);
    });
    used_decorations.forEach(dec => {
        dec["skill-points"].forEach(skill_point => {
            if (skill_map.get(skill_point["name"]) !== undefined) {
                skill_map.set(skill_point["name"], 
                            skill_map.get(skill_point["name"]) +
                            skill_point["points"]);
            } else {
                skill_map.set(skill_point["name"], 
                            skill_point["points"]);
            }
        });
    });

    const skill_points = [];
    skill_map.forEach((val, key) => {
        skill_points.push({
            "name": key,
            "points": val
        });
    });

    return {
        "skill-points": skill_points,
        "armor-id": armor["id"],
        "decoration-ids": used_decorations.map(dec => dec["id"])
    }
};

module.exports = {
    insert_decorations: insert_decorations
};
