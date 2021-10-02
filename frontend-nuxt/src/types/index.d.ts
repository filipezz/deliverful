import { NuxtStorage } from "@nuxtjs/universal-storage";

interface Toast {
  showMessage(showMessage: showMessage): void;
}

interface showMessage {
  color?: string;
  content?: string;
  timeout?: number;
}

declare module "vue/types/vue" {
  interface Vue {
    _uid: number;
    $storage: NuxtStorage;
    $toast: Toast;
  }
}

// Nuxt 2.9+
declare module "@nuxt/types" {
  interface Context {
    $storage: NuxtStorage;
  }
  interface NuxtAppOptions {
    $storage: NuxtStorage;
  }
}
declare module "vuex/types/index" {
  // this.$myInjectedFunction inside Vuex stores
  interface Store<S> {
    $storage: NuxtStorage;
  }
}
