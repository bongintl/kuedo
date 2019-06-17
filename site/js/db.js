module.exports = JSON.parse( document.getElementById('data').innerText );

// var db = window.db;

// db.work.forEach( work => {
//     if ( !( 'files' in work ) ) {
//         work.files = [];
//     }
//     if ( typeof work.files === 'string' ) {
//         work.files = [ { name: work.files } ];
//     }
// })

// console.log( db );

// module.exports = db;

// module.exports = {
//     load: () => {
//         /* global fetch */
//         return fetch('./data.json')
//             .then( res => res.json() )
//             .then( ({ content, assets }) => {
//                 content.work.forEach( work => {
//                     if ( !( 'files' in work ) ) {
//                         work.files = [];
//                     }
//                     if ( typeof work.files === 'string' ) {
//                         work.files = [ { name: work.files } ];
//                     }
//                 })
//                 return { content, assets };
//             })
//     }
// };