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
};

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
        const result = !valid_armors.some(competitor => {
            // Don't compare itself
            if (curr["id"] === competitor["id"]) return false;
            if (curr["part"] !== competitor["part"]) return false;
            // Check if the competitor will 'win'
            return required_skills.every(required_skill => {
                // 
                const curr_skill_point = curr["skill-points"]
                    .find(skill_point => skill_point["name"] === required_skill["skill-point"]);
                const curr_point_for_skill = curr_skill_point ? curr_skill_point["points"] : 0;
                const competitor_skill_point = competitor["skill-points"]
                    .find(skill_point => skill_point["name"] === required_skill["skill-point"]);
                const competitor_point_for_skill = competitor_skill_point ? competitor_skill_point["points"] : 0;
                
                return required_skill["points"] > 0 ? 
                    curr_point_for_skill <= competitor_point_for_skill : 
                    curr_point_for_skill > competitor_point_for_skill;
            }) && curr["slots"] <= competitor["slots"];
        });
        // if (!result) {
        //     console.log(curr["name"]);
        // }
        return result;
    });
};

const discard_outclassed_armors_complete = (decorated_armors_complete, required_skills) => {
    return decorated_armors_complete.filter(curr => {
        const result = !decorated_armors_complete.some(competitor => {
            if (curr["id"] === competitor["id"]) return false;
            if (curr["armor"]["part"] !== competitor["armor"]["part"]) return false;
            // Check if the competitor will 'win'
            return required_skills.every(required_skill => {
                const curr_skill_point = curr["skill-points"]
                    .find(skill_point => skill_point["name"] === required_skill["skill-point"]);
                const curr_point_for_skill = curr_skill_point ? curr_skill_point["points"] : 0;
                const competitor_skill_point = competitor["skill-points"]
                    .find(skill_point => skill_point["name"] === required_skill["skill-point"]);
                const competitor_point_for_skill = competitor_skill_point ? competitor_skill_point["points"] : 0;
                return required_skill["points"] > 0 ? 
                    curr_point_for_skill < competitor_point_for_skill : 
                    curr_point_for_skill > competitor_point_for_skill;
            });
        });
        // if (!result) {
        //     console.log(curr["armor"]["name"]);
        // }
        return result;
    });
};

module.exports = {
    get_valid_armors: get_valid_armors,
    get_valid_decorations: get_valid_decorations,
    get_required_skills: get_required_skills,
    discard_outclassed_armors: discard_outclassed_armors,
    discard_outclassed_armors_complete: discard_outclassed_armors_complete
};
