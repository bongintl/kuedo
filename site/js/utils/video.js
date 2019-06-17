var rAF = require('./rAF');

module.exports = ( state, emitter ) => {
    
    state.element = document.createElement( 'video' );
    state.element.setAttribute( 'playsinline', 'playsinline' );
    state.element.setAttribute('webkit-playsinline', 'webkit-playsinline');
    
    state.element.addEventListener( 'ended', () => {
        unload();
        emitter.emit( 'end' );
    })
    
    var unload = () => {
        state.element.src = '';
        rAF.stop( 'videoprogress' );
    }
    
    var isVideo = () => state.asset().type === 'video';
    
    emitter.on( 'play', ({ track = state.track, time = state.time } = {}) => {
        var asset = state.asset( track );
        if ( asset.type !== 'video' ) return;
        if ( state.element.src !== asset.src ) {
            unload();
            state.element.src = asset.src;
            state.element.load();
            state.element.currentTime = time;
            rAF.start( 'videoprogress', () => emitter.emit( 'progress', state.element.currentTime ))
        }
        emitter.emit('tryPlay', { promise: state.element.play(), track, time });
    });
    
    emitter.on( 'pause', () => isVideo() && state.element.pause() );
    
    emitter.on( 'seek', time => isVideo() && ( state.element.currentTime = time ) )
    
    emitter.on( 'unload', unload );
    
}