<template>
  <div class="signin-container">
    <v-form v-model="valid" class="form-container">
      <Input
        v-model="email"
        label="email"
        type="email"
        class="login-input"
        :rules="rules.email"
        placeholder="awesome.driver@email.com"
      />
      <Input
        v-model="password"
        label="password"
        type="password"
        class="login-input"
        :rules="rules.password"
        placeholder="******"
      />
      <Button
        :disabled="!valid"
        class="login-button"
        @click.native.prevent="login"
        >login</Button
      >

      <NuxtLink to="/signup"
        >Don't have an account in <em>Deliverful</em>? Please Sign Up</NuxtLink
      >

      <Button
        class="login-button"
        type="google"
        @click.native.prevent="OAuthLogin('google')"
      >
        Continue with Google</Button
      >
      <Button
        class="login-button"
        type="facebook"
        @click.native.prevent="OAuthLogin('facebook')"
      >
        Continue with Facebook</Button
      >
    </v-form>
    <div>
      <UserCircleIcon class="user-icon" size="60" />
      <Title size="h1">Sign In</Title>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import firebase from "firebase/app";
// @ts-ignore
import { UserCircleIcon } from "@vue-hero-icons/solid";

import Title from "~/components/Title.vue";

import { requiredRule, validEmail } from "~/utils/rules.js";

export default Vue.extend({
  components: {
    Title,
    UserCircleIcon
  },
  data() {
    return {
      valid: false,
      email: "",
      password: "",
      rules: {
        password: [requiredRule()],
        email: [requiredRule(), validEmail()]
      }
    };
  },
  methods: {
    async login() {
      try {
        const email = this.email;
        const password = this.password;
        await this.$store.dispatch("loginWithEmail", {
          email,
          password
        });
        return this.$router.push("/gig-accounts");
      } catch (error) {
        this.$toast.showMessage({
          content: error.response.data.error.message,
          timeout: 5000,
          color: "red"
        });
      }
    },
    async OAuthLogin(providerName: "google" | "facebook" | null) {
      const provider = (() => {
        switch (providerName) {
          case "facebook":
            return new firebase.auth.FacebookAuthProvider();
          case "google":
            return new firebase.auth.GoogleAuthProvider();
          default:
            return this.$toast.showMessage({
              content: "Something went wrong. Please try again",
              color: "red",
              timeout: 5000
            });
        }
      })();
      if (provider) {
        try {
          await this.$fire.auth.signInWithPopup(provider);
          const currentUser: firebase.User | null = this.$fireModule.auth()
            .currentUser;

          if (!currentUser) return;
          const {
            displayName,
            photoURL,
            uid,
            email,
            phoneNumber
          } = currentUser;
          const userToken = await currentUser.getIdToken();

          this.$store.dispatch("setUserToken", userToken);

          await this.$store.dispatch("saveUserProfile", {
            userId: uid,
            name: displayName,
            email,
            phone: phoneNumber,
            picture: photoURL
          });
          await this.$store.dispatch("getUserProfile");
          return this.$router.push("/");
        } catch (error) {
          this.$toast.showMessage({
            content: error.response.data.error.message,
            timeout: 5000,
            color: "red"
          });
        }
      }
    }
  }
});
</script>

<style lang="scss">
.signin-container {
  display: flex;
  flex: 1;
  justify-content: space-between;
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
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    @media screen and (max-width: 960px) {
      order: 1;
    }
  }
  form {
    margin-top: 14px;
    display: flex;
    flex: 1;
    flex-direction: column;
    width: 100%;

    @media screen and (max-width: 960px) {
      order: 2;
      flex: 2;
    }
    button {
      margin-bottom: 12px;
    }

    .login-button {
      margin-bottom: 24px;
    }
    .login-input {
      margin-bottom: 16px;
    }
  }

  .user-icon {
    color: $secondary;
    align-self: center;
    margin-bottom: 16px;
  }

  h1 {
    margin-bottom: 24px;
  }

  a {
    margin-bottom: 30px;
    cursor: pointer;
    text-align: center;
    em {
      color: $primary;
    }
  }
}
</style>
