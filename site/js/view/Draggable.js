var m = require('mithril');

module.exports = {
    dragging: false,
    oncreate: ({ dom, state }) => {
        if ( 'ontouchstart' in window ) return;
        var prev;
        var onDown = e => {
            prev = e.clientX;
            dom.addEventListener( 'mousemove', onMove );
        };
        var onMove = e => {
            e.preventDefault();
            var d = prev - e.clientX;
            dom.scrollLeft += d;
            prev = e.clientX;
            if ( !state.dragging ) {
                state.dragging = true;
                m.redraw();
            }
        }
        var onUp = e => {
            onMove( e );
            dom.removeEventListener( 'mousemove', onMove );
            setTimeout( () => {
                state.dragging = false;
                m.redraw();
            }, 10 );
        }
        dom.addEventListener( 'mousedown', onDown );
        dom.addEventListener( 'mouseup', onUp );
    },
    view: ({ state: { dragging }, children }) => {
        var className = dragging ? 'draggable draggable_dragging' : 'draggable';
        return m('div', { className },
            m('.draggable__inner', children )
        )
    }
}