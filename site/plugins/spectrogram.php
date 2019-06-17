<?php

define( 'CONVERT', $_SERVER['REMOTE_ADDR'] === '::1' ? 'convert' : '~/bin/convert' );

ConverterAsync::define([
	'name' => 'duration',
	'extension' => 'txt',
	'label' => function ( $inFile, $outFile, $params ) {
		return "Get duration of " . basename( $inFile );
	},
	'command' => function ( $inFile, $outFile, $params ) {
		$info = shell_exec( 'ffmpeg -i "' . $inFile . '" -f null - 2>&1' );
		if ( preg_match( "/: Invalid /", $info ) ){
			throw new Exception( "Couldn't get duration" );
		}
		preg_match_all( "/time=(.{2}):(.{2}):(.{2})/", $info, $durations, PREG_SET_ORDER );
		$duration = end( $durations );
		if( !isset( $duration[ 1 ] ) ) {
			return false;
		}
		$hours = $duration[ 1 ];
		$minutes = $duration[ 2 ];
		$seconds = $duration[ 3 ];
		f::write( $outFile, $seconds + ( $minutes * 60 ) + ( $hours * 60 * 60 ) );
	}
]);

function mmss ( $s ) {
	return floor( $s / 60 ) . ':' . str_pad( (string) $s % 60, 2, '0' );
}

ConverterAsync::define([
	'name' => 'spectrogramTile',
	'extension' => 'jpg',
	'label' => function ( $inFile, $outFile, $params ) {
		return 'Render spectrogram for ' . basename( $inFile ) . ' from ' . mmss( $params['startTime'] ) . ' to ' . mmss( $params['startTime'] + $params['duration'] );
	},
	'command' => 'ffmpeg -loglevel warning -y -ss {startTime} -t {duration} -i "{inFile}" -lavfi showspectrumpic=s={width}x{paddedHeight}:mode=combined:legend=disabled:color=channel:orientation=horizontal -f image2pipe pipe: | '.CONVERT.' - -crop x{height}+0+0 -channel B -separate -quality 50 {outFile}'
]);

ConverterAsync::define([
	'name' => 'spectrogramThumbnail',
	'extension' => 'jpg',
	'label' => function ( $inFile, $outFile, $params ) {
		return "Render thumbnail for " . basename( $inFile );
	},
	'command' => 'ffmpeg -loglevel warning -y -i "{inFile}" -lavfi showspectrumpic=s=1000x12000:mode=combined:legend=disabled:color=channel:orientation=horizontal -f image2pipe pipe: | '.CONVERT.' - -channel B -separate -threshold 27% -resize 25% -quality 50 {outFile}'
]);

ConverterAsync::define([
	'name' => 'transcodeAudio',
	'extension' => 'mp3',
	'label' => function ( $inFile ) {
		return "Compress " . basename( $inFile );
	},
	'command' => 'ffmpeg -loglevel warning -y -i "{inFile}" -codec:a libmp3lame -q:a 5 "{outFile}"'
]);

ConverterAsync::define([
	'name' => 'transcodeVideo',
	'extension' => 'mp4',
	'label' => function ( $inFile ) {
		return "Compress " . basename( $inFile );
	},
	'command' => 'ffmpeg -loglevel warning -y -i "{inFile}" -vf "scale=-1:\'min(720,ih)\'" -crf 25 "{outFile}"'
]);

function tileParams ( $duration ) {

	$WIDTH = 1000;
	$TIME_CHUNK = 15;
	$PADDING = 0.1;
	$PX_PER_S = 100;

	$num = ceil( $duration / $TIME_CHUNK );
	$tiles = [];

	for ( $i = 0; $i < $num; $i++ ) {
		$t = $TIME_CHUNK * $i;
		$d = min( $duration - $t, $TIME_CHUNK + $PADDING );
		$paddedHeight = floor( $d * $PX_PER_S );
		$height = min( $paddedHeight, $TIME_CHUNK * $PX_PER_S );
		$tiles []= [
			'width' => $WIDTH,
			'paddedHeight' => $paddedHeight,
			'height' => $height,
			'startTime' => $t,
			'duration' => $d
		];
	}

	return $tiles;

}

function img ( $file ) {
	if ( $file === null ) return null;
	return [
		'src' => $file -> url(),
		'w' => $file -> width(),
		'h' => $file -> height()
	];
};

function spectrogram ( $file ) {
	$type = $file -> type();
	return ConverterAsync::collect([
		$file -> duration(),
		$file -> spectrogramThumbnail(),
		$type === 'audio' ? $file -> transcodeAudio() : $file -> transcodeVideo()
	], function ( $durationFile, $thumbnail, $src ) use ( $file, $type ) {
		$duration = (int) $durationFile -> content();
		$createTile = function ( $params ) use ( $file ) {
			return $file -> spectrogramTile( $params );
		};
		$tiles = array_map( $createTile, tileParams( $duration ) );
		return ConverterAsync::collect( $tiles, function () use ( $type, $duration, $thumbnail, $src, $tiles ) {
			return [
				'type' => $type,
				'src' => (string) $src -> url(),
				'duration' => $duration,
				'tiles' => array_map( 'img', $tiles ),
				'thumbnail' => img( $thumbnail )
			];
		});
	});
}