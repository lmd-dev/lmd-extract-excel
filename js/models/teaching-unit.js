class TeachingUnit
{
    //Name of the teaching unit
    #name;
    get name() { return this.#name; }

    //collection of modules
    #modules;
    get modules() { return new Map(this.#modules) }

    /**
     * constructor
     * @param {string} name Name of the teaching unit 
     */
    constructor(name)
    {
        this.#name = name;
        this.#modules = new Map();
    }

    /**
     * Adds a module to the collection
     * @param {Module} module Module to add
     */
    addModule(module)
    {
        if (this.#modules.has(module.name) === false)
            this.#modules.set(module.name, module);
    }

    /**
     * Merges modules of the teaching unit with the given teaching unit
     * @param {TeachingUnit} teachingUnitToMerge teaching unit to merge with
     */
    merge(teachingUnitToMerge)
    {
        teachingUnitToMerge.modules.forEach((modulesToMerge, moduleName) =>
        {
            let module = this.#modules.get(moduleName);

            if (!module)
                this.#modules.set(moduleName, modulesToMerge);
            else
            {
                module.merge(modulesToMerge);
            }
        })
    }

    /**
     * Returns skills matching with the teaching unit
     */
    getSkills()
    {
        const skills = [];

        this.modules.forEach((module) =>
        {
            module.skills.forEach((skill) =>
            {
                if (skills.findIndex(s => s.name === skill.name) === -1)
                    skills.push(skill);
            })
        })

        skills.sort((skill1, skill2) =>
        {
            if (skill1.block > skill2.block)
                return 1;
            else if (skill1.block < skill2.block)
                return -1;
            else
                return 0;
        })

        return skills;
    }
}