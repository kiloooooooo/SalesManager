const path = require('path');

module.exports = {
    mode: 'development',
    entry: {
        script: './src/scripts/main.js',
        style: './src/styles/main.scss'
    },
    output: {
        path: path.join(__dirname, 'public/scripts'),
        filename: '[name].bundle.js'
    },
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.js'
        }
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    { loader: 'style-loader' },
                    { loader: 'css-loader' },
                    {
                        loader: 'sass-loader',
                        options: {
                            includePaths: ['./node_modules']
                        }
                    }
                ]
            }
        ]
    },
};
