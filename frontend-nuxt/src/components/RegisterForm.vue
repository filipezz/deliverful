<template>
  <div class="login-form-container">
    <Loading v-if="loading" />
    <v-form v-if="!phone" v-model="valid">
      <Input
        v-model="email"
        label="email"
        class="input-component"
        :rules="rules.email"
        placeholder="your@email.com"
      />

      <Input
        v-model="password"
        label="password"
        :rules="rules.password"
        type="password"
        class="input-component"
        placeholder="**********"
      />
      <Input
        v-model="confirmPassword"
        label="confirm password"
        type="password"
        class="input-component"
        :rules="rules.confirmPassword"
        placeholder="**********"
      />
      <Button
        :disabled="!valid"
        class="login-button"
        type="primary"
        @click.native.prevent="emailRegister"
        >submit</Button
      >

      <NuxtLink to="/signin"
        >Already have an account? <em>Sign In</em></NuxtLink
      >

      <Button type="white" @click.native.stop.prevent="phone = true"
        >Sign In with Phone Number</Button
      >

      <Button type="google" @click.native.prevent="OAuthLogin('google')">
        Sign in with Google</Button
      >
      <Button type="facebook" @click.native.prevent="OAuthLogin('facebook')">
        Sign in with Facebook</Button
      >
    </v-form>

    <div v-else class="phone-number">
      <Input
        v-if="!verifyId"
        v-model="phoneNumber"
        mask="+# ###-###-####"
        type="tel"
        class="input-component"
        placeholder="+1 555-555-5555"
      />
      <Input
        v-if="verifyId"
        v-model="confirmationCode"
        mask="######"
        class="input-component"
        placeholder="Confirmation Code"
        @input="submitConfirmationCode"
      />
      <Button
        v-if="!verifyId"
        class="phone-submit"
        type="primary"
        @click.native.prevent="phoneNumberLogin"
        >Submit</Button
      >
    </div>
    <!--     <span>
      By creating an account you agree to our <em>Terms of Service</em> and
      <em>Privacy Policy</em>
    </span> -->
    <div id="recaptcha"></div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import firebase from "firebase/app";
import {
  requiredRule,
  minCharacters,
  validEmail,
  matchPassword
} from "../utils/rules.js";
import Loading from "./Loading.vue";
import Input from "./Input.vue";
import Button from "./Button.vue";

export default Vue.extend({
  components: {
    Input,
    Button,
    Loading
  },

  data() {
    return {
      loading: false,
      valid: false,
      phone: false,
      phoneNumber: "",
      verifyId: null,
      confirmationCode: "",
      email: "",
      password: "",
      confirmPassword: "",
      rules: {
        password: [requiredRule(), minCharacters(6)],
        email: [requiredRule(), validEmail()],
        confirmPassword: [requiredRule(), matchPassword.call(this)]
      }
    };
  },

  methods: {
    async submitConfirmationCode(value: string) {
      if (value.length !== 6) return;

      this.loading = true;

      try {
        // @ts-ignore
        const result = await this.verifyId.confirm(this.confirmationCode);
        const { user } = result;
        const { displayName, photoURL, uid, email, phoneNumber } = user;
        const userToken = await user.getIdToken();

        this.$store.dispatch("setUserToken", userToken);

        await this.$store.dispatch("saveUserProfile", {
          userId: uid,
          name: displayName,
          email,
          phone: phoneNumber,
          picture: photoURL
        });

        this.$router.push("/gig-accounts");
      } catch (error) {
        this.$toast.showMessage({
          content: error.response.data.error.message,
          timeout: 5000,
          color: "red"
        });
      }

      this.loading = false;
    },
    async phoneNumberLogin() {
      const recaptchaVerifier = new this.$fireModule.auth.RecaptchaVerifier(
        "recaptcha",
        {
          size: "invisible"
        }
      );

      this.loading = true;
      try {
        const confirmationResult = await this.$fireModule
          .auth()
          .signInWithPhoneNumber(this.phoneNumber, recaptchaVerifier);

        // @ts-ignore
        this.verifyId = confirmationResult;
      } catch (error) {
        this.$toast.showMessage({
          content: error.response.data.error.message,
          timeout: 5000,
          color: "red"
        });
      }

      this.loading = false;
    },
    async OAuthLogin(providerName: "google" | "facebook" | null) {
      const provider = (() => {
        switch (providerName) {
          case "facebook":
            return new firebase.auth.FacebookAuthProvider();
          case "google":
            return new firebase.auth.GoogleAuthProvider();
          default:
            return null;
        }
      })();
      if (provider) {
        try {
          await this.$fire.auth.signInWithPopup(provider);
          const currentUser: firebase.User | null = this.$fireModule.auth()
            .currentUser;

          this.loading = true;

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
          return this.$router.push("/gig-accounts");
        } catch (error) {
          this.$toast.showMessage({
            content: error.response.data.error.message,
            timeout: 5000,
            color: "red"
          });
        }
        this.loading = false;
      }
    },
    async emailRegister() {
      const email = this.email;
      const password = this.password;

      this.loading = true;
      try {
        await this.$store.dispatch("registerWithEmail", {
          email,
          password
        });

        await this.$store.dispatch("loginWithEmail", {
          email,
          password
        });
        this.$router.push("/gig-accounts");
      } catch (error) {
        this.$toast.showMessage({
          content: error.response.data.error.message,
          timeout: 5000,
          color: "red"
        });
      }

      this.loading = false;
    }
  }
});
</script>

<style lang="scss">
.login-form-container {
  display: flex;
  flex-direction: column;
  width: 100%;

  form {
    margin-top: 14px;
    display: flex;
    flex: 1;
    justify-content: space-between;
    flex-direction: column;

    button {
      margin-bottom: 12px;
    }

    .login-button {
      margin-bottom: 24px;
    }

    a {
      cursor: pointer;
      text-align: center;
      margin-bottom: 20px;
      em {
        color: $primary;
      }
    }
  }
  .phone-number {
    display: flex;
    flex-direction: column;
    margin-top: 14px;

    .phone-submit {
      margin-bottom: 12px;
    }
  }

  .input-component {
    margin-bottom: 12px;
  }

  > span {
    font-size: 12px;
    text-align: center;
    font-family: "Montserrat";
    color: $dark-gray;

    em {
      color: $primary;
      text-decoration: underline;
    }
  }
}
</style>
