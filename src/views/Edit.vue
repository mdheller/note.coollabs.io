<template>
  <div
    v-if="!loading"
    class="h-full edit"
  >
    <div
      v-if="note && note.deleted"
      class="overlay-full"
      @click.stop
    >
      <span class="py-3 pb-5 text-white">
        <p class="text-4xl font-bold small-caps">Ooops, note deleted.</p>
        <p class="pb-2 text-base">Do you still need it?</p>
        <div class="flex flex-row justify-center">
          <button
            class="h-8 px-2 py-0 mx-2 button cool-button bg-coolgreen"
            @click="forceSync()"
          >Yes</button>
          <button
            class="h-8 px-2 py-0 mx-2 button cool-button bg-coolred"
            @click="forceDelete()"
          >No</button>
        </div>
      </span>
    </div>
    <div
      v-if="note"
      :class="[note && note.deleted ? 'opacity-50' : '']"
    >
      <textarea
        ref="title"
        v-model="note.title"
        spellcheck="false"
        class="note-title-edit"
        placeholder="Title"
        rows="1"
        @input="updateNote()"
        @keydown.enter.prevent="$refs.todo && $refs.todo[0].$el.children[2].children[0].focus() || $refs.description && $refs.description.focus()"
      />
      <div class="flex flex-row flex-wrap select-none custom-tags">
        <Tag
          v-for="(tag,index) in note.tags"
          :key="index"
          :tag-name="tag"
          @removeTag="removeTag(tag)"
        />
      </div>
      <div
        v-if="note.todo.length > 0"
        class="todos"
      >
        <todo-line
          v-for="(todo,index) in note.todo"
          :key="index"
          ref="todo"
          :todo="todo"
          :line-index="index"
          @checkTodo="checkTodo(todo)"
          @updateNote="updateNote()"
          @addNewTodo="addNewTodo(index)"
          @deleteTodo="deleteTodo(index)"
          @deleteTodoLine="deleteTodoLine(index)"
          @goToTodo="goToTodo($event,index)"
        />
      </div>
      <textarea
        v-else
        ref="description"
        v-model="note.description"
        class="note-description-edit"
        placeholder="Description"
        @input="updateNote()"
      />
      <Dropdown
        class="fixed right-0 mx-6 cursor-pointer select-none dropdown is-right settings-icon-menu"
        content-design="mt-10"
      >
        <template #dropdown-trigger>
          <settings-icon
            v-if="note && !note.deleted"
            title="Settings"
            class="fixed right-0 mx-6 icon settings-icon"
          />
        </template>
        <template #dropdown-content>
          <div class="custom-label">
            Modes
          </div>
          <div
            v-if="note.todo.length === 0"
            class="dropdown-item"
            @click="convertToList()"
          >
            Todo Mode
          </div>
          <div
            v-else
            class="dropdown-item"
            @click="convertToText()"
          >
            Freetext Mode
          </div>
          <span class="dropdown-divider" />
          <span v-if="note.todo.length !== 0">
            <div class="custom-label">Functions</div>
            <div
              class="dropdown-item"
              @click="clearDoneTodos()"
            >Clear Done Todos</div>
            <span class="dropdown-divider" />
          </span>
          <div class="dropdown-item hover:bg-white hover:text-black">
            <input
              ref="taginput"
              placeholder="Add new tag"
              class="py-2 pl-2 text-black border rounded"
              @click.stop
              @keypress.enter.stop
              @keypress.enter.prevent="addNewTag()"
            >
          </div>
          <span
            v-if="$store.state.tags.length > 0"
            class="dropdown-divider"
          />
          <div
            v-if="$store.state.tags.length > 0"
            class="custom-label"
          >
            Available Tags
          </div>
          <div class="scrollable">
            <div
              v-for="tag in $store.state.tags"
              :key="tag"
              class="dropdown-item"
              @click.stop
              @click="addExistingTag(tag)"
            >
              {{ tag }}
            </div>
          </div>
        </template>
      </Dropdown>
    </div>
    <!-- <chevrons-up-icon class="fixed bottom-0 right-0 mx-6 mb-4 icon-black" @click.stop @click="toTop()" /> -->
    <x-icon
      class="icon x-icon"
      @click="backAndNoSave()"
    />
  </div>
  <Loading
    v-else
    class="bg-coolnote"
  />
</template>
<script>
import { SettingsIcon, XIcon } from 'vue-feather-icons'
import autosize from 'autosize'
import debounce from 'lodash.debounce'
import Tag from '@/components/Tag/Tag'
import Dropdown from '@/components/Dropdown/Dropdown'
import TodoLine from '@/components/TodoLine/TodoLine'
import { idb, Loading } from '@coollabsio/developer-kit'
export default {
  name: 'Edit',
  components: {
    Dropdown,
    Tag,
    SettingsIcon,
    XIcon,
    TodoLine,
    Loading
  },
  data () {
    return {
      debounceFn: null,
      xDown: null,
      yDown: null,
      loading: false
    }
  },
  computed: {
    isOnline () {
      return this.$store.state.isOnline
    },
    note: {
      get: function () {
        return this.$store.state.selectedNote
      },
      set: function (value) {
        this.$store.commit('setState', { name: 'selectedNote', value: value })
      }
    }
  },
  updated () {
    this.updateSizes()
  },
  beforeDestroy () {
    this.$store.commit('setState', { name: 'selectedNote', value: null })
    this.$store.commit('setState', { name: 'focusLine', value: null })
  },
  async created () {
    if (!this.note) {
      const localNote = await idb.read(
        this.$route.params.noteUuid,
        this.$store.state.idbStore
      )
      if (localNote) {
        this.note = localNote
      } else {
        this.loading = true
        await this.$socket.emit('getNote', {
          uuid: this.$route.params.noteUuid,
          sendTo: 'myself'
        })
      }
    }
    this.loading = false
  },
  async mounted () {
    document.onkeydown = async evt => {
      evt = evt || window.event
      if (evt.keyCode === 27) {
        if (this.$route.path !== '/') {
          if (this.deleteMode) {
            this.deleteMode = false
          } else {
            this.backAndNoSave()
          }
        }
      }
    }
    this.updateSizes()
    this.$nextTick(() => {
      if (this.$refs.title.value === '' && this.$refs.description.value === '') {
        this.$refs.title.focus()
      }
    })
  },
  methods: {
    clearDoneTodos () {
      this.note.todo = this.note.todo.filter(todo => !todo.isChecked)
      this.updateNote()
    },
    forceDelete () {
      this.$store.dispatch('syncNoteLocally', {
        note: this.note,
        type: 'findAndDelete'
      })
      this.$router.replace('/')
    },
    forceSync () {
      this.note.deleted = false
      this.updateNote()
    },
    backAndNoSave () {
      if (window.history.state == null) {
        this.$router.replace('/')
      } else {
        this.$router.go(-1)
      }
    },
    checkTodo (todo) {
      todo.isChecked = !todo.isChecked
      // Disabled sorting
      /* this.note.todo.sort((a, b) => a.isChecked - b.isChecked) */
      this.updateNote()
    },
    convertToList () {
      const newNote = { ...this.note }
      newNote.description = ''
      newNote.todo = []

      if (this.note.todo.length > 0) {
        newNote.todo = []
      } else if (this.note.description.length === 0) {
        newNote.todo.push({ line: '', isChecked: false })
      } else {
        this.note.description.split('\n').map(oneline => {
          if (oneline !== '') {
            newNote.todo.push({ line: oneline, isChecked: false })
          }
        })
      }
      this.note = newNote
      this.updateNote()
    },
    async convertToText () {
      const newNote = { ...this.note }
      newNote.description = ''
      newNote.todo = []
      this.note.todo.map((onetodo, index) => {
        if (index === this.note.todo.length - 1) {
          newNote.description += onetodo.line
        } else {
          newNote.description += onetodo.line + '\n'
        }
      })
      this.note = newNote
      this.updateNote()
    },
    /*     toTop () {
      console.log(this.$refs.note)
    }, */
    goToTodo (goto, index) {
      if (this.$refs.todo.length - 1 === index && goto === 1) {
      } else {
        if (index === 0 && goto === -1) {
        } else {
          if (goto === -1) {
            this.$refs.todo[index - 1].$el.children[this.$refs.todo[index - 1].$el.children.length - 1].children[0] && this.$refs.todo[index - 1].$el.children[this.$refs.todo[index - 1].$el.children.length - 1].children[0].focus()
          } else {
            this.$refs.todo[index + 1].$el.children[this.$refs.todo[index + 1].$el.children.length - 1].children[0] && this.$refs.todo[index + 1].$el.children[this.$refs.todo[index + 1].$el.children.length - 1].children[0].focus()
          }
        }
      }
    },
    removeTag (tagName) {
      if (!this.note.tags) {
        this.note.tags = []
      }
      const index = this.note.tags.indexOf(tagName)
      if (index !== -1) {
        this.note.tags.splice(index, 1)
        this.updateNote()
      }
    },
    addNewTag () {
      if (this.$refs.taginput.value !== '') {
        if (!this.note.tags) {
          this.note.tags = []
        }
        if (!this.note.tags.includes(this.$refs.taginput.value)) {
          this.note.tags.push(this.$refs.taginput.value)
          this.updateNote()
        }

        this.$refs.taginput.value = ''
      }
    },
    addExistingTag (tagName) {
      if (!this.note.tags) {
        this.note.tags = []
      }
      if (!this.note.tags.includes(tagName)) {
        this.note.tags.push(tagName)
        this.updateNote()
      }
    },
    updateSizes () {
      this.$refs.title &&
        autosize(this.$refs.title) &&
        autosize.update(this.$refs.title)
      this.$refs.description &&
        autosize(this.$refs.description) &&
        autosize.update(this.$refs.description)

      this.$nextTick(() => {
        this.$refs.title && autosize.update(this.$refs.title)
        this.$refs.description &&
          autosize(this.$refs.description) &&
          autosize.update(this.$refs.description)
      })
    },
    addNewTodo (index) {
      this.note.todo.splice(index + 1, 0, { line: '', isChecked: false })
      this.updateNote()
      this.$nextTick(() => {
        this.$refs.todo[index + 1].$el.children[
          this.$refs.todo[index + 1].$el.children.length - 1
        ].children[0].focus()
      })
    },
    deleteTodoLine (index) {
      if (this.note.todo.length !== 1) {
        this.note.todo.splice(index, 1)
      } else {
        this.note.todo[index].line = ''
        this.note.todo[index].isChecked = false
      }
      this.updateNote()
      this.$store.commit('setState', { name: 'selectedNote', value: null })
    },
    deleteTodo (index) {
      if (this.note.todo[index].line === '' && this.note.todo.length > 1) {
        this.note.todo.splice(index, 1)
        this.updateNote()
        this.$nextTick(() => {
          event.preventDefault()
          if (index === 0) {
            this.$refs.todo[index].$el.children[
              this.$refs.todo[index].$el.children.length - 1
            ].children[0].focus()
          } else {
            this.$refs.todo[index - 1].$el.children[
              this.$refs.todo[index - 1].$el.children.length - 1
            ].children[0].focus()
          }
        })
      }
    },
    updateNote () {
      const self = this
      if (!this.removing) {
        const lastUpdate = {
          ...this.note,
          lastUpdate: new Date().toISOString()
        }
        if (this.debounceFn) this.debounceFn.cancel()
        this.debounceFn = debounce(function () {
          self.$store.dispatch('syncNoteLocally', {
            note: lastUpdate,
            type: 'findAndModify'
          })
          self.$store.commit('setState', { name: 'selectedNote', value: lastUpdate })
          if (self.$store.state.isOnline) {
            self.$socket.emit('updateNote', {
              note: lastUpdate,
              sendTo: 'others'
            })
          }
        }, 300)
        this.debounceFn()
      }
    }
  }
}
</script>

<style lang="sass">
.edit
  @apply text-black text-sm bg-white px-2 pr-4 pb-4 pt-4
  @screen md
    @apply px-2 pr-4 pb-4
.note-title-edit
  padding: 0px 10px !important
  @apply w-full text-2xl font-bold
  @screen lg
    padding: 5px 20% 0px !important
    @apply text-4xl
.note-description-edit
  padding: 0px 40px 0px 12px !important
  @apply w-full h-full text-base mb-10
  @screen lg
    padding: 0px 17% 0px 20% !important
    @apply text-xl w-full
.custom-tags
  padding: 0px 10px !important
  max-width: 95%
  @screen lg
    padding: 0px 20% !important
.todos
  padding: 10px 20px 0px 0px !important
  @apply pt-1 mt-2 text-base
  @screen lg
    width:95%
    padding: 10px 17% 0px 20% !important
    @apply text-xl
.x-icon
  @apply fixed right-0 top-0 my-4 mx-6
.settings-icon
  top: 5rem
.settings-icon-menu
  top: 4rem
.check
  width: 26px
  height: 26px
.overlay-full
  z-index:8999
  background-color: rgba(255,0,0,0.8) !important
  @apply fixed left-0 right-0 top-0 bottom-0 flex flex-col justify-center text-center cursor-default
.scrollable
  max-height: 132px
  @apply overflow-y-auto
.custom-label
  @apply pl-2 text-base font-bold cursor-default text-left
</style>
