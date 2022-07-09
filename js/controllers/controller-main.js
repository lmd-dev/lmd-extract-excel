class ControllerMain extends Notifier
{
    //Extracted title
    #title;
    get title() { return this.#title }

    //Extracted study years
    #studyYears;
    get studyYears() { return new Map(this.#studyYears)}

    //Extracted skills
    #skills;

    //Index of the current extracted study year
    #iCurrentStudyYear;

    /**
     * Constructor
     */
    constructor()
    {
        super();
        
        this.#title = "";
        this.#studyYears = new Map();
        this.#skills = new Map();

        this.#iCurrentStudyYear = 3;
    }

    /**      
     * Extracts data from file
     * @param {File} file 
     */
    async extractFromFile(file)
    {
        this.#title = "";
        this.#studyYears.clear();
        this.#skills.clear();

        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer);
        
        workbook.SheetNames.forEach((sheetName,  index) => {
            const sheet = workbook.Sheets[sheetName];

            if(index === 0)
                this.#extractTitle(sheet)

            this.#extractFromSheet(sheet, sheetName);
        })
    }

    #extractTitle(sheet)
    {
        const cellTitle = sheet[XLSX.utils.encode_cell({r:1, c:1})];

        if(cellTitle)
            this.#title = cellTitle.w;
    }

    /**
     * Extracts data from a sheet
     * @param {Sheet} sheet 
     */
     #extractFromSheet(sheet, sheetName)
    {
        this.#extractSkills(sheet, sheetName);
        this.#extractModules(sheet);

        this.notify();
    }

    /**
     * Extracts skills from the sheet
     * @param {Sheet} sheet 
     */
     #extractSkills(sheet, sheetName)
    {
        const iRow = 5;
        let iCol = 3;

        let cellValue = "";

        do {
            const cellName = XLSX.utils.encode_cell({r:iRow, c:iCol});
            const cell = sheet[cellName];

            if(cell)
            {
                cellValue = cell.w;
                this.#skills.set(cellValue, new Skill(cellValue, sheetName));

                ++iCol;
            }
            else
                cellValue = "";

        }while(cellValue !== "")
    }

    /**
     * Extracts Modules from the sheet
     * @param {Sheet} sheet 
     */
     #extractModules(sheet)
    {
        const colTeachingUnit = 1;
        const colModule = 2;
        const rowSkill = 5;
        const colSkillStart = 3;

        let iRow = 6;

        let currentTeachingUnit = null;
        let cellModule = null;

        const temporyStudyYears = new Map();

        do
        {
            //extract Teaching Units 
            const cellTeachingUnit = sheet[XLSX.utils.encode_cell({r:iRow, c:colTeachingUnit})];
            if(cellTeachingUnit && cellTeachingUnit.w !== "")
            {
                if(currentTeachingUnit)
                    this.#addTeachingUnit(temporyStudyYears, currentTeachingUnit);

                currentTeachingUnit = new TeachingUnit(cellTeachingUnit.w);
            }

            if(currentTeachingUnit)
            {
                //Extracts modules
                cellModule = sheet[XLSX.utils.encode_cell({r:iRow, c:colModule})];
                if(cellModule && cellModule.w !== "")
                {
                    const module = new Module(cellModule.w);
                    let colSkill = colSkillStart;
                    let cellSkill = null;

                    //Extracts skills
                    do {
                        cellSkill = sheet[XLSX.utils.encode_cell({r:rowSkill, c:colSkill})];
                        
                        if(cellSkill && cellSkill.w !== "")
                        {
                            const cellSkillModule = sheet[XLSX.utils.encode_cell({r:iRow, c:colSkill})]; 
                            if(cellSkillModule && cellSkillModule.w.toUpperCase() === "X")
                                module.addSkill(this.#skills.get(cellSkill.w));

                            ++colSkill;
                        }
                    } while(cellSkill && cellSkill.w !== "")

                    currentTeachingUnit.addModule(module);
                }
            }
            ++iRow;
        } while(cellModule && cellModule.w !== "")

        if(currentTeachingUnit)
            this.#addTeachingUnit(temporyStudyYears, currentTeachingUnit);

        this.#mergeStudyYears(temporyStudyYears);
    }

    /**
     * Add the given teaching unit to the given collection
     * @param {*} studyYears Extracted study years
     * @param {*} teachingUnit teaching Unit to add
     */
     #addTeachingUnit(studyYears, teachingUnit)
    {
        if(studyYears.size === 0 || studyYears.get(this.#iCurrentStudyYear).teachingUnits.has(teachingUnit.name) === true)
        {
            if(studyYears.size === 0)
                this.#iCurrentStudyYear = 3;
            else
                ++this.#iCurrentStudyYear;

            const studyYear = new StudyYear(this.#iCurrentStudyYear);
            studyYear.addTeachingUnit(teachingUnit);

            studyYears.set(studyYear.name, studyYear);
        }
        else
        {
            studyYears.get(this.#iCurrentStudyYear).addTeachingUnit(teachingUnit);
        }
    }

    /**
     * Merges main study years collection with the given study years
     * @param {Map} studyYearsToMerge study years to merge
     */
     #mergeStudyYears(studyYearsToMerge)
    {
        studyYearsToMerge.forEach((studyYearToMerge, studyYearName) => {
            let studyYear = this.#studyYears.get(studyYearName);

            if(!studyYear)
                this.#studyYears.set(studyYearName, studyYearToMerge);
            else
            {
                studyYear.merge(studyYearToMerge);
            }
        })
    }
}

