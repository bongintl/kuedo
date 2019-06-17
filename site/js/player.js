var m = require('mithril');
var EventEmitter = require('events');
var audio = require('./utils/audio');
var video = require('./utils/video');
var localStorage = require('./utils/localStorage');
var { content, assets } = require('./db');

class LoggingEmitter extends EventEmitter {
    emit ( ...args ) {
        console.log( args );
        return super.emit( ...args );
    }
}
var emitter = new LoggingEmitter();
// var emitter = new EventEmitter();

var state = {
    played: localStorage( 'played' ) || {},
    canAutoplay: require('./utils/canAutoplay'),
    ready: false,
    playing: false,
    playlist: null,
    track: 0,
    time: 0,
    asset: ( track = state.track ) => assets[ state.playlist[ track ] ],
    assetType: track => {
        var a = state.asset( track );
        return a === null ? a : a.type;
    }
};

emitter.on( 'playlist', playlist => state.playlist = playlist );

emitter.on( 'progress', time => {
    var from = state.time;
    var to = time;
    var file = state.playlist[ state.track ];
    var overlaps = [ [ from, to ] ];
    var ret = [];
    if ( file in state.played ) {
        state.played[ file ].forEach( ([ from2, to2 ]) => {
            if ( !( from2 > to || to2 < from ) ) {
                overlaps.push( [ from2, to2 ] );
            } else {
                ret.push( [ from2, to2 ] );
            }
        });
    }
    ret.push([
        Math.min( ...overlaps.map( t => t[ 0 ] ) ),
        Math.max( ...overlaps.map( t => t[ 1 ] ) )
    ])
    state.played[ file ] = ret;
    state.time = to;
    localStorage( 'played', state.played );
    // m.redraw();
});

emitter.on( 'end', () => {
    if ( state.track < state.playlist.length - 1 ) {
        state.track = ( state.track + 1 ) % state.playlist.length;
        emitter.emit( 'play', { track: state.track, time: 0 });
    } else {
        // emitter.emit( 'pause' );
        state.track = 0;
        state.time = 0;
    }
    m.redraw();
});

emitter.on('tryPlay', ({ promise, track, time }) => {
    var success = () => {
        state.track = track;
        state.time = time;
        state.playing = true;
        emitter.emit('playSuccess');
    }
    var fail = () => emitter.emit('playFail');
    if ( !( promise instanceof Promise )) {
        success();
    } else {
        promise.then( success ).catch( fail );
    }
})

emitter.on('toggle', () => emitter.emit( state.playing ? 'pause' : 'play' ));

// emitter.on( 'play', () => state.playing = true );
// emitter.on( 'pause', () => state.playing = false );
// emitter.on( 'seek', time => state.time = time );

audio( state, emitter );
video( state, emitter );

module.exports = { state, emitter };