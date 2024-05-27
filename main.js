const getter = require('./src/getter');
const get_valid_armors = getter.get_valid_armors;
const get_valid_decorations = getter.get_valid_decorations;
const get_required_skills = getter.get_required_skills;
const discard_outclassed_armors = getter.discard_outclassed_armors;
const discard_outclassed_armors_complete = getter.discard_outclassed_armors_complete;
const insert_decorations = require('./src/decoration_inserter').insert_decorations;
const get_decorated_equipment_complete = require('./src/armor_processor').get_decorated_equipment_complete;
const categorize_equipment_complete = require('./src/armor_processor').categorize_equipment_complete;


const brute_force = (skill_names, armor_filter, weapon_slots) => {
    const required_skills = get_required_skills(skill_names);
    const valid_armors = armor_filter(get_valid_armors(required_skills));
    const valid_decorations = get_valid_decorations(required_skills);
    const optimal_armors = discard_outclassed_armors(valid_armors, required_skills);
    const decorated_armors = optimal_armors.map(armor => insert_decorations(armor, valid_decorations)).flat();
    const weapon = {
        "id": -1,
        "name": "Weapon",
        "slots": weapon_slots,
        "skill-points": []
    };
    const decorated_weapon = insert_decorations(weapon, valid_decorations);
    const decorated_armors_complete = decorated_armors.map((a, i) => {
        const result = get_decorated_equipment_complete(a, valid_armors, valid_decorations);
        result["id"] = i;
        return result;
    });
    const optimal_dec_armors = discard_outclassed_armors_complete(decorated_armors_complete, required_skills);

    require('fs').writeFileSync('./output.json', JSON.stringify(optimal_dec_armors.map(a=>{
        return {
            "armor": a["equipment"]["name"],
            "part": a["equipment"]["part"],
            "decorations": a["decorations-name"]
        }
    }), null, '    '));

    const decorated_weapon_complete = decorated_weapon.map(w => get_decorated_equipment_complete(w, [weapon], valid_decorations));
    const parts = categorize_equipment_complete(optimal_dec_armors);

    const is_gear_satisfy_requirement = (gear, required_skills) => {
        const temp = {};
        required_skills.map(required_skill => {
            temp[required_skill["skill-point"]] = required_skill["points"]
        });

        for (let i = 0; i < gear.length; i++) {
            const skill_points = gear[i]["skill-points"];
            skill_points.map(skill_point => {
                if (temp[skill_point["name"]] !== undefined)
                    temp[skill_point["name"]] -= skill_point["points"];
            });
        }
        return Object.values(temp).every(v => v <= 0);
    };

    const get_total_points = (gear) => {
        const result = {};
        for (let i = 0; i < gear.length; i++) {
            const skill_points = gear[i]["skill-points"];
            skill_points.map(skill_point => {
                if (result[skill_point["name"]] !== undefined)
                    result[skill_point["name"]] += skill_point["points"];
                else 
                result[skill_point["name"]] = skill_point["points"];
            });
        }
        return result;
    };

    for (helmet of parts["helmet"]) {
        for (plate of parts["plate"]) {
            for (gauntlet of parts["gauntlet"]) {
                for (waist of parts["waist"]) {
                    for (legging of parts["legging"]) {
                        for (m_weapon of decorated_weapon_complete) {
                            if (is_gear_satisfy_requirement([helmet, plate, gauntlet, waist, legging, m_weapon], required_skills)) {
                                console.log(helmet["equipment"]["name"] + ", ", 
                                            plate["equipment"]["name"] + ", ", 
                                            gauntlet["equipment"]["name"] + ", ", 
                                            waist["equipment"]["name"] + ", ", 
                                            legging["equipment"]["name"]);
                                console.log("\n helmet: \t", helmet["decorations-name"], "\n",
                                            "plate: \t", plate["decorations-name"], "\n",
                                            "gauntlet: \t", gauntlet["decorations-name"], "\n",
                                            "waist: \t", waist["decorations-name"], "\n",
                                            "legging: \t", legging["decorations-name"], "\n",
                                            "weapon: \t", m_weapon["decorations-name"], "\n");
                                
                                console.log(get_total_points([helmet, plate, gauntlet, waist, legging, m_weapon]))
                                return;
                            }
                        }
                    }
                }
            }
        }
    }
};

const skill_names = ["Sharpness +1", "Reckless Abandon +3", "Sharp Sword"];
const filter = (armor) => armor.filter(a=>a["hunter-type"] !== "G").filter(a=>a["rare"]>=5);
const weapon_slots = 1;
brute_force(skill_names, filter, weapon_slots);
