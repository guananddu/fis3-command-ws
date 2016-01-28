/**
 * webserver
 */

var shell = require( 'shelljs' );
var path = require( 'path' );
var fs = require( 'fs' );
var dir = process.cwd();
var wsconfig = require( '../../config' );

var utils = require( '../../common/utils' );

var configFile;
var config;

/**
 * 启动服务器
 * @return {[type]} [description]
 */
var startWs = function() {

    // 直接require grunt
    var g = require( 'grunt' );
    // ws 模式下只有一个默认的任务
    g.cli.tasks = [ 'default' ];
    // 配置选项
    g.cli.options.gruntfile = path.join( __dirname, '../../', wsconfig.wsName );
    g.cli.options.configpath = path.join( dir, configFile );
    // 运行grunt
    g.cli();

    var cwdConfig = require( g.cli.options.configpath );

    // 自动打开浏览器
    setTimeout( function () {
        utils.open( 'http:/localhost:' + cwdConfig.webPort, openDone );
    }, 1000 );

};

var openDone = function (){ };

var ceIdtConfig = function () {

    require( './ceconfig' )( 'main', startWs );

};

module.exports = function( action, options ) {

    configFile = wsconfig.configName;
    utils.clog.cmd( 'running fis3b ws(webserver) '
        + action + ', use ' + configFile );

    switch ( action ) {

        // start the webserver
        case 'start':
            fs.exists( path.join( dir, configFile ), function( exists ) {
                exists ? startWs() : ceIdtConfig();
            } );
            break;

        default:

            break;

    }

};
