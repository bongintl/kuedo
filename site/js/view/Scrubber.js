var m = require('mithril');

var player = require('../player');
var db = require('../db');

module.exports = {
    
    oncreate: ({ dom, state, attrs: { asset, mediaElement } }) => {
        var head = dom.querySelector('.scrubber__progress');
        state.update = time => {
            var progress = mediaElement.currentTime / mediaElement.duration;
            head.style.transform = `translateY(${ progress * 100 }%)`
            window.requestAnimationFrame( state.update );
        }
        state.update();
    },
    
    onremove: ({ state }) => window.cancelAnimationFrame( state.update ),
    
    view: ({ attrs: { asset, seek } }) => {
        return m('.scrubber',
            {
                style: {
                    backgroundImage: `url("${ asset.thumbnail.src }")`
                },
                onclick: e => seek( ( e.clientY / window.innerHeight ) * asset.duration )
            },
            m('.scrubber__progress' )
        )
    }
    
}