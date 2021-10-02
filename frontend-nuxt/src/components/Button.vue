<template>
  <button
    :disabled="loading"
    class="button-container"
    :class="{ loading, [type]: true }"
  >
    <lottie-player
      v-if="loading"
      src="https://assets3.lottiefiles.com/packages/lf20_pywyon5o.json"
      background="transparent"
      speed="1"
      style="height: 38px"
      loop
      autoplay
    ></lottie-player>

    <div v-else>
      <v-icon v-if="type === 'facebook'" left size="22px" color="#fff">
        mdi-facebook
      </v-icon>
      <v-icon v-if="type === 'google'">$google</v-icon>
      <slot />
    </div>
  </button>
</template>

<script lang="ts">
import Vue, { PropOptions } from "vue";

type ButtonTypes =
  | "primary"
  | "secondary"
  | "white"
  | "facebook"
  | "google"
  | "danger";

export default Vue.extend({
  props: {
    loading: {
      type: Boolean,
      required: false,
      default: false
    },
    type: {
      type: String,
      required: false,
      default: "primary"
    } as PropOptions<ButtonTypes>
  }
});
</script>

<style lang="scss">
.button-container {
  border-radius: 4px;
  font-weight: bold;
  padding: 5px 20px;
  text-align: center;
  height: 50px;
  display: flex;
  position: relative;
  font-size: 14px;
  text-transform: uppercase;
  justify-content: center;
  align-items: center;
  box-shadow: 0px 3px 6px #00000029;

  &:disabled {
    opacity: 0.7;
    cursor: unset;
  }

  &:not(:disabled)::before {
    background-repeat: no-repeat;
    box-sizing: inherit;
    background-color: currentColor;
    border-radius: inherit;
    bottom: 0;
    color: inherit;
    content: "";
    left: 0;
    opacity: 0;
    pointer-events: none;
    position: absolute;
    right: 0;
    top: 0;
    transition: opacity 0.2s cubic-bezier(0.4, 0, 0.6, 1);
  }
  &:hover:before {
    opacity: 0.2;
  }
}
.primary {
  background: $primary;
  color: $white;
}
.danger {
  background: crimson;
  color: $white;
}
.white {
  background: $white;
  color: $primary;
}
.outline {
  background: $white;
  color: $secondary;
  border: 2px solid $secondary;
}
.facebook {
  background: #4065b4;
  color: #fff;
}
.google {
  color: $dark-gray;
  svg {
    margin-right: 8px;
  }
}
</style>
