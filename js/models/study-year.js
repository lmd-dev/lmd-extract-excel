class StudyYear
{
    //Name of the study year
    #name;
    get name() { return this.#name}

    //Teaching units of the study year
    #teachingUnits;
    get teachingUnits() { return new Map(this.#teachingUnits)}

    /**
     * Constructor
     * @param {string} name Name of the stydu year 
     */
    constructor(name)
    {
        this.#name = name;
        this.#teachingUnits = new Map();        
    }

    /**
     * Adds a teaching unit to the study year
     * @param {TeachingUnit} teachingUnit Teaching unit to add
     */
    addTeachingUnit(teachingUnit)
    {
        if(this.#teachingUnits.has(teachingUnit.name) === false)
            this.#teachingUnits.set(teachingUnit.name, teachingUnit);
    }

    /**
     * Merges teaching units of the study year with the given study year
     * @param {StudyYear} studyYearToMerge Study year to merge with
     */
    merge(studyYearToMerge)
    {
        studyYearToMerge.teachingUnits.forEach((teachingUnitToMerge, teachingUnitName) => {
            let teachingUnit = this.#teachingUnits.get(teachingUnitName);

            if(!teachingUnit)
                this.#teachingUnits.set(teachingUnitName, teachingUnitToMerge);
            else
            {
                teachingUnit.merge(teachingUnitToMerge);
            }
        })
    }
}