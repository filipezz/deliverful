<template>
  <div class="input-container">
    <Title size="h2">{{ title }}</Title>
    <label v-if="label">{{ label }}</label>
    <span class="input-icon">
      <slot />
    </span>
    <input
      :is="textArea ? 'textarea' : 'input'"
      v-mask="mask"
      :type="type"
      :value="value"
      :style="{
        padding: !!this.$slots.default ? '20px 35px' : '20px 16px'
      }"
      :placeholder="placeholder"
      @input="$emit('input', $event.target.value)"
    />
    <v-text-field
      ref="validation"
      v-model="value"
      :style="{ display: rules.length === 0 ? 'none' : '' }"
      :rules="rules"
      required
    ></v-text-field>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  props: {
    placeholder: {
      type: String,
      required: false,
      default: ""
    },
    label: {
      type: String,
      required: false,
      default: ""
    },
    title: {
      type: String,
      required: false,
      default: ""
    },
    value: {
      type: String,
      required: false,
      default: ""
    },
    type: {
      type: String,
      required: false,
      default: "text"
    },
    rules: {
      type: Array,
      required: false,
      default: () => []
    },
    mask: {
      type: String,
      required: false,
      default: null
    },
    textArea: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  updated() {
    // @ts-ignore
    // eslint-disable-next-line no-self-assign
    this.value = this.value;
  }
});
</script>

<style lang="scss">
.input-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;

  .v-text-field {
    padding: 0;
    margin: 0;
  }
  .v-input__slot {
    display: none;
  }
  .error--text {
    color: red !important;
    font-weight: 600;
    padding-left: 2px;
  }
  > label {
    color: $dark-gray;
    font-family: $secondary-font;
    font-size: 12px;
    font-style: italic;
    text-transform: capitalize;
  }

  > input,
  textarea {
    margin-top: 5px;
    height: 56px;
    background: $white;
    border: 1px solid #cccccc;
    border-radius: 4px;
    padding: 20px 16px;
    color: $dark-blue;
    font-family: "Montserrat";
    outline-color: $secondary;
    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.16);
    margin-bottom: 10px;
  }
  > input::placeholder {
    color: $light-gray;
    font-style: italic;
    font-size: 14px;
    line-height: 26px;
  }
  .input-icon {
    position: absolute;
    top: 35px;
    left: 8px;
  }
  textarea {
    height: 200px;
  }
}
</style>
