module.exports = canvas => {
    
    var gl = canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' );
    
    var vs = gl.createShader( gl.VERTEX_SHADER );
    gl.shaderSource( vs, `
        attribute vec2 aPosition;
        uniform vec2 uPosition;
        uniform vec2 uSize;
        uniform vec2 uResolution;
        varying vec2 vUv;
        void main () {
            vec2 p = ((( aPosition * uSize ) + uPosition ) / uResolution ) * 2. - 1.;
            p.y = -p.y;
            gl_Position = vec4( p, 0., 1. );
            vUv = aPosition;
        }
    `);
    gl.compileShader( vs );
    
    var fs = gl.createShader( gl.FRAGMENT_SHADER );
    gl.shaderSource( fs, `
        precision highp float;
        const vec3 pink = vec3( ${ 255 / 255 }, ${ 199 / 255 }, ${ 199 / 255 } );
        precision highp float;
        varying vec2 vUv;
        uniform sampler2D uTex;
        uniform vec2 uResolution;
        void main () {
            vec2 p = 1. - gl_FragCoord.xy / uResolution.xy;
            float shine = pow( smoothstep( .485, .5, p.y ) * ( 1. - smoothstep( .5, .515, p.y ) ), 5. );
            float value = texture2D( uTex, vUv ).r;
            float spectro = smoothstep( .25, .29, value );
            //float shimmer = smoothstep( .12, .17, value * shine );
            //vec3 color = mix( mix( pink, vec3( 1 ), step( .5, p.y ) ) * spectro, vec3( 1. ), shimmer );
            vec3 color = pink * spectro;
            //vec3 color = mix( pink, vec3( 1 ), step( .5, p.y ) ) * spectro;
            gl_FragColor = vec4( color, 1. );
        }
    `);
    gl.compileShader( fs );
    // console.log( gl.getShaderInfoLog( fs ) );
    
    var shader = gl.createProgram();
    gl.attachShader( shader, vs );
    gl.attachShader( shader, fs );
    gl.linkProgram( shader );
    gl.useProgram( shader );
    
    var buffer = new Float32Array([
        1, 0,
        0, 0,
        0, 1,
        1, 0,
        0, 1,
        1, 1
    ]);
    gl.bindBuffer( gl.ARRAY_BUFFER, gl.createBuffer() );
    gl.bufferData( gl.ARRAY_BUFFER, buffer, gl.STATIC_DRAW );
    var aPosition = gl.getAttribLocation( shader, "aPosition" );
    gl.enableVertexAttribArray( aPosition );
    gl.vertexAttribPointer( aPosition, 2, gl.FLOAT, false, 0, 0 );
    
    var uPosition = gl.getUniformLocation( shader, "uPosition" );
    var uSize = gl.getUniformLocation( shader, "uSize" );
    var uResolution = gl.getUniformLocation( shader, "uResolution" );
    var uTex = gl.getUniformLocation( shader, "uTex" );
  
    gl.activeTexture( gl.TEXTURE0 );
    gl.uniform1i( uTex, 0 );
    gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );
    gl.disable( gl.DEPTH_TEST );
    
    var textures = new WeakMap();
    var getTexture = img => {
        if ( !textures.has( img ) ) {
            var texture = gl.createTexture();
            gl.bindTexture( gl.TEXTURE_2D, texture );
            gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img );
            gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
            gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
            gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
            textures.set( img, texture );
        }
        return textures.get( img );
    }
    
    return quads => {
        if ( !Array.isArray( quads ) ) quads = [ quads ];
        var { width, height } = canvas;
        gl.viewport( 0, 0, width, height );
        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT );
        gl.uniform2fv( uResolution, [ width, height ] );
        quads.forEach( ({ x, y, w, h, img }) => {
            gl.uniform2fv( uPosition, [ x, y ] );
            gl.uniform2fv( uSize, [ w, h ] );
            gl.bindTexture( gl.TEXTURE_2D, getTexture( img ) );
            gl.drawArrays( gl.TRIANGLES, 0, 6 );
        });
    }
    
};