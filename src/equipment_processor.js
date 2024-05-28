/**
 * Determines skill points of a decorated equipment.
 * 
 * @param {DecoratedEquipment} decorated_equipment The decorated equipment
 * @param {Equipment} equipment The actual equipment to be tested
 * @param {Decoration[]} valid_decorations All valid decorations
 * @returns {Skill[]} The decorated equipment's skill points
 */
const determine_skill_points_of = (decorated_equipment, equipment, valid_decorations) => {
    // decorated_equipment does not store the actual equipment nor the decorations
    // instead, it stores ids.
    const used_decorations = decorated_equipment["decorations"]["id"].map(d=>valid_decorations.find(v=>v["id"] === d));
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

    return skill_points;
};

/**
 * Categorizes a list of decorated armors by the armor part
 * 
 * @param {DecoratedEquipment[]} decorated_equipments A list of decorated armors
 * @returns {CategorizedEquipments} An object consists the five parts of armor, with
 *                                  each storing a list of decorated armors
 */
const categorize_decorated_equipments = (decorated_equipments) => {
    const result = {
        "helmet": [],
        "plate": [],
        "gauntlet": [],
        "waist": [],
        "legging": []
    };
    for (let i = 0; i < decorated_equipments.length; i++) {
        result[decorated_equipments[i]["equipment"]["part"]].push(decorated_equipments[i]);
    }
    return result;
};

module.exports = {
    determine_skill_points_of: determine_skill_points_of,
    categorize_decorated_equipments: categorize_decorated_equipments,
};
