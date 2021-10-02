<template>
  <div class="survey-container">
    <v-stepper v-model="e1">
      <img class="logo" :src="companyPicture" alt="Rideshare Guy" />
      <h1>2021 Survey From The Rideshare Guy</h1>
      <div v-if="e1 <= 1">
        <p>
          This survey is 100% anonymous and you will have the option to leave
          your e-mail at the end if you’d like to be entered into the contest to
          win one of our amazing prizes.
        </p>
        <p>
          This year, you’ll also be able to login to the rideshare or delivery
          apps you use in order to automatically provide us with additional
          data. In exchange for this, you’ll receive a custom driving report
          comparing your earnings, ratings and more to drivers nationally and in
          your area. Your information is encrypted and will not be shared with
          anyone. It is only used to help correctly fill out this survey and cut
          down on the number of questions you have to answer.
        </p>
      </div>
      <v-stepper-items v-if="sections.length">
        <v-stepper-content :step="9">
          <div v-if="e1 === 9">
            <img class="logo" :src="companyPicture" alt="Rideshare Guy" />

            <h1>2021 Survey From The Rideshare Guy</h1>
            <h2>Thank You!</h2>

            <p>
              Your survey responses have been submitted. Make sure you’re
              <a href="http://therideshareguy.com/email">
                subscribed to our e-mail list</a
              >
              to get notified when these results go live. Past year’s survey
              results are also live here on our
              <a href="https://therideshareguy.com/uber-driver-survey/">
                Uber Driver Survey</a
              >
              page.
            </p>
          </div>
        </v-stepper-content>
        <v-stepper-content :step="8">
          <div v-if="e1 === 8">
            <img class="logo" :src="companyPicture" alt="Rideshare Guy" />

            <h1>2021 Survey From The Rideshare Guy</h1>
            <h2>Link Your Gig Account Data</h2>

            <p>
              In oder for us to gather even more data from gig workers across
              the country….
            </p>

            <div class="actions">
              <button class="back-button" @click="e1 = 9">NO THANKS</button>
              <button class="next-button" @click="linkArgyleAccounts">
                LINK ACCOUNT
              </button>
            </div>
          </div>
        </v-stepper-content>

        <v-stepper-content
          v-for="(section, sectionIndex) in sections"
          :key="section.id"
          :step="sectionIndex + 1"
        >
          <h2 v-if="e1 !== 1">{{ section.title }}</h2>
          <strong class="required-mark"> * Required Question</strong>
          <section
            v-for="question in section.questions"
            :key="question.title"
            class="question"
          >
            <h3>
              {{ question.title }}
              <strong
                v-if="question.htmlJSON.props.required"
                class="required-mark"
                >*</strong
              >
            </h3>
            <p v-if="question.htmlJSON.props.label">
              {{ question.htmlJSON.props.label }}
            </p>
            <div class="alternatives">
              <v-radio-group v-model="question.checked" column>
                <span
                  v-for="(alternative, alternativesIndex) in question.htmlJSON
                    .props.alternatives"
                  :key="alternativesIndex"
                >
                  <v-radio
                    v-if="
                      question.htmlJSON.element === 'Radio' &&
                      !question.multiple
                    "
                    :value="alternative"
                    color="#CF583A"
                    :label="alternative"
                  ></v-radio>
                  <v-checkbox
                    v-if="
                      question.htmlJSON.element === 'Radio' && question.multiple
                    "
                    v-model="question.checkbox"
                    :value="alternative"
                    color="#CF583A"
                    :label="alternative"
                  ></v-checkbox>
                  <input
                    v-if="alternative === 'Other'"
                    v-model="question.answer"
                    type="text"
                    placeholder="Type out 'other' answer here"
                    @input="handleOther(question)"
                  />
                </span>
                <input
                  v-if="
                    !question.htmlJSON.props.textArea &&
                    question.htmlJSON.element === 'Input'
                  "
                  v-model="question.answer"
                  type="text"
                  placeholder="Type your answer here"
                />
                <textarea
                  v-if="
                    question.htmlJSON.props.textArea &&
                    question.htmlJSON.element === 'Input'
                  "
                  v-model="question.answer"
                  type="text"
                  placeholder="Type your answer here"
                />
              </v-radio-group>
            </div>
          </section>
          <div class="actions">
            <button v-if="e1 > 1" class="back-button" @click="previousPage">
              BACK
            </button>
            <button
              v-if="e1 <= sections.length"
              class="next-button"
              :disabled="!isSectionValid"
              @click="nextPage"
            >
              NEXT
            </button>
          </div>
        </v-stepper-content>
      </v-stepper-items>
      <div v-else>
        <v-skeleton-loader
          v-for="_ in 6"
          :key="_"
          type="list-item"
          max-width="250px"
          :tile="false"
        ></v-skeleton-loader>
      </div>
    </v-stepper>
    <v-progress-linear
      v-if="sections && sections.length && e1 < 8"
      :value="percentage"
      height="16"
      striped
      style="margin-top: 24px"
      color="#CF583A"
    >
      <template v-slot:default="{ value }">
        <strong>{{ value }}%</strong>
      </template>
    </v-progress-linear>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
// @ts-ignore
import ridesharelogo from "~/assets/logos/ridesharelogo.png";
// @ts-ignore
import companyPicture from "~/assets/logos/ridesharecomplete.png";
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
  companyName: string;
};

interface Section {
  title: string;
  id: string;
  questions: Question[];
}

interface Question {
  checkbox?: Array<String>;
  checked?: string;
  htmlJSON: {
    element: string;
    props: {
      [key: string]: any;
    };
  };
  multiple: boolean;
  title: string;
  answer?: string;
}

export default Vue.extend({
  async fetch() {
    const data = await this.$axios.$get(`/jobs/${this.surveyId}`, {
      headers: {
        origin: this.$nuxt.context?.req?.headers?.host || location.host
      }
    });

    const sections = data.formsObjs[0].pages.questionPagesObjs.map(
      (section: Section) => {
        const questions = section.questions.map((question) => {
          return { ...question, checkbox: [], checked: "" };
        });
        return {
          ...section,
          questions
        };
      }
    );
    this.sections = sections;
  },
  data() {
    return {
      percentage: 0,
      e1: 0,
      sections: [] as Section[],
      companyPicture,
      navSectionHistory: [] as Array<number>,
      danglingId: "",
      formResponseId: "",
      surveyId:
        process.env.NUXT_ENV_NODE_ENV === "dev" ||
        process.env.NUXT_ENV_NODE_ENV === "dev "
          ? "00040B8Q049K2S39NZVZSSSZ50-SurveySection" // dev
          : "0004JCNQMSWY4EAWSWH2AERGYH-Survey" // prod
    };
  },

  computed: {
    goToFinalQuestions(): boolean {
      return this.sections[0].questions[0].checked === "I'm not a driver yet";
    },
    goToSection3(): boolean {
      return this.sections[1].questions[0].checked === "Uber";
    },
    goToSection4(): boolean {
      return this.sections[1].questions[0].checked === "Lyft";
    },
    goToSection5(): boolean {
      return !this.goToSection3 && !this.goToSection4;
    },
    isSectionValid(): boolean {
      if (!this.sections[this.e1 - 1]) return false;
      return this.sections[this.e1 - 1].questions.every((question) => {
        if (question.htmlJSON.props.required) {
          return (
            question.answer || question.checked || question.checkbox?.length
          );
        }
        return true;
      });
    }
  },
  watch: {
    sections(value) {
      if (value) {
        this.$nextTick(() => (this.e1 = 1));
      }
    },
    e1(value) {
      window.scrollTo(0, 0);
      this.percentage = Math.round((100 * (value - 1)) / 6);
      this.navSectionHistory.push(value);
    }
  },

  methods: {
    async setupDanglingAndForm() {
      const danglingResponse = await this.$axios.$post(
        "/profiles/dangling-profiles"
      );
      const danglingId = danglingResponse.info.id;

      const createFormResponse = await this.$axios.$post(
        `/forms/${this.surveyId}/responses/`,
        {
          answers: [],
          profileId: danglingId
        },
        {
          headers: { Authorization: danglingId }
        }
      );

      this.formResponseId = createFormResponse.id;
      this.danglingId = danglingId;
    },
    handleOther(question: Question) {
      if (question.multiple) {
        if (question.checkbox?.includes("Other")) return;
        return question.checkbox?.push("Other");
      }
      return (question.checked = "Other");
    },
    submitForm() {
      const answers: any = [];
      this.sections.map((section) => {
        const questions = section.questions.map((question) => {
          const answer = () => {
            if (question.checkbox?.length) {
              if (question.checkbox?.includes("Other")) {
                const otherIndex = question.checkbox.indexOf("Other");
                question.checkbox?.splice(otherIndex, 1);
                if (!question.answer) return;

                question.checkbox?.push(question.answer);
              }
              return { title: question.title, answer: question.checkbox };
            }
            if (question.checked === "Other") {
              return { title: question.title, answer: question.answer };
            }
            if (question.answer) {
              return { title: question.title, answer: question.answer };
            }
            return { title: question.title, answer: question.checked };
          };

          answers.push(answer());
        });

        return {
          questions
        };
      });

      this.$axios.$patch(
        `/forms/${this.surveyId}/responses/${this.formResponseId}`,
        { answers, profileId: this.danglingId }
      );
    },
    nextPage() {
      if (this.e1 === 1) {
        this.setupDanglingAndForm().then(() => this.submitForm());
        if (this.e1 === 1 && this.goToFinalQuestions) {
          return (this.e1 = this.sections.length);
        }

        return this.e1++;
      }

      this.submitForm();

      if (this.e1 === 2 && this.goToSection3) {
        return (this.e1 = 3);
      }
      if (this.e1 === 2 && this.goToSection4) {
        return (this.e1 = 4);
      }
      if (this.e1 === 3 || this.e1 === 4) {
        return (this.e1 = 5);
      }
      if (this.e1 === 2 && this.goToSection5) {
        return (this.e1 = 5);
      }
      if (this.e1 === 7 && this.goToFinalQuestions) {
        return (this.e1 = 9);
      }
      this.e1++;
    },
    previousPage() {
      this.navSectionHistory.pop() as number;
      this.e1 = this.navSectionHistory[this.navSectionHistory.length - 1];
    },
    linkArgyleAccounts() {
      const id = this.danglingId;

      const argyleArgsObj: ArgyleArgsObj = {
        pluginKey:
          process.env.NUXT_ENV_NODE_ENV === "dev" ||
          process.env.NUXT_ENV_NODE_ENV === "dev "
            ? "a15238b2-ed6e-4f17-bb63-55cefced79c5"
            : "3577f626-b204-44d9-acc7-c92ccfd11820",
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
          "amazon_flex"
        ],
        companyName: "The Rideshare Guy",
        onClose: () => {
          this.e1 = 9;
        },
        onAccountCreated: () => {},
        onAccountConnected: async ({ accountId }) => {
          try {
            await this.$axios.post(
              "users/me/argyle/accounts",
              {
                accountId
              },
              {
                headers: { "x-dangling-profile-id": id }
              }
            );
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
            await this.$axios.post(
              "users/me/argyle",
              {
                userId,
                userToken
              },
              {
                headers: { "x-dangling-profile-id": id }
              }
            );
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
              updateToken,
              {
                headers: { "x-dangling-profile-id": id }
              }
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
    }
  },
  head() {
    return {
      title: "Rideshare Guy Survey",
      link: [
        { hid: "favicon", rel: "icon", type: "image/png", href: ridesharelogo }
      ],
      script: [{ src: "https://plugin.argyle.io/argyle.web.v1.js", body: true }]
    };
  }
});
</script>
<style lang="scss">
html {
  .app {
    background: transparent linear-gradient(221deg, #f8b593 0%, #d24f39 100%) 0%
      0% no-repeat padding-box !important;
    background-attachment: fixed;
    min-height: 100vh;
    padding: 15px 0;
  }
}
.required-mark {
  color: #cf583a;
  font-weight: normal;
}

.nuxt-progress {
  background: #d24f39;
}
.survey-container {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  max-width: 960px;
  margin: 0 auto;
  background: #fff;
  width: 100%;
  padding: 48px 96px;
  margin: 15px auto;
  box-shadow: 0px 3px 9px #00000029;
  min-height: 100vh;

  color: #2a2a2a;
  line-height: 24px;
  font-family: "Open Sans", sans-serif;

  a {
    color: #cf583a;
    text-decoration: underline;
    font-family: inherit;
  }
  .v-stepper__content {
    padding: 0;
  }
  .v-stepper {
    box-shadow: none;
    width: 100%;
  }
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  button {
    font-family: "Work Sans", sans-serif;
    line-height: 1.2;
  }
  h2 {
    color: #d24f39;
    margin-bottom: 48px;
  }
  h1 {
    margin-bottom: 48px;
  }
  h3 {
    font-size: 20px;
    font-weight: 500;
  }

  .logo {
    width: 185px;
    height: 96px;
    margin-bottom: 24px;
  }
  @media screen and (max-width: 960px) {
    min-height: 100vh;
    margin: 0 auto;
    padding: 48px 20px;
  }
  p {
    margin-bottom: 24px;
  }
  .question {
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 24px;
    margin: 48px 0;
    width: 100%;

    h3 {
      margin-bottom: 6px;
    }
    p {
      margin-bottom: 24px;
    }
    .alternatives {
      display: grid;
      span {
        margin-bottom: 26px;
        display: flex;
        align-items: center;
        .v-radio {
          margin-bottom: 0;
        }
        label {
          margin-left: 8px;
        }

        input[type="text"] {
          margin-left: 24px;
        }
        .v-input--selection-controls {
          margin-top: 0;
        }
      }
      input[type="text"],
      textarea {
        border-bottom: 1px solid #ccc;
        outline: 0;
        width: 100%;
        padding: 6px;
      }
      textarea {
        height: 150px;
        border: 1px solid #ccc;
      }
    }

    .v-messages {
      display: none;
    }
  }
  .actions {
    display: flex;
    justify-content: space-around;
    justify-items: center;
    @media screen and (max-width: 500px) {
      flex-direction: column;
    }
    .next-button,
    .back-button {
      background: #cf583a;
      border-radius: 4px;
      width: 170px;
      font-weight: bold;
      height: 48px;
      color: #fff;
      letter-spacing: 0.96px;
      outline: 0;
      @media screen and (max-width: 500px) {
        margin-bottom: 18px;
        width: 100%;
      }
    }
    .back-button {
      border: 2px solid #cf583a;
      background: #fff;
      color: #cf583a;
      @media screen and (max-width: 500px) {
        order: 1;
      }
    }

    .next-button:disabled {
      opacity: 0.7;
      cursor: auto;
    }
  }
  .gig-video {
    width: 100%;
  }
}
</style>
