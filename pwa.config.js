module.exports = {
  name: 'coolNote',
  short_name: 'coolNote',
  themeColor: '#242629',
  msTileColor: '#242629',
  appleMobileWebAppCapable: 'yes',
  appleMobileWebAppStatusBarStyle: 'black',
  workboxPluginMode: 'InjectManifest',
  workboxOptions: {
    swSrc: 'src/service-worker.js'
  },
  iconPaths: {
    favicon32: 'images/icons/favicon-32x32.png',
    favicon16: 'images/icons/favicon-16x16.png',
    appleTouchIcon: 'images/icons/apple-touch-icon.png',
    maskIcon: 'images/icons/safari-pinned-tab.svg',
    msTileImage: 'images/icons/icon-144x144.png'
  }
}
