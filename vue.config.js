/* const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin */
const pwaConfig = require('./pwa.config.js')

module.exports = {
  configureWebpack: {
    plugins: [
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
            whitelist: ['fade-enter-active', 'fade-leave-active', 'fade-enter', 'fade-leave-to', 'v-lazy-image-loaded', 'alertify'],
            whitelistPatternsChildren: [
              /field.*/,
              /control.*/,
              /notices.*/,
              /toast.*/,
              /fade.*/,
              /zoom.*/,
              /help.*/
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
