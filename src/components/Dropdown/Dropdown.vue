<template>
  <div
    ref="menu"
    aria-label="Menu"
    :class="{'is-active': menu, 'is-up': isUp}"
    @click.stop
    @click="showMenu($event)"
    @mouseleave="checkMenu"
  >
    <slot
      name="dropdown-trigger"
      class="dropdown-trigger"
    />
    <div class="dropdown-menu  z-9999">
      <div
        class="dropdown-content shadow-lg border mx-5"
        :class="contentDesign"
      >
        <slot name="dropdown-content" />
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    contentDesign: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      menu: false,
      isUp: false
    }
  },
  computed: {
    isMenuVisible: {
      get () {
        return this.$store.state.isMenuVisible
      },
      set (value) {
        this.$store.commit('isMenuVisible', value)
      }
    }
  },
  watch: {
    isMenuVisible (value) {
      if (value === false) {
        this.menu = value
      }
    }
  },
  methods: {
    checkMenu () {
      if (this.isMenuVisible === true) { this.isMenuVisible = false }
    },
    showMenu (event) {
      this.menu = !this.menu
      this.isMenuVisible = !this.isMenuVisible

      this.$nextTick(() => {
        const spaceLeft = window.innerHeight - this.$refs.menu.getBoundingClientRect().bottom
        const dropdownHeight = this.$refs.menu.childNodes[1].scrollHeight
        if (spaceLeft < dropdownHeight) this.isUp = true
        else this.isUp = false
        const isMobile = window.matchMedia('only screen and (max-width: 760px)').matches
        if (isMobile && this.$route.path !== '/') { this.isUp = false }
      })
    }
  }
}
</script>
<style lang="sass" scoped>
.dropdown-item
  max-width:217px
  @apply truncate
  &:hover
    background-color: rgba(0,0,0,0.8)
    @apply text-white
.z-9999
  z-index: 9999
</style>
