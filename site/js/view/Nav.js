var m = require('mithril');

var TYPES = [
    [ 'release', 'Releases'],
    [ 'project', 'Projects' ],
    [ 'live', 'Live' ],
    [ 'mix', 'Mixes' ]
]

var cls = active => 'nav__item' + ( active ? ' nav__item_active' : '' );

module.exports = {
    view: ({ attrs: { highlight, setFilter } }) => {
        var route = m.route.get();
        return m('.nav',
            m('.nav__item', { onclick: () => {
                setFilter( null );
                m.route.set( '/' );
            }}, 'Kuedo' ),
            TYPES.map( ([ type, plural ]) => {
                var active = route !== '/about' && highlight === type;
                return m('a', {
                    className: cls( active ),
                    onclick: () => {
                        setFilter( type );
                        m.route.set('/');
                    }
                }, plural );
            }),
            m('a', {
                href: '/about',
                oncreate: m.route.link,
                className: cls( route === '/about' )
            }, 'About' )
        )
    }
}