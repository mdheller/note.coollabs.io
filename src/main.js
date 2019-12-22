import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './registerServiceWorker'
import axios from 'axios'
import vhCheck from 'vh-check'
import VueSocketIO from 'vue-socket.io'
/* import Buefy from 'buefy' */
import { setAxios } from '@coollabsio/developer-kit'
import { Field, Input, Toast } from 'buefy'
window.coolArtillery && window.coolArtillery({ Vue })
/* Vue.use(Buefy) */
Vue.use(Field)
Vue.use(Input)
Vue.use(Toast)

vhCheck()

let debug = false
let connOptions = { path: '/coolsocket', autoConnect: false, upgrade: true, transports: ['websocket'] }
if (process.env.NODE_ENV !== 'production') {
  debug = true
  connOptions = { path: '/coolsocket', autoConnect: false }
}
const options = {
  debug: debug,
  connection: `${process.env.VUE_APP_WSS}/coolNote`,
  vuex: {
    store,
    actionPrefix: 'SOCKET_',
    mutationPrefix: 'SOCKET_'
  },
  options: connOptions
}

Vue.use(new VueSocketIO(options))
Vue.config.productionTip = false
/* Vue.config.performance = true */

const app = new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

axios.defaults.baseURL = `${process.env.VUE_APP_API}/v1`
setAxios(axios, app, Vue)

export { app }
