
var path=require('path')

var htmlWebpackPlugin=require('html-webpack-plugin')

const {VueLoaderPlugin}=require('vue-loader')    //配置vue-loader需要引入此模块

module.exports={
    entry: path.join(__dirname, './src/main.js'),
    output: {
        path: path.join(__dirname, './src/public/javascripts'),
        filename: 'bundle.js'
    },
    plugins:[     //插件配置处
        new htmlWebpackPlugin({      //此插件用以在内存中产生对应页面
            template: path.join(__dirname, './src/views/chat.html'),
            filename: 'index.html'   //此处的文件名必须是index
        }),
        new VueLoaderPlugin()     // 配置vue-loader插件
    ],
    module: {
        rules:[
            {test: /\.css$/, use:['style-loader','css-loader']},
            {test:/\.less$/,use:['style-loader','css-loader','less-loader']},
            {test:/\.scss$/,use:['style-loader','css-loader', 'sass-loader']},
            {test:/\.(jpg|png|gif|jpeg)$/,use: 'url-loader?name=[hash:8]-[name].[ext]'},
            {test:/\.(ttf|eot|svg|woff|woff2)$/,use: 'url-loader'},    //web字体加载器
            {test:/\.js$/,use : 'babel-loader', exclude: /node_modules/}, //配置ES6语法转换加载器
            {test:/\.vue$/, use: 'vue-loader'}, //配置vue-loader
        ]
    }
}
