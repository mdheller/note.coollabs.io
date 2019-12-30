<template>
  <settings>
    <template v-slot:settings>
      <div class="container flex flex-row w-full px-2 my-3 text-white lg:px-10">
        <div class="flex flex-col items-center justify-center w-full text-center md:flex-row">
          <div class="pr-0 text-base font-bold md:text-2xl md:pr-10">
            Sort By
          </div>
          <div class="flex flex-row pt-4 md:pt-0">
            <div
              class="px-2 mx-2 my-auto cursor-pointer heading transition "
              :class="[by === 'moddate' ? 'bg-green-900 text-white rounded-full' : 'text-gray-500 hover:text-white']"
              @click="sort('moddate')"
            >
              Modification Date
            </div>
            <div
              class="px-2 mx-2 my-auto cursor-pointer heading transition "
              :class="[by === 'title' ? 'bg-green-900 text-white rounded-full' : ' text-gray-500 hover:text-white']"
              @click="sort('title')"
            >
              Title
            </div>
          </div>
        </div>
      </div>
    </template>
  </settings>
</template>

<script>
import { Settings } from '@coollabsio/developer-kit'
export default {
  name: 'SettingsView',
  components: { Settings },
  data () {
    return {
      by: localStorage.getItem('sort')
    }
  },
  methods: {
    sort (by) {
      localStorage.setItem('sort', by)
      this.by = by
    }
  }
}
</script>
