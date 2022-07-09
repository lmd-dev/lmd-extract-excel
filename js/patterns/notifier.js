class Notifier
{
    //Observers attached to hte notifier
    #observers;

    /**
     * Constructor
     */
    constructor()
    {
        this.#observers = [];
    }

    /**
     * Adds an observer to the notifier
     * @param {*} observer Has to have a notify method
     */
    addObserver(observer)
    {
        this.#observers.push(observer);
    }

    /**
     * Notifies observers to refresh them
     */
    notify()
    {
        this.#observers.forEach((observer) => {
            observer.notify();
        })
    }
}