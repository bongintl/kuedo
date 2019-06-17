var m = require('mithril');

module.exports = {
    view: ({ attrs: { body } }) => {
        return m('.about', m.trust( body ) );
    }
}