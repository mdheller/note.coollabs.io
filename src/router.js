import Vue from 'vue'
import Router from 'vue-router'
import About from './views/About.vue'
import Edit from './views/Edit.vue'
import { Profile, FeatureBoard, setRouter } from '@coollabsio/developer-kit'
import store from './store'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  coolSettings: {
    app: 'coolNote',
    isBeta: false,
    isWorkingOffline: true,
    isDocsAvailable: true,
    isFree: true
  },
  routes: [
    {
      path: '/about',
      name: 'About',
      component: About
    },
    {
      path: '/feature-board',
      name: 'FeatureBoard',
      component: FeatureBoard
    },
    {
      path: '/settings',
      name: 'SettingsView',
      component: () =>
        import(
          /* webpackChunkName: "SettingsView", webpackPrefetch: true */ './views/Settings.vue'
        )
    },
    {
      path: '/',
      name: 'Home',
      component: () =>
        import(
          /* webpackChunkName: "Home", webpackPrefetch: true */ './views/Home.vue'
        ),
      children: [
        {
          path: '/note/:noteUuid',
          name: 'Edit',
          component: Edit,
          meta: { showModal: true }
        }
      ]
    },
    {
      path: '/profile',
      name: 'Profile',
      component: Profile
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})

router.afterEach((to, from) => {
  if (to.name === 'Home') {
    if (store.state.top !== 0) {
      router.app.$nextTick(() => {
        if (store.state.search !== '') {
          window.scrollTo({
            top: 0,
            left: 0
          })
        } else {
          window.scrollTo({
            top: store.state.top,
            left: 0
          })
          store.commit(
            'setState',
            { name: 'top', value: 0 }
          )
        }
      })
    }
  }
})

setRouter({ router, guest: ['/about'], path: `${process.env.VUE_APP_API}/v1`, store: store })
export default router
