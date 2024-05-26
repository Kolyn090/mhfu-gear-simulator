const getter = require('./getter');
const get_valid_armors = getter.get_valid_armors;
const get_valid_decorations = getter.get_valid_decorations;
const get_required_skills = getter.get_required_skills;
const discard_outclassed_armors = getter.discard_outclassed_armors;
const insert_decorations = require('./decoration_inserter').insert_decorations;

const brute_force = () => {
    const skill_names = ["High Grade Earplug", "Evade +2", "Health -30"];
    const required_skills = get_required_skills(skill_names);
    const valid_armors = get_valid_armors(required_skills);
    const valid_decorations = get_valid_decorations(required_skills);
    const optimal_armors = discard_outclassed_armors(valid_armors, required_skills);
    const decorated_armors = optimal_armors.map(armor => insert_decorations(armor, valid_decorations)).flat();
    for (let i = 0; i < decorated_armors.length; i++) {
        console.log(decorated_armors[i]);
    }
};

brute_force();
