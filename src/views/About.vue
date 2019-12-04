<template>
  <div>
    <navbar is-menu-visible>
      <template v-slot:brand>
        <div class="navbar-item">
          <img
            class="w-10 text-white cursor-pointer"
            :src="`${$store.state.baseUrl}images/coolNote.svg`"
            alt="Logo of coolLabs.io"
          >
          <div class="text-white text-xl font-bold ml-2">
            coolNote
          </div>
        </div>
        <span class="flex-1" />
      </template>
    </navbar>
    <div class="main">
      <div class="w-full bg-coolnote text-white pt-16">
        <div
          class="text-2xl sm:text-2xl md:text-3xl xl:text-4xl font-bold text-center px-6"
        >
          {{ description }}
        </div>
        <div class="text-base md:text-2xl pb-16 text-center px-10">
          It's available on
          <span
            class="has-tooltip-bottom has-tooltip-success has-tooltip-multiline has-tooltip-dashed"
            data-tooltip="It's a Progressive Web Application! You can install it on your phone / desktop / everywhere!"
          >all platforms</span>
          & without the
          <span
            class="has-tooltip-bottom has-tooltip-success has-tooltip-multiline has-tooltip-dashed"
            data-tooltip="Without any service / server related to Amazon, Facebook, Google, Microsoft, and Apple or any big company. Sounds cool?"
          >big five!</span>
        </div>
        <div class="text-center w-64 mx-auto -my-5">
          <authentication
            class="animated tada"
            app-route="/"
            login-class="loginButton"
            logged-in-text="Get Started"
            logged-in-class="loggedInButton"
            loading-class="loadingButton"
          />
        </div>
      </div>
      <div class="w-full pt-4">
        <div class="flex flex-col md:flex-row items-center px-10 pt-8">
          <div class="flex flex-col text-center w-full md:w-1/2 mt-0 md:-mt-12">
            <h4 class="text-3xl mb-2 font-semibold small-caps">
              Use it on the go
            </h4>
            <p class="text-base md:text-xl">
              You can use it offline without internet connection!
            </p>
          </div>
          <div class="w-full md:w-1/2 mx-10 px-10 pt-5 md:pt-0 -mb-2">
            <img
              :src="`${$store.state.baseUrl}images/undraw_on_the_way_ldaq.svg`"
              class="undraw"
              alt="Picture of a woman on motorcycle. Creator unDraw.co"
            >
          </div>
        </div>
        <div
          class="flex flex-col-reverse md:flex-row py-10 text-center items-center px-10 bg-green-100 w-full border-b"
        >
          <div class="w-full mb-4 md:w-1/2 md:mb-0 px-4">
            <div class="mb-2 w-full mx-auto">
              <img
                :src="`${$store.state.baseUrl}images/undraw_pizza_sharing_wxop.svg`"
                class="undraw"
                alt="Picture of real time synchronization. Creator unDraw.co"
              >
            </div>
          </div>
          <div class="w-full mb-4 md:w-1/2 md:mb-0 px-4">
            <h4 class="text-3xl mb-2 font-semibold small-caps">
              Real time sharing & editing
            </h4>
            <p class="text-base md:text-xl">
              You can coolLaborate on your notes live with others!
            </p>
          </div>
        </div>
        <div class="flex flex-col md:flex-row items-center px-10 py-8">
          <div class="flex flex-col text-center w-full md:w-1/2 mt-0 md:-mt-12">
            <h4 class="text-3xl mb-2 font-semibold small-caps">
              Open Source
            </h4>
            <p class="text-base md:text-xl">
              You can shape the application!
            </p>
            <a
              class="font-mono"
              href="https://github.com/coollabsio/note.coollabs.io"
            >Check the code @ GitHub</a>
          </div>
          <div class="w-full md:w-1/2 mx-10 px-10 pt-5 md:pt-0 -mb-2">
            <img
              :src="`${$store.state.baseUrl}images/undraw_code_typing_7jnv.svg`"
              class="undraw"
              alt="Picture of programming. Creator unDraw.co"
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Navbar, Authentication } from '@coollabsio/developer-kit'
export default {
  name: 'About',
  components: { Navbar, Authentication },
  data () {
    return {
      description: require('../../package').description
    }
  }
}
</script>
<style lang="sass">
.main
  @apply h-full flex flex-col justify-center text-black items-center
.undraw
  max-width:200px
  @apply mx-auto
  @screen md
    max-width: 340px
.bg-custom
  background-color: #cdeccd
</style>
