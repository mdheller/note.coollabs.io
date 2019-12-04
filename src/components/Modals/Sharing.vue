<template>
  <div
    class="px-4 overflow-auto cursor-default md:px-0 min-h-32"
    @click.stop
  >
    <section class="rounded-b-lg cursor-default">
      <b-field label="Registered users only (at the moment)">
        <b-input
          ref="input"
          v-model="email"
          type="email"
          class="text-base"
          placeholder="coolLaborate by email address 🖖"
          :disabled="$store.state.loading.sharing"
          @keyup.native.enter="addShare()"
          @input="checkValid()"
        />
      </b-field>
      <div class="flex flex-col-reverse md:flex-row">
        <b-field
          v-if="note.sharedWith && note.sharedWith.length > 0"
          label="Remove from sharing ❌"
          class="flex flex-col pt-4"
        >
          <div
            v-for="shared of note.sharedWith"
            :key="shared"
            class="text-center"
          >
            <div
              class="px-2 py-1 my-2 font-bold text-white border-2 border-transparent rounded-full cursor-pointer bg-custom-red hover:border-red-700"
              @click="removeShare(shared)"
            >
              {{ shared }}
            </div>
          </div>
        </b-field>
        <div class="flex-1" />
        <b-field
          v-if="shareEmails.length > 0"
          label="Favourites 🌟"
          class="flex flex-col pt-4"
        >
          <div
            v-for="shared of shareEmails"
            :key="shared"
            class="text-center"
          >
            <div
              class="px-2 py-1 my-2 font-bold text-black border-2 border-transparent rounded-full cursor-pointer bg-custom-green hover:text-white hover:border-green-700"
              @click="addShare(shared)"
            >
              {{ shared }}
            </div>
          </div>
        </b-field>
      </div>
    </section>
    <Loading v-if="$store.state.loading.sharing" />
  </div>
</template>

<script>
import { Loading } from '@coollabsio/devkit'
export default {
  name: 'Sharing',
  components: { Loading },
  props: {
    note: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      email: null
    }
  },
  computed: {
    shareEmails () {
      const quickShares = new Set()
      this.$store.state.notes.map(note => {
        note.sharedWith && note.sharedWith.map(share => {
          if (share !== this.$store.state.coolStore.email) {
            quickShares.add(share)
          }
        })
      })

      return Array.from(quickShares)
    }
  },
  mounted () {
    if (this.note.sharedWith && this.note.sharedWith.length === 0) {
      this.$refs.input.focus()
    }
  },
  methods: {
    checkValid () {
      this.$refs.input.checkHtml5Validity()
    },
    removeShare (email) {
      this.$store.commit('setLoading', { load: 'sharing', isLoading: true })
      this.$emit('removeShare', email)
    },
    async addShare (fav = null) {
      if (fav == null) {
        if (
          this.$refs.input.checkHtml5Validity() &&
          this.email != null &&
          this.email !== ''
        ) {
          this.$store.commit('setLoading', {
            load: 'sharing',
            isLoading: true
          })
          if (!this.note.sharedWith) {
            this.$emit('addShare')
          }
          try {
            if (this.note.sharedWith.includes(this.email)) {
              this.$buefy.toast.open({
                duration: 2000,
                message: `Already shared with ${this.email}`,
                position: 'is-top',
                type: 'is-danger'
              })
              this.$store.commit('setLoading', {
                load: 'sharing',
                isLoading: false
              })
            } else if (this.email === this.$store.state.coolStore.email) {
              this.$buefy.toast.open({
                duration: 2000,
                message: 'Are you trying to share with yourself? 🤭',
                position: 'is-top',
                type: 'is-primary'
              })
              this.$store.commit('setLoading', {
                load: 'sharing',
                isLoading: false
              })
            } else {
              this.$emit('addShare', this.email)
            }
          } catch (e) {
            console.log(e)
          }
        }
      } else {
        this.$store.commit('setLoading', { load: 'sharing', isLoading: true })
        if (!this.note.sharedWith) {
          this.$emit('addShare')
        }
        try {
          if (this.note.sharedWith.includes(fav)) {
            this.$buefy.toast.open({
              duration: 2000,
              message: `Already shared with ${fav}`,
              position: 'is-top',
              type: 'is-danger'
            })
            this.$store.commit('setLoading', {
              load: 'sharing',
              isLoading: false
            })
          } else if (fav === this.$store.state.coolStore.email) {
            this.$buefy.toast.open({
              duration: 2000,
              message: 'Are you trying to share with yourself? 🤭',
              position: 'is-top',
              type: 'is-primary'
            })
            this.$store.commit('setLoading', {
              load: 'sharing',
              isLoading: false
            })
          } else {
            this.$emit('addShare', fav)
          }
        } catch (e) {
          console.log(e)
        }
      }
    }
  }
}
</script>
<style lang="sass">
.input::placeholder
  @apply text-coolnote

.input:focus,
.input:active
  border-color: white !important

.field .label
  @apply text-white text-center

.min-h-32
  min-height: 8rem

.bg-custom-red
  transition: all 0.2s ease-out
  background-color: rgba(255,255,255,0.3)
  &:hover
    background-color: rgba(255,0,0,0.3)
.bg-custom-green
  transition: all 0.2s ease-out
  background-color: rgba(255,255,255,1)
  &:hover
    background-color: rgba(0,255,0,0.3)
</style>
