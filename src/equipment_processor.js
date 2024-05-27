const determine_skill_points_of = (decorated_equipment, equipment, valid_decorations) => {
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
