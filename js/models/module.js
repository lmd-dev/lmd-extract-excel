class Module
{
    //Name of the teaching module
    #name;
    get name() { return this.#name }

    //Skills matching with the module
    #skills;
    get skills() { return new Map(this.#skills) }

    /**
     * Constructor
     * @param {string} name Name of the module 
     */
    constructor(name)
    {
        this.#name = name;
        this.#skills = new Map();
    }

    /**
     * Adds a skill to the module 
     * @param {Skill} skill Skill to add 
     */
    addSkill(skill)
    {
        if(this.#skills.has(skill.name) === false)
            this.#skills.set(skill.name, skill);
    }

    /**
     * Merges skills of the module with the given one
     * @param {Module} moduleToMerge Module to merge with 
     */
    merge(moduleToMerge)
    {
        moduleToMerge.skills.forEach((skillsToMerge, skillName) => {
            let skill = this.#skills.get(skillName);

            if(!skill)
                this.#skills.set(skillName, skillsToMerge);
        })
    }
}