module.exports = {
  root: true,

  env: {
    browser: true,

    node: true
  },
  globals: {
    cy: true
  },

  extends: [
    "@nuxtjs/eslint-config-typescript",
    "prettier",
    "prettier/vue",
    "plugin:prettier/recommended",
    "plugin:nuxt/recommended"
  ],

  plugins: ["prettier"],

  // add your custom rules here

  rules: {
    "prettier/prettier": [
      "error",
      {
        trailingComma: "none",
        tabWidth: 2,
        semi: true,
        singleQuote: false,
        arrowParens: "always"
      }
    ],
    "vue/no-v-html": "off",
    "vue/no-use-v-if-with-v-for": "off",
    "no-unneeded-ternary": "off",
    "no-useless-escape": "off",
    "no-console": "off",
    "comma-dangle": "off",
    "no-unused-vars": ["error", { argsIgnorePattern: "_" }],
    "no-use-before-define": ["error", { functions: false }]
  }
};
