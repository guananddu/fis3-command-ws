/**
 * html 中间层，处理velocity
 */

var fs = require( 'fs' );
var path = require( 'path' );
var mkdirp = require( 'mkdirp' );
var colors = require( 'colors' );

var wsconfig = require( '../../config' );
var utils = require( '../../common/utils' );
var _ = require( 'underscore' );

var urlparser = require( 'urlparse' );

var Engine = require( 'velocity' ).Engine;

var config;

var connectN;

var make = function( url2filename, fullpath, req, res ) {
    // debugger;

    var dirname = path.dirname( fullpath );
    var commonPath = path.join(
        config.mockAjax, config.mockCommon );

    // delete cache
    delete require.cache[ require.resolve( fullpath ) ];
    var fullpathRequired = require( fullpath );

    var commonPathRequired = {};
    fs.exists( commonPath, function( exists ) {
        if ( exists ) {
            delete require.cache[ require.resolve( commonPath ) ];
            commonPathRequired = require( commonPath );
        }
        answer();
    } );

    var answer = function() {

        // 输出ajax请求
        utils.clog.tip( 'ajax: ' + req.url );

        res.setHeader( 'Content-Type', 'text/html;charset=UTF-8' );

        // 判断是否为function
        if ( typeof( fullpathRequired ) == 'function' ) {
            // 带入请求对象，此function需要返回object
            fullpathRequired = fullpathRequired.call( req, urlparser( req.url ) );
        }

        // 判断是不是纯粹的字符串等基本类型
        var fullpathRequiredType = typeof( fullpathRequired );
        if ( ~ [ 'number', 'string', 'boolean' ]
                .indexOf( fullpathRequiredType ) ) {
            return res.end( fullpathRequired.toString() );
        }

        if ( fullpathRequiredType == 'undefined' ) {
            return res.end( 'undefined' );
        }

        if ( fullpathRequiredType == 'object' && fullpathRequired === null ) {
            return res.end( 'null' );
        }

        // 如果是数组
        if ( fullpathRequired instanceof Array ) {
            return res.end( JSON.stringify( fullpathRequired ) );
        }

        // 以下考虑都是普通的Map(Object)类型
        var context = _.extend( commonPathRequired, fullpathRequired );

        if ( context.__sleep__ ) {
            
            setTimeout( function () {
                res.end( JSON.stringify( context ) );
                // connectN();
            }, context.__sleep__ );

            return;
        }

        res.end( JSON.stringify( context ) );

        // connectN();

    };

};

var create = function( url2filename, fullpath, req, res ) {

    var args = arguments;

    // 构建目录结构
    mkdirp( path.dirname( fullpath ), function( err ) {
        if ( err ) throw ( err )
        fs.writeFile( fullpath, wsconfig.mock, function( err ) {
            if ( err ) throw err;
            // res.end( 'Had create mock file for you, go to mock directory, write your mock data. :)' );
            make.apply( null, args );
        } );
    } );

};

exports.run = function( req, res, next, importConfig ) {

    // connectN = next;

    // debugger;

    config = importConfig;

    // 去掉 html 后面附加的参数: xxx.html?a=1
    var url = utils.trimUrlQuery( req.url );
    // /projectExperience/save.json to ...
    // projectExperience_save.json.js
    // var url2filename = utils.handleMockFullname( url );
    var fullpath = path.join( config.mockAjax, utils.handleMockJsTail( url ) );

    var arg = [ url, fullpath, req, res ];
    // 检查mock下面是否有对应的js文件存在，没有的话，自动生成
    fs.exists( fullpath, function( exists ) {
        exists
            ? make.apply( null, arg ) : create.apply( null, arg );
    } );

};
