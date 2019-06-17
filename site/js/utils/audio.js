var rAF = require('./rAF');

var SILENT_MP3 = 'data:audio/mpeg;base64,/+MYxAAAAANIAUAAAASEEB/jwOFM/0MM/90b/+RhST//w4NFwOjf///PZu////9lns5GFDv//l9GlUIEEIAAAgIg8Ir/JGq3/+MYxDsLIj5QMYcoAP0dv9HIjUcH//yYSg+CIbkGP//8w0bLVjUP///3Z0x5QCAv/yLjwtGKTEFNRTMuOTeqqqqqqqqqqqqq/+MYxEkNmdJkUYc4AKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq';

module.exports = ( state, emitter ) => {
    
    var audio = new Audio();
    
    var unload = () => {
        if ( audio ) audio.src = undefined;
        rAF.stop( 'audioprogress' );
    }
    
    audio.addEventListener('ended', () => {
        unload();
        emitter.emit('end');
    })
    
    var isAudio = () => state.asset().type === 'audio';
    
    emitter.on( 'play', ({ track = state.track, time = state.time } = {}) => {
        var asset = state.asset( track )
        if ( asset.type !== 'audio' ) return;
        if ( audio.src !== asset.src ) {
            unload();
            audio = new Audio();
            audio.src = asset.src;
            // rAF.start( 'audioprogress', () => {
            //     emitter.emit( 'progress', audio.currentTime );
            // });
            if ( time > 0 ) audio.currentTime = time;
        }
        emitter.emit('tryPlay', { promise: audio.play(), track, time });
    });
    
    emitter.on( 'pause', () => isAudio() && audio.pause() );
    
    emitter.on( 'unload', unload )
    
    emitter.on( 'seek', time => isAudio() && ( audio.currentTime = time ) )
    
}

// var { Howl } = require('howler');
// var { assets } = require('../db');
// var rAF = require('./rAF');

// module.exports = ( state, emitter ) => {
    
//     var howl, src;
    
//     var unload = () => {
//         if ( howl ) howl.unload();
//         howl = src = undefined;
//         rAF.stop( 'audioprogress' );
//     }
    
//     var isAudio = () => state.asset().type === 'audio';
    
//     emitter.on( 'play', ({ track = state.track, time = state.time } = {}) => {
//         var asset = state.asset( track )
//         if ( asset.type !== 'audio' ) return;
//         if ( src !== asset.src ) {
//             unload();
//             howl = new Howl({ src: [ asset.src ], html5: true });
//             src = asset.src;
//             rAF.start( 'audioprogress', () => {
//                 if ( howl.state() === 'loaded' ) {
//                     emitter.emit( 'progress', howl.seek() )
//                 } else {
//                     emitter.emit( 'progress', time )
//                 }
//             });
//             howl.on('end', () => {
//                 unload();
//                 emitter.emit( 'end' );
//             });
//             if ( time > 0 ) howl.seek( time );
//             howl.once( 'load', () => {
//                 try {
//                     howl.play();
//                 } catch ( e ) {
//                     console.log('cannot');
//                 }
//             })
//         } else {
//             howl.play();
//         }
//         state.track = track;
//         state.time = time;
//     });
    
//     emitter.on( 'pause', () => isAudio() && howl && howl.pause() );
    
//     emitter.on( 'unload', unload )
    
//     emitter.on( 'seek', time => isAudio() && howl && howl.seek( time ) )
    
// }