var m = require('mithril');

// var { content } = require('../db');

var MenuItem = require('./MenuItem');

var matchFilter = filter => work => filter === null || work.type === filter;

module.exports = {
    view: ({ attrs: { work, assets, filter, setHighlight, listened } }) => {
        var visible = work.filter( matchFilter( filter ) ).reverse();
        return visible.map( work => m( MenuItem, { work, assets, setHighlight, listened } ));
    }
}