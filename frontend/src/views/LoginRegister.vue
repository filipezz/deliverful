<template>
  <form class="content">
    <ion-card>
      <ion-card-header>
        <ion-card-title>{{ action }}</ion-card-title>
      </ion-card-header>

      <ion-card-content>
        <div id="recaptcha-container"></div>

        <div v-if="!isPhoneRoute">
          <ion-item>
            <ion-label>E-Mail</ion-label>
            <ion-input
              placeholder="emilia@email.com"
              name="email"
              inputmode="email"
              autocomplete="email"
              type="email"
              :required="true"
              :autofocus="true"
              :clearInput="true"
            />
          </ion-item>

          <ion-item>
            <ion-label>Password</ion-label>
            <ion-input
              placeholder="emilia@email.com"
              name="password"
              inputmode="password"
              autocomplete="password"
              type="password"
              :required="true"
              :clearInput="true"
            />
          </ion-item>
        </div>

        <div v-else>
          <ion-item v-if="phone.status < phoneStatus.recaptchaInformed">
            <ion-label>Phone Number</ion-label>
            <ion-input
              v-model="phone.number"
              placeholder="+1 202-555-0155"
              name="tel"
              inputmode="tel"
              autocomplete="tel"
              type="tel"
              :required="true"
              :clearInput="true"
            />
          </ion-item>

          <!-- <ion-item v-if="phone.status === phoneStatus.numberInformed">
              <ion-label>Recaptcha</ion-label>
              <ion-input
                v-model="phone.recaptcha"
                name="recaptcha"
                inputmode="number"
                autocomplete="number"
                type="number"
                :required="true"
                :clearInput="true"
              />
            </ion-item> -->

          <div v-if="phone.status === phoneStatus.recaptchaInformed">
            <ion-item>
              <ion-label>Confirmation Code</ion-label>
              <ion-input
                v-model="phone.confirmationCode"
                name="confirmationCode"
                :required="true"
                :clearInput="true"
              />
              <br />
            </ion-item>
            <ion-card-subtitle
              >Please, check the confirmation code you received on your phone,
              and type it here</ion-card-subtitle
            >
          </div>
        </div>

        <br />
        <ion-card-subtitle>
          <a @click="switchAction">
            {{
              action === "Register"
                ? "Already registered? Sign in instead!"
                : "Do not have a account? Register Instead!"
            }}
          </a>
        </ion-card-subtitle>
      </ion-card-content>
    </ion-card>
    <ion-card>
      <div v-if="!isPhoneRoute">
        <ion-button color="success" size="large" expand="full">
          {{ action }}
        </ion-button>

        <ion-button
          color="danger"
          size="large"
          expand="full"
          @click="loginWithProvider('google')"
        >
          <ion-icon slot="start" :icon="logoGoogle"></ion-icon>
          <label> {{ action }} with Google</label>
        </ion-button>

        <ion-button
          color="facebook"
          size="large"
          expand="full"
          @click="loginWithProvider('facebook')"
        >
          <ion-icon slot="start" :icon="logoFacebook"></ion-icon>
          <label> {{ action }} with Facebook</label>
        </ion-button>
      </div>

      <ion-button
        color="dark"
        size="large"
        expand="full"
        @click="handlePhoneSubmits"
      >
        <ion-icon :icon="phonePortrait" />
        <ion-label>{{ action }} with Phone</ion-label>
      </ion-button>
    </ion-card>
  </form>
</template>

<script lang="ts">
import firebase from "firebase/app";
import userStore from "@/stores/user.store";
import {
  IonButton,
  IonItem,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonLabel,
  IonInput,
  IonCardContent,
  IonIcon,
  IonCardSubtitle,
} from "@ionic/vue";
import { phonePortrait, logoGoogle, logoFacebook } from "ionicons/icons";

import { defineComponent, ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

import { oauthLogin, OAuthProvider, loginWithPhone } from "../services/api";
import { processLogin } from "../services/auth";

export default defineComponent({
  name: "LoginRegister",
  components: {
    IonButton,
    IonItem,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonLabel,
    IonInput,
    IonCardContent,
    IonIcon,
    IonCardSubtitle,
  },
  props: {
    action: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const router = useRouter();
    const route = useRoute();

    enum phoneStatus {
      pristine,
      numberInformed,
      recaptchaInformed,
      verificationCodeInformed,
    }

    const phone = ref({
      number: undefined as any,
      recaptcha: undefined as any,
      confirmationCode: undefined as any,
      status: phoneStatus.pristine,
    });

    onMounted(() => {
      phone.value.recaptcha = loginWithPhone.setRecaptcha(
        "recaptcha-container",
        {
          callback: () => {
            phone.value.status = phoneStatus.recaptchaInformed;
          },
        }
      );
    });

    const isPhoneRoute = computed(() => route.path.includes("phone-"));
    const whichLoginRegister = computed(() =>
      props.action === "Register" ? "register" : "login"
    );
    const opositeWhichLoginRegister = computed(() =>
      props.action !== "Register" ? "register" : "login"
    );

    const baseRoutePrefix = "/auth/";
    const phoneRoutePrefix = "phone-";

    const switchAction = () => {
      const routePrefix = isPhoneRoute.value ? phoneRoutePrefix : "";
      return router.push(routePrefix + opositeWhichLoginRegister.value);
    };

    const handlePhoneSubmits = async () => {
      if (phone.value.status === phoneStatus.pristine && !phone.value.number) {
        return router.push(
          baseRoutePrefix + phoneRoutePrefix + whichLoginRegister.value
        );
      } else if (phone.value.status < phoneStatus.numberInformed) {
        //todo: validate phone number format (or add mask to input)
        phone.value.status = phoneStatus.numberInformed;
        await loginWithPhone.attemptLogin(
          phone.value.number,
          phone.value.recaptcha
        );
      }

      if (
        phone.value.status === phoneStatus.recaptchaInformed &&
        phone.value.confirmationCode
      ) {
        const result = await loginWithPhone.confirmCode(
          phone.value.confirmationCode
        );
        phone.value.status++;
        return processLogin(result);
      }

      // only recaptcha callback may update phone login status to "recaptchaInformed"
      if (
        phone.value.status < phoneStatus.recaptchaInformed &&
        phone.value.status + 1 !== phoneStatus.recaptchaInformed
      ) {
        return phone.value.status++;
      }
    };
    const loginWithProvider = async (providerName: OAuthProvider) => {
      const result = await oauthLogin(providerName);
      if (result) {
        return processLogin(result as firebase.auth.UserCredential);
      }
    };

    return {
      phonePortrait,
      logoGoogle,
      logoFacebook,
      loginWithProvider,
      router,
      switchAction,
      isPhoneRoute,
      handlePhoneSubmits,
      phone,
      phoneStatus,
    };
  },
});
</script>

<style scoped>
.content {
  text-align: center;
  width: 95%;
  max-width: 60ch;
}
</style>
