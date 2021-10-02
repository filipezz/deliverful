<template>
  <div class="gigaccounts-container">
    <LinkIcon class="link-icon" size="48" />
    <Title size="h1" type="color-dark-blue">Link Gig Accounts</Title>
    <p>
      Sign in to your gig accounts to create your profile faster and share your
      ratings, awards, and more!
    </p>

    <img src="~/assets/images/link-card@2x.png" alt="" srcset="" />

    <Button type="primary" @click.native="linkArgyleAccounts"
      >LINK ACCOUNTS</Button
    >

    <nuxt-link to="/">I don’t have any of these accounts.</nuxt-link>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
// @ts-ignore
import { LinkIcon } from "@vue-hero-icons/outline";
import Title from "~/components/Title.vue";
import Button from "~/components/Button.vue";

declare global {
  interface Window {
    Argyle: any;
  }
}

type ArgyleMethod = (argsObj: { accountId: string; userId: string }) => void;

type ArgyleArgsObj = {
  pluginKey: string;
  apiHost: string;
  userToken?: string;
  dataPartners: Array<string>;
  onAccountCreated: ArgyleMethod;
  onAccountConnected: ArgyleMethod;
  onAccountUpdated: ArgyleMethod;
  onAccountRemoved: ArgyleMethod;
  onUserCreated: (argsObj: { userId: string; userToken: string }) => void;
  onClose: ArgyleMethod;
  onTokenExpired: ArgyleMethod;
};

export default Vue.extend({
  components: {
    Title,
    Button,
    LinkIcon
  },
  methods: {
    linkArgyleAccounts() {
      const argyleArgsObj: ArgyleArgsObj = {
        pluginKey:
          process.env.NUXT_ENV_NODE_ENV === "dev" ||
          process.env.NUXT_ENV_NODE_ENV === "dev "
            ? "a15238b2-ed6e-4f17-bb63-55cefced79c5"
            : "e13ddced-87aa-444b-bf66-15a87d320024",
        apiHost:
          process.env.NUXT_ENV_NODE_ENV === "dev" ||
          process.env.NUXT_ENV_NODE_ENV === "dev "
            ? "https://api-sandbox.argyle.io/v1"
            : "https://api.argyle.io/v1",
        dataPartners: [
          "doordash",
          "uber",
          "lyft",
          "postmates",
          "grubhub",
          "instacart",
          "task_rabbit",
          "amazon_flex",
          "caviar",
          "shipt",
          "deliv"
        ],
        onClose: () => {
          this.$store.dispatch("getUserProfile");
          this.$router.push("/");
        },
        onAccountCreated: () => {},
        onAccountConnected: async ({ accountId, userId }) => {
          try {
            await this.$axios.post("users/me/argyle/accounts", {
              accountId,
              userId
            });
          } catch (error) {
            this.$toast.showMessage({
              content: error.response.data.error.message,
              timeout: 5000,
              color: "red"
            });
          }
        },
        onAccountUpdated: () => {},
        onAccountRemoved: () => {},
        onUserCreated: async ({ userId, userToken }) => {
          try {
            await this.$axios.post("users/me/argyle", {
              userId,
              userToken
            });
          } catch (error) {
            this.$toast.showMessage({
              content: error.response.data.error.message,
              timeout: 5000,
              color: "red"
            });
          }
        },
        onTokenExpired: async (updateToken) => {
          try {
            await this.$axios.post(
              "users/me/argyle/refresh-token",
              updateToken
            );
          } catch (error) {
            this.$toast.showMessage({
              content: error.response.data.error.message,
              timeout: 5000,
              color: "red"
            });
          }
        }
      };
      const argyle = window.Argyle.create(argyleArgsObj);
      argyle.open();
      // this.$store.dispatch("api/login");
    },
    skipArgyleAccounts() {
      this.$router.push("/");
    }
  },
  beforeRouteEnter(_, from, next) {
    if (from.name === "SignUp" || from.name === "SignIn") {
      return next();
    }
    return next("/");
  },
  head() {
    return {
      script: [{ src: "https://plugin.argyle.io/argyle.web.v1.js", body: true }]
    };
  }
});
</script>

<style lang="scss">
.gigaccounts-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  background: #fff;
  height: 95vh;
  max-width: 768px;
  margin: 24px auto;
  padding: 24px;
  border-radius: 4px;
  text-align: center;

  @media screen and (max-width: 960px) {
    padding: 24px 15px;
    margin: 0 auto;
  }

  @media screen and (max-width: 768px) {
    height: 100vh;
  }

  .link-icon {
    color: $secondary;
  }

  h1 {
    margin-top: 16px;
  }

  p {
    text-align: center;
    max-width: 400px;
    color: $dark-blue;
    margin: 0 auto;
    margin-top: 16px;
  }

  img {
    max-height: 65%;
    width: 75%;
    margin-top: 16px;
  }

  button {
    width: 72%;
    margin: 8px auto 24px;
  }

  a {
    color: $primary;
    text-decoration: underline;
    font-style: italic;
  }
}
</style>
