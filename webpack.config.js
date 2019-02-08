const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const StripWhitespace = require('strip-whitespace-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

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
        
        ecma: 8
    }
});

const uglifyTemplateString = require('uglify-template-string-loader');

const jsxFixupRegexp = /\$\(((?:<host>){0,1}?)?([\d|\D|\s]*?)((?:<\/host>){0,1}?)\)\!(;|!)/;
const jsxFixup = {
    test: /\.tsx?$/,
    enforce: "pre",
    loader: 'regexp-replace-loader',
    exclude: /node_modules/,
    options: {
        match: {
            pattern: jsxFixupRegexp,
            flags: 'g'
        },
        replaceWith: () => {
            
            return function (raw, hostTagStart, text, hostTagEnd) {

                //console.warn("args", arguments);

                function fix(str) {
                    var rep = str.replace(/=\{([\d|\D|\s]*?)\}/g, function (m, _$1) {
                        return `=$\{${_$1}\}`
                    });

                    var f = uglifyTemplateString(`return \`${rep}\``);

                    f = `(html${f.substring("return ".length)})`;

                    return f;
                }

                var ret = fix(text);

                //console.warn("aa", ret);
                
                ret = ret.replace(/\$\(([\d|\D|\s]*?)\)\!/, function (m, _$1) {
                    return fix(_$1);
                });
                
                //console.warn("bb", ret);

                return ret;
            };
        }
    }
};

const jsxComments = {
    test: /\.tsx?$/,
    enforce: "pre",
    loader: 'regexp-replace-loader',
    exclude: /node_modules/,
    options: {
        match: {
            pattern: /{\/\*.*\/}/,
            flags: 'g'
        },
        replaceWith: () => {
            return function (match, $1) {
                return "";
            };
        }
    }
};

module.exports = {
    entry: {
        main: './src/main.tsx'
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
            
            jsxFixup,
            jsxComments,
            
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: [{ loader: "ts-loader"}]
            },
        ]
    },

    plugins: [
        new BundleAnalyzerPlugin({
            analyzerMode: "static",
            openAnalyzer: false,
            reportFilename: "bundle.report.html"
        }),
        //new StripWhitespace(),
        //terser
    ],

    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },

    optimization: {
        minimize: minify,
        minimizer: minify ? [terser] : [],

        runtimeChunk: false,

        //concatenateModules: false, //report.bundle.html - concatenated

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
