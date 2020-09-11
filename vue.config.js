const { evnConfig, seoHtml } = require('./app/view/pathConfig');
//const InlineHtmlPlugin = require('./app/view/webpack-plugins/inline-html');
const InlineHtmlPlugin = require('BlockChain-ui/webpack-plugin/inline-html.js');
const path = require('path');
let staticDomain = '';
try{
  let domain = process.argv[3].split('=')[1];
  staticDomain = domain;
}catch (e) {

}
const seoHtmlList = [];
let seos = Object.keys(seoHtml);
seos.forEach((item) => {
    const li = seoHtml[item]
    if (li) {
        li.forEach((sitem) => {
            seoHtmlList.push(sitem);
        })
    }
});
const paths = evnConfig.concat(seoHtmlList).map(item => `/${item}/*`);
const lanPaths = evnConfig.concat(seoHtmlList).map(item => `/${item}/`)
const htlmOptions = {
  staticDomain: staticDomain ? staticDomain : "",
  echarts: process.env.NODE_ENV !== 'production' ? '/static/js/echarts.min.js' : '{{eChartsUrl}}',
};
module.exports = {
    transpileDependencies: [
      'BlockChain-ui',
      'vue-script2',
    ],
    productionSourceMap: false,
    outputDir: path.join(__dirname, '/app/dist/'),
    publicPath : staticDomain ? staticDomain : "/",
    configureWebpack: {
        plugins: [new InlineHtmlPlugin()],
        entry: {
            detail: path.join(__dirname, '/app/view/src/pages/detail-home/main')
        },
      resolve: {
        alias: {
          '@': path.join(__dirname, '/app/view/src/')
        }
      }
    },
    pages: {
        'ex-index': {
            // page 的入口
            entry: path.join(__dirname, '/app/view/src/pages/ex-home/main'),
            // 模板来源
            template: './app/public/ex-index.html',
            // 在 dist/index.html 的输出
            filename: 'ex-index.html',
            // 当使用 title 选项时，
            // template 中的 title 标签需要是 <title><%= htmlWebpackPlugin.options.title %></title>
            title: 'Exchange',
            // 在这个页面中包含的块，默认情况下会包含
            // 提取出来的通用 chunk 和 vendor chunk。
            chunks: ['chunk-vendors', 'chunk-common', 'ex-index'],
            options: htlmOptions,
            minify: {
                removeAttributeQuotes: false,
                collapseWhitespace: true,
                conservativeCollapse: true,
                minifyCSS: true,
                minifyJS: true,
            },
        },
        'otc-index': {
            // page 的入口
            entry: path.join(__dirname, '/app/view/src/pages/otc-home/main'),
            // 模板来源
            template: './app/public/otc-index.html',
            // 在 dist/index.html 的输出
            filename: 'otc-index.html',
            // 当使用 title 选项时，
            // template 中的 title 标签需要是 <title><%= htmlWebpackPlugin.options.title %></title>
            title: 'Exchange',
            // 在这个页面中包含的块，默认情况下会包含
            // 提取出来的通用 chunk 和 vendor chunk。
            chunks: ['chunk-vendors', 'chunk-common', 'otc-index'],
            options: htlmOptions,
            minify: {
                removeAttributeQuotes: false,
                collapseWhitespace: true,
                conservativeCollapse: true,
                minifyCSS: true,
                minifyJS: true,
            },
        },
        'co-index': {
            // page 的入口
            entry: path.join(__dirname, '/app/view/src/pages/co-home/main'),
            // 模板来源
            template: './app/public/co-index.html',
            // 在 dist/index.html 的输出
            filename: 'co-index.html',
            // 当使用 title 选项时，
            // template 中的 title 标签需要是 <title><%= htmlWebpackPlugin.options.title %></title>
            title: 'Exchange',
            // 在这个页面中包含的块，默认情况下会包含
            // 提取出来的通用 chunk 和 vendor chunk。
            chunks: ['chunk-vendors', 'chunk-common', 'co-index'],
            options: htlmOptions,
            minify: {
                removeAttributeQuotes: false,
                collapseWhitespace: true,
                conservativeCollapse: true,
                minifyCSS: true,
                minifyJS: true,
            },
        },
    },
    devServer: {
        before(app, self) {
            // 重定向到语言 2
            app.get(lanPaths, (req, res) => {
                let pathName = req.path.replace('/', '');
                let fileName = pathName.split('/');
                let files = fileName[0];
                res.redirect(`/${files}/zh_CN`)
            })
            // 匹配到项目 3
            app.get(paths, (req, res) => {
                let pathName = req.path.replace('/', '');
                let fileName = pathName.split('/');
                let files = fileName[0];
                if (pathName.indexOf('.') === -1) {
                    files = `${fileName[0]}-index.html`;
                }
                let source = self._stats.compilation.assets[files].source();
                if (typeof source === 'object') {
                    source = source.toString();
                }
                res.send(source);
            });
            // 重定向到项目 1
            app.get('/', (req, res) => {
                res.redirect('/ex/')
            })
        },
        compress: true,
        contentBase: path.join(__dirname, "app/public/"),
        open: true,
        proxy: {
            'fePublicInfo':{
              target: 'https://www.kinghash.com/',
            },
            '/fe-ex-api': {
                target: 'https://www.kinghash.com/fe-ex-api/',
                pathRewrite: {
                    '^/fe-ex-api': '',
                },
            },
            '/fe-financing-api': {
                target: 'https://rd3www.chaindown.com/financing/',
                pathRewrite: {
                    '^/fe-financing-api': '',
                },
            },
            '/fe-otc-api': {
                target: 'https://otc.kinghash.com/fe-otc-api',
                pathRewrite: {
                    '^/fe-otc-api': '',
                },
            },
            '/fe-co-api': {
                target: 'https://rd3www.chaindown.com/fe-co-api',
                pathRewrite: {
                    '^/fe-co-api': '',
                },
            },
            '/fe-upload-api': {
                target: 'https://rd3webapi.chaindown.com',
                pathRewrite: {
                    '^/fe-upload-api': '',
                },
            },
            '/fe-hashrate-api': {
                target: 'https://www.kinghash.com',
                changeOrigin: true, // 将 host 修改为 target
                headers: {
                  'x-forwarded-host': 'webapi.kinghash.com',
                },
              },
        },
    },
};
