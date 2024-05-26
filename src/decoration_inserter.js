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
 *  armor_id,
 *  decoration_id[]
 * }
 * 
 * @param {*} armor 
 * @param {*} possible_decorations 
 * @return {DecoratedArmor[]} A list of decorated armors
 */
const insert_decorations = (armor, possible_decorations) => {
    const slots = armor["slots"];
    const result = [];
    let curr_slots = slots;

    const push_to_result = (decorated_armor) => {
        const is_result_contain = () => {
            for (let i = 0; i < result.length; i++) {
                if (result[i]["armor-id"] === decorated_armor["armor-id"] &&
                    is_array_equal(result[i]["decoration-ids"], decorated_armor["decoration-ids"])) {
                    return true;
                }
            }
            return false;
        }
        if (!is_result_contain()) {
            result.push(decorated_armor);
        }
    };

    for (let i = 0; i < possible_decorations.length; i++) {
        curr_slots = slots;
        const i_slots = possible_decorations[i]["slots"];
        if (curr_slots - i_slots < 0) {
            continue;
        } else if (curr_slots - i_slots === 0) {
            // all decorations used so far
            push_to_result(make_decorated_armor(armor, [possible_decorations[i]]));
            continue;
        } else { // curr_slots > i_slots
            curr_slots -= i_slots;
        }
        for (let j = 0; j < possible_decorations.length; j++) {
            const j_slots = possible_decorations[j]["slots"];
            if (curr_slots - j_slots < 0) {
                continue;
            } else if (curr_slots - j_slots === 0) {
                push_to_result(make_decorated_armor(armor, [possible_decorations[i], 
                                                        possible_decorations[j]]));
                continue;
            } else { // curr_slots > j_slots
                curr_slots -= j_slots;
            }
            for (let k = 0; k < possible_decorations.length; k++) {
                const k_slots = possible_decorations[k]["slots"];
                if (curr_slots - k_slots < 0) {
                    continue;
                } else if (curr_slots - k_slots === 0) {
                    push_to_result(make_decorated_armor(armor, [possible_decorations[i], 
                                                            possible_decorations[j],
                                                            possible_decorations[k]]));
                    continue;
                    /* c8 ignore start */
                } else {
                    throw new Error("Unreachable condition: The occupied slots are greater than 3, which is impossible in this case");
                }
                /* c8 ignore end */
            }
        }
    }

    return result;
}; 

const is_array_equal= (a, b) => {
    /* c8 ignore next */
    if (a === b) return true;
    /* c8 ignore next */
    if (a === null || b === null) return false;
    if (a.length !== b.length) return false;
    const a_sort = a.sort((x, y) => x-y);
    const b_sort = b.sort((x, y) => x-y);
    return a_sort.every((val, i) => val === b_sort[i]);
}

// Returns a DecoratedArmor
const make_decorated_armor = (armor, used_decorations) => {    
    return {
        "armor-id": armor["id"],
        "decoration-ids": used_decorations.map(dec => dec["id"])
    }
};

const determine_skill_points_of = (decorated_armor, valid_armors, valid_decorations) => {
    const armor = valid_armors.find(v=>v["id"] === decorated_armor["armor-id"]);
    const used_decorations = decorated_armor["decoration-ids"].map(d=>valid_decorations.find(v=>v["id"] === d));
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

    return skill_points;
};

module.exports = {
    insert_decorations: insert_decorations,
    determine_skill_points_of: determine_skill_points_of
};
