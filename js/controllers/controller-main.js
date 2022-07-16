class ControllerMain extends Notifier
{
    //Extracted title
    #title;
    get title() { return this.#title }

    //Extracted study years
    #studyYears;
    get studyYears() { return new Map(this.#studyYears) }

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

        workbook.SheetNames.forEach((sheetName, index) =>
        {
            const sheet = workbook.Sheets[sheetName];

            if (index === 0)
                this.#extractTitle(sheet)

            this.#extractFromSheet(sheet, sheetName);
        })
    }

    #extractTitle(sheet)
    {
        const cellTitle = sheet[XLSX.utils.encode_cell({ r: 1, c: 1 })];

        if (cellTitle)
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

        do
        {
            const cellName = XLSX.utils.encode_cell({ r: iRow, c: iCol });
            const cell = sheet[cellName];

            if (cell)
            {
                cellValue = cell.w;
                this.#skills.set(cellValue, new Skill(cellValue, sheetName));

                ++iCol;
            }
            else
                cellValue = "";

        } while (cellValue !== "")
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
            const cellTeachingUnit = sheet[XLSX.utils.encode_cell({ r: iRow, c: colTeachingUnit })];
            if (cellTeachingUnit && cellTeachingUnit.w !== "")
            {
                if (currentTeachingUnit)
                    this.#addTeachingUnit(temporyStudyYears, currentTeachingUnit);

                currentTeachingUnit = new TeachingUnit(cellTeachingUnit.w);
            }

            if (currentTeachingUnit)
            {
                //Extracts modules
                cellModule = sheet[XLSX.utils.encode_cell({ r: iRow, c: colModule })];
                if (cellModule && cellModule.w !== "")
                {
                    const module = new Module(cellModule.w);
                    let colSkill = colSkillStart;
                    let cellSkill = null;

                    //Extracts skills
                    do
                    {
                        cellSkill = sheet[XLSX.utils.encode_cell({ r: rowSkill, c: colSkill })];

                        if (cellSkill && cellSkill.w !== "")
                        {
                            const cellSkillModule = sheet[XLSX.utils.encode_cell({ r: iRow, c: colSkill })];
                            if (cellSkillModule && cellSkillModule.w.toUpperCase() === "X")
                                module.addSkill(this.#skills.get(cellSkill.w));

                            ++colSkill;
                        }
                    } while (cellSkill && cellSkill.w !== "")

                    currentTeachingUnit.addModule(module);
                }
            }
            ++iRow;
        } while (cellModule && cellModule.w !== "")

        if (currentTeachingUnit)
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
        if (studyYears.size === 0 || studyYears.get(this.#iCurrentStudyYear).teachingUnits.has(teachingUnit.name) === true)
        {
            if (studyYears.size === 0)
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
        studyYearsToMerge.forEach((studyYearToMerge, studyYearName) =>
        {
            let studyYear = this.#studyYears.get(studyYearName);

            if (!studyYear)
                this.#studyYears.set(studyYearName, studyYearToMerge);
            else
            {
                studyYear.merge(studyYearToMerge);
            }
        })
    }

    /**
     * Generates teaching units files from extracted data
     * @param {File} templateFile docx template file to use
     */
    async makeTeachingUnitsFiles(templateFile)
    {
        try
        {
            const zip = new PizZip();

            const studyYears = Array.from(this.#studyYears.values());

            for (let i = 0; i < studyYears.length; ++i)
            {
                const studyYear = studyYears[i];

                for (let teachingUnit of studyYear.teachingUnits.values())
                {
                    const blob = await this.#makeTeachingUnitFile(templateFile, teachingUnit)

                    zip.file(
                        `${ studyYear.name }A - ${ teachingUnit.name }.docx`,
                        await blob.arrayBuffer(),
                        { binary: true }
                    );
                };
            }

            if (Object.keys(zip.files).length > 0)
            {
                this.#downloadFile(zip.generate({ type: "blob" }), `fiches-ue-2022.zip`);
            }
        }
        catch (error)
        {
            console.log(error);
        }
    }

    /**
     * Generates the file for the given teaching unit
     * @param {File} templateFile Template file to use
     * @param {TeachingUnit} teachingUnit teaching Unit to export
     */
    async #makeTeachingUnitFile(templateFile, teachingUnit)
    {
        const template = await this.#loadTemplateFile(templateFile);

        const docx = new docxtemplater(template);

        docx.render({
            ecue: this.#makeOXMLListe(Array.from(teachingUnit.modules.values()).map((module) => { return module.name })),
            competence: this.#makeOXMLListe(teachingUnit.getSkills().map((skill) => { return skill.name }))
        })

        const blob = docx.getZip().generate({
            type: "blob",
            mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            compression: "DEFLATE",
        });

        return blob;
    }

    /**
     * Load the docx template file to coplete
     * @param {File} file docx template file 
     */
    async #loadTemplateFile(file)
    {
        return new Promise((resolve, reject) =>
        {
            const reader = new FileReader();

            reader.onloadend = () =>
            {
                resolve(new PizZip(reader.result));
            }

            reader.onerror = (error) =>
            {
                reject(error);
            }

            reader.readAsBinaryString(file);
        })
    }

    /**
     * Download the given blob as a file on the client file system
     * @param {*} blob Content of the file
     * @param {*} filename Name of the downloaded file
     */
    #downloadFile(blob, filename)
    {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;

        link.dispatchEvent(new MouseEvent("click"));
    }

    /**
     * Generates an OpenXML formatted bullet list from an array of strings
     * @param {string[]} array Array of strings to make the list from 
     * @returns The Open XML List as raw string format
     */
    #makeOXMLListe(array)
    {
        let oxmlList = ``;

        array.forEach((item) =>
        {
            oxmlList += `
                <w:p>
                    <w:pPr>
                        <w:jc w:val="both" />
                        <w:numPr>
                            <w:ilvl w:val="0"/>
                            <w:numId w:val="1"/>
                        </w:numPr>
                    </w:pPr>
                    <w:r>
                        <w:t>
                            ${ item }
                        </w:t>
                    </w:r>   
                </w:p>                     
            `;
        })

        return oxmlList;
    }
}

