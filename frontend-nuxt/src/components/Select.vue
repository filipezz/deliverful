<template>
  <div
    :class="{ hasRules: rules.length === 0 ? 'has-rules' : '' }"
    class="select-container"
  >
    <label>{{ label }}</label>
    <v-select
      :class="'select-' + id"
      :placeholder="placeholder"
      :attach="'.select-' + id"
      :items="items"
      :rules="rules"
      :value="value"
      solo
      @input="$emit('change', $event)"
    ></v-select>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  model: {
    prop: "value",
    event: "change"
  },
  props: {
    value: {
      type: String,
      required: false,
      default: ""
    },
    rules: {
      type: Array,
      required: false,
      default: () => []
    },
    label: {
      type: String,
      required: false,
      default: ""
    },
    placeholder: {
      type: String,
      required: false,
      default: ""
    },
    items: {
      type: Array,
      required: false,
      default: () => []
    }
  },
  data() {
    return {
      id: this._uid
    };
  }
});
</script>

<style lang="scss">
.select-container {
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  > label {
    display: block;
    color: $dark-gray;
    font-family: $secondary-font;
    font-size: 12px;
    font-style: italic;
    margin-bottom: 5px;
    text-transform: capitalize;
  }
  input::placeholder {
    color: $light-gray;
    font-style: italic;
    font-size: 14px;
    line-height: 26px;
  }
  .v-input__slot {
    height: 56px;
    background: $white;
    border: 1px solid $light-gray;
    border-radius: 4px;
    padding: 20px 16px;
    color: $dark-blue;
    font-family: $secondary-font;
    outline-color: $secondary;
    box-shadow: 0px 3px 6px rgb(0 0 0 / 16%) !important;
    margin-bottom: 10px;
  }
}
.v-messages__message {
  color: red !important;
  font-weight: 600;
  padding-left: 2px;
}
.hasRules {
  .v-text-field__details {
    display: none;
  }
}
</style>
