/**
 * MagicMirror Module: Goodreads Quotes
 * A MagicMirror² Module to display quotes from github.
 * 
 * Version 1.0.0
 * By Courtney Pitcher
 * 
 * License CC-BY-NC-SA-4.0
 * 
 * This is an autogenerated file. DO NOT EDIT!
 */

'use strict';

var NodeHelper = require('node_helper');
var Log = require('logger');
var fetch = require('node-fetch');
var cheerio = require('cheerio');

function _interopNamespaceDefault(e) {
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n.default = e;
    return Object.freeze(n);
}

var cheerio__namespace = /*#__PURE__*/_interopNamespaceDefault(cheerio);

function sample(arr) {
    var len = arr.length;
    return arr[Math.floor(Math.random() * len)];
}
// noinspection JSVoidFunctionReturnValueUsed
module.exports = NodeHelper.create({
    start: function () {
        Log.log("Starting node helper for: " + this.name);
    },
    socketNotificationReceived: function (notification, payload) {
        var _this = this;
        if (notification === "REQUEST_GOODREADS_QUOTES") {
            Log.info("".concat(this.name, ": Retrieving a new quote"));
            // The sitemap contains the first 1000 comics, and sitemap2 contains the latest comics.
            var url = sample(payload.quotesUrls);
            fetch(url)
                .then(function (response) { return response.text(); })
                .then(function (pageHtml) {
                var $ = cheerio__namespace.load(pageHtml);
                // Get author image.
                var authorImage = $('a.leftAlignedImage > img').eq(0).attr('src') || '';
                // Get quotes
                var list = [];
                $('div.quoteText').each(function (index, element) {
                    var quote = $(element)
                        .clone() // clone the element
                        .children() // select all the children
                        .remove() // remove all the children
                        .end() // again go back to selected element
                        .text() // get element text
                        .trim(); // Remove newlines and white space
                    if (quote[quote.length - 1] === '―') {
                        quote = quote.substring(0, quote.length - 1).trim();
                    }
                    if (quote.startsWith('“')) {
                        quote = quote.substring(1).trim();
                    }
                    if (quote.endsWith('”')) {
                        quote = quote.substring(0, quote.length - 1).trim();
                    }
                    var author = $(element)
                        .find('span.authorOrTitle')
                        .clone() // clone the element
                        .children() // select all the children
                        .remove() // remove all the children
                        .end() // again go back to selected element
                        .text() // get element text
                        .trim(); // Remove newlines and white space
                    list.push({ quote: quote, author: author, authorImage: authorImage });
                });
                _this.sendSocketNotification("GOODREADS_QUOTES", sample(list));
            });
        }
    },
});
