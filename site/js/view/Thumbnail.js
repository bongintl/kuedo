var m = require('mithril');

var flatten = arr => arr.reduce( ( a, b ) => a.concat( b ), [] );
var pairs = arr => {
    var pairs = [];
    for ( var i = 0; i < arr.length; i += 2 ) {
        pairs.push( [ arr[ i ], arr[ i + 1 ] ] );
    }
    return pairs;
}
var nonzeroRange = ([ from, to ]) => to - from > 0;

var invertPlayed = ( ranges, duration ) => pairs( [ 0, ...flatten( ranges ), duration ] ).filter( nonzeroRange );

module.exports = {
    view: ({ attrs: { src, x, y, w, h, slug, i, duration, played } }) => {
        var style = {
            left: x + 'px',
            top: y + 'px',
            width: w + 'px',
            height: h + 'px',
        }
        var onclick = e => {
            e.stopPropagation();
            var time = ( e.offsetY / h ) * duration;
            m.route.set( '/work/' + slug, null, { state: { track: i, time } } );
        };
        return m('.thumbnail', { style, onclick },
            invertPlayed( played, duration ).map( ([ from, to ]) => {
                var style = {
                    top: ( from / duration ) * 100 + '%',
                    height: ( ( to - from ) / duration ) * 100 + '%'
                }
                return m('.thumbnail__unplayed', { style } )
            }),
            m('.thumbnail__image', { style: { backgroundImage: `url("${ src }")` } } ),
        )
    }
}