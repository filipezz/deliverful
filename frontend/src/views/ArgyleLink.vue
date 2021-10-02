<template>
  <div />
</template>

<script lang="ts">
import userStore from "@/stores/user.store";
import { onMounted, defineComponent } from "vue";
import { useRouter } from "vue-router";
import { createArgyleUser } from "../services/api";
import { processLogin } from "../services/auth";

type ArgyleMethod = (argsObj: { accountId: string; userId: string; }) => void;

type ArgyleArgsObj = {
  pluginKey: string
  apiHost: string
  userToken?: string
  dataPartners: Array<string>
  onAccountCreated: ArgyleMethod
  onAccountConnected: ArgyleMethod
  onAccountUpdated: ArgyleMethod
  onAccountRemoved: ArgyleMethod
  onUserCreated: (argsObj: { userId: string; userToken: string; }) => void
  onClose: ArgyleMethod
  onTokenExpired: ArgyleMethod
};

interface ArgyleInterface {
  open: Function
  create: (argsObj: ArgyleArgsObj) => ArgyleInterface
}

export default defineComponent({
  setup() {
    const router = useRouter();

    const loadArgyleLink = async (userToken?: string) => {
      const argyleArgsObj: ArgyleArgsObj = {
        pluginKey: "a15238b2-ed6e-4f17-bb63-55cefced79c5",
        apiHost: "https://api-sandbox.argyle.io/v1",
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
          "deliv",
        ],
        onAccountCreated: ({ accountId, userId }) => {
          console.log("Account created: ", accountId, " User ID:", userId);
        },
        onAccountConnected: ({ accountId, userId }) => {
          console.log("Account connected: ", accountId, " User ID:", userId);
        },
        onAccountUpdated: ({ accountId, userId }) => {
          console.log("Account updated: ", accountId, " User ID:", userId);
        },
        onAccountRemoved: ({ accountId, userId }) => {
          console.log("Account removed: ", accountId, " User ID:", userId);
        },
        onUserCreated: ({ userId, userToken }) => {
          console.log("User created: ", userId);
          createArgyleUser({ userId, userToken }).then((x) => console.log(x));
        },
        onClose: async () => {
          console.log("Argyle Link closed");
          await processLogin();
          router.push("/profile");
        },
        onTokenExpired: (updateToken) => {
          console.log("Token expired");
          // generate your new token here
          // updateToken(newToken)
        },
      };

      if (
        userStore.isLoggedIn &&
        userStore.argyle &&
        userStore.argyle.userToken
      ) {
        argyleArgsObj["userToken"] = userStore.argyle.userToken;
      }

      const Argyle: ArgyleInterface = (window as any).getArgyle();
      const argyle = Argyle.create(argyleArgsObj);
      argyle.open();
    };

    onMounted(async () => {
      userStore.isLoggedIn && userStore.argyle?.userToken
        ? loadArgyleLink()
        : loadArgyleLink(userStore.argyle?.userToken);
    });
  },
});
</script>
