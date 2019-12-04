/* eslint-disable no-console */
import { register } from 'register-service-worker'
import alertify from 'alertify.js'

if (process.env.NODE_ENV === 'production') {
  register(`${process.env.BASE_URL}service-worker.js`, {
    ready () {
      console.log(
        'App is being served from cache by a service worker.\n' +
        'For more details, visit https://goo.gl/AFskqB'
      )
    },
    registered () {
    },
    cached () {
    },
    updatefound () {
    },
    updated (registration) {
      alertify.alert('New version available!', () => {
        registration.waiting.postMessage({ action: 'skipWaiting' })
      })
    },
    offline () {

    },
    error (error) {
      console.error('Error during service worker registration:', error)
    }
  })
  let refreshing
  navigator && navigator.serviceWorker && navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return
    window.location.reload()
    refreshing = true
  })
}
