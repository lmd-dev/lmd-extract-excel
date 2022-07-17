class ViewMain
{
    //Main controller of the application
    #controller;

    /**
     * Constructor
     * @param {ControllerMain} controller Main controller of the application
     */
    constructor(controller)
    {
        this.#controller = controller;
        this.#controller.addObserver(this);

        this.#initEvents();
    }

    /**
     * Notifies the view to refresh itself
     */
    notify()
    {
        this.#displayTitle();
        this.#displayExtraction();
    }

    /**
     * Initialize main events of the view
     */
    #initEvents()
    {
        const btnLoadFile = document.querySelector("#btn-load-file");
        const txtFileMatrix = document.querySelector("#txt-file-matrix");

        btnLoadFile.addEventListener("click", (event) =>
        {
            txtFileMatrix.files = null;
            txtFileMatrix.dispatchEvent(new MouseEvent("click"));
        })

        txtFileMatrix.addEventListener("change", () =>
        {
            if (txtFileMatrix.files.length)
                this.#controller.extractFromFile(txtFileMatrix.files[0]);
        })

        const txtFileTemplate = document.querySelector("#txt-file-template");
        
        txtFileTemplate.addEventListener("change", () =>
        {
            if (txtFileTemplate.files.length)
                this.#controller.makeTeachingUnitsFiles(txtFileTemplate.files[0]);
        })

        document.querySelector("#rb-teaching-unit").addEventListener("click", () => { this.notify() })
        document.querySelector("#rb-module").addEventListener("click", () => { this.notify() })
        document.querySelector("#chk-block").addEventListener("change", () => { this.notify() })

        document.querySelector("#btn-make-ue-files").addEventListener("click", () => { 
            txtFileTemplate.files = null;
            txtFileTemplate.dispatchEvent(new MouseEvent("click")) 
        })

        document.querySelector("#credits").addEventListener("click", () => { document.querySelector("#credits").classList.toggle("hidden")})
    }

    /**
     * Display the title of the extracted document
     */
    #displayTitle()
    {
        const extractHeaderTitle = document.querySelector("#extract-header h1");
        extractHeaderTitle.innerHTML = this.#controller.title;
    }

    /**
     * Display extracted data
     */
    #displayExtraction()
    {
        const displayArea = document.querySelector("#extract-content");
        let html = "";

        this.#controller.studyYears.forEach((studyYear) =>
        {
            html += this.#makeHTMLStudyYear(studyYear);
        })

        displayArea.innerHTML = html;

        displayArea.classList.remove("hidden");
        document.querySelector("body > div:first-child").classList.add("reduce");
        document.querySelector("#extract-header").classList.remove("hidden");
    }

    /**
     * Build HTML structure for a study year
     * @param {StudyYear} studyYear Study year to display data
     * @returns Builded HTML structure
     */
    #makeHTMLStudyYear(studyYear)
    {
        let html = `
            <div class="study-year">
                <h1>${studyYear.name}<sup>ème</sup> année</h1>
        `;

        studyYear.teachingUnits.forEach((teachingUnit) =>
        {
            html += this.#makeHTMLTeachingUnit(teachingUnit);
        })

        html += "<hr>";
        html += "</div>";

        return html;
    }

    /**
     * Build HTML structure for a teaching unit
     * @param {TeachingUnit} teachingUnit Teaching unit to display data
     * @returns Builded HTML structure
     */
    #makeHTMLTeachingUnit(teachingUnit)
    {
        let html = `
            <div class="teaching-unit">
                <h2>${teachingUnit.name} - ${teachingUnit.fullname} (${teachingUnit.studyCredits} ECTS)</h2>
        `;

        if (this.#areSkillsDisplayingPerTeachingUnit())
        {
            const skills = teachingUnit.getSkills()

            skills.forEach((skill) =>
            {
                html += this.#makeHTMLSkill(skill)
            })
        }
        else
        {
            teachingUnit.modules.forEach((module) => {
                html += this.#makeHTMLModule(module);
            })
        }

        html += "</div>";

        return html;
    }

    /**
     * Build HTML structure for a module
     * @param {Module} module Module to display data
     * @returns Builded HTML structure
     */
    #makeHTMLModule(module)
    {
        let html = `
            <div class="module">
                <h3 class="${module.skills.size === 0 ? 'warning' : ''}">${module.name}</h3>
        `;

        module.skills.forEach((skill) =>
        {
            html += this.#makeHTMLSkill(skill);
        })

        html += "</div>";

        return html;
    }

    /**
     * Build HTML structure for a skill
     * @param {Skill} skill Skill to display data
     * @returns Builded HTML structure
     */
    #makeHTMLSkill(skill)
    {
        let html = `
            <p class="skill">${this.#areSkillsBlocksDisplayed() ? skill.block + " - " : ""}${skill.name}</p>
        `;

        return html;
    }

    /**
     * Indicates if skills has to be displayed per teching unit (true) or per module (false)
     */
    #areSkillsDisplayingPerTeachingUnit()
    {
        return document.querySelector("#rb-teaching-unit").checked;
    }

    /**
     * Indicates if skills blocks has to be displayed
     */
    #areSkillsBlocksDisplayed()
    {
        return document.querySelector("#chk-block").checked;
    }


}