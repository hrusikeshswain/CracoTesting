const TerserPlugin = require ('terser-webpack-plugin');
const webpack = require ('webpack');
module.exports = {

    webpack : {
            configure : (webpackConfig) => {
                const babelLoaderRule = webpackConfig.module.rules.find(
                    (rule) => rule.oneof &&
                     rule.oneof.some(
                        (subRule) => 
                            subRule.loader && 
                            subRule.loader.includes('babel-loader')
                )
                
            );
                if(babelLoaderRule) {
                    babelLoaderRule.oneof.forEach((subRule) => {
                        if (subRule.loader && subRule.loader.includes('babel-loader')){
                            subRule.include = 
                                Array.isArray(subRule.include)
                                ? [...subRule.include,/node_modules\/yaml/]
                                : [subRule.include, /node_modules\/yaml/];
                               
                            
                        }
                    });

                }
                if ( webpackConfig.optimization && webpackConfig.optimization.minimizer) 
                {
                    webpackConfig.optimization.minimizer = webpackConfig.optimization.minimizer.map((minimizer) => {
                        if(minimizer.constructor.name===  'TerserPlugin') {
                            return new TerserPlugin({
                                terserOptions : {
                                    ecma:2020,
                                    compress : {
                                            drop_console:true,
                                            },
                                    output : {
                                        comments : false,
                                    },
                                },
                                
                            });
                        }
                        return minimizer;
                    });
                }
                return webpackConfig;
            },
        },

    babel : {
        presets : [
            [
                '@babel/preset-env',
                {
                    targets : '> 0.25%, not dead',
                    useBuiltIns : 'entry',
                    corejs : 3
                }
            ]
        ],
        plugins : [
            [
                '@babel/plugin-proposal-optional-chaining',
                {
                    loose : true
                }
            ],
            [
                '@babel/plugin-proposal-private-methods',
                {
                    loose : true
                }
            ],
            [
                '@babel/plugin-transform-class-properties',
                {
                    loose :true
                }
            ],
            [
                '@babel/plugin-transform-private-methods',
                {
                    loose :true
                }
            ],
            [
                '@babel/plugin-transform-private-property-in-object',
                {
                    loose :true
                }
            ],
            [
                '@babel/plugin-proposal-nullish-coalescing-operator',
                {
                    loose :true
                }
            ]
           
        ]
    }
};