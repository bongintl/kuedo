var m = require('mithril');

var _loadImage = require('../utils/loadImage');
var Quads = require('../utils/quads');
// var player = require('../player');
var db = require('../db');

var DPR = 1//window.devicePixelRatio || 1;

var wait = delay => new Promise( resolve => setTimeout( resolve, delay ) );

var updateSize = ({ dom, state }) => {
    var { width, height } = dom.getBoundingClientRect();
    state.width = dom.width = width * DPR;
    state.height = dom.height = height * DPR;
}

var pluck = ( objs, key ) => objs.map( obj => obj[ key ] );
var sum = xs => xs.reduce( ( sum, x ) => sum + x, 0 );
var sumDuration = files => sum( pluck( files, 'duration' ) );
var sumHeight = tiles => sum( pluck( tiles, 'h' ) );
var flatten = arrs => arrs.reduce( ( acc, arr ) => acc.concat( arr ), [] );
var flattenTiles = files => flatten( pluck( files, 'tiles' ) );

var visibleTiles = ({ state: { width, height }, attrs: { work, getTrack, getTime } }) => {
    var assets = work.files.map(({ file }) => file );
    var elapsed = sumDuration( assets.slice( 0, getTrack() ) ) + getTime();
    var flat = flattenTiles( assets );
    var scale = width / flat[ 0 ].w;
    var offset = ( ( elapsed / sumDuration( assets ) ) * -sumHeight( flat ) * scale ) + height// / 2;
    return flat
        .map( ( tile, i ) => {
            var t = {
                key: i,
                y: offset,
                w: tile.w * scale,
                h: tile.h * scale,
                src: tile.src
            }
            offset += tile.h * scale;
            return t;
        })
        .filter( ({ y, h }) => y <= height * 1.5 && y + h > 0 );
}

var imgs = {};
var loadImage = src => !( src in imgs ) && _loadImage( src ).then( img => imgs[ src ] = img );

module.exports = {
    
    oncreate: vnode => {
        updateSize( vnode );
        var draw = Quads( vnode.dom );
        Promise.all([
            ...visibleTiles( vnode ).map( tile => loadImage( tile.src ) ),
            wait( 0 )
        ]).then( () => {
            // vnode.attrs.onload();
            // vnode.state.draw();
        });
        var tick = () => {
            var tiles = visibleTiles( vnode );
            tiles.forEach( ({ src }) => loadImage( src ));
            draw( tiles
                .filter(({ src }) => src in imgs )
                .map(({ src, y, w, h }) => ({
                    img: imgs[ src ],
                    x: 0,
                    y, w, h
                }))
            )
            vnode.state.frame = requestAnimationFrame( tick );
        }
        tick();
    },
    
    onremove: vnode => {
        imgs = {};
        // player.emitter.removeListener( 'progress', vnode.state.draw );
        // window.removeEventListener( 'resize', vnode.state.draw );
        window.cancelAnimationFrame( vnode.state.frame );
    },
    
    onupdate: updateSize,
    
    view: () => m( 'canvas.spectrogram' )
    
}