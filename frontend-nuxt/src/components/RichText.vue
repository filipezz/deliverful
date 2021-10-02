<template>
  <div class="editor">
    <editor-menu-bar v-slot="{ commands, isActive }" :editor="editor">
      <div class="menubar">
        <button
          class="menubar__button"
          :class="{ 'is-active': isActive.bold() }"
          @click="commands.bold"
        >
          <v-icon> mdi-format-bold </v-icon>
        </button>

        <button
          class="menubar__button"
          :class="{ 'is-active': isActive.italic() }"
          @click="commands.italic"
        >
          <v-icon> mdi-format-italic </v-icon>
        </button>

        <button
          class="menubar__button"
          :class="{ 'is-active': isActive.underline() }"
          @click="commands.underline"
        >
          <v-icon> mdi-format-underline </v-icon>
        </button>

        <button
          class="menubar__button"
          :class="{ 'is-active': isActive.paragraph() }"
          @click="commands.paragraph"
        >
          <v-icon> mdi-format-paragraph </v-icon>
        </button>

        <button
          class="menubar__button"
          :class="{ 'is-active': isActive.bullet_list() }"
          @click="commands.bullet_list"
        >
          <v-icon> mdi-format-list-bulleted </v-icon>
        </button>

        <button class="menubar__button" @click="commands.undo">
          <v-icon> mdi-undo </v-icon>
        </button>

        <button class="menubar__button" @click="commands.redo">
          <v-icon> mdi-redo </v-icon>
        </button>
      </div>
    </editor-menu-bar>

    <editor-content class="editor__content" :editor="editor" />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
// @ts-ignore
import { Editor, EditorContent, EditorMenuBar } from "tiptap";

import {
  OrderedList,
  BulletList,
  ListItem,
  TodoItem,
  TodoList,
  Bold,
  Code,
  Italic,
  Link,
  Underline,
  History
  // @ts-ignore
} from "tiptap-extensions";
export default Vue.extend({
  components: {
    EditorMenuBar,
    EditorContent
  },
  data() {
    return {
      editor: null as any
    };
  },
  mounted() {
    this.editor = new Editor({
      extensions: [
        new BulletList(),
        new ListItem(),
        new OrderedList(),
        new TodoItem(),
        new TodoList(),
        new Link(),
        new Bold(),
        new Code(),
        new Italic(),
        new Underline(),
        new History()
      ],
      content: "<p>Write your Job Description <b>here</b> </p>",
      onUpdate: ({ getHTML }: any) => {
        this.$emit("value", getHTML());
      }
    });
  },

  beforeDestroy() {
    if (!this.editor) return;
    this.editor.destroy();
  }
});
</script>

<style lang="scss">
.editor {
  position: relative;

  margin: 0 auto 5rem auto;

  .menubar {
    margin-bottom: 14px;
    button {
      margin-right: 5px;
      transition: 0.2s;
      border-radius: 4px;
      padding: 3px;
      &:hover {
        background: rgba(0, 0, 0, 0.2);
      }
    }
  }
  li {
    list-style: disc !important;
  }
  &__content {
    border: 1px solid #ccc;
    border-radius: 4px;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;
    padding: 20px 26px;

    .ProseMirror {
      outline: 0;
      height: 100%;
      height: 544px;
      overflow-x: auto;
      line-height: 28px;
    }
    * {
      caret-color: currentColor;
    }

    ul,
    ol {
      padding-left: 1.2rem;
    }
    h1,
    h2,
    h3 {
      line-height: 1.3;
    }
    blockquote,
    h1,
    h2,
    h3,
    ol,
    p,
    pre,
    ul {
      margin: 1rem 0;
    }
    li > p,
    li > ol,
    li > ul {
      margin: 1rem 0;
    }

    a {
      color: inherit;
    }

    .resize-cursor {
      cursor: ew-resize;
      cursor: col-resize;
    }
  }
  .is-active {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    i {
      color: $secondary;
    }
  }
}
</style>
