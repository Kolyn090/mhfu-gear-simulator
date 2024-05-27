const get_decorated_equipment_complete = (decorated_equipment, valid_equipments, valid_decorations) => {
    return {
        "equipment": valid_equipments.find(v => v["id"] === decorated_equipment["equipment-id"]),
        "decorations-name": decorated_equipment["decoration-ids"].map(d => valid_decorations.find(v=>v["id"] === d)["name"]),
        "skill-points": determine_skill_points_of(decorated_equipment, valid_equipments, valid_decorations)
    };
}

const determine_skill_points_of = (decorated_equipment, valid_equipments, valid_decorations) => {
    const equipment = valid_equipments.find(v=>v["id"] === decorated_equipment["equipment-id"]);
    const used_decorations = decorated_equipment["decoration-ids"].map(d=>valid_decorations.find(v=>v["id"] === d));
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

const categorize_equipment_complete = (decorated_equipments_complete) => {
    const result = {
        "helmet": [],
        "plate": [],
        "gauntlet": [],
        "waist": [],
        "legging": []
    };
    for (let i = 0; i < decorated_equipments_complete.length; i++) {
        result[decorated_equipments_complete[i]["equipment"]["part"]].push(decorated_equipments_complete[i]);
    }
    return result;
}

module.exports = {
    determine_skill_points_of: determine_skill_points_of,
    get_decorated_equipment_complete: get_decorated_equipment_complete,
    categorize_equipment_complete: categorize_equipment_complete,
};
