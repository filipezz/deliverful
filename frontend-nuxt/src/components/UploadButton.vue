<template>
  <div v-ripple :disabled="disabled" class="upload-container">
    <v-file-input
      :id="file"
      :accept="accept"
      :name="file"
      class="file-input"
      filled
    >
    </v-file-input>
    <lottie-player
      v-if="loading"
      src="https://assets2.lottiefiles.com/packages/lf20_a2gg7umq.json"
      background="transparent"
      speed="1"
      style="height: 27px"
      loop
      autoplay
    ></lottie-player>

    <label v-else :for="file">Upload <UploadIcon /></label>
  </div>
</template>

<script>
import Vue from "vue";
// @ts-ignore

import { UploadIcon } from "@vue-hero-icons/solid";
export default Vue.extend({
  components: {
    UploadIcon
  },
  props: {
    accept: {
      type: String,
      required: false,
      default: ""
    },
    file: {
      type: String,
      required: true,
      default: ""
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    },
    loading: {
      type: Boolean,
      required: false,
      default: false
    }
  }
});
</script>

<style lang="scss">
.upload-container[disabled] {
  pointer-events: none;
  opacity: 0.5;
  background: $secondary;
  color: $white;
}
.upload-container {
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  width: 100%;
  height: 56px;
  border: 2px solid $secondary;
  background: 0;
  color: $secondary;
  font-family: $primary-font;
  border-radius: 4px;
  text-transform: uppercase;
  margin-top: 24px;
  box-shadow: 0px 3px 6px #00000029;
  transition: 0.1s;
  cursor: pointer;

  &:hover {
    border: 2px solid $secondary;
    background: $secondary;
    color: $white;
  }

  label {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: 16px;
    cursor: pointer;
  }

  .file-input {
    width: 0.1px;
    height: 0.1px;
    opacity: 0;
    overflow: hidden;
    position: absolute;
    z-index: -1;
    pointer-events: none;
  }

  .inputfile + label * {
    pointer-events: none;
  }
}
</style>
