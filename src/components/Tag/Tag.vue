<template>
  <button
    :class="[$route.path !== '/' ? 'break-all' : 'truncate max-w-cust']"
    class="tag border bg-gray-300 rounded px-1 mb-1 mx-1 text-gray-800 border-gray-200 hover:border-red-500 hover:bg-red-600 hover:text-white"
    @click.stop
    @click="$emit('removeTag')"
  >
    {{ tagName }}
  </button>
</template>

<script>
export default {
  name: 'Tag',
  props: {
    tagName: {
      type: String,
      required: true
    }
  }
}
</script>

<style lang="sass" scoped>
.tag
  transition: all 0.2s ease
  @apply text-xs
  @screen md
    @apply text-xs
  &:hover
    transition: all 0.2s ease
.max-w-cust
  max-width:40%
</style>
