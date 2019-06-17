var m = require('mithril');

// var player = require('../player');
var { assets } = require('../db');

var formatTime = require('../utils/formatTime');

var Time = {
    oncreate: ({ dom, state, attrs: { getTime } }) => {
        var tick = () => {
            dom.innerText = formatTime( getTime() );
            state.frame = requestAnimationFrame( tick );
        }
        tick();
    },
    onremove: ({ state }) => {
        window.cancelAnimationFrame( state.frame );
    },
    view: () => m('.player__time', '0:00')
}

module.exports = {
    view: ({ attrs: { title, duration, toggle, playing, getTime } }) => {
        return m('.player',
            m( 'span.player__title', title ),
            m( 'span.player__play-pause', { onclick: toggle }, playing ? 'Pause' : 'Play' )
            // m( Time, { getTime } ),
            // m( '.player__duration', formatTime( duration ) )
        )
    }
}