import Vue from 'vue'
import Vuex from 'vuex'
import router from '@/router'
import uuidv4 from 'uuid/v4'
import Cookies from 'js-cookie'
import decode from 'jwt-decode'
import { idb, coolStore } from '@coollabsio/developer-kit'

Vue.use(Vuex)

export default new Vuex.Store({
  namespaced: true,
  modules: {
    coolStore
  },
  state: {
    idbStore: {
      db: 'coolNoteDB',
      store: 'coolNoteStore'
    },
    loading: {
      remoteNotes: false,
      localNotes: true,
      sharing: false
    },
    isOnline: true,
    connected: false,
    showMainMenu: false,
    isMenuVisible: false,
    notes: [],
    tags: [],
    search: '',
    selectedTag: null,
    selectedNote: null,
    focusLine: null,
    top: 0
  },
  mutations: {
    setState (state, data) {
      state[data.name] = data.value
    },
    showMainMenu (state, value = null) {
      if (value !== null) state.showMainMenu = value
      else state.showMainMenu = !state.showMainMenu
    },
    setLoading (state, value) {
      state.loading[value.load] = value.isLoading
    },
    setNote (state, value) {
      const { index, note } = value
      const changedNotes = [...state.notes]
      changedNotes[index] = note
      state.notes = changedNotes
    },
    addNote (state, value) {
      const changedNotes = [...state.notes]
      changedNotes.push(value)
      state.notes = changedNotes.sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()))
    },
    delNote (state, index) {
      const changedNotes = [...state.notes]
      changedNotes.splice(index, 1)
      state.notes = changedNotes
    }
  },
  actions: {
    async loadLocalNotes ({ state, commit, dispatch }) {
      const noteUUIDs = await idb.load(state.idbStore)
      if (noteUUIDs.length > 0) {
        const testNotes = []
        for (let i = 0; i < noteUUIDs.length; i++) {
          const readNote = await idb.read(noteUUIDs[i], state.idbStore)
          testNotes.push(readNote)
          /* commit('addNote', readNote) */
          /* console.log('localnote') */
        }
        dispatch('setTags')
        commit('setState', { name: 'notes', value: testNotes })
        if (state.loading.localNotes) {
          commit('setLoading', { load: 'localNotes', isLoading: false })
        }
      } else {
        commit('setLoading', { load: 'localNotes', isLoading: false })
      }
    },
    SOCKET_disconnect ({ commit }) {
      commit('setState', { name: 'connected', value: false })
    },
    async SOCKET_connected ({ commit, dispatch }) {
      if (this._vm.$socket.connected) {
        commit('setState', { name: 'connected', value: true })
      }
      commit('setLoading', { load: 'remoteNotes', isLoading: true })
      await this._vm.$socket.emit('getNotes', { sendTo: 'myself' })
    },
    delNote ({ state, dispatch }, note) {
      this._vm.$socket.emit('deleteNote', note.uuid)
      for (const [i, stateNote] of state.notes.entries()) {
        if (stateNote.uuid === note.uuid) {
          dispatch('syncNoteLocally', { note: note, index: i, type: 'delete' })
        }
      }
    },
    syncNoteLocally ({ state, commit, dispatch }, data) {
      const { note, index, type, uuid } = data
      if (type === 'delete') {
        commit('delNote', index)
        idb.remove(note.uuid, state.idbStore)
        dispatch('setTags')
      }
      if (type === 'findAndDelete') {
        for (const [i, findNote] of state.notes.entries()) {
          if (findNote.uuid === note.uuid) {
            dispatch('syncNoteLocally', { note: note, index: i, type: 'delete' })
          }
        }
      }
      if (type === 'findAndDeleteByUuid') {
        for (const [i, findNote] of state.notes.entries()) {
          if (findNote.uuid === uuid) {
            const tmpNote = {
              uuid: uuid
            }
            dispatch('syncNoteLocally', { note: tmpNote, index: i, type: 'delete' })
          }
        }
      }
      if (type === 'add') {
        commit('addNote', note)
        idb.save(note.uuid, note, state.idbStore)
        dispatch('setTags')
      }
      if (type === 'modify') {
        commit('setNote', { index: index, note: note })
        idb.save(note.uuid, note, state.idbStore)
        dispatch('setTags')
      }
      if (type === 'findAndModify') {
        let found = false
        for (const [i, findNote] of state.notes.entries()) {
          if (findNote.uuid === note.uuid) {
            found = true
            dispatch('syncNoteLocally', { note: note, index: i, type: 'modify' })
          }
        }
        if (!found) {
          dispatch('syncNoteLocally', { note: note, type: 'add' })
        }
      }
    },
    SOCKET_invalidUser ({ commit }) {
      this._vm.$buefy.toast.open({
        duration: 2000,
        message: 'User not found!',
        position: 'is-top',
        type: 'is-danger'
      })
      commit('setLoading', { load: 'sharing', isLoading: false })
    },
    SOCKET_addedShare ({ commit }, payload) {
      this._vm.$buefy.toast.open({
        duration: 2000,
        message: `Shared with ${payload.email}! 🎉`,
        position: 'is-top',
        type: 'is-success'
      })
      commit('setLoading', { load: 'sharing', isLoading: false })
    },
    SOCKET_removedShare ({ commit }, { email, removedMyself = false }) {
      if (removedMyself) {
        this._vm.$buefy.toast.open({
          duration: 2000,
          message: 'You removed yourself from the sharing list!',
          position: 'is-top',
          type: 'is-success'
        })
      } else {
        this._vm.$buefy.toast.open({
          duration: 2000,
          message: `Removed ${email} from sharing! 😱`,
          position: 'is-top',
          type: 'is-danger'
        })
      }

      commit('setLoading', { load: 'sharing', isLoading: false })
    },
    async SOCKET_getNote ({ state, commit, dispatch }, msg) {
      const cookieToken = Cookies.get('token')
      const decoded = decode(cookieToken)
      const email = state.coolStore.email
      // If user is in edit mode and the note is shared, but the sharing is deleted
      if (msg.data == null) {
        dispatch('syncNoteLocally', { uuid: router.currentRoute.params.noteUuid, type: 'findAndDeleteByUuid' })
        if (router.currentRoute && router.currentRoute.path && router.currentRoute.path !== '/' && router.currentRoute.params.noteUuid === msg.data.uuid) {
          router.push('/')
        }
      } else {
        // If user is in home mode and the note is shared, but the sharing is deleted
        if (msg.data && msg.data.sharedWith && !msg.data.sharedWith.includes(email) && msg.data.userUuid !== decoded.jti) {
          dispatch('syncNoteLocally', { note: msg.data, type: 'findAndDelete' })
          if (!msg.removedMyself) {
            this._vm.$buefy.toast.open({
              duration: 4000,
              message: `'${msg.data.title}' (owned by ${msg.from || 'Unknown but cool'}) is not shared with you anymore! 😱`,
              position: 'is-top',
              type: 'is-danger'
            })
          }
          if (router.currentRoute && router.currentRoute.path && router.currentRoute.path !== '/' && router.currentRoute.params.noteUuid === msg.data.uuid) {
            router.push('/')
          }
        } else {
          // Not shared notes
          if (msg.type === 'add') {
            this._vm.$buefy.toast.open({
              duration: 4000,
              message: `Wow! You have a new shared note from ${msg.from}, called '${msg.data.title}'! 🎉`,
              position: 'is-top',
              type: 'is-success'
            })
          }
          if (msg.data.userUuid !== decoded.jti && (!msg.data.sharedWith || !msg.data.sharedWith.includes(email))) {
            dispatch('syncNoteLocally', { note: msg.data, type: 'findAndDelete' })
            if (!msg.removedMyself) {
              this._vm.$buefy.toast.open({
                duration: 4000,
                message: `'${msg.data.title}' (owned by ${msg.from || 'Unknown but cool'}) is not shared with you anymore! 😱`,
                position: 'is-top',
                type: 'is-danger'
              })
            }
          } else {
            dispatch('syncNoteLocally', { note: msg.data, type: 'findAndModify' })
          }
          if (router.currentRoute && router.currentRoute.path && router.currentRoute.path !== '/' && router.currentRoute.params.noteUuid === msg.data.uuid) {
            commit('setState', { name: 'selectedNote', value: msg.data })
          }
        }
      }
    },
    async compareNotes ({ dispatch }, data) {
      const { localNote, remoteNote } = data
      if (localNote.deleted === true && remoteNote.deleted === false) {
        this._vm.$socket.emit('getNote', { uuid: remoteNote.uuid, sendTo: 'myself' })
      } else {
        if (localNote.deletedLocally) {
          if (new Date(localNote.lastUpdate).getTime() > new Date(remoteNote.lastUpdate).getTime()) {
            await dispatch('syncNoteLocally', { note: localNote, type: 'findAndDelete' })
            localNote.deleted = true
            localNote.lastUpdate = new Date().toISOString()
            // console.log('local is newer and deleted, sync...')
            this._vm.$socket.emit('updateNote', { note: localNote, sendTo: 'others' })
          } else if (new Date(localNote.lastUpdate).getTime() < new Date(remoteNote.lastUpdate).getTime()) {
            // console.log('server is newer, sync...')
            this._vm.$socket.emit('getNote', { uuid: remoteNote.uuid, sendTo: 'myself' })
          } else if (!localNote.lastUpdate && remoteNote.lastUpdate) {
            // console.log('server is newer, sync...')
            this._vm.$socket.emit('getNote', { uuid: remoteNote.uuid, sendTo: 'myself' })
          } else if (localNote.lastUpdate && !remoteNote.lastUpdate) {
            // console.log('local is newer, sync...')
            this._vm.$socket.emit('updateNote', { note: localNote, sendTo: 'others' })
          }
        } else {
          if (new Date(localNote.lastUpdate).getTime() > new Date(remoteNote.lastUpdate).getTime()) {
            // console.log('local is newer, sync...')
            this._vm.$socket.emit('updateNote', { note: localNote, sendTo: 'others' })
          } else if (new Date(localNote.lastUpdate).getTime() < new Date(remoteNote.lastUpdate).getTime()) {
            // console.log('1server is newer, sync...')
            this._vm.$socket.emit('getNote', { uuid: remoteNote.uuid, sendTo: 'myself' })
          } else if (!localNote.lastUpdate && remoteNote.lastUpdate) {
            // console.log('2server is newer, sync...')
            this._vm.$socket.emit('getNote', { uuid: remoteNote.uuid, sendTo: 'myself' })
          } else if (localNote.lastUpdate && !remoteNote.lastUpdate) {
            // console.log('local is newer, sync...')
            this._vm.$socket.emit('updateNote', { note: localNote, sendTo: 'others' })
          }
        }
      }
    },
    async SOCKET_getNotes ({ state, commit, dispatch }, notes) {
      let noteUUIDs = await idb.load(state.idbStore)
      if (notes && notes.data) {
        if (notes.data.length === 0) {
          if (noteUUIDs) {
            for (const [i, uuid] of noteUUIDs.entries()) {
              const localNote = await idb.read(uuid, state.idbStore)
              localNote.deleted = true
              dispatch('syncNoteLocally', { note: localNote, index: i, type: 'modify' })
            }
          }
        } else {
          for (const remoteNote of notes.data) {
            if (noteUUIDs && noteUUIDs.includes(remoteNote.uuid)) {
              const localNote = await idb.read(remoteNote.uuid, state.idbStore)
              noteUUIDs = noteUUIDs.filter(uuid => uuid !== localNote.uuid)
              if (remoteNote.deleted) {
                dispatch('syncNoteLocally', { note: remoteNote, type: 'findAndModify' })
              } else {
                dispatch('compareNotes', { localNote: localNote, remoteNote: remoteNote })
              }
            } else {
              if (!remoteNote.deleted) {
                dispatch('syncNoteLocally', { note: remoteNote, type: 'findAndModify' })
              }
            }
          }
        }
        // If note is only available locally
        if (noteUUIDs && noteUUIDs.length > 0) {
          for (const uuid of noteUUIDs) {
            // console.log('on cloud it is not available, sync...')
            const localNote = await idb.read(uuid, state.idbStore)
            if (localNote.sharedWith && localNote.sharedWith.includes(state.coolStore.email)) {
              dispatch('syncNoteLocally', { note: localNote, type: 'findAndDelete' })
            } else {
              this._vm.$socket.emit('updateNote', { note: localNote, sendTo: 'broadcast' })
            }
          }
        }
      } else {
        if (noteUUIDs && noteUUIDs.length > 0) {
          for (const uuid of noteUUIDs) {
            // console.log('on cloud it is not available, sync...')
            const localNote = await idb.read(uuid, state.idbStore)
            if (localNote.sharedWith && localNote.sharedWith.includes(state.coolStore.email)) {
              dispatch('syncNoteLocally', { note: localNote, type: 'findAndDelete' })
            } else {
              this._vm.$socket.emit('updateNote', { note: localNote, sendTo: 'broadcast' })
            }
          }
        }
      }
      setTimeout(function () { commit('setLoading', { load: 'remoteNotes', isLoading: false }) }, 800)
    },
    async setTags ({ state, commit }) {
      const noteUUIDs = await idb.load(state.idbStore)
      if (noteUUIDs && noteUUIDs.length > 0) {
        const tags = new Set()
        for (const note of noteUUIDs) {
          const readNote = await idb.read(note, state.idbStore)
          if (readNote && readNote.tags && readNote.tags.length > 0) {
            for (const tag of readNote.tags) {
              tags.add(tag)
            }
          }
        }
        commit('setState', {
          name: 'tags',
          value: Array.from(tags).sort((a, b) =>
            a.toLowerCase().localeCompare(b.toLowerCase())
          )
        })
      } else {
        commit('setState', { name: 'tags', value: [] })
      }
    },
    async addNewNote ({ state, commit, dispatch }) {
      const checkMax = (max, cur) => Math.max(max, cur)
      let max = state.notes.map(el => el.order).reduce(checkMax, -Infinity)
      if (max === -Infinity) {
        max = 1
      } else {
        max++
      }
      const uuid = uuidv4()
      const cookieToken = Cookies.get('token')
      const decoded = decode(cookieToken)
      const newNote = {
        userUuid: decoded.jti,
        uuid: uuid,
        title: '',
        description: '',
        todo: [],
        order: max,
        tags: [],
        lastUpdate: new Date().toISOString(),
        deleted: false,
        sharedWith: []
      }
      commit('setState', { name: 'selectedNote', value: newNote })
      dispatch('syncNoteLocally', { note: newNote, type: 'add' })
      this._vm.$socket.emit('updateNote', { note: newNote, sendTo: 'others' })
      router.push({ path: `/note/${uuid}` })
    }
  }
})
