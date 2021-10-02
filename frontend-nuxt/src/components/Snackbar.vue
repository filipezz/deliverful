<template>
  <v-snackbar
    v-model="show"
    :top="true"
    :right="true"
    :timeout="timeout"
    :color="color"
  >
    {{ message }}
    <v-btn text @click="show = false">Close</v-btn>
  </v-snackbar>
</template>

<script>
export default {
  data() {
    return {
      show: false,
      message: "",
      color: "",
      timeout: null
    };
  },
  created() {
    this.$store.subscribe((mutation, state) => {
      if (mutation.type === "showMessage") {
        this.message = state.snackbar.content;
        this.color = state.snackbar.color;
        this.timeout = state.snackbar.timeout;
        this.show = true;
      }
    });
  }
};
</script>
