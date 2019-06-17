var m = require('mithril');

var Thumbnails = require('./Thumbnails');

var isTouch = 'ontouchstart' in window;

module.exports = {
    view: ({ attrs: { work, assets, setHighlight, listened } }) => {
        return m('.menu-item',
            {
                onclick: () => m.route.set( '/work/' + work.slug, { state: { track: 0, time: 0 } } ),
                onmouseenter: isTouch ? undefined : () => setHighlight( work.type ),
                onmouseleave: isTouch ? undefined : () => setHighlight( null )
            },
            m('.menu-item__title', work.title ),
            m( Thumbnails, { work, assets, listened } )
        )
    }
}