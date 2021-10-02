<template>
  <nav>
    <section class="start">
      <nuxt-link to="/" class="brand">
        <img src="~/assets/logos/logo-white.svg" alt="Deliverful" />
      </nuxt-link>
      <a>Jobs</a>
      <a>Resources</a>
    </section>
    <section class="end">
      <nuxt-link to="/signin"> SIGN IN </nuxt-link>
      <nuxt-link v-if="superAdmin" to="/super-admin"> Dashboard </nuxt-link>
    </section>
  </nav>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  components: {},
  data() {
    return {
      valid: false,
      loading: true,
      superAdmin: false
    };
  },
  mounted() {
    try {
      const user = this.$store.state.user;
      if (user && user.roles[0] === "superAdmin") {
        this.superAdmin = true;
      } else {
        this.superAdmin = false;
      }
    } catch (error) {
      this.superAdmin = false;
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
});
</script>

<style lang="scss" scoped>
nav {
  color: #f3f5f8;
  display: flex;
  position: sticky;
  top: 0;
  box-shadow: 1px 1px 6px 0px rgba(0, 0, 0, 0.3);
  align-items: center;
  background: transparent linear-gradient(90deg, #0099ff 0%, #00c590 100%) 0% 0%
    no-repeat padding-box;
  width: 100vw;
  padding: 20px 96px;
  height: 72px;
  justify-content: space-between;
  z-index: 999;

  a {
    color: $white;
  }

  @media screen and (max-width: 670px) {
    padding: 20px 24px;
  }
  .end {
    @media screen and (max-width: 670px) {
      display: none;
    }
  }
  .start {
    display: flex;
    .brand {
      margin-right: 96px;

      cursor: pointer;
      img {
        width: 140px;
        height: 20px;
      }
    }
    a {
      margin-right: 48px;
    }
    a:not(.brand) {
      @media screen and (max-width: 670px) {
        display: none;
      }
    }
  }
}
</style>
