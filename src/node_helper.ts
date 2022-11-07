import NodeHelper from "node_helper";
import Log from "logger";
import fetch from "node-fetch";
import * as cheerio from 'cheerio';
import {Quote} from "./quote";

function sample<T>(arr: T[]): T {
    const len = arr.length
    return arr[Math.floor(Math.random() * len)];
}

// noinspection JSVoidFunctionReturnValueUsed
module.exports = NodeHelper.create({
    start: function() {
        Log.log("Starting node helper for: " + this.name);
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "REQUEST_GOODREADS_QUOTES") {
            Log.info(`${this.name}: Retrieving a new quote`);
            // The sitemap contains the first 1000 comics, and sitemap2 contains the latest comics.
            let url: string = sample(payload.quotesUrls);
            fetch(url)
                .then((response) => response.text())
                .then((pageHtml) => {
                    const $ = cheerio.load(pageHtml);

                    // Get author image.
                    const authorImage: string = $('a.leftAlignedImage > img').eq(0).attr('src') || '';

                    // Get quotes
                    const list: Quote[] = [];
                    $('div.quoteText').each((index, element) => {
                        let quote = $(element)
                            .clone()    // clone the element
                            .children() // select all the children
                            .remove()   // remove all the children
                            .end()      // again go back to selected element
                            .text()     // get element text
                            .trim();    // Remove newlines and white space
                        if (quote[quote.length - 1] === '―') {
                            quote = quote.substring(0, quote.length - 1).trim();
                        }
                        if (quote.startsWith('“')) {
                            quote = quote.substring(1).trim();
                        }
                        if (quote.endsWith('”')) {
                            quote = quote.substring(0, quote.length - 1).trim();
                        }
                        const author = $(element)
                            .find('span.authorOrTitle')
                            .clone()    // clone the element
                            .children() // select all the children
                            .remove()   // remove all the children
                            .end()      // again go back to selected element
                            .text()     // get element text
                            .trim();    // Remove newlines and white space
                        list.push({quote, author, authorImage});
                    });
                    this.sendSocketNotification("GOODREADS_QUOTES", sample(list));
                });
        }
    },
});
