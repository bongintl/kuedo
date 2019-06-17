var m = require('mithril');
var played = require('../utils/played');

var { homeColumn, rem } = require('../utils/metrics');

var Thumbnail = require('./Thumbnail');

var clamp = ( x, min, max ) => Math.max( Math.min( x, max ), min );

var updateHeight = ({ state, dom }) => {
    var h = dom.offsetHeight;
    if ( h !== state.height ) {
        state.height = h;
        setTimeout( m.redraw, 0 );
    }
}

module.exports = {
    height: null,
    oncreate: updateHeight,
    onupdate: updateHeight,
    view: ({ attrs: { work: { files, slug } }, state: { height } }) => {
        if ( height === null ) return m( '.thumbnails' );
        var col = homeColumn();
        var gutter = rem();
        var x = 0;
        var y = 0;
        var children = files.map( ({ file }, i ) => {
            var { src, w, h } = file.thumbnail;
            var scale = col / w;
            var duration = file.duration;
            w *= scale;
            h = duration * 5 * scale * ( window.innerWidth < 768 ? .75 : 1 )
            h = clamp( h, files.length === 1 ? height / 4 : 0, height );
            if ( y + h > height ) {
                x += col + gutter;
                y = 0;
            }
            var ret = m( Thumbnail, {
                src, x, y, w, h, slug, i, duration,
                played: played.get( file.src )
            });
            y += h + gutter;
            return ret;
        })
        var style = { width: x + col + 'px' }
        return m( '.thumbnails', { style }, children );
    }
};