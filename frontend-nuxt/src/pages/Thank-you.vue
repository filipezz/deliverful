<template>
  <div class="thankyou-container">
    <EmojiHappyIcon size="58" class="happy-icon"></EmojiHappyIcon>
    <Title size="h1" color="color-dark-blue">Thank you!</Title>
    <p>You have successfully submitted an application for the Kyte Driver</p>

    <div class="thankyou-signup-container">
      <h3>Sign Up for a Deliverful Driver Profile!</h3>
      <img src="~/assets/images/profile-preview.png" alt="profile preview" />
      <span
        >Create a Deliverful profile so you can link your gig accounts to show
        off your driver rating, trips completed, and more!</span
      >
      <Button @click.native="goToCreateProfile"> Create a profile </Button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
// @ts-ignore
import { EmojiHappyIcon } from "@vue-hero-icons/solid";

import Title from "~/components/Title.vue";
import Button from "~/components/Button.vue";

export default Vue.extend({
  components: {
    Title,
    EmojiHappyIcon,
    Button
  },
  methods: {
    goToCreateProfile() {
      this.$router.push("/signup");
    }
  } /* ,
  beforeRouteEnter(_, from, next) {
    if (from.name === "job_id-form-Requirements-info") {
      return next();
    }
    return next("/");
  } */
});
</script>

<style lang="scss">
.thankyou-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  height: 90vh;
  background: #fff;
  max-width: 768px;
  margin: 24px auto;
  padding: 24px;
  border-radius: 4px;

  @media screen and (max-width: 960px) {
    padding: 0 15px;

    margin: 0 auto;

    height: 100vh;
  }

  .happy-icon {
    color: $secondary;
  }

  h1 {
    margin-top: 16px;
  }

  p {
    text-align: center;
    max-width: 330px;
    margin-top: 16px;
    color: $dark-blue;
  }

  .thankyou-signup-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    color: $dark-blue;

    > h3 {
      margin-top: 48px;
      font-weight: 600;
    }

    img {
      margin-top: 24px;
      width: 130px;
    }

    span {
      text-align: center;
      margin-top: 24px;
      font-family: $secondary-font;
      max-width: 480px;
    }
    button {
      margin-top: 48px;
      width: 100%;
    }
  }
}
</style>
