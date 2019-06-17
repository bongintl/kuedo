var localStorage = require('./localStorage');

var KEY = 'played_2'

var played = localStorage( KEY ) || {};

var merge = ranges => {
    var merged = [], last;
    ranges
        .sort( ( a, b ) => a[ 0 ] - b[ 0 ] || a[ 1 ] - b[ 1 ] )
        .forEach( r => {
            if ( !last || r[ 0 ] > last[ 1 ] ) {
                merged.push( r );
                last = r;
            } else if ( r[ 1 ] > last[ 1 ] ) {
                last[ 1 ] = r[ 1 ];
            }
        });
    return merged;
}
var get = key => played[ key ] || [];

// var record = ( key, from, to ) => {
//     played[ key ] = merge( get( key ).concat([ range ]) );
// }

var from = null;
var start = time => {
    // console.log( 'start', time );
    // if ( from !== null ) throw new Error('Recorded start time without ending previous time');
    from = time;
}
var end = ( key, time ) => {
    // console.log( 'end', key, time );
    if ( from === null ) return //throw new Error('Recorded end time without start time');
    if ( time < from ) return //throw new Error('End time is before start time');
    played[ key ] = merge([ ...get( key ), [ from, time ] ]);
    localStorage( KEY, played );
    from = null;
    console.log( played )
}

module.exports = { get, start, end };

// var watch = ( key, element ) => {
//     debugger
// 	var then = null;
// 	element.addEventListener( 'timeupdate', () => {
// 		var now = element.currentTime;
// 		if ( then === null ) then = now;
//         if ( then >= now ) return;
//         var range = [ then, now ];
//         played[ key ] = merge( get( key ).concat([ range ]) );
// 		then = now;
// 	})
// }

// module.exports = { watch, get };