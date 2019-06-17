<?php

function parseTime ( $hhmmss ) {
    $time = explode( ':', $hhmmss );
    $seconds = (int) array_pop( $time );
    $minutes = count( $time ) ? (int) array_pop( $time ) : 0;
    $hours = count( $time ) ? (int) array_pop( $time ) : 0;
    return $seconds + $minutes * 60 + $hours * 60 * 60;
}

  function splitBody ( $text ) {
    $parts = preg_split( '/\n{2,}/', $text );
    return implode( '', array_map( 'kirbytext', $parts ) );
}

function db ( $site ) {

  $transformProject = function ( $page ) {
    $data = [
      'title' => (string) $page -> title(),
      'type' => (string) $page -> intendedTemplate(),
      'slug' => (string) $page -> slug()
    ];
    if ( $page -> artwork() -> isNotEmpty() ) {
      $data['artwork'] = (string) $page -> file( $page -> artwork() ) -> url();
    }
    if ( $page -> tracks() -> isNotEmpty() ) {
      $data[ 'files' ] = $page
        -> tracks()
        -> toStructure()
        -> toArray( function ( $track ) use ( $page ) {
          return [
            'title' => (string) $track -> title(),
            'file' => spectrogram( $page -> file( $track -> file() ) )
          ];
        });
    } else if ( $page -> track() -> isNotEmpty() ) {
      $data[ 'files' ] = [[
        'file' => spectrogram( $page -> file( $page -> track() ) )
      ]];
    } else {
      $data[ 'files' ] = [];
    }

    if ( $page -> timestamps() -> isNotEmpty() ) {
      $data[ 'timestamps' ] = $page
        -> timestamps()
        -> toStructure()
        -> toArray( function ( $timestamp ) {
          return [
            'title' => (string) $timestamp -> title(),
            'artist' => (string) $timestamp -> artist(),
            'time' => parseTime( $timestamp -> time() )
          ];
        });
    }

    if ( $page -> buy() -> isNotEmpty() ) {
      $data['buy'] = (string) $page -> buy();
    }

    return $data;
  };

  $validate = function ( $data ) {
    foreach ( $data[ 'files' ] as $file ) {
      if ( $file[ 'file' ] === null ) return false;
    }
    return true;
  };

  return [
    'work' => array_values( array_filter(
      $site
        -> page('work')
        -> children()
        -> visible()
        -> toArray( $transformProject ),
      $validate
    )),
    'about' => [
      'slug' => 'about',
      'body' => splitBody( $site -> page('about') -> body() )
    ]
  ];

}