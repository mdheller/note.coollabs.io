<template>
  <div class="application">
    <div
      v-show="!loading"
      class="notes"
    >
      <note
        v-for="(note,index) in notes"
        v-show="(!note.deletedLocally) && (!$store.state.selectedTag || (note.tags && note.tags.length > 0 && note.tags.includes($store.state.selectedTag))) && (note.title && note.title.match(new RegExp(`.*${$store.state.search}.*`,'giu')) || note.description && note.description.match(new RegExp(`.*${$store.state.search}.*`,'giu')) || (note.tags && note.tags.toString().match(new RegExp(`.*${$store.state.search}.*`,'giu')))|| (note.todo && note.todo.length > 0 && note.todo.map(todo => todo.line).toString().match(new RegExp(`.*${$store.state.search}.*`,'giu'))))"
        :key="note.uuid"
        :note="note"
        @click.native="editMode(note,index)"
      />
      <div
        v-if="notes.length === 0 && !loading"
        class="absolute w-full text-base font-bold text-center text-black center"
      >
        No notes found! Let's create your first one!
        <div
          class="flex flex-col items-center justify-center h-full my-3 animated jello"
          @click="addNewNote()"
        >
          <PlusIcon
            size="60"
            class="plus"
          />
        </div>
      </div>
    </div>
    <!--     <Loading
      v-if="loading"
      class="bg-coolnote"
    /> -->
    <div
      v-show="showModal"
      class="overflow-auto modal"
      :class="[showModal ? 'is-active bg-white': '']"
    >
      <div class="modal-content-home">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import Note from '@/components/Note/Note'
import { PlusIcon } from 'vue-feather-icons'

export default {
  name: 'Home',
  components: { Note, PlusIcon },
  data () {
    return {
      showModal: this.$route.meta.showModal,
      showMenuGlobal: 3.14
    }
  },
  computed: {
    notes () {
      return this.$store.state.notes
    },
    loading () {
      return this.$store.state.loading.localNotes
    }
  },
  watch: {
    '$route.meta' ({ showModal }) {
      this.showModal = showModal
    }
  },
  mounted () {
    if (this.notes.length === 0) this.$store.dispatch('loadLocalNotes')

    // Needed after the first login
    if (navigator.onLine) {
      if (this.$route.path !== '/about' && !this.$socket.connected) {
        this.$socket.connect()
        this.$store.commit('setState', { name: 'isOnline', value: true })
      }
    } else {
      if (this.$socket.connected) this.$socket.disconnect()
      this.$store.commit('setState', { name: 'isOnline', value: false })
    }
  },
  methods: {
    addNewNote () {
      this.$store.commit('setState', { name: 'selectedTag', value: null })
      this.$store.commit('showMainMenu', false)
      this.$store.dispatch('addNewNote')
    },
    editMode (note, index) {
      this.$store.commit(
        'setState',
        { name: 'top', value: document.documentElement.scrollTop || document.body.scrollTop }
      )
      this.$store.commit('setState', { name: 'selectedNote', value: note })
      this.$router.push({ path: `note/${note.uuid}` })
    }
  }
}
</script>
<style lang="sass">
.modal-content-home
  width: 100%
  height: 100%
  margin: 0
  @apply bg-white
.center
  top: 50%
  left: 50%
  transform: translate(-50%, -50%)
.notes
  transition: 0.2s
  column-gap: 0
  column-count:1
  @apply pb-5
  @screen sm
    column-count: 2
  @screen md
    column-count: 2
  @screen lg
    column-count: 3
  @screen xl
    column-count: 4
.scrollable
  max-height: 296px
  @apply overflow-y-auto
</style>
