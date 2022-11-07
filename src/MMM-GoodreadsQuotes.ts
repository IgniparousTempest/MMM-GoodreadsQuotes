import {Config} from "./Config";

Module.register<Config>('MMM-GoodreadsQuotes', {
    defaults: {
        quotesUrls: ['https://www.goodreads.com/author/quotes/6819578.Augustine_of_Hippo'],
        updateInterval: 60
    },
    _retrievedData: null,

    start: function() {
        // Validate input
        if (this.config.updateInterval <= 0)
            throw new Error("'updateInterval' should be a positive integer.");

        // Retrieve data
        this.sendSocketNotification("REQUEST_GOODREADS_QUOTES", {...this.config});
        setInterval(() => this.sendSocketNotification("REQUEST_GOODREADS_QUOTES", {...this.config}), this.config.updateInterval * 1000);
    },

    getTemplate() {
        return "MMM-GoodreadsQuotes.njk";
    },

    /**
     * Data used in the template.
     */
    getTemplateData: function() {
        if (!this._retrievedData) {
            return {
                config: this.config
            };
        }


        return {
            quote: this._retrievedData,
            config: this.config
        };
    },

    getStyles: function() {
        return ['MMM-GoodreadsQuotes.css'];
    },

    socketNotificationReceived(notification, payload) {
        if (notification === "GOODREADS_QUOTES") {
            this._retrievedData = payload;

            this.updateDom(500);
        }
    },
});
