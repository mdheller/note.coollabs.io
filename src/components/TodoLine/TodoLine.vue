<template>
  <div class="todo-list">
    <!--   <chevron-right-icon
      size="1.1x"
      class="position animated lightSpeedIn faster"
      v-show="focusLine === lineIndex"
    ></chevron-right-icon> -->
    <div @click="$emit('checkTodo')">
      <check-square-icon
        v-if="todo.isChecked"
        title="Done"
        size="1.6x"
        class="inline-flex mx-2 text-green-500 cursor-pointer transition"
      />
      <square-icon
        v-else
        size="1.6x"
        title="Undone"
        class="inline-flex mx-2 text-gray-500 cursor-pointer transition hover:text-black-500"
      />
    </div>
    <div class="todo-list-item">
      <textarea
        ref="todoline"
        v-model="todo.line"
        :data-todoline="todo.line"
        spellcheck="false"
        class="todo-list-item-line"
        :class="[todo.isChecked ? 'line-through text-green-500' : '']"
        rows="1"
        :readonly="todo.isChecked"
        placeholder="Todo item"
        @input="$emit('updateNote')"
        @focus="focus()"
        @keydown.enter.prevent.exact="$emit('addNewTodo')"
        @keydown.delete.stop.exact
        @keydown.delete.exact="$emit('deleteTodo')"
        @keydown.down.exact="goToTodo(1)"
        @keydown.up.exact="goToTodo(-1)"
      />
      <!--  <x-icon
          size="1.1x"
          class="mx-2 my-auto cursor-pointer animated lightSpeedIn faster md:mx-10 lg:mx-0 lg:-mr-24"
          :class="[focusLine === lineIndex ? 'inline-flex' :  'hidden']"
          v-show="focusLine === lineIndex"
          @click.stop
          @click="$emit('deleteTodoLine')"
        /> -->
    </div>
  </div>
</template>

<script>
import autosize from 'autosize'
import {
  SquareIcon,
  CheckSquareIcon
} from 'vue-feather-icons'
export default {
  components: {
    SquareIcon,
    CheckSquareIcon
  },
  props: {
    todo: {
      type: Object,
      required: true
    },
    lineIndex: {
      type: Number,
      required: true
    }
  },
  computed: {
    focusLine () {
      return this.$store.state.focusLine
    }
  },
  mounted () {
    this.updateSizes()
  },
  updated () {
    this.updateSizes()
  },
  methods: {
    focus () {
      this.$store.commit('setState', { name: 'focusLine', value: this.lineIndex })
    },
    goToTodo (index) {
      this.$emit('goToTodo', index)
    },
    checkTodo (todo) {
      todo.isChecked = !todo.isChecked
    },
    updateSizes () {
      autosize(this.$refs.todoline) && autosize.update(this.$refs.todoline)
    }
  }
}
</script>

<style lang="sass">
.todo-list
  @apply flex
.todo-list-item
  @apply flex w-full my-auto
.todo-list-item-line
  height: 30px
  @apply w-full flex-1 my-auto border border-transparent
.position
  @apply absolute left-0
  @screen lg
    margin-left: -25px
    @apply relative
</style>
