const getter = require('../src/getter');
const get_valid_armors = getter.get_valid_armors;
const get_valid_decorations = getter.get_valid_decorations;
const get_required_skills = getter.get_required_skills;
const discard_outclassed_armors = getter.discard_outclassed_armors;

it('gets required skills', () => {
    const skill_names = ["Health -30"];
    const skills = get_required_skills(skill_names);
    expect(skills[0]["name"]).toBe("Health -30");
    expect(skills[0]["skill-point"]).toBe("Health");
    expect(skills[0]["points"]).toBe(-20);
});

it('gets valid armors according to provided skills', () => {
    const skill_names = ["Health -30"];
    const skills = get_required_skills(skill_names);
    const valid_armors = get_valid_armors(skills);

    expect(valid_armors.every(armor => {
        return armor["skill-points"].some(skill_point => {
            return skill_point["name"] === "Health" &&
                    skill_point["points"] < 0;
        });
    }));
});

it ('gets valid decorations according to provided skills', () => {
    const skill_names = ["Health -30"];
    const skills = get_required_skills(skill_names);
    const valid_decorations = get_valid_decorations(skills);

    expect(valid_decorations.every(dec => {
        return dec["skill-points"].some(skill_point => {
            return skill_point["name"] === "Health" &&
                    skill_point["points"] < 0;
        });
    }));
});

it ('discards all out-classed armors', () => {
    // All filtered armors should at least 'tie' with the unfiltered armors
    const skill_names = ["High Grade Earplug", "Evade +2", "Health -30"];
    const skills = get_required_skills(skill_names);
    const valid_armors = get_valid_armors(skills);
    const get_optimal_armors = discard_outclassed_armors(valid_armors, skills);
    const is_optimal = (optimal, competitors) => {
        // Optimal armor must 'win' against every competitor
        return competitors.every(competitor => {
            return competitor["skill-points"].every(competitor_skill_point => {
                return skills.every(skill => {
                    // This skill is not included in the requirement, not interested
                    if (!competitor_skill_point["name"] === skill["skill-point"]) return true;
                    const optimal_skill_point = optimal["skill-points"]
                        .find(s => s["name"] === competitor_skill_point["name"]);
                    const points_for_optimal = optimal_skill_point ? optimal_skill_point["points"] : 0;
                    const points_for_competitor = competitor_skill_point["points"];
                    return skill["points"] > 0 ? points_for_optimal > points_for_competitor :
                                            points_for_optimal < points_for_competitor;
                });
            }) || optimal["slots"] > competitor["slots"];
        });
    };
    expect(get_optimal_armors.every(armor => is_optimal(armor, valid_armors)));
});
