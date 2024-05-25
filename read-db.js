const env = require("./dotenv");

const getContents = (dir) => {
    return require('fs').readFileSync(dir).toString();
}

const get_parsed_contents = (path) => {
    return JSON.parse(getContents(env.DB_DIRECTORY + path + ".json"));
}

const get_armors = () => {
    return get_parsed_contents("/armors");
}

const get_decorations = () => {
    return get_parsed_contents("/decorations");
}

const get_skills = () => {
    return get_parsed_contents("/skills");
}

module.exports = {
    ARMORS: get_armors(),
    DECORATIONS: get_decorations(),
    SKILLS: get_skills()
}
