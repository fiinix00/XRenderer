const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
var StripWhitespace = require('strip-whitespace-plugin');

module.exports = {
    entry: {
        main: './src/main.ts'
    },

    devtool: false, //"cheap-source-map",

    module: {
        rules: [
            { test: /\.tsx?$/, loader: "ts-loader" }
        ]
    },

    plugins: [
        new StripWhitespace()
    ],

    resolve: {
        extensions: ['.ts', '.js']
    },

    optimization: {
        minimizer: [
            new TerserPlugin({
                parallel: true,
                cache: './buildcache',
                extractComments: {
                    condition: /^\**!|@preserve|@license|@cc_on/i,
                    filename: 'LICENCES.txt',
                    banner: (licenseFile) => {
                        return `License information can be found in ${licenseFile}`;
                    }
                },
                terserOptions: {
                    warnings: false,
                    parse: {},
                    compress: {},
                    mangle: {
                        toplevel: true,
                        eval: true,
                        properties: false
                    },
                    module: false,
    
                    output: {
                        comments: false
                    },
                    
                    toplevel: false,
                    nameCache: null,
                    ie8: false,
                    keep_classnames: false,
                    keep_fnames: false,
                    safari10: false,
    
                    ecma: 6
                }
            })
        ]
    }
};