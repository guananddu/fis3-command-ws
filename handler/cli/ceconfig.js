/**
 * ceconfig
 */

var shell = require( 'shelljs' );
var utils = require( '../../common/utils' );
var path = require( 'path' );
var fs = require( 'fs' );
var wsconfig = require( '../../config' );

var dir = process.cwd();

function cemain( callback ) {

    var configfile = path.join( dir, wsconfig.configName );

    if ( fs.existsSync( configfile ) ) {
        utils.clog.tip( 'ws config file exists in: ' + dir + '. Will do nothing.');
        return;
    }

    utils.clog.nor( 'create ws config file for your project, in dir: ' + dir );

    var comm = [

        'cp -f "',
        path.join( __dirname, '../../store', wsconfig.configName ),
        '" "',
        path.dirname( configfile ),
        '"'

    ].join( '' );

    comm = utils.handleWinCp( comm );

    utils.clog.cmd( 'running ' + comm );

    shell.exec( comm, function( code, output ) {
        utils.clog.nor( 'Exit code: ' + utils.errorMaps[ code ] );

        callback && callback();

    } );

}

module.exports = function( type, callback ) {

    var program = this;

    switch ( type ) {

        case 'main':
            cemain( callback );
            break;

        default:
            break;

    }

};
