<template>
  <client-only>
    <v-app class="app">
      <Navbar v-if="route === 'index'" />
      <Navbar v-if="route === 'super-admin'" />
      <Snackbar />
      <main>
        <Nuxt />
      </main>
    </v-app>
  </client-only>
</template>
<script lang="ts">
import Vue from "vue";
import Snackbar from "~/components/Snackbar.vue";
import Navbar from "~/components/Navbar.vue";

export default Vue.extend({
  components: {
    Navbar,
    Snackbar
  },
  computed: {
    route(): string | null | undefined {
      return this.$route.name;
    }
  },
  head() {
    if (this.route === "index") {
      return {
        title: ""
      };
    }
    return {};
  }
});
</script>

<style lang="scss">
.v-application {
  font-family: unset !important;
  background: 0;
}
.app {
  background: linear-gradient(58deg, #00c590 0%, #008df9 100%) !important;
  background-attachment: fixed;
  min-height: 100vh;

  main {
    display: flex;
    align-items: center;
    width: 100%;
    border-radius: 4px;
    @media screen and (max-width: 1380px) {
      border-radius: 0;
    }
  }
}
</style>
