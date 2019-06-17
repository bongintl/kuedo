module.exports = seconds => {
    var m = String( Math.floor( seconds / 60 ) )
    var s = String( Math.ceil( seconds % 60 ) );
    return m + ':' + s.padStart( 2, '0' )
}