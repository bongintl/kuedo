var m = require('mithril');
var db = require('./db');
var FontFaceObserver = require('fontfaceobserver');

var View = require('./view/View');

var init = () => {
    var view = View( db );
    m.route.prefix('');
    m.route( document.body, '/', {
        '/': view,
        '/about': view,
        '/work/:slug': view
    })
    window.addEventListener( 'resize', m.redraw );
    document.body.classList.remove( 'loading' )
}

Promise.all([
    // db.load(),
    new FontFaceObserver('Electra Display').load(),
    new FontFaceObserver('Grotesque MT').load()
]).then( init )