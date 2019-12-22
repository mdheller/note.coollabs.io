/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import runtime from 'serviceworker-webpack-plugin/lib/runtime'

if (process.env.NODE_ENV === 'production') {
  let newWorker
  if ('serviceWorker' in navigator) {
    const registration = runtime.register()
    navigator.serviceWorker
      .register(`${process.env.BASE_URL}service-worker.js`)
      .then(serviceWorker => {
        serviceWorker.addEventListener('updatefound', () => {
          newWorker = serviceWorker.installing
          newWorker.addEventListener('statechange', () => {
            switch (newWorker.state) {
              case 'installed':
                if (navigator.serviceWorker.controller) {
                  var elem = document.createElement('div')
                  var text = document.createElement('div')
                  var button = document.createElement('div')

                  elem.style.cssText = 'position:fixed;bottom:0;right:0;background-color:#242629;margin:10px;border-radius:.5rem;font-weight:700;box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);min-width:320px;font-family:monospace;color:white;cursor:pointer;z-index:99999;text-align:center;'

                  text.innerHTML = 'A new version is available!'
                  text.style.cssText = 'padding:10px;font-size:15px;text-align:center;'

                  button.innerHTML = 'Click to load the latest!'
                  button.style.cssText = 'margin:10px;background-color:transparent;border:0;color:white'

                  document.body.appendChild(elem)
                  elem.appendChild(text)
                  elem.appendChild(button)
                  elem.addEventListener('click', function () {
                    newWorker.postMessage({ action: 'skipWaiting' })
                  })
                }
                break
            }
          })
        })
      })
      .catch(error => {
        console.log('Error registering the Service Worker: ' + error)
      })
  }
  let refreshing
  navigator.serviceWorker.addEventListener('controllerchange', function () {
    if (refreshing) return
    window.location.reload()
    refreshing = true
  })
}
