<template>
  <div class="h-full">
    <landing-page
      :description="require('../../package').description"
      logged-in-text="Scrabble it!"
    >
      <template v-slot:slogan>
        <div class="px-10 text-base text-center md:text-2xl">
          It's available on
          <b-tooltip
            multilined
            type="is-coolgreen"
            position="is-bottom"
            dashed
            label="It's a Progressive Web Application! You can install it on your phone / desktop / everywhere!"
          >
            <span>all platforms</span>
          </b-tooltip>
          & without the
          <b-tooltip
            multilined
            type="is-coolgreen"
            position="is-bottom"
            dashed
            label="Without any service / server related to Amazon, Facebook, Google, Microsoft, and Apple or any 3rd parties. Sounds cool?"
          >
            <span>big five!</span>
          </b-tooltip>
        </div>
      </template>
      <template v-slot:app-features>
        <div class="flex flex-col justify-center lg:flex-row">
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
