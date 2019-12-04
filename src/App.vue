<template>
  <div
    id="app"
    :class="{ 'overflow-hidden': overflow }"
  >
    <navbar
      v-if="$route.path !== '/about'"
      :navbar-class="$route.path !== '/profile' && $route.path !== '/feature-board' ? 'navbar-shadow bg-coolnote' : 'bg-coolnote'"
      has-things-before-menu
    >
      <template v-slot:brand>
        <div class="cursor-pointer navbar-item">
          <edit-3-icon
            v-show="$route.path !== '/profile' && $route.path !== '/feature-board'"
            size="30"
            class="mx-1 my-auto animated jackInTheBox faster navbar-icon"
            @click.stop="addNewNote()"
          />
          <arrow-left-icon
            v-show="$route.path === '/profile' || $route.path === '/feature-board'"
            size="30"
            class="mx-1 my-auto animated jackInTheBox faster navbar-icon"
            @click="$store.commit('coolStore/goBack',$router)"
          />
        </div>
        <div
          v-show="selectedTag === null && $route.path !== '/profile' && $route.path !== '/feature-board'"
          class="mx-auto my-auto animated fadeInDown faster"
        >
          <b-field class>
            <b-input
              v-model="search"
              type="search"
              placeholder="Quick search"
              :disabled="false || $store.state.loading.remoteNotes"
              @keyup.esc.native.stop
              @keyup.esc.native="search = ''"
            />
          </b-field>
        </div>
        <div
          v-if="selectedTag && $route.path !== '/profile' && $route.path !== '/feature-board'"
          class="flex my-auto text-white cursor-pointer animated fadeIn faster hover:text-red-600 hideshowtruncate"
          @click="unSelectTag()"
        >
          <HashIcon
            size="1.3x"
            class="my-auto"
          />
          <div class="text-base font-semibold md:text-xl">
            {{ selectedTag }}
          </div>
        </div>
      </template>
      <template v-slot:things-before-menu>
        <div
          class="w-2 h-2 mx-3 my-auto text-center rounded-full shadow-lg indicator animated onoff"
          :class="[$store.state.isOnline && $store.state.connected ? 'bg-coollime rubberBand' : 'bg-red-500 heartBeat fast']"
        >
          <div
            v-if="loadingRemoteNotes"
            class="relative dual-ring-loading"
          />
        </div>
      </template>
      <template
        v-if="tags.length > 0"
        v-slot:menu-items-first
      >
        <div class="scrollable lg:mt-2">
          <div
            v-for="(tag,index) in tags"
            :key="index"
            class="nav-item"
            :class="[selectedTag === tag ? 'border-l-2 rounded-none border-coolgreen' : '']"
            @click.stop
            @click="selectTag(tag)"
          >
            <HashIcon
              size="1.5x"
              class="my-auto mr-2 hideshowtruncate"
            />{{ tag }}
          </div>
        </div>
        <hr class="flex bg-gray-200 navbar-divider">
      </template>
    </navbar>
    <transition
      name="fade"
      mode="out-in"
    >
      <router-view
        v-if="$route.path !== '/about'"
        class="h-full pt-navbar"
      />
      <router-view v-else />
    </transition>
  </div>
</template>
<script>
import { Navbar } from '@coollabsio/developer-kit'
import { Edit3Icon, ArrowLeftIcon, HashIcon } from 'vue-feather-icons'
export default {
  name: 'App',
  components: { Navbar, Edit3Icon, ArrowLeftIcon, HashIcon },
  data () {
    return {
      baseURL: process.env.BASE_URL,
      overflow: true
    }
  },
  computed: {
    search: {
      get: function () {
        return this.$store.state.search
      },
      set: function (value) {
        this.$store.commit('setSearch', value)
        window.scrollTo({
          top: 0,
          left: 0
        })
      }
    },
    loadingRemoteNotes () {
      return this.$store.state.loading.remoteNotes
    },
    selectedTag () {
      return this.$store.state.selectedTag
    },
    tags () {
      return this.$store.state.tags
    }
  },
  watch: {
    $route (to, from) {
      if (to.name === 'Edit') {
        this.overflow = true
      } else {
        this.overflow = false
      }
      if (to.name === 'Profile' || to.name === 'FeatureBoard') {
        this.$store.commit('setNotes', [])
        this.$store.commit('setTags', [])
      }
    }
  },
  async created () {
    await this.$store.dispatch('coolStore/checkLogin', { vue: this, db: { db: 'coolNoteDB', store: 'coolNoteStore' }, app: 'coolNote' })
  },
  mounted () {
    if (navigator.onLine) {
      if (this.$route.path !== '/about' && !this.$socket.connected) {
        this.$socket.connect()
        this.$store.commit('setIsOnline', true)
      }
    } else {
      if (this.$socket.connected) this.$socket.disconnect()
      this.$store.commit('setIsOnline', false)
    }
    window.addEventListener('online', this.updateOnlineStatus)
    window.addEventListener('offline', this.updateOnlineStatus)
  },
  beforeDestroy () {
    window.removeEventListener('online', this.updateOnlineStatus)
    window.removeEventListener('offline', this.updateOnlineStatus)
  },
  methods: {
    selectTag (tag) {
      this.search = ''
      if (this.selectedTag === tag) {
        this.$store.commit('selectTag', null)
      } else {
        if (tag) {
          this.$store.commit('selectTag', tag)
        } else {
          this.$store.commit('selectTag', null)
        }
      }
      this.$store.commit('coolStore/setState', { name: 'showMenu', value: false })
    },
    unSelectTag () {
      this.$store.commit('selectTag', null)
    },
    addNewNote () {
      this.$store.commit('selectTag', null)
      this.$store.commit('showMainMenu', false)
      this.$store.dispatch('addNewNote')
    },
    updateOnlineStatus (value) {
      if (value.type === 'online') {
        if (this.$route.path !== '/about' && !this.$socket.connected) {
          this.$socket.connect()
          this.$store.commit('setIsOnline', true)
        }
      } else {
        this.$socket.disconnect()
        this.$store.commit('setIsOnline', false)
      }
    }
  }
}
</script>

<style lang="sass">
@import '@coollabsio/developer-kit/styles/sass/main.sass'
@import "~buefy/src/scss/utils/_all.scss"
@import "~buefy/src/scss/components/_form.scss"
@import "~buefy/src/scss/components/_notices.scss"
@import "~buefy/src/scss/components/_checkbox.scss"
@import "assets/styles/custom.sass"

html
  overflow: visible !important

#app, textarea, input
  @apply font-oxygen antialiased
</style>
