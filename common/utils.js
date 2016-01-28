/**
 * 工具
 */

var fs = require( 'fs' );
var path = require( 'path' );
var urler = require( 'url' );
var colors = require( 'colors' );

var _ = require( 'underscore' );

var os = require( 'os' );
var mimetype = require( './mimetype' );

/**
 * 去掉查询字符串等
 *
 * @param  {string} url [description]
 * @return {boolean}     [description]
 */
var trimUrlQuery = function( url ) {

    // if ( ~url.indexOf( '?' ) ) {
    //     return url.substring( 0, url.lastIndexOf( '?' ) )
    // } else {
    //     return url;
    // }

    var parsed = urler.parse( url );
    var protocol = parsed.protocol ? ( parsed.protocol + '//' ) : '';
    var host = parsed.host ? parsed.host : '';
    var pathname = parsed.pathname ? parsed.pathname : 'about:blank;';

    var returner = protocol + host + pathname;

    // 如果以'/'结尾，则去掉
    if ( returner.lastIndexOf( '/' ) == ( returner.length - 1 ) ) {
        returner = returner.substring( 0, returner.length - 1 );
    }

    return returner;

};

/**
 * 简易地检查url类型
 *
 * @param  {string} url  '/a/b/c.xxx'
 * @param  {string} type 'html'/'less'
 * @return {boolean}
 */
var checkUrlTail = function( url, type ) {

    url = trimUrlQuery( url );

    return url.substring( url.lastIndexOf( '.' ) + 1 ) == type;

};

var isWin32 = function () {

    return ~os.platform().indexOf( 'win32' );

};

var errorMaps = {
    0: 'ok'
};

module.exports = {

    errorMaps: errorMaps,

    trimUrlQuery: trimUrlQuery,

    clog: {

        cmd: function( msg ) {
            msg = 'Fi3b -> cmd: ' + msg;
            console.log(
                msg.bgGreen.blue );
        },

        error: function( msg ) {
            msg = 'Fi3b -> error: ' + msg;
            console.log(
                msg.bgGreen.red.underline );
        },

        tip: function ( msg ) {
            msg = 'Fi3b -> tip: ' + msg;
            console.log(
                msg.bgYellow.magenta );
        },

        tell: function ( msg ) {
            msg = 'Fi3b -> tell: ' + msg;
            console.log(
                msg.bgWhite.green );
        },

        nor: function ( msg ) {
            msg = 'Fi3b -> nor: ' + msg;
            console.log(
                msg.yellow );
        }

    },

    isWin32: isWin32,

    judgeImage: function ( response ) {

        return mimetype.image[ response.headers[ 'content-type' ] ];

    },

    handleWinCp: function( comm ) {

        if ( ! isWin32() )
            return comm;
        
        return comm
            .replace( /([a-z])\:\\/g, "\\$1\\" )
            .replace( /\\/g, '/' );

    },

    matchRProxy: function ( req, reverseProxyMap ) {

        var match = false;

        _.each( reverseProxyMap, function ( value, key ) {
            if ( value.pattern.test( req.url ) ) {
                match = key;
                return false;
            }
        } );

        return match;

    },

    src2asset: function ( spath ) {

        if ( spath.indexOf( 'src' ) == 0 ) {
            spath = spath.replace( 'src', 'asset' )
        }

        return spath;

    },

    getPathDir: function( pathl ) {

        var targetPath;
        var stats = fs.statSync( pathl );
        stats.isDirectory() ? ( targetPath = pathl ) : ( targetPath = path.dirname( pathl ) );

        return targetPath;

    },

    handleMockFullname: function( url ) {

        return url.substring( 1 ).replace( /\//g, '_' ) + '.js';

    },

    handleMockJsTail: function( path ) {

        return path + '.js';

    },

    trimExt: function ( tp ) {

        return tp.substring( 0, tp.lastIndexOf( '.' ) );

    },

    isHtml: function( req ) {

        var url = req.url;

        return checkUrlTail( url, 'html' ) || checkUrlTail( url, 'tpl' );

    },

    isAjax: function( req ) {

        var url = req.url;

        if ( req.headers[ 'x-requested-with' ] && ( req.headers[ 'x-requested-with' ] == 'XMLHttpRequest' ) && ( !checkUrlTail( url, 'js' ) ) )
            return 1;

        return checkUrlTail( url, 'json' );

    },

    isLess: function( req ) {

        var url = req.url;

        return checkUrlTail( url, 'less' );

    },

    isAtpl: function( req ) {

        // *.atpl.js
        var url = trimUrlQuery( req.url ).split( '.js' )[ 0 ];

        return checkUrlTail( url, 'atpl' );

    }

};

// copy from: https://github.com/fex-team/fis3-command-server/blob/master/lib/util.js

var mets = module.exports;

mets.hostname = ( function() {
    var ip = false;
    var net = require( 'os' ).networkInterfaces();

    Object.keys( net ).every( function( key ) {
        var detail = net[ key ];
        Object.keys( detail ).every( function( i ) {
            var address = String( detail[ i ].address ).trim();
            if ( address && /^\d+(?:\.\d+){3}$/.test( address ) && address !== '127.0.0.1' ) {
                ip = address;
            }
            return !ip; // 找到了，则跳出循环
        } );
        return !ip; // 找到了，则跳出循环
    } );
    return ip || 'unknown';
} )();

mets.open = function( path, callback ) {
    var child_process = require( 'child_process' );
    var cmd = fis.util.escapeShellArg( path );
    if ( fis.util.isWin() ) {
        cmd = 'start "" ' + cmd;
    } else {
        if ( process.env[ 'XDG_SESSION_COOKIE' ] ||
            process.env[ 'XDG_CONFIG_DIRS' ] ||
            process.env[ 'XDG_CURRENT_DESKTOP' ] ) {
            cmd = 'xdg-open ' + cmd;
        } else if ( process.env[ 'GNOME_DESKTOP_SESSION_ID' ] ) {
            cmd = 'gnome-open ' + cmd;
        } else {
            cmd = 'open ' + cmd;
        }
    }
    child_process.exec( cmd, callback );
};

mets.matchVersion = function( str ) {
    var version = false;
    var reg = /\b\d+(\.\d+){2}/;
    var match = str.match( reg );
    if ( match ) {
        version = match[ 0 ];
    }
    return version;
};

mets.getRCFile = function() {
    return fis.project.getTempPath( 'server/conf.json' );
};

mets.getPidFile = function() {
    return fis.project.getTempPath( 'server/pid' );
};

mets.pid = function( value ) {
    var pidFile = mets.getPidFile();

    if ( arguments.length ) {
        return value ? fis.util.write( pidFile, value ) : fis.util.fs.unlinkSync( pidFile );
    } else {

        if ( fis.util.exists( pidFile ) ) {
            return fis.util.fs.readFileSync( pidFile, 'utf8' ).trim();
        }

        return 0;
    }
};

mets.serverInfo = function( options ) {
    var conf = mets.getRCFile();

    if ( arguments.length ) {

        // setter
        return options && fis.util.write( conf, JSON.stringify( options, null, 2 ) );
    } else {

        // getter
        return fis.util.isFile( conf ) ? require( conf ) : null;
    }
};

mets.getDefaultServerRoot = function() {
    var key = 'FIS_SERVER_DOCUMENT_ROOT';

    if ( process.env && process.env[ key ] ) {
        var path = process.env[ key ];

        // 如果指定的是一个文件，应该报错。
        if ( fis.util.exists( path ) && !fis.util.isDir( path ) ) {
            fis.log.error( 'invalid environment variable [%s] of document root [%s]', key, root );
        }

        return path;
    }

    return fis.project.getTempPath( 'www' );
};

mets.printObject = function( o, prefix ) {
    prefix = prefix || '';
    for ( var key in o ) {
        if ( o.hasOwnProperty( key ) ) {
            if ( typeof o[ key ] === 'object' ) {
                mets.printObject( o[ key ], prefix + key + '.' );
            } else {
                console.log( prefix + key + '=' + o[ key ] );
            }
        }
    }
};