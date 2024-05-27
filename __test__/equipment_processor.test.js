const getter = require('../src/getter');
const get_required_skills = getter.get_required_skills;
const discard_outclassed_armors = getter.discard_outclassed_armors;
const insert_decorations = require('../src/decoration_inserter').insert_decorations;
const categorize_decorated_equipments = require('../src/equipment_processor').categorize_decorated_equipments;

const db = require('./test_assets');
const test_armor2 = db.test_armor2;
const test_armor3 = db.test_armor3;
const test_decoration1 = db.test_decoration1;
const test_decoration2 = db.test_decoration2;
const test_decoration3 = db.test_decoration3;

it('categorizes decorated equipments', () => {
    const skill_names = ["High Grade Earplug", "Evade +2", "Health -30"];
    const required_skills = get_required_skills(skill_names);
    const valid_armors = [test_armor2, test_armor3];
    const valid_decorations = [test_decoration1, test_decoration2, test_decoration3];
    const optimal_armors = discard_outclassed_armors(valid_armors, required_skills);
    const decorated_armors = optimal_armors.map(armor => insert_decorations(armor, valid_decorations)).flat();
    const parts = categorize_decorated_equipments(decorated_armors);
    expect(parts["gauntlet"].length).toBeGreaterThan(0);
    expect(parts["waist"].length).toBeGreaterThan(0);
});
