var m = require('mithril');

var Home = require('./Home');
var Work = require('./Work');

module.exports = content => ({
    view: ({ attrs: { slug, track, time } }) => {
        return [
            m( Home, { content } ),
            slug && m( Work, {
                work: content.work.find( w => w.slug === slug ),
                track, time
            })
        ]
    }
});