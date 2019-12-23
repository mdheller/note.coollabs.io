/* const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin */
const ServiceWorkerWebpackPlugin = require('serviceworker-webpack-plugin')
const pwaConfig = require('./pwa.config.js')
const path = require('path')

module.exports = {
  configureWebpack: {
    plugins: [
      new ServiceWorkerWebpackPlugin({
        entry: path.join(__dirname, 'src/service-worker.js'),
        filename: 'service-worker.js'
      })
      /* new BundleAnalyzerPlugin() */
    ]
  },
  css: {
    loaderOptions: {
      postcss: {
        plugins: [
          require('autoprefixer'),
          require('tailwindcss')('./node_modules/@coollabsio/developer-kit/config/tailwind.config.js'),
          require('vue-cli-plugin-tailwind/purgecss')({
            keyframes: true,
            /* defaultExtractor: content => content.match(/[A-Za-z0-9-_/:]*[A-Za-z0-9-_/]+/g) || [], */
            content: ['./public/**/*.html', './src/**/*.vue', './node_modules/@coollabsio/developer-kit/dist/developer-kit.umd.js'],
            whitelist: ['fade-enter-active', 'fade-leave-active', 'fade-enter', 'fade-leave-to', 'v-lazy-image-loaded'],
            whitelistPatternsChildren: [
              /b-tooltip.*cool.*/,
              /is-cool.*/,
              /notices.*/
            ]
          })
        ]
      }
    }
  },
  devServer: {
    compress: true,
    open: true,
    https: false
  },
  pwa: pwaConfig
}
