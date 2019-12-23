<template>
  <div
    class="px-10 overflow-auto cursor-default min-h-32"
    @click.stop
  >
    <section class="rounded-b-lg cursor-default">
      <b-field label="Registered users only">
        <b-input
          ref="input"
          v-model="email"
          size="is-small"
          type="email"
          placeholder="Email address"
          :disabled="$store.state.loading.sharing"
          @keyup.native.enter="addShare()"
          @input="checkValid()"
        />
      </b-field>
      <div class="flex flex-col pt-4 md:flex-row">
        <b-field
          v-if="note.sharedWith && note.sharedWith.length > 0"
          label="Remove from sharing"
          class="flex flex-col"
        >
          <div
            v-for="shared of note.sharedWith"
            :key="shared"
            class="text-center"
          >
            <div
              class="text-xs button cool-button bg-coolred"
              @click="removeShare(shared)"
            >
              {{ shared }}
            </div>
          </div>
        </b-field>
        <div class="flex-1" />
        <b-field
          v-if="shareEmails.length > 0"
          label="Favourites"
          class="flex flex-col"
        >
          <div
            v-for="shared of shareEmails"
            :key="shared"
            class="text-center"
          >
            <div
              class="text-xs button cool-button bg-coolnote"
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
import { Loading } from '@coollabsio/developer-kit'
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
                message: `Already shared with ${this.email}.`,
                position: 'is-top',
                type: 'is-coolred'
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
                type: 'is-coolred'
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
              type: 'is-coolred'
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
              type: 'is-coolnote'
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
  @screen md
    @apply text-left
  @apply text-xs text-center

.min-h-32
  min-height: 8rem

</style>
