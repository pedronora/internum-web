<template>
  <div
    class="overflow-hidden rounded-lg border bg-white dark:bg-slate-900"
    :class="
      error
        ? 'border-red-500 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/40'
        : 'border-slate-300 transition focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/40 dark:border-slate-600'
    "
  >
    <div
      class="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50 px-2 py-1.5 dark:border-slate-700 dark:bg-slate-800"
      role="toolbar"
      :aria-label="ariaLabel || 'Barra de formatação'"
    >
      <button
        type="button"
        class="editor-btn"
        title="Desfazer"
        aria-label="Desfazer"
        :disabled="!editor?.can().undo()"
        @click="editor?.chain().focus().undo().run()"
      >
        <Icon name="undo" class="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        class="editor-btn"
        title="Refazer"
        aria-label="Refazer"
        :disabled="!editor?.can().redo()"
        @click="editor?.chain().focus().redo().run()"
      >
        <Icon name="redo" class="h-4 w-4" aria-hidden="true" />
      </button>

      <span class="editor-sep" aria-hidden="true"></span>

      <button
        type="button"
        class="editor-btn"
        :class="{ 'editor-btn-active': editor?.isActive('bold') }"
        title="Negrito"
        aria-label="Negrito"
        @click="editor?.chain().focus().toggleBold().run()"
      >
        <Icon name="bold" class="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        class="editor-btn"
        :class="{ 'editor-btn-active': editor?.isActive('italic') }"
        title="Itálico"
        aria-label="Itálico"
        @click="editor?.chain().focus().toggleItalic().run()"
      >
        <Icon name="italic" class="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        class="editor-btn"
        :class="{ 'editor-btn-active': editor?.isActive('underline') }"
        title="Sublinhado"
        aria-label="Sublinhado"
        @click="editor?.chain().focus().toggleUnderline().run()"
      >
        <Icon name="underline" class="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        class="editor-btn"
        :class="{ 'editor-btn-active': editor?.isActive('strike') }"
        title="Tachado"
        aria-label="Tachado"
        @click="editor?.chain().focus().toggleStrike().run()"
      >
        <Icon name="strikethrough" class="h-4 w-4" aria-hidden="true" />
      </button>

      <span class="editor-sep" aria-hidden="true"></span>

      <button
        type="button"
        class="editor-btn"
        :class="{
          'editor-btn-active': editor?.isActive('heading', { level: 1 }),
        }"
        title="Título 1"
        aria-label="Título 1"
        @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()"
      >
        H1
      </button>
      <button
        type="button"
        class="editor-btn"
        :class="{
          'editor-btn-active': editor?.isActive('heading', { level: 2 }),
        }"
        title="Título 2"
        aria-label="Título 2"
        @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
      >
        H2
      </button>
      <button
        type="button"
        class="editor-btn"
        :class="{
          'editor-btn-active': editor?.isActive('heading', { level: 3 }),
        }"
        title="Título 3"
        aria-label="Título 3"
        @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()"
      >
        H3
      </button>

      <span class="editor-sep" aria-hidden="true"></span>

      <button
        type="button"
        class="editor-btn"
        :class="{ 'editor-btn-active': editor?.isActive('bulletList') }"
        title="Lista com marcadores"
        aria-label="Lista com marcadores"
        @click="editor?.chain().focus().toggleBulletList().run()"
      >
        <Icon name="list-ul" class="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        class="editor-btn"
        :class="{ 'editor-btn-active': editor?.isActive('orderedList') }"
        title="Lista numerada"
        aria-label="Lista numerada"
        @click="editor?.chain().focus().toggleOrderedList().run()"
      >
        <Icon name="list-ol" class="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        class="editor-btn"
        :class="{ 'editor-btn-active': editor?.isActive('blockquote') }"
        title="Citação"
        aria-label="Citação"
        @click="editor?.chain().focus().toggleBlockquote().run()"
      >
        <Icon name="blockquote-left" class="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        class="editor-btn"
        :class="{ 'editor-btn-active': editor?.isActive('code') }"
        title="Código"
        aria-label="Código"
        @click="editor?.chain().focus().toggleCode().run()"
      >
        <Icon name="code" class="h-4 w-4" aria-hidden="true" />
      </button>

      <span class="editor-sep" aria-hidden="true"></span>

      <button
        type="button"
        class="editor-btn"
        :class="{
          'editor-btn-active': editor?.isActive({ textAlign: 'left' }),
        }"
        title="Alinhar à esquerda"
        aria-label="Alinhar à esquerda"
        @click="editor?.chain().focus().setTextAlign('left').run()"
      >
        <Icon name="align-left" class="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        class="editor-btn"
        :class="{
          'editor-btn-active': editor?.isActive({ textAlign: 'center' }),
        }"
        title="Centralizar"
        aria-label="Centralizar"
        @click="editor?.chain().focus().setTextAlign('center').run()"
      >
        <Icon name="align-center" class="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        class="editor-btn"
        :class="{
          'editor-btn-active': editor?.isActive({ textAlign: 'right' }),
        }"
        title="Alinhar à direita"
        aria-label="Alinhar à direita"
        @click="editor?.chain().focus().setTextAlign('right').run()"
      >
        <Icon name="align-right" class="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        class="editor-btn"
        :class="{
          'editor-btn-active': editor?.isActive({ textAlign: 'justify' }),
        }"
        title="Justificar"
        aria-label="Justificar"
        @click="editor?.chain().focus().setTextAlign('justify').run()"
      >
        <Icon name="align-justify" class="h-4 w-4" aria-hidden="true" />
      </button>

      <span class="editor-sep" aria-hidden="true"></span>

      <button
        type="button"
        class="editor-btn"
        :class="{ 'editor-btn-active': editor?.isActive('link') }"
        title="Inserir link"
        aria-label="Inserir link"
        @click="setLink"
      >
        <Icon name="link-45deg" class="h-4 w-4" aria-hidden="true" />
      </button>
    </div>

    <editor-content :editor="editor" class="tiptap-editor" />
  </div>
</template>

<script setup>
  import { useEditor, EditorContent } from '@tiptap/vue-3'
  import StarterKit from '@tiptap/starter-kit'
  import Underline from '@tiptap/extension-underline'
  import Link from '@tiptap/extension-link'
  import TextAlign from '@tiptap/extension-text-align'
  import Placeholder from '@tiptap/extension-placeholder'
  import { watch } from 'vue'
  import Icon from '@/components/Icon.vue'

  const props = defineProps({
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: 'Escreva aqui...' },
    error: { type: Boolean, default: false },
    ariaLabel: { type: String, default: '' },
  })

  const emit = defineEmits(['update:modelValue'])

  const editor = useEditor({
    content: props.modelValue,
    extensions: [
      StarterKit.configure({
        link: false,
        underline: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: props.placeholder,
      }),
    ],
    onUpdate: ({ editor }) => {
      emit('update:modelValue', editor.getHTML())
    },
  })

  watch(
    () => props.modelValue,
    (value) => {
      if (!editor.value || value === editor.value.getHTML()) return
      editor.value.commands.setContent(value || '', false)
    },
  )

  function setLink() {
    if (!editor.value) return
    const previousUrl = editor.value.getAttributes('link').href
    const url = window.prompt('URL do link:', previousUrl || 'https://')
    if (url === null) return
    if (url === '') {
      editor.value.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.value
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: url })
      .run()
  }
</script>
