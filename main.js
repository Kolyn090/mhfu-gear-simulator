const db = require("./read-db");

/**
 * Perform a search in the entire armor database. Find
 * armor parts with relevant skill points. An armor is
 * valid even if only one point is found. Points can be
 * gained by matching the skill name and required skill
 * point. If the required point is negative, for it to
 * be valid, the armor should have negative points on
 * that skill as well, otherwise it would need other 
 * matching skill points to be considered valid. That
 * goes the same with positive skill points.
 * 
 * @param {Skill[]} required_skills A list of required skills
 * @return {Armor[]} A list of armors with valid skills points
 */
const get_valid_armors = (required_skills) => {
    // need to filter blademaster/gunner as well
    return db.ARMORS.filter(a => {
        return a["skill-points"].some(skill_point => {
            return required_skills.some(required_skill => {
                return skill_point["name"] === required_skill["skill-point"] && 
                    ((skill_point["points"] > 0 && required_skill["points"] > 0) ||
                    (skill_point["points"] < 0 && required_skill["points"] < 0));
            });
        });
    });
};

/**
 * Perform a search in the entire decoration database. 
 * Find decorations with relevant skill points. A 
 * decoration is valid even if only one point is found. 
 * Points can be gained by matching the skill name and 
 * required skill point. If the required point is 
 * negative, for it to be valid, the armor should have 
 * negative points on that skill as well, otherwise it 
 * would need other matching skill points to be considered 
 * valid. That goes the same with positive skill points.
 * 
 * @param {Skill[]} required_skills A list of required skills
 * @return {Decoration[]} A list of decorations with valid skills points
 */
const get_valid_decorations = (required_skills) => {
    return db.DECORATIONS.filter(a => {
        return a["skill-points"].some(skill_point => {
            return required_skills.some(required_skill => {
                return skill_point["name"] === required_skill["skill-point"] && 
                    ((skill_point["points"] > 0 && required_skill["points"] > 0) ||
                    (skill_point["points"] < 0 && required_skill["points"] < 0));
            });
        });
    });
}

/**
 * Convert a list of skill names into Skill objects.
 * 
 * @param {string[]} required_skill_names A list of names of required skills
 * @return {Skill[]} Converted list of required skills
 */
const get_required_skills = (required_skill_names) => {
    return db.SKILLS.filter(s => {
        return required_skill_names.some(req => {
            return req === s["name"];
        });
    });
};

/**
 * Filter a list of armors so that for every armor, 
 * its required skill points would not be outclassed
 * by other armors in the list. Outclassed means that
 * every required skill points has been surpassed by
 * another armor in the same & its slot number is less
 * than its competitor. An armor won't be outclassed
 * by armors from other parts.
 * 
 * @param {Armor[]} valid_armors A list of valid armors
 * @param {Skill[]} required_skills A list of required skills
 * @return {Armor[]} The armors not being outclassed by other armors in the same list
 */
const discard_outclassed_armors = (valid_armors, required_skills) => {
    return valid_armors.filter(curr => {
        return !valid_armors.some(competitor => {
            // Don't compare itself
            if (curr["id"] === competitor["id"]) return false;
            if (curr["part"] !== competitor["part"]) return false;
            // Check if the competitor will 'win'
            return required_skills.every(required_skill => {
                const curr_point_for_skill = curr["skill-points"]
                    .find(skill_point => skill_point["name"] === required_skill["skill-point"])["points"];
                const competitor_point_for_skill = competitor["skill-points"]
                    .find(skill_point => skill_point["name"] === required_skill["skill-point"])["points"];
                
                return required_skill["points"] > 0 ? 
                    curr_point_for_skill <= competitor_point_for_skill : 
                    curr_point_for_skill > competitor_point_for_skill;
            }) && curr["slots"] <= competitor["slots"];
        });
    });
}

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

// const skill_names = ["Health -30"];
// const skills = get_required_skills(skill_names);
// console.log(get_valid_armors(skills).length);
// console.log(discard_outclassed_armors(get_valid_armors(skills), skills));

// const skill_names = ["Attack Up (Small)"];
// const skills = get_required_skills(skill_names);
// console.log(get_valid_armors(skills)[10]);
// console.log(get_complete_decorations(get_valid_armors(skills)[10], get_valid_decorations(skills)))

// const skill_names = ["Attack Up (Small)"];
// const skills = get_required_skills(skill_names);
// const valid_armors = get_valid_armors(skills);
// const valid_decorations = get_valid_decorations(skills);
// console.log(make_decorated_armor(valid_armors[10], valid_decorations));

const skill_names = ["Attack Up (Small)"];
const skills = get_required_skills(skill_names);
const valid_armors = get_valid_armors(skills);
const valid_decorations = get_valid_decorations(skills);
console.log(insert_decorations(valid_armors[10], valid_decorations));
