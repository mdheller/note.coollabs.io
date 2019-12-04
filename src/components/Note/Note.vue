<template>
  <div
    class="note animated"
    :class="[removing ? 'slow fadeOut' : '', note.deleted ? 'note-deleted' : '']"
    @mouseleave="checkMenu"
  >
    <div class="flex flex-col h-full">
      <div
        v-if="note.deleted"
        class="overlay"
        @click.stop
      >
        <span class="text-white">
          <p class="text-2xl font-bold small-caps">Ooops, note deleted.</p>
          <p>Do you still need it?</p>
          <div class="flex flex-row justify-center">
            <button
              class="py-2 mx-2 syncbutton"
              @click="forceSync()"
            >Yes</button>
            <button
              class="py-2 mx-2 delbutton"
              @click="forceDelete()"
            >No</button>
          </div>
        </span>
      </div>
      <span :class="[note.deleted ? 'opacity-50' : '']">
        <p
          class="note-title"
          :class="[note.title ? '' : 'text-gray-400']"
        >{{ note.title || 'Title' }}</p>
        <div class="flex flex-row justify-start mb-3 select-none">
          <div
            v-if="note.tags && note.tags.length > 2"
            class="w-full"
          >
            <Tag
              v-for="(tag,index) in note.tags.slice(0, 2)"
              :key="index"
              :tag-name="tag"
              @removeTag="removeTag(tag)"
            />
            <span
              class="w-1/6 px-2 mx-1 text-xs text-gray-800 bg-gray-300 border-gray-200 rounded hover:border-red-500 hover:bg-red-600 hover:text-white"
            >{{ note.tags.length - 2 }}+</span>
          </div>
          <div
            v-if="note.tags && note.tags.length < 3"
            class="w-full"
          >
            <Tag
              v-for="(tag,index) in note.tags"
              :key="index"
              :tag-name="tag"
              @removeTag="removeTag(tag)"
            />
          </div>
        </div>
        <div v-if="note.todo && note.todo.length === 0">
          <p
            class="note-description"
            :class="[note.description ? '' : 'text-gray-400']"
          >{{ note.description || 'Description' }}</p>
          <div
            v-if="note.description.split(/\r\n|\r|\n/).length > 10"
            class="more"
          >
            <hr class="dropdown-divider">
          </div>
        </div>
        <div
          v-if="note.todo && note.todo.length > 0"
          class="note-description-list"
        >
          <div
            v-for="(todo,index) in note.todo.slice(0,9)"
            :key="index"
            class="flex flex-row"
          >
            <div
              @click.stop
              @click="checkTodo(todo)"
            >
              <check-square-icon
                v-if="todo.isChecked"
                title="Done"
                size="24"
                class="mx-2 text-green-500 icon"
              />
              <square-icon
                v-else
                title="Undone"
                size="24"
                class="mx-2 icon"
              />
            </div>
            <div class="note-todo-list-item">
              <div
                ref="todo"
                class="note-todo-list-item-line"
                :class="[todo.isChecked ? 'line-through text-green-500' : '' || todo.line ? '' : 'text-gray-400']"
              >{{ todo.line || 'Todo item' }}</div>
            </div>
          </div>
        </div>
        <div
          v-if="note.todo && note.todo.length > 10"
          class="more"
        >
          <hr class="dropdown-divider">
        </div>
        <div class="flex-grow">
          <div class="flex flex-col justify-end flex-grow h-full">
            <div class="flex flex-col mx-2 my-1">
              <div class="flex justify-end mt-1">
                <span
                  v-if="notOurNote()"
                  class="flex flex-row"
                >
                  <span
                    class="absolute badge"
                    :class="[note.sharedWith && note.sharedWith.length > 0 ? 'border border-gray-300' : '']"
                  >{{ note.sharedWith && note.sharedWith.length > 0 ? note.sharedWith.length : '' }}</span>
                  <user-plus-icon
                    v-if="$store.state.isOnline && $store.state.connected"
                    size="1.5x"
                    class="mx-4 icon"
                    title="Share note"
                    @click.stop
                    @click="shareNoteModal = true"
                  />
                  <span
                    v-else
                    class="has-tooltip-left has-tooltip-danger"
                    data-tooltip="Cannot share in offline mode!"
                  >
                    <user-plus-icon
                      size="1.5x"
                      class="mx-4 text-red-600 cursor-not-allowed icon"
                      title="Cannot share in offline mode!"
                      @click.stop
                    />
                  </span>
                  <div
                    v-show="shareNoteModal"
                    class="modal"
                    :class="[shareNoteModal ? 'is-active': '']"
                  >
                    <div
                      class="modal-background"
                      @click.stop
                    />
                    <div class="modal-content">
                      <sharing
                        :note="note"
                        @addShare="addShare"
                        @removeShare="removeShare"
                        @updateNote="updateNote()"
                      />
                    </div>
                    <button
                      class="modal-close is-large"
                      aria-label="close"
                      @click.stop
                      @click="shareNoteModal = false"
                    />
                  </div>
                </span>
                <span
                  v-else
                  class="has-tooltip-left has-tooltip-danger"
                  data-tooltip="Remove myself from sharing!"
                >
                  <user-x-icon
                    size="1.5x"
                    class="mx-4 text-red-600 icon"
                    title="Remove myself from sharing"
                    @click.stop
                    @click="removeMyself()"
                  />
                </span>
                <span
                  v-show="!removing"
                  class="has-tooltip-left has-tooltip-danger"
                  data-tooltip="Delete note!"
                >
                  <trash-2-icon
                    size="1.5x"
                    title="Delete note?"
                    class="icon hover:text-red-600"
                    @click.stop
                    @click="removeNote()"
                  />
                </span>
                <corner-up-left-icon
                  v-show="removing"
                  size="1.5x"
                  title="Undo deletion"
                  class="text-red-600 icon"
                  @click.stop
                  @click="cancelRemove()"
                />
              </div>
            </div>
          </div>
        </div>
      </span>
    </div>
  </div>
</template>

<script>
import Tag from '@/components/Tag/Tag'
import Sharing from '@/components/Modals/Sharing'
import {
  SquareIcon,
  Trash2Icon,
  CornerUpLeftIcon,
  CheckSquareIcon,
  UserPlusIcon,
  UserXIcon
} from 'vue-feather-icons'
import autosize from 'autosize'
import debounce from 'lodash.debounce'
import Cookies from 'js-cookie'
import decode from 'jwt-decode'
export default {
  name: 'Note',
  components: {
    Tag,
    SquareIcon,
    Trash2Icon,
    CornerUpLeftIcon,
    CheckSquareIcon,
    UserPlusIcon,
    Sharing,
    UserXIcon
  },
  props: {
    note: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      removing: false,
      timeout: null,
      debounceFn: null,
      shareInfo: {},
      shareNoteModal: false
    }
  },
  computed: {
    isMenuVisible: {
      get () {
        return this.$store.state.isMenuVisible
      },
      set (value) {
        this.$store.commit('setState', { name: 'isMenuVisible', value: value })
      }
    }
  },
  methods: {
    removeMyself () {
      this.shareInfo = {
        type: 'remove',
        email: this.$store.state.coolStore.email,
        from: this.$store.state.coolStore.email,
        removedMyself: true
      }
      this.updateNote()
    },
    addShare (email = null) {
      if (email === null) {
        this.note.sharedWith = []
      } else {
        this.shareInfo = {
          type: 'add',
          email: email,
          from: this.$store.state.coolStore.email
        }
        this.updateNote()
      }
    },
    notOurNote () {
      const decoded = decode(Cookies.get('token'))
      if (decoded) {
        return this.note.userUuid === decoded.jti
      } else {
        return null
      }
    },
    removeShare (email = null) {
      if (email === null) {
        this.note.sharedWith = []
      } else {
        this.shareInfo = {
          type: 'remove',
          email: email,
          from: this.$store.state.coolStore.email
        }
      }
      this.updateNote()
    },
    async forceDelete () {
      this.$store.dispatch('syncNoteLocally', {
        note: this.note,
        type: 'findAndDelete'
      })
      this.$store.dispatch('setTags')
    },
    forceSync () {
      this.note.deleted = false
      this.updateNote()
    },
    checkTodo (todo) {
      todo.isChecked = !todo.isChecked
      // Disabled sorting
      /* this.note.todo.sort((a, b) => a.isChecked - b.isChecked) */
      this.updateNote()
    },
    checkMenu () {
      if (this.isMenuVisible === true) {
        this.isMenuVisible = false
      }
    },
    updateSizes () {
      this.$nextTick(() => {
        this.$refs.title && autosize.update(this.$refs.title)
        this.$refs.description && autosize.update(this.$refs.description)
        this.$refs.todo &&
          this.$refs.todo.map(onetodo => {
            autosize(onetodo)
            autosize.update(onetodo)
          })
      })
    },
    removeTag (tagName) {
      if (!this.note.tags) {
        this.note.tags = []
      }
      const index = this.note.tags.indexOf(tagName)
      if (index !== -1) {
        this.note.tags.splice(index, 1)
        this.updateNote()
        this.checkMenu()
      }
    },
    async convertToList () {
      // eslint-disable-next-line prefer-const
      let newNote = { ...this.note }
      newNote.description = ''
      newNote.todo = []
      newNote.lastUpdate = new Date().toISOString()
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
      this.updateNote(newNote)
    },
    async convertToText () {
      const newNote = { ...this.note }
      newNote.description = ''
      newNote.todo = []
      newNote.lastUpdate = new Date().toISOString()
      this.note.todo.map((onetodo, index) => {
        if (index === this.note.todo.length - 1) {
          newNote.description += onetodo.line
        } else {
          newNote.description += onetodo.line + '\n'
        }
      })
      this.updateNote(newNote)
    },
    removeNote () {
      this.removing = true
      this.timeout = setTimeout(async () => {
        const lastUpdate = {
          ...this.note,
          lastUpdate: new Date().toISOString()
        }
        if (this.$store.state.isOnline) {
          this.$store.dispatch('syncNoteLocally', {
            note: lastUpdate,
            type: 'findAndDelete'
          })
          this.$socket.emit('deleteNote', {
            uuid: lastUpdate.uuid,
            sendTo: 'others'
          })
          this.$store.dispatch('setTags')
        } else {
          lastUpdate.deletedLocally = true
          this.$store.dispatch('syncNoteLocally', {
            note: lastUpdate,
            type: 'findAndModify'
          })
        }
      }, 1800)
    },
    cancelRemove () {
      if (this.timeout !== null) {
        clearTimeout(this.timeout)
        this.removing = false
        this.timeout = null
      }
    },
    updateNote (newNote) {
      if (!this.note.deleted) {
        if (!this.removing) {
          const lastUpdate = {
            ...this.note,
            lastUpdate: new Date().toISOString()
          }
          if (newNote) {
            this.$store.dispatch('syncNoteLocally', {
              note: newNote,
              type: 'findAndModify'
            })
          } else {
            this.$store.dispatch('syncNoteLocally', {
              note: lastUpdate,
              type: 'findAndModify'
            })
          }
          if (this.$store.state.isOnline) {
            if (this.debounceFn) this.debounceFn.cancel()
            this.debounceFn = debounce(function () {
              if (newNote) {
                this.$socket.emit('updateNote', {
                  note: newNote,
                  sendTo: 'others'
                })
              } else {
                this.$socket.emit('updateNote', {
                  note: lastUpdate,
                  sendTo: 'others',
                  shareInfo: this.shareInfo
                })
                this.shareInfo = {}
              }
            }, 1000)
            this.debounceFn()
          }
        }
      }
    }
  }
}
</script>

<style lang="sass" >
.note
  -webkit-tap-highlight-color: transparent
  display: inline-block
  width: 100%
  max-width: 95%
  max-height: 375px
  transition: all 0.2s ease
  box-shadow: 5px 10px #22292f
  @apply bg-white rounded border border-coolnote text-gray-700 text-sm text-left my-2 px-1 pb-2 cursor-pointer mx-2 relative
  @screen sm
    box-shadow: none
    @apply border-gray-300
  &:hover
    transition: all 0.2s ease
    box-shadow: 5px 10px #22292f
    @apply text-black border-coolnote
.note-title
  @apply px-2 mt-2 mb-1 text-base font-semibold truncate
.note-title-empty
  @extend .note-title
  @apply text-gray-300 cursor-text
.note-description
  max-height: 210px
  @apply px-2 text-sm cursor-text truncate whitespace-pre-wrap break-words
.note-description-list
  max-height: 240px
  @apply truncate text-sm leading-tight cursor-text
.note-todo-list
  @apply flex
.note-todo-list-item
  @apply flex w-full my-auto truncate
.note-todo-list-item-line
  height: 26px
  padding-top: 0.15rem
  @apply w-full flex-1 my-auto border border-transparent resize-none truncate
.more
  @apply cursor-pointer px-6
.max-width-23
  max-width:23%
.badge
  font-size:0.8rem
  right:37px
  margin-top: -15px
  background-color: rgba(128, 128, 128, 0.1)
  min-width: 20px
  @apply rounded-full px-1 text-black px-2 font-mono font-bold
</style>
