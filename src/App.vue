<template>
  <main id="app">
    <navbar
      v-if="$route.name !== 'About' && !editMode "
      has-things-before-menu
    >
      <template v-slot:brand>
        <div class="cursor-pointer navbar-item">
          <edit-3-icon
            v-show="$route.path !== '/profile' && $route.path !== '/feature-board' && $route.path !== '/settings'"
            size="30"
            class="mx-1 my-auto animated jackInTheBox faster navbar-icon"
            @click.stop="addNewNote()"
          />
          <arrow-left-icon
            v-show="$route.path === '/profile' || $route.path === '/feature-board' || $route.path === '/settings'"
            size="30"
            class="mx-1 my-auto animated jackInTheBox faster navbar-icon"
            @click="$store.commit('coolStore/goBack',$router)"
          />
        </div>
        <div
          v-show="$store.state.selectedTag === null && $route.path !== '/profile' && $route.path !== '/feature-board' && $route.path !== '/settings'"
          class="w-full pr-3 mx-auto my-auto"
        >
          <input
            v-model="search"
            class="input"
            type="search"
            placeholder="Quick search"
            :disabled="false || $store.state.loading.remoteNotes"
            @keyup.esc.stop
            @keyup.esc="search = ''"
          >
        </div>
        <div
          v-if="$store.state.selectedTag && $route.path !== '/profile' && $route.path !== '/feature-board' && $route.path !== '/settings'"
          class="flex my-auto text-white cursor-pointer animated fadeIn faster hover:text-red-600 hideshowtruncate"
          @click="unSelectTag()"
        >
          <HashIcon
            size="1.3x"
            class="my-auto"
          />
          <div class="text-base font-semibold md:text-xl">
            {{ $store.state.selectedTag }}
          </div>
        </div>
      </template>
      <template v-slot:things-before-menu>
        <div
          class="w-2 h-2 mx-3 my-auto text-center rounded-full shadow-lg indicator animated onoff"
          :class="[$store.state.coolStore.isOnline && $store.state.connected ? 'bg-coollime rubberBand' : 'bg-red-500 heartBeat fast']"
        >
          <div
            v-if="$store.state.loading.remoteNotes"
            class="relative dual-ring-loading"
          />
        </div>
      </template>
      <template
        v-if="$store.state.tags.length > 0"
        v-slot:menu-items-first
      >
        <div class="scrollable lg:mt-2">
          <div
            v-for="(tag,index) in $store.state.tags"
            :key="index"
            class="nav-item"
            :class="[$store.state.selectedTag === tag ? 'border-l-2 rounded-none border-coolgreen' : '']"
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
        :class="{'mt-navbar': $route.path !== '/about'}"
      />
      <router-view v-else />
    </transition>
  </main>
</template>
<script>
import { Navbar, registerDevkit } from '@coollabsio/developer-kit'
import { Edit3Icon, ArrowLeftIcon, HashIcon } from 'vue-feather-icons'
export default {
  name: 'App',
  components: { Navbar, Edit3Icon, ArrowLeftIcon, HashIcon },
  data () {
    return {
      editMode: true
    }
  },
  computed: {
    search: {
      get: function () {
        return this.$store.state.search
      },
      set: function (value) {
        this.$store.commit('setState', { name: 'search', value: value })
        window.scrollTo({
          top: 0,
          left: 0
        })
      }
    }
  },
  watch: {
    $route (to, from) {
      if (to.name === 'Edit') {
        this.editMode = true
        document.documentElement.classList.add('overflow-hidden')
      } else {
        this.editMode = false
        document.documentElement.classList.remove('overflow-hidden')
      }
      if (to.name === 'Profile' || to.name === 'FeatureBoard' || to.name === 'SettingsView') {
        this.$store.commit('setState', { name: 'notes', value: [] })
        this.$store.commit('setState', { name: 'tags', value: [] })
      }
    }
  },
  async created () {
    if (this.$route.path === '/profile' || this.$route.path === '/feature-board') {
      this.editMode = false
    }
    await registerDevkit({ vue: this, db: { db: 'coolNoteDB', store: 'coolNoteStore' }, app: 'coolNote' })
  },
  mounted () {
    if (navigator.onLine) {
      if (this.$route.path !== '/about' && !this.$socket.connected) {
        this.$socket.connect()
      }
    } else {
      if (this.$socket.connected) this.$socket.disconnect()
      this.$store.commit('setLoading', { load: 'remoteNotes', isLoading: false })
    }
  },
  methods: {
    selectTag (tag) {
      this.search = ''
      if (this.$store.state.selectedTag === tag) {
        this.$store.commit('setState', { name: 'selectedTag', value: null })
      } else {
        if (tag) {
          this.$store.commit('setState', { name: 'selectedTag', value: tag })
        } else {
          this.$store.commit('setState', { name: 'selectedTag', value: null })
        }
      }
      this.$store.commit('coolStore/setState', { name: 'showMenu', value: false })
    },
    unSelectTag () {
      this.$store.commit('setState', { name: 'selectedTag', value: null })
    },
    addNewNote () {
      this.$store.commit('setState', { name: 'selectedTag', value: null })
      this.$store.commit('showMainMenu', false)
      this.$store.dispatch('addNewNote')
    }
  }
}
</script>

<style lang="sass">
@import '@coollabsio/developer-kit/styles/sass/main.sass'
@import "assets/styles/custom.sass"

#app, textarea, input
  @apply font-oxygen
</style>
