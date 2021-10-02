<template>
  <component :is="size" :class="{ [color]: true }" :css="true">
    <slot />
  </component>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  props: {
    color: {
      type: String,
      default: "color-dark-blue"
    },
    size: {
      type: String,
      default: "h1"
    }
  }
});
</script>

<style lang="scss">
.color-primary {
  color: $primary;
}
.color-white {
  color: $white;
}
.color-dark-blue {
  color: $dark-blue;
}
.color-dark-gray {
  color: $dark-gray;
}
.color-secondary {
  color: $secondary;
}
.color-base {
  color: $base;
}
.color-light-gray {
  color: $light-gray;
}
</style>
