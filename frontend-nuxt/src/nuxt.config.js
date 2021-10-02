const config = {
  typescript: {
    typeCheck: {
      eslint: {
        files: "./**/*.{ts,js,vue}"
      }
    }
  },
  buildDir: "nuxt",
  /*
   ** Nuxt rendering mode
   ** See https://nuxtjs.org/api/configuration-mode
   */
  /*
   ** Nuxt target
   ** See https://nuxtjs.org/api/configuration-target
   */
  target: "server",
  /*
   ** Headers of the page
   ** See https://nuxtjs.org/api/configuration-head
   */
  head: {
    title: "Deliverful",
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        hid: "description",
        name: "description",
        content: "The industry’s first dedicated hiring platform for drivers!"
      }
    ],
    script: [
      {
        src:
          "https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js",
        body: true
      }
    ],
    link: [
      {
        rel: "stylesheet",
        href:
          "https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap"
      },
      {
        rel: "stylesheet",
        href:
          "https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Quicksand:wght@300;400;500;600;700&display=swap"
      },
      {
        rel: "stylesheet",
        href:
          "https://fonts.googleapis.com/css2?family=Work+Sans:ital,wght@0,400;0,500;0,700;1,500&display=swap"
      },
      {
        rel: "stylesheet",
        href:
          "https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,400;0,700;1,400&display=swap"
      },
      { hid: "favicon", rel: "icon", type: "image/png", href: "/favicon.svg" }
    ]
  },
  /*
   ** Global CSS
   */
  css: [
    // SCSS file in the project
    "~/assets/scss/global.scss"
  ],
  styleResources: {
    scss: ["~/assets/scss/*.scss"]
  },
  /*
   ** Plugins to load before mounting the App
   ** https://nuxtjs.org/guide/plugins
   */
  plugins: [
    // .client will only be run client side on initial app load
    "~/plugins/init.client.js",
    "~/plugins/mask.js",
    { src: "~/plugins/vuex-persist", ssr: false },
    "~/plugins/axios.js",
    "~/plugins/toast.js"
  ],
  /*
   ** Auto import components
   ** See https://nuxtjs.org/api/configuration-components
   */
  components: true,
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    "@nuxtjs/style-resources",
    "@nuxt/typescript-build",
    // Doc: https://github.com/nuxt-community/stylelint-module
    "@nuxtjs/vuetify",
    "@nuxtjs/firebase",
    "@nuxtjs/composition-api",
    "@nuxtjs/date-fns",
    [
      "@nuxtjs/router",
      {
        keepDefaultRouter: true
      }
    ]
  ],
  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    "@nuxtjs/axios",
    "@nuxtjs/universal-storage",
    "@nuxtjs/gtm"
  ],
  gtm: {
    id:
      process.env.NUXT_ENV_NODE_ENV === "dev " ||
      process.env.NUXT_ENV_NODE_ENV === "dev"
        ? ""
        : "GTM-KCHKTB3",
    enabled: true
  },
  publicRuntimeConfig: {
    gtm: {
      id:
        process.env.NUXT_ENV_NODE_ENV === "dev " ||
        process.env.NUXT_ENV_NODE_ENV === "dev"
          ? ""
          : "GTM-KCHKTB3"
    }
  },
  storage: {
    vuex: true,
    cookie: {
      prefix: "",
      options: {
        path: "/"
      }
    },
    localStorage: {
      prefix: ""
    },
    ignoreExceptions: false
  },
  firebase: {
    lazy: false,
    // eslint-disable-next-line no-constant-condition
    config:
      process.env.NUXT_ENV_NODE_ENV === "dev" ||
      process.env.NUXT_ENV_NODE_ENV === "dev "
        ? {
            apiKey: "AIzaSyDuO84hhnaaLOOb8qMvg5E-K7unq6ywMPU",
            authDomain: "deliverful-dev.firebaseapp.com",
            databaseURL: "https://deliverful-dev.firebaseio.com",
            projectId: "deliverful-dev",
            storageBucket: "deliverful-dev.appspot.com",
            messagingSenderId: "1004563766962",
            appId: "1:1004563766962:web:ab822211f768e744a033ab",
            measurementId: "G-LCY3DFZ4WM"
          }
        : {
            apiKey: "AIzaSyDg2hzUvpV3h6KYrbpDsoD-I9HoRrwG414",
            authDomain: "deliverful-prod.firebaseapp.com",
            databaseURL: "https://deliverful-prod-default-rtdb.firebaseio.com",
            projectId: "deliverful-prod",
            storageBucket: "deliverful-prod.appspot.com",
            messagingSenderId: "1023681768474",
            appId: "1:1023681768474:web:86c83cd86d10ce8ed4f5a3",
            measurementId: "G-742HEZBECY"
          },
    onFirebaseHosting: false,
    services: {
      auth: true,
      storage: true,
      analytics: true
    }
  },
  /*
   ** Axios module configuration
   ** See https://axios.nuxtjs.org/options
   */
  axios: {
    // See https://github.com/nuxt-community/axios-module#options
    browserBaseURL:
      process.env.NUXT_ENV_NODE_ENV === "dev" ||
      process.env.NUXT_ENV_NODE_ENV === "dev "
        ? "https://dev.api.deliverful.co/"
        : "https://deliverful-prod.web.app",
    baseUrl:
      process.env.NUXT_ENV_NODE_ENV === "dev" ||
      process.env.NUXT_ENV_NODE_ENV === "dev "
        ? "https://dev.api.deliverful.co/"
        : "https://deliverful-prod.web.app"
  },
  loading: {
    continuous: true,
    height: "5px",
    color: "#33cc99"
  },
  /*
   ** vuetify module configuration
   ** https://github.com/nuxt-community/vuetify-module
   */
  vuetify: {
    optionsPath: "./vuetify.options.js",
    customVariables: ["~/assets/scss/variables.scss"],
    treeShake: true
  },
  /*
   ** Build configuration
   ** See https://nuxtjs.org/api/configuration-build/
   */
  build: {
    // @ts-ignore
    // eslint-disable-next-line
    extend(config, { isDev, isClient, isServer }) {
      if (isServer) {
        config.externals = {
          "@firebase/app": "commonjs @firebase/app",
          "@firebase/firestore": "commonjs @firebase/firestore"
          // etc...
        };
      }
    },
    splitChunks: {
      layouts: true
    }
  }
};

export default config;
