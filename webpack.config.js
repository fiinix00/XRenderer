const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const StripWhitespace = require('strip-whitespace-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const arg_isProd = process.argv.indexOf('-p') !== -1;

const minify = arg_isProd;

const terser = new TerserPlugin({
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
        compress: true,
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
});

const uglifyTemplateString = require('uglify-template-string-loader');

const uglifyInterolation = {
    test: /\.tsx?$/,
    enforce: "pre",
    loader: 'regexp-replace-loader',
    exclude: /node_modules/,
    options: {
        match: {
            pattern: /(?:(?:=)|(?:=>)|(?:return))(?:\s*\()?\s*(?<hasHtmlTag>(?:html))`([\d|\D]*?)`/,
            flags: 'g'
        },
        replaceWith: () => {
            return function (match, $1) {

                var hasHtmlTag = false;

                for (var i = 0; i < arguments.length; i++) {
                    var current = arguments[i];

                    if (typeof current === 'object') {
                        if ("hasHtmlTag" in current) {
                            hasHtmlTag = true;
                        }
                    }
                }
                
                if (hasHtmlTag) {
                    var step1 = uglifyTemplateString(match.replace("return html`", "/*htmlLit*/return `"));
                    var step2 = step1.replace("/*htmlLit*/return `", "return html`");
                    
                    return step2;
                } else {
                    return uglifyTemplateString(match);
                }
            };
        }
    }
};

module.exports = {
    entry: {
        main: './src/main.ts'
    },

    devtool: false, //"cheap-source-map",

    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        hot: false,
        inline: false,
        compress: true
    },
    module: {
        rules: [

            uglifyInterolation, 

            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: [{ loader: "ts-loader"}]
            },
        ]
    },

    plugins: [
        //new StripWhitespace(),
        //terser
    ],

    resolve: {
        extensions: ['.ts', '.js']
    },

    optimization: {
        minimize: minify,
        minimizer: minify ? [terser] : [],

        runtimeChunk: false,

        splitChunks: {
            chunks: 'all',
            minSize: 45000,
            maxSize: 0,
            minChunks: 1,
            maxAsyncRequests: 100,
            maxInitialRequests: 1,
            automaticNameDelimiter: '~',
            name: true,
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10
                },
                default: {
                    minChunks: 2,
                    priority: -20,
                    reuseExistingChunk: true
                }
            }
        }
    }
};