module.exports = ( key, value ) => {
    if ( value === undefined ) {
        value = window.localStorage.getItem( key );
        return value === null ? value : JSON.parse( value );
    } else {
        window.localStorage.setItem( key, JSON.stringify( value ) )
    }
}
