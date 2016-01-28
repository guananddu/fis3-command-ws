var _ = fis.util;
var ws = require( './handler/cli/main' )[ 'ws' ];

exports.name = 'ws <command>';
exports.desc = 'launch a mock server';
exports.options = {
    '-h, --help': 'print this help message'
};
exports.commands = {
    'start': 'start mock server'
};

exports.run = function( argv, cli, env ) {

    // 显示帮助信息
    if ( argv.h || argv.help ) {
        return cli.help( exports.name, exports.options, exports.commands );
    }

    if ( !validate( argv ) ) {
        return;
    }

    var cmd = argv[ '_' ][ 1 ];

    switch ( cmd ) {

        case 'start':
            ws( cmd, {  } );
            break;

        default:
            cli.help( exports.name, exports.options, exports.commands );
            break;

    }

};

function validate() {
    return true;
}