class Skill
{
    //Name of the skill
    #name;
    get name() { return this.#name }

    //Skills block
    #block;
    get block() { return this.#block }

    /**
     * Constructor
     * @param {string} name Name of the skill
     * @param {string} block Block of the skill
     */
    constructor(name, block)
    {
        this.#name = name;
        this.#block = block;
    }
}