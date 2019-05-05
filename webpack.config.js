// @ts-check

const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const StripWhitespace = require('strip-whitespace-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const ts = require('typescript');

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
                        return `=$\{${_$1}\}`;
                    });

                    rep = rep.replace(/\<(\/|)(\w+)((\s*@*\w+=(\w|\d|\"|\{|\}|\$|\(|\)|\<|\>|\.)*)*)\s*?\/?\>/g, function (all, slash, name, attributes, e) { //<DigitalClock ad=10 de=20> </DigitalClock>

                        const nameFirstChar = name.charAt(0);
                        const nameStartsWithBigLetter = nameFirstChar === nameFirstChar.toUpperCase();

                        var newName;

                        if (nameStartsWithBigLetter) {
                            if (slash === "/") {
                                newName = `<${slash}x-${name.toLowerCase()}${attributes}>`;
                                return newName;
                            }
                            else {
                                newName = `<${slash}x-${name.toLowerCase()}${attributes} .__uses=\${${name}.name}>`;
                                return newName;
                            }
                        } else {
                            if (slash === "/") {
                                newName = `</${name.toLowerCase()}${attributes}>`;
                                return newName;
                            }
                            else {
                                newName = `<${name.toLowerCase()}${attributes}>`;
                                return newName;
                            }
                        }
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

function updateSourceFile(sourceFile/*: ts.SourceFile*/, importMap/*: Object*/) {
    const props = [];

    //TODO: replace "_cc" with "html" import (lit-html)

    for (let key in importMap) {
        props.push(
            ts.createPropertyAssignment(
                ts.createLiteral(key),
                ts.createLiteral(importMap[key]),
            ),
        );
    }

    return ts.updateSourceFileNode(sourceFile, [
        ts.createVariableStatement(undefined, [
            ts.createVariableDeclaration(
                '_cc',
                undefined,
                ts.createCall(
                    ts.createIdentifier('require'),
                    [],
                    [ts.createLiteral('cxs')],
                ),
            )
        ]),
        ...sourceFile.statements
    ]);
}

const XTransformer = (program) => {
    //Original basis code from: https://github.com/deamme/ts-transform-classcat

    return (context/*: ts.TransformationContext*/)/*: ts.Transformer<ts.SourceFile>*/ => {
        return (sourceFile/*: ts.SourceFile*/) => {
            context['classcat'] = false;

            let newSourceFile = ts.visitEachChild(sourceFile, visitor, context);

            if (context['classcat']) {
                newSourceFile = updateSourceFile(newSourceFile, context['classcat']);
            }

            return newSourceFile;
        };

        /**
         * 
         * @param {any} node .
         * @returns {ts.VisitResult<ts.Node>} .
         */
        function visitor(node/*: ts.Node*/)/*: ts.VisitResult<ts.Node>*/ {
            switch (node.kind) {
                case ts.SyntaxKind.JsxElement: {
                    //console.log(node);
                    return visit(node/* as ts.JsxElement*/, (node /*as ts.JsxElement*/).children);
                }

                case ts.SyntaxKind.JsxSelfClosingElement:
                    return visit(node/* as ts.JsxSelfClosingElement*/);

                default:
                    return ts.visitEachChild(node, visitor, context);
            }
        }

        /**
         * @param {ts.JsxElement} node .
         * @param {ts.NodeArray<ts.JsxChild>} children .
         * @returns {ts.Node} .
         */
        function visit(
            node,//: ts.JsxElement | ts.JsxSelfClosingElement,
            children = undefined//?: ts.NodeArray<ts.JsxChild>,
        ) {
            const tagName = (node.tagName || node.openingElement.tagName).getText();
            const tagNameLower = tagName.toLowerCase();

            const isBuiltIn = tagName === tagNameLower;

            const htmlHead = isBuiltIn ? ts.createTemplateHead(`<${tagNameLower} .uses=`) : ts.createTemplateHead(`<x-${tagNameLower} .uses=`);

            function createTails() {
                if (children && children.length > 0) {
                    const htmlTail = ts.createTemplateMiddle(`>`);
                    const finalTail = isBuiltIn ? ts.createTemplateTail(`</${tagNameLower}>`) : ts.createTemplateTail(`</x-${tagNameLower}>`);

                    return { htmlTail, finalTail, separateTail: true };
                } else {
                    const finalTail = isBuiltIn ? ts.createTemplateTail(`></${tagNameLower}>`) : ts.createTemplateTail(`></x-${tagNameLower}>`);

                    return { finalTail, separateTail: false };
                }
            }

            const { htmlTail, finalTail, separateTail } = createTails();

            /**@type {ts.NodeArray<ts.JsxAttributeLike>} */
            let properties;

            /** @type {ts.VisitResult<ts.Node>[]} */
            let mappedChildren = [];

            if (children) {
                properties = (node/* as any*/).openingElement.attributes.properties;
                //children.forEach(child => visitor(child));

                mappedChildren = children.map(c => visitor(c));

                var aaa = mappedChildren[0];
               

            } else {
                properties = (node/* as ts.JsxSelfClosingElement*/).attributes.properties;
            }

            const htmlArgs = [ //elements are chained with for-loop below --- mid (value) => asd (key)
                ///>ts.createTemplateSpan(ts.createIdentifier(tagName), mid),
                ///>ts.createTemplateSpan(ts.createIdentifier("asd"), htmlTail),
            ];

            let nextValue = isBuiltIn ? ts.createStringLiteral("native") : ts.createIdentifier(tagName + ".name");

            for (let i = -1; i < properties.length; i++) {

                const nextt = properties[i + 1];

                let nextAttr;

                if (!nextt) {
                    nextAttr = separateTail ? htmlTail : finalTail;
                } else {
                    const nextAttrName = nextt.name.getFullText();
                    nextAttr = ts.createTemplateMiddle(`${nextAttrName}=`);
                }

                const span = ts.createTemplateSpan(nextValue, nextAttr);

                htmlArgs.push(span);

                nextValue = properties[i + 1] && properties[i + 1].initializer;
            }

            /**
             * @param {ts.JsxChild} c .
             * @returns {ts.Expression} .
             */
            function makeChild(c) {
                if (ts.isJsxText(c)) {

                    const trimmed = c.text.trim();

                    if (trimmed.length === 0) {
                        return null;
                    }
                    else {
                        return ts.createLiteral(trimmed);
                    }
                }
                else if (ts.isJsxExpression(c)) {
                    return visitor(c);
                }
                else if (ts.isJsxElement(c)) {
                    return visitor(c);
                }
                else if (ts.isJsxSelfClosingElement(c)) {
                    return visitor(c);
                }
                else {
                    console.log("PANIC!", c);
                    
                    return ts.createLiteral("PANIC!!");
                }
            }

            if (separateTail) {

                const aaaa = ts.createArrayLiteral(children.map(c => makeChild(c)).filter(c => c !== null));

                htmlArgs.push(ts.createTemplateSpan(aaaa, finalTail));
            }

            const html = ts.createTemplateExpression(htmlHead, htmlArgs);

            /** @type {ts.Node} */
            let currentWalk = node;

            let hasSvgParent = false;

            while (currentWalk) {
                if (ts.isJsxElement(currentWalk)) {
                    const tagName = currentWalk.openingElement.tagName.getFullText();

                    if (tagName === "svg") {
                        hasSvgParent = true;
                        break;
                    }
                }

                currentWalk = currentWalk.parent;
            }

            const template = ts.createTaggedTemplate(ts.createIdentifier(hasSvgParent ? 'svg' : 'html'), html);

            return template;

            /*
            let properties;
            
            if (children) {
                properties = (node as any).openingElement.attributes.properties;
                children.forEach(child => visitor(child));
            } else {
                properties = (node as ts.JsxSelfClosingElement).attributes.properties;
            }
            
            properties.forEach((prop: any) => {
                const propName = prop.name ? prop.name.text : '';
                if (propName === 'class' || propName === 'className') {
                    if (prop.initializer.kind === ts.SyntaxKind.JsxExpression) {
                        prop.initializer.expression = ts.createCall(
                            ts.createIdentifier('_cc'),
                            undefined,
                            [prop.initializer.expression],
                        );
                        context['classcat'] = true;
                    }
                }
            });
            
            return node;
            */
        }
    };
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
                loader: "ts-loader",
                options: {
                    getCustomTransformers: program => ({
                        before: [
                            XTransformer(program)
                        ]
                    })
                }
            }
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
