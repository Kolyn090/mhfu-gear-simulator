/**
 * Get a list of permutations of given equipment combined with 
 * all possible decorations to choose from.
 * 
 * SkillPoint {
 *  name,
 *  points
 * }
 * 
 * DecoratedEquipment {
 *  SkillPoint[]
 *  equipment,
 *  decoration[]
 * }
 * 
 * @param {*} equipment 
 * @param {*} possible_decorations 
 * @return {DecoratedEquipment[]} A list of decorated equipments
 */
const insert_decorations = (equipment, possible_decorations) => {
    const slots = equipment["slots"];
    const result = [];
    let curr_slots = slots;

    const is_list_equal = (a, b) => {
        /* c8 ignore next */
        if (a === b) return true;
        /* c8 ignore next */
        if (a === null || b === null) return false;
        if (a.length !== b.length) return false;
        const a_sort = a.sort((x, y) => x-y);
        const b_sort = b.sort((x, y) => x-y);
        return a_sort.every((val, i) => val === b_sort[i]);
    };

    const push_to_result = (decorated_equipment) => {
        const is_result_contain = () => {
            for (let i = 0; i < result.length; i++) {
                if (result[i]["equipment-id"] === decorated_equipment["equipment-id"] &&
                    is_list_equal(result[i]["decorations"]["id"], decorated_equipment["decorations"]["id"])) {
                    return true;
                }
            }
            return false;
        }
        if (!is_result_contain()) {
            result.push(decorated_equipment);
        }
    };

    for (let i = 0; i < possible_decorations.length; i++) {
        curr_slots = slots;
        const i_slots = possible_decorations[i]["slots"];
        if (curr_slots - i_slots < 0) {
            continue;
        } else if (curr_slots - i_slots === 0) {
            // all decorations used so far
            push_to_result(make_decorated_equipment(equipment, [possible_decorations[i]]));
            continue;
        } else { // curr_slots > i_slots
            curr_slots -= i_slots;
        }
        for (let j = 0; j < possible_decorations.length; j++) {
            const j_slots = possible_decorations[j]["slots"];
            if (curr_slots - j_slots < 0) {
                continue;
            } else if (curr_slots - j_slots === 0) {
                push_to_result(make_decorated_equipment(equipment, [possible_decorations[i], 
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
                    push_to_result(make_decorated_equipment(equipment, [possible_decorations[i], 
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

/**
 * Decorate an equipment. In the end returns a new object
 * consists of 
 * 1. the total skill points of the equipment after decoration, 
 * 2. the id of the equipment, 
 * 3. all id for the used decorations.
 * 
 * @param {*} equipment The equipment to be decorated
 * @param {*} used_decorations The decorations to be used
 * @returns The given equipment with given decorations
 */
const make_decorated_equipment = (equipment, used_decorations) => {  
    const skill_map = new Map();

    equipment["skill-points"].forEach(skill_point => {
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
        "equipment": {
            "name": equipment["name"],
            "id": equipment["id"],
            "part": equipment["part"]
        },
        "decorations": {
            "id": used_decorations.map(dec => dec["id"]),
            "name": used_decorations.map(dec => dec["name"])
        }
    }
};

module.exports = {
    insert_decorations: insert_decorations,
};
