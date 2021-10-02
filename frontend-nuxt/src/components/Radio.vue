<template>
  <div>
    <Title size="h2">{{ title }}</Title>
    <label class="requirements-label">{{ label }}</label>
    <v-btn-toggle
      :value="value"
      :multiple="multiple"
      class="requirementform-buttons"
      @change="$emit('change', $event)"
    >
      <v-btn
        v-for="alternative in alternatives"
        :key="alternative"
        active-class="active-btn"
        :value="alternative"
      >
        {{ alternative }}
      </v-btn>
    </v-btn-toggle>
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
    title: {
      type: String,
      required: true,
      default: ""
    },
    value: {
      type: [String, Array],
      required: true,
      default: ""
    },
    alternatives: {
      type: Array,
      required: false,
      default: () => ["yes", "no"]
    },
    multiple: {
      type: Boolean,
      required: false,
      default: false
    },
    required: {
      type: Boolean,
      required: false,
      default: false
    },
    label: {
      type: String,
      required: false,
      default: ""
    }
  }
});
</script>

<style lang="scss">
h2 {
  font-family: $primary-font;
  font-weight: 600;
  margin-bottom: 16px;
  font-size: 20px;
}

.requirements-label {
  color: $dark-gray;
  font-size: 16px;
  font-family: $secondary-font;
  font-style: italic;
}

.active-btn {
  border-color: $secondary !important;
  background: $secondary !important;
  color: $base !important;
}
</style>
