<template>
  <div class="h-full">
    <landing-page
      :description="require('../../package').description"
      :pricing="false"
      :docs="false"
    >
      <template v-slot:slogan>
        <div class="px-10 text-base text-center md:text-2xl">
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
      </template>
      <template v-slot:app-features>
        <div class="flex flex-col justify-center pt-10 lg:flex-row">
          <fact
            emoji="bicycle"
            title="Use It On The Go"
            description="You can use it offline without internet connection!"
          />
          <fact
            emoji="handshake"
            title="Real Time Sharing & Editing"
            description="You can coolLaborate on your notes live with others!"
          />
        </div>
        <div class="flex flex-col justify-center lg:pb-10 lg:flex-row">
          <fact
            :wip="true"
            emoji="more"
            title="Markdown Support"
          />
        </div>
      </template>
    </landing-page>
    <Footer class="text-white bg-coolnoteover" />
  </div>
</template>

<script>
import { Fact, LandingPage, Footer } from '@coollabsio/developer-kit'
export default {
  name: 'About',
  components: { Fact, LandingPage, Footer }
}
</script>
