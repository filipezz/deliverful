<template>
  <v-form class="requirementform-container">
    <Loading v-if="loading" />
    <component
      :is="question.htmlJSON.element"
      v-for="question in form.questions"
      :key="question.title"
      v-model="question.answer"
      v-bind="question.htmlJSON.props"
    >
    </component>

    <Button
      :disabled="!isQuestionaireValid"
      type="primary"
      class="requirements-submit"
      @click.native.prevent="submit"
      >SUBMIT</Button
    >
  </v-form>
</template>

<script lang="ts">
import Vue from "vue";
import Title from "~/components/Title.vue";
import Button from "~/components/Button.vue";
import Radio from "~/components/Radio.vue";
import Loading from "~/components/Loading.vue";
import Input from "~/components/Input.vue";

export default Vue.extend({
  components: {
    Title,
    Button,
    Radio,
    Loading,
    Input
  },
  data() {
    return {
      loading: false
    };
  },
  computed: {
    isQuestionaireValid(): boolean {
      const allRequiredQuestions = this.form.questions.filter(
        (question: any) => question.htmlJSON.props.required
      );
      return allRequiredQuestions.every(
        (question: any) => question.answer && question.answer.length
      );
    },
    form(): any {
      return this.$store.getters.getRequirementForm;
    }
  },
  methods: {
    async submit() {
      this.loading = true;
      const {
        email,
        name,
        phone,
        birthDate
      } = this.$store.getters.getPersonalInformation;
      const address = this.$store.getters.getAddressInformation;
      const driverLicense = this.$store.getters.getDriverLicense;
      const availability = this.$store.getters.getAvailabilityData;
      const driverResume = this.$store.getters.getDriverResume;

      const profile = {
        info: {
          name,
          email,
          phone,
          birthDate,
          address,
          resumeUrl: driverResume.url
        },
        driver: {
          license: {
            number: driverLicense.number,
            issuedDate: driverLicense.issuedDate,
            expirationDate: driverLicense.expirationDate,
            frontFileUrl: driverLicense.frontFileUrl,
            backFileUrl: driverLicense.backFileUrl
          }
        },
        workPreferences: {
          availability
        }
      };

      try {
        const response = await this.$axios.post(
          "/profiles/dangling-profiles",
          profile
        );
        const profileId = response.data.driver.id;

        await this.$axios.post(`/forms/${this.form.id}/responses`, {
          profileId,
          answers: this.form.questions
        });
        this.$store.dispatch("setDanglingProfileId", profileId);

        const queryStrings = Object.entries(
          this.$store.getters.getSourceQueryStrings
        );
        const queryStringsFormatted = queryStrings.map((query) =>
          query.join("=")
        );
        const joinedQueryStrings = queryStringsFormatted.join("&");

        this.$router.push(`/thank-you/?${joinedQueryStrings}`);
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
.requirementform-container {
  margin-top: 36px;
  width: 100%;

  > div {
    margin-bottom: 24px;
  }
  h2 {
    font-family: $primary-font;
    font-weight: 600;
    margin-bottom: 16px;
    font-size: 20px;
  }

  .requirementform-buttons {
    margin-top: 16px;
    display: grid;
    width: 100%;

    .active-btn {
      border-color: $secondary !important;
      background: $secondary !important;
      color: $base !important;
    }

    > .v-btn {
      border-radius: 4px;
      box-shadow: 0px 3px 6px #00000029;
    }

    button {
      color: $secondary;
      flex: 1;
      background: 0;
      border: 2px solid $secondary;
      border-color: $secondary;
      border-radius: 4px;
      font-weight: bold;
      font-family: $primary-font;
      font-size: 14px;
      margin-bottom: 23px;
      box-shadow: 0px 3px 6px #00000029;
    }
  }
  .requirements-submit {
    width: 100%;
    margin-top: 12px;
  }
}
</style>
