class ExtractorApp
{
    //Main controller of the application
    #controllerMain;

    //Main view of the application
    #viewMain;

    /**
     * Constructor
     */
    constructor()
    {
        this.#controllerMain = new ControllerMain();
        this.#viewMain = new ViewMain(this.#controllerMain);
    }
}