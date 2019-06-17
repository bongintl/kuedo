var m = require('mithril');
// var player = require('../player');

var formatTime = seconds => {
    var m = Math.floor( seconds / 60 );
    var s = seconds % 60;
    return String( m ) + ':' + String( s ).padStart( 2, '0' )
}

var renderItem = ( active, onclick, left, right ) => {
    var className = active ? 'playlist__item playlist__item_active' : 'playlist__item';
    return m('li', { className, onclick },
        m('.playlist__left', left ),
        m('.playlist__right', right )
    )
}

var renderTimestamp = ( play, currentTime ) => ({ time, artist, title }, i, timestamps ) => {
    var nextTime = i === timestamps.length - 1
        ? Infinity
        : timestamps[ i + 1 ].time;
    var active = currentTime >= time && currentTime < nextTime;
    var onclick = () => play( 0, time );
    return renderItem( active, onclick,
        formatTime( time ),
        [
            m( 'span', artist ),
            ' – ',
            m( 'span', title )
        ]
    )
};

var renderFile = ( track, play, playing ) => ({ title }, i ) => {
    var onclick = () => play( i );
    var active = playing && i === track;
    return renderItem( active, onclick, i + 1, title );
}

var findIndexRight = ( arr, fn ) => {
    for ( var i = arr.length - 1; i >= 0; i-- ) {
        if ( fn( arr[ i ], i, arr ) ) return i;
    }
    return -1;
}

var Timestamps = {
    curr: 0,
    oninit: ({ attrs: { timestamps, getTime }, state }) => {
        console.log( timestamps );
        state.update = () => {
            var time = getTime();
            var curr = findIndexRight( timestamps, timestamp => time >= timestamp.time );
            if ( curr !== state.curr ) {
                state.curr = curr;
                m.redraw();
            }
            window.requestAnimationFrame( state.update );
        }
        state.update();
    },
    onremove: ({ state }) => window.cancelAnimationFrame( state.update ),
    view: ({ attrs: { timestamps, play, getTime }, state: { curr } }) => {
        return timestamps.map( ({ time, artist, title }, i ) => {
            return renderItem(
                i === curr,
                () => play( 0, time ),
                formatTime( time ),
                [
                    m( 'span', artist ),
                    ' – ',
                    m( 'span', title )
                ]
            );
        });
        //return timestamps.map( renderTimestamp( play, getTime ) )
    }
}

module.exports = {
    view: ({ attrs: { work, track, playing, play, getTime } }) => {
        if ( !work.timestamps && work.files.length === 1 ) return;
        return m('ol.playlist',
            work.timestamps
                ? m( Timestamps, { timestamps: work.timestamps, play, getTime })//work.timestamps.map( renderTimestamp( play, getTime() ) )
                : work.files.map( renderFile( track, play, playing ) )
        )
    }
}