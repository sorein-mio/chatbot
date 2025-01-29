const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const DotenvWebpackPlugin = require('dotenv-webpack');

module.exports = {
    entry: './src/index.tsx',
    output: {
        path: path.resolve(process.cwd(), 'dist'),
        filename: 'bundle.js',
        publicPath: '/',
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        preferRelative: true,
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html',
            inject: true,
            meta: {
                'Content-Security-Policy': {
                    'http-equiv': 'Content-Security-Policy',
                    content: "default-src 'self' 'unsafe-eval' https:; font-src 'self' data: https: http:; style-src 'self' 'unsafe-inline' https: http:; script-src 'self' 'unsafe-eval' 'unsafe-inline' https:; connect-src 'self' ws: https:; img-src 'self' data: https:;"
                }
            }
        }),
        new DotenvWebpackPlugin(),
    ],
    devServer: {
        static: [
            {
                directory: path.join(process.cwd(), 'public'),
            },
            {
                directory: path.join(process.cwd(), 'dist'),
            }
        ],
        hot: true,
        port: 8084,
        host: 'localhost',
        historyApiFallback: true,
        devMiddleware: {
            writeToDisk: true,
        },
    },
};
