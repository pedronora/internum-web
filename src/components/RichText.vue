<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div class="rich-content" :class="$attrs.class" v-html="safeHtml"></div>
</template>

<script setup>
  import { computed } from 'vue'
  import DOMPurify from 'dompurify'

  defineOptions({ inheritAttrs: false })

  const props = defineProps({
    html: { type: String, default: '' },
  })

  const safeHtml = computed(() => DOMPurify.sanitize(props.html || ''))
</script>
