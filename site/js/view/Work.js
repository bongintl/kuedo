/* global HTMLVideoElement */

var m = require('mithril');

var Spectrogram = require('./Spectrogram');
var Scrubber = require('./Scrubber');
var Video = require('./Video');
var Player = require('./Player');
var Playlist = require('./Playlist');

var autobind = require('../utils/autobind');
var played = require('../utils/played');
var tween = require('../utils/tween');

var isTouch = 'ontouchstart' in window;

var createMediaElement = type => {
    var element = document.createElement( type );
    if ( type === 'video' ) {
        element.setAttribute( 'playsinline', 'playsinline' );
        if ( isTouch ) element.setAttribute( 'controls', 'controls' );
    }
    return element;
}

var play = element => {
    var p = element.play();
    if ( p instanceof Promise ) return p;
    return Promise.resolve();
}

module.exports = {
    transitionIn: false,
    fullscreen: false,
    playing: false,
    track: -1,
    oninit: ({ attrs: { work, assets, track = 0, time = 0 }, state }) => {
        var getTime = () => state.mediaElement.currentTime;
        var getTrack = ( track = state.track ) => work.files[ track ];
        var getAsset = track => getTrack( track ).file;
        var start = () => played.start( getTime() );
        var end = () => played.end( getAsset().src, getTime() );
        var setTime = time => state.mediaElement.currentTime = time;
        state.mediaElement = createMediaElement( getAsset( 0 ).type );
        var setTrack = ( track, time ) => {
            if ( state.track > -1 ) end();
            state.track = track;
            state.mediaElement.src = getAsset().src;
            if ( time !== undefined ) setTime( time );
            start();
        }
        state.play = ( track = state.track, time ) => {
            if ( track !== state.track ) {
                setTrack( track, time );
            } else if ( time !== undefined ) {
                state.seek( time );
            }
            play( state.mediaElement )
                .then( () => state.playing = true )
                .catch( () => state.playing = false )
                .finally( m.redraw )
        }
        state.pause = () => {
            state.mediaElement.pause();
            end();
            state.playing = false;
        }
        state.toggle = () => state.playing ? state.pause() : state.play();
        state.getTime = () => state.mediaElement.currentTime;
        state.seek = time => {
            end();
            state.mediaElement.currentTime = time;
            start();
        }
        state.mediaElement.addEventListener( 'ended', () => {
            if ( state.track < work.files.length - 1 ) {
                state.play( 0, state.track + 1 )
            } else {
                state.track = state.time = 0;
                state.playing = false;
                end();
                m.redraw();
            }
        });
        window.innerWidth >= 768 ? state.play( track, time ) : setTrack( track, time );
    },
    onbeforeremove: ({ dom, state, attrs: { work } }) => {
        // played.end( work.files[ state.track ].name, state.mediaElement.currentTime );
        if ( state.playing ) state.pause();
        // dom.classList.add('work_transition-out');
        tween({ from: 1, to: 0, duration: 400, onProgress: x => {
            state.mediaElement.volume = x;
        }}).then(() => {
            state.mediaElement.src = '';
        })
    },
    view: ({ attrs: { work }, state }) => {
        var {
            transitionIn,
            playing,
            track,
            getTime,
            play,
            toggle,
            seek,
            mediaElement,
            fullscreen
        } = state;
        var asset = work.files[ track ].file;
        var isVideo = mediaElement instanceof HTMLVideoElement;
        return m('div', { className: transitionIn ? 'work work_transition-in' : 'work' },
            m( Scrubber, { asset, seek, mediaElement }),
            !fullscreen &&
                m( 'a.work__back', { href: '/', oncreate: m.route.link }, 'Kuedo' ),
            !fullscreen && window.innerWidth >= 768 &&
                m( Spectrogram, {
                    work,
                    getTime,
                    getTrack: () => state.track,
                    // onload: state.onload
                }),
            m('.work__body',
                !fullscreen && [
                    m( '.work__title', work.title ),
                    m( 'a', { className: `work__play-pause work__play-pause--${ playing ? 'pause' : 'play' }`, onclick: toggle }, 'Pause' )
                ],
                isVideo && m( Video, { mediaElement, fullscreen: state.fullscreen, onclick: () => state.fullscreen = !state.fullscreen }),
                !fullscreen && [
                    work.artwork && m('img.work__artwork', { src: work.artwork } ),
                    m( Playlist, { work, track, playing, play, getTime }),
                    m( '.work__description', m.trust( work.body ) ),
                    work.buy && m('a.work__buy', { href: work.buy, target: '_blank' }, 'Buy' )
                ]
            )
        )
    }
}


// module.exports = {
//     transitionIn: true,
//     fullscreen: false,
//     oninit: ({ attrs: { work, assets, track = 0, time = 0 }, state }) => {
//         document.body.classList.add( 'loading' );
//         player.emitter.emit( 'playlist', work.files.map( f => f.name ) );
//         player.emitter.emit( 'play', { track, time });
//         state.onplay = () => state.fullscreen = state.fullscreen && player.asset().type === 'video';
//         player.emitter.on( 'play', state.onplay )
//     },
//     oncreate: vnode => {
//         if ( window.innerWidth < 768 ) vnode.state.onload( vnode );
//     },
//     onbeforeremove: ({ dom, state }) => {
//         dom.classList.add('work_transition-out');
//         player.emitter.emit( 'unload' );
//         player.emitter.removeListener( 'play', state.onplay );
//         return wait( 400 );
//     },
//     onload: ({ state }) => {
//         state.transitionIn = false;
//         document.body.classList.remove('loading');
//         m.redraw();
//     },
//     view: ({ attrs: { work }, state }) => {
//         var className = state.transitionIn ? 'work work_transition-in' : 'work';
//         var toggleFullscreen = () => {
//             state.fullscreen = !state.fullscreen;
//         };
//         var playingVideo = player.state.assetType() === 'video';
//         return m('div', { className },
//             m( Scrubber ),
//             !state.fullscreen && m( 'a.work__back', { href: '/', oncreate: m.route.link }, 'Kuedo' ),
//             !state.fullscreen && window.innerWidth >= 768 && [
//                 m( Spectrogram, { onload: () => state.onload({ state }) } ),
//                 m( Player, { work } )
//             ],
//             m('.work__body',
//                 !state.fullscreen && m( '.work__mobile-title', work.title ),
//                 playingVideo && m( Video, { fullscreen: state.fullscreen, onclick: toggleFullscreen } ),
//                 !state.fullscreen && [
//                     work.artwork && m('img.work__artwork', { src: assets[ work.artwork ] } ),
//                     m( '.player__play-pause', { onclick: () => player.emitter.emit( 'toggle' ) }, player.state.playing ? 'Pause' : 'Play' ),
//                     m( Playlist, { work }),
//                     m.trust( work.body ),
//                     work.buy && m('a.work__buy', { href: work.buy, target: '_blank' }, 'Buy' ),
//                 ]
//             )
//         )
//     }
// }