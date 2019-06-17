var EXCEPT = [
	'oninit',
	'oncreate',
	'onbeforeupdate',
	'onupdate',
	'onbeforeremove',
	'onremove',
	'view'
];

var autobind = ({ state }) => {
	for ( var key in state ) {
		if ( !EXCEPT.includes( key ) && typeof state[ key ] === 'function' ) {
			state[ key ] = state[ key ].bind( state, state );
		}
	}
}

module.exports = arg => {
	if ( typeof arg === 'function' ) {
		return vnode => {
			autobind( vnode );
			return fn( vnode );
		}
	} else {
		autobind( arg );
	}
}