var m = require('mithril');

var Nav = require('./Nav');
var Draggable = require('./Draggable');
var Menu = require('./Menu');
var About = require('./About');

module.exports = {
    filter: null,
    highlight: null,
    view: ({ state, attrs: { content, assets, listened } }) => {
        var setFilter = x => state.filter = x;
        var setHighlight = x => state.highlight = x;
        return m('.home',
            m( Nav, { highlight: state.highlight || state.filter, setFilter }),
            m( Draggable,
                m.route.get() === '/about'
                    ? m( About, { body: content.about.body })
                    : m( Menu, {
                        work: content.work,
                        filter: state.filter,
                        setHighlight,
                        listened,
                        assets
                    })
            )
        )
    }
}