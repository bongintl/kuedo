var m = require('mithril');
var player = require('../player');

module.exports = {
    oncreate: ({ dom, attrs }) => {
        dom.appendChild( attrs.mediaElement );
    },
    view: ({ attrs: { fullscreen, onclick } }) => {
        var className = fullscreen ? 'video video_fullscreen' : 'video';
        return m( 'div', { className, onclick });
    }
}