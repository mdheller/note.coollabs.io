/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import runtime from 'serviceworker-webpack-plugin/lib/runtime'

if (process.env.NODE_ENV === 'production') {
  if ('serviceWorker' in navigator) {
    let refreshing
    // When the user asks to refresh the UI, we'll need to reload the window
    navigator.serviceWorker.addEventListener('controllerchange', function (event) {
      if (refreshing) return // prevent infinite refresh loop when you use "Update on Reload"
      refreshing = true
      window.location.reload()
    })
    const registration = runtime.register()
    navigator.serviceWorker.register(`${process.env.BASE_URL}service-worker.js`)
      .then(function (serviceWorker) {
      // Track updates to the Service Worker.
        if (!navigator.serviceWorker.controller) {
          // The window client isn't currently controlled so it's a new service
          // worker that will activate immediately
          return
        }
        serviceWorker.update()
        newServiceWorkerFound(serviceWorker, function () {
          showButton(serviceWorker)
        })
      })
  }
}

function newServiceWorkerFound (serviceWorker, callback) {
  if (serviceWorker.waiting) {
    // SW is waiting to activate. Can occur if multiple clients open and
    // one of the clients is refreshed.
    return callback()
  }
  function listenInstalledStateChange () {
    serviceWorker.installing.addEventListener('statechange', function (event) {
      if (event.target.state === 'installed') {
        // A new service worker is available, inform the user
        callback()
      }
    })
  };
  if (serviceWorker.installing) {
    return listenInstalledStateChange()
  }
  // Add a listener in case a new serviceWorker is found.
  serviceWorker.addEventListener('updatefound', listenInstalledStateChange)
}
function showButton (serviceWorker) {
  var elem = document.createElement('div')
  var text = document.createElement('div')
  var button = document.createElement('div')

  elem.style.cssText = 'position:fixed;bottom:0;right:0;background-color:rgba(36, 38, 41, 0.9);margin:10px;border-radius:.5rem;font-weight:700;box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);min-width:320px;font-family:monospace;color:white;cursor:pointer;z-index:99999;text-align:center'

  text.innerHTML = 'A new version is available!'
  text.style.cssText = 'padding-top:10px;font-size:12px'

  button.innerHTML = 'Click to refresh!'
  button.style.cssText = 'padding:10px;background-color:transparent;border:0;color:white;font-size:10px'

  document.body.appendChild(elem)
  elem.appendChild(text)
  elem.appendChild(button)
  elem.addEventListener('click', () => {
    if (!serviceWorker.waiting) {
      // Just to ensure registration.waiting is available before
      // calling postMessage()
      return
    }
    serviceWorker.waiting.postMessage('skipWaiting')
  })
};
