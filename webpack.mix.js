const cssImport = require('postcss-import');
const cssNesting = require('postcss-nesting');
const mix = require('laravel-mix');
const path = require('path');
const tailwindcss = require('tailwindcss');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ejs = require('ejs');
const { version } = require('./package.json');

class TailwindExtractor {
    static extract (content) {
        return content.match(/[\w-/:]+(?<!:)/g) || [];
    }
}

function transformHtml(content) {
    return ejs.render(content.toString(), {
      ...process.env,
    });
  }

const purgecss = require('@fullhuman/postcss-purgecss')({
    content: [
        path.join(__dirname, 'src/options/**/*.html'),
        path.join(__dirname, 'src/options/**/*.vue'),
        path.join(__dirname, 'src/popup/**/*.html'),
        path.join(__dirname, 'src/popup/**/*.vue'),
    ],
    whitelist: ['html', 'body'],
    whitelistPatterns: [/^footer/],
    extractors: [
        {
            extractor: TailwindExtractor,
            extensions: ['html', 'js', 'vue'],
        },
    ],
});
mix.js('src/background.js', 'dist/background.js')
   .js('src/popup/popup.js', 'dist/popup')
   .js('src/options/options.js', 'dist/options');

mix.postCss('src/css/main.css', 'dist/css', [
        cssImport(),
        cssNesting(),
        tailwindcss('tailwind.config.js'),
        ...process.env.NODE_ENV === 'production' ? [purgecss]: [],
    ])
    .webpackConfig({
        output: { chunkFilename: 'js/[name].js?id=[chunkhash]' },
        resolve: {
            alias: {
                'vue$': 'vue/dist/vue.runtime.js',
                '@': path.resolve('src'),
                POPUP: path.resolve(__dirname, 'src/popup'),
                OPTIONS: path.resolve(__dirname, 'src/options'),
                SHARED: path.resolve(__dirname, 'src/Shared'),
                MIXINS: path.resolve(__dirname, 'src/mixins'),
                PLUGINS: path.resolve(__dirname, 'src/plugins')
            },
        },
    })
    .webpackConfig({
        plugins: [
            new CopyWebpackPlugin([
                { from: 'src/fonts', to: 'dist/fonts' },
                { from: 'src/icons', to: 'dist/icons', ignore: ['icon.xcf'] },
                { from: 'src/popup/popup.html', to: 'dist/popup/popup.html', transform: transformHtml },
                { from: 'src/options/options.html', to: 'dist/options/options.html', transform: transformHtml },
                { from: 'src/css/fonts.css', to: 'dist/css/fonts.css' },
                {
                  from: 'src/manifest.json',
                  to: 'dist/manifest.json',
                  transform: (content) => {
                    const jsonContent = JSON.parse(content);
                    jsonContent.version = version;

                    if (process.env.NODE_ENV === 'development') {
                      jsonContent['content_security_policy'] = "script-src 'self' 'unsafe-eval'; object-src 'self'";
                    }

                    return JSON.stringify(jsonContent, null, 2);
                  },
                },
              ]),
        ],
    })
    .sourceMaps();
