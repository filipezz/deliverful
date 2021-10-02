<template>
  <div class="page-container">
    <div class="login-container">
      <RegisterForm />
    </div>

    <div>
      <UserCircleIcon class="user-icon" size="60" />
      <Title size="h1">Create a profile</Title>
      <Title size="h4">To apply for this job you must create a profile.</Title>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
// @ts-ignore
import { UserCircleIcon } from "@vue-hero-icons/solid";
import Title from "~/components/Title.vue";
import RegisterForm from "~/components/RegisterForm.vue";

export default Vue.extend({
  components: {
    Title,
    RegisterForm,
    UserCircleIcon
  }
});
</script>

<style lang="scss">
.page-container {
  display: flex;
  width: 100%;
  align-items: center;
  height: 90vh;
  background: $white;
  border-radius: 4px;
  padding: 0 48px;
  width: 100%;
  margin: 50px auto;
  max-width: 1390px;
  @media screen and (max-width: 960px) {
    flex-direction: column;
    margin: 0;
    height: 100vh;
    padding: 0 15px;
  }
  > div:nth-child(2) {
    flex: 1;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    @media screen and (max-width: 960px) {
      order: 1;
    }

    .user-icon {
      color: $secondary;
      align-self: center;
      margin-bottom: 16px;
    }

    h4 {
      font-weight: normal;
      text-align: center;
      font-family: "Montserrat";
      max-width: 280px;
      margin-top: 16px;
      color: #202529;
    }

    .close-button {
      font-style: italic;
      font-size: 16px;
      background: 0;
      border: 0;
      color: $primary;
      text-decoration: underline;
      font-family: "Montserrat";
    }
  }
}
.login-container {
  display: flex;
  flex: 1;
  width: 100%;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  @media screen and (max-width: 960px) {
    order: 2;
  }
}
</style>
