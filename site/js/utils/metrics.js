var MEDIUM = 768;
var LARGE = 1200;

var breakpoint = ( ww = window.innerWidth ) => {
    if ( ww < MEDIUM ) return 'small';
    if ( ww < LARGE ) return 'medium';
    return 'large';
}

var responsive = values => ( bp = breakpoint() ) => values[ bp ];

module.exports = {
    rem: responsive({
        small: 15,
        medium: 18,
        large: 20
    }),
    homeColumn: responsive({
        small: 50,
        medium: 70,
        large: 80
    }),
    playerWidth: responsive({
        small: .2,
        medium: .4,
        large: .6
    })
}