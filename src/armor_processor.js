const get_decorated_armor_complete = (decorated_armor, valid_armors, valid_decorations) => {
    return {
        "armor": valid_armors.find(v => v["id"] === decorated_armor["armor-id"]),
        "decorations-name": decorated_armor["decoration-ids"].map(d => valid_decorations.find(v=>v["id"] === d)["name"]),
        "skill-points": determine_skill_points_of(decorated_armor, valid_armors, valid_decorations)
    };
}

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

const categorize_armor_complete = (decorated_armors_complete) => {
    const result = {
        "helmet": [],
        "plate": [],
        "gauntlet": [],
        "waist": [],
        "legging": []
    };
    for (let i = 0; i < decorated_armors_complete.length; i++) {
        result[decorated_armors_complete[i]["armor"]["part"]].push(decorated_armors_complete[i]);
    }
    return result;
}

module.exports = {
    determine_skill_points_of: determine_skill_points_of,
    get_decorated_armor_complete: get_decorated_armor_complete,
    categorize_armor_complete: categorize_armor_complete,
};
