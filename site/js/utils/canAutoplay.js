module.exports = () => {
    var mp3 = 'data:audio/mpeg;base64,/+MYxAAAAANIAUAAAASEEB/jwOFM/0MM/90b/+RhST//w4NFwOjf///PZu////9lns5GFDv//l9GlUIEEIAAAgIg8Ir/JGq3/+MYxDsLIj5QMYcoAP0dv9HIjUcH//yYSg+CIbkGP//8w0bLVjUP///3Z0x5QCAv/yLjwtGKTEFNRTMuOTeqqqqqqqqqqqqq/+MYxEkNmdJkUYc4AKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq';
    var audio = new Audio();
    audio.src = mp3;
    var p = audio.play();
    // Assume that browsers which don't return promise do allow autoplay (???)
    if ( !( p instanceof Promise ) ) return Promise.resolve( true );
    return new Promise( resolve => {
        p
            .then( () => resolve( true ) )
            .catch( () => resolve( false ) )
    })
}