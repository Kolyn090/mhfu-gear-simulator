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

