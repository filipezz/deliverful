<template>
  <div class="admin-signup-container">
    <Loading v-if="loading" />
    <UserCircleIcon class="user-icon" size="60" />

    <Title size="h1">Admin Sign Up</Title>
    <v-form v-model="valid" class="form-grid">
      <Input
        v-model="firstName"
        :rules="rules.firstName"
        placeholder="John"
        label="First Name"
      ></Input>
      <Input v-model="lastName" placeholder="Doe" label="Last Name"></Input>
      <Input
        v-model="email"
        :rules="rules.email"
        type="email"
        placeholder="john@doe.com"
        label="Email"
      ></Input>
      <Input
        v-model="phone"
        :rules="rules.phone"
        type="text"
        :mask="telRule"
        placeholder="+1 123-456-7890"
        label="Phone Number"
      ></Input>
      <Input
        v-model="password"
        :rules="rules.password"
        type="password"
        placeholder="********"
        label="Password"
      ></Input>
      <Input
        v-model="confirmPassword"
        :rules="rules.confirmPassword"
        type="password"
        placeholder="********"
        label="Confirm Password"
      ></Input>
    </v-form>
    <Button :disabled="!valid" @click.native="adminSignup">submit</Button>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
// @ts-ignore
import { UserCircleIcon } from "@vue-hero-icons/solid";
import Title from "~/components/Title.vue";
import Input from "~/components/Input.vue";
import Button from "~/components/Button.vue";
import Loading from "~/components/Loading.vue";
import {
  requiredRule,
  minCharacters,
  validEmail,
  matchPassword
} from "~/utils/rules";
export default Vue.extend({
  components: {
    Title,
    Input,
    UserCircleIcon,
    Button,
    Loading
  },
  data() {
    return {
      valid: false,
      telRule: "+1 ###-###-####",
      email: "",
      password: "",
      phone: "",
      firstName: "",
      lastName: "",
      confirmPassword: "",
      rules: {
        firstName: [requiredRule()],
        lastName: [requiredRule()],
        password: [requiredRule(), minCharacters(6)],
        phone: [requiredRule()],
        email: [requiredRule(), validEmail()],
        confirmPassword: [requiredRule(), matchPassword.call(this)]
      },
      loading: false
    };
  },
  methods: {
    async adminSignup() {
      this.loading = true;

      try {
        const response = await this.$axios.$post("/companies/admin", {
          email: this.email,
          password: this.password,
          profile: {
            phone: this.phone,
            firstName: this.firstName,
            lastName: this.lastName
          }
        });

        const { accessToken } = response.user.token;

        this.$store.dispatch("setUserToken", accessToken);
        this.$router.push("Signup");
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
.admin-signup-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex: 1;
  height: 80vh;
  background: #fff;
  max-width: 960px;
  margin: 24px auto;
  padding: 48px 96px;
  border-radius: 4px;

  @media screen and (max-width: 960px) {
    height: 100vh;
    margin: 0 auto;
    padding: 48px 24px;
  }

  > h1 {
    margin-bottom: 48px;
  }
  .user-icon {
    color: $secondary;
    align-self: center;
    margin-bottom: 16px;
  }

  .form-grid {
    grid-template-columns: auto auto;
    display: grid;
    grid-gap: 24px 48px;
    width: 100%;

    > div {
      input {
        height: 48px;
      }
    }

    @media screen and (max-width: 768px) {
      display: block;
    }
  }
  button {
    margin-top: 30px;
    width: 100%;
  }
}
</style>
nse;
