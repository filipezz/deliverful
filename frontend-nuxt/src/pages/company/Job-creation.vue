<template>
  <div class="company-container">
    <Loading v-if="loading" />
    <div class="steps">
      <v-stepper v-model="e1">
        <v-stepper-header>
          <v-stepper-step color="secondary" :complete="e1 > 1" step="1">
          </v-stepper-step>

          <v-divider
            class="divider"
            :style="{
              borderColor: e1 >= 2 ? '#0099ff' : '#ccc',
              background: e1 >= 2 ? '#0099ff' : '#ccc'
            }"
          >
          </v-divider>

          <v-stepper-step color="secondary" :complete="e1 > 2" step="2">
          </v-stepper-step>

          <v-divider
            :style="{
              borderColor: e1 >= 3 ? '#0099ff' : '#ccc',
              background: e1 >= 3 ? '#0099ff' : '#ccc'
            }"
            class="divider"
          ></v-divider>

          <v-stepper-step color="secondary" step="3"> </v-stepper-step>
        </v-stepper-header>

        <v-stepper-items>
          <v-stepper-content step="1">
            <Title size="h1">Details</Title>

            <v-form v-model="valid" data-app="true">
              <Title class="form-title" size="h3" color="color-secondary"
                >Basic Info</Title
              >
              <div data-app="true" class="form-grid">
                <Input
                  v-model="title"
                  :rules="[rule]"
                  placeholder="Deliverful"
                  label="Job Title"
                ></Input>
                <Select
                  v-model="jobType"
                  :rules="[rule]"
                  class="jobtype-select"
                  placeholder="Contract"
                  label="Job Type"
                  :items="jobTypes"
                />
              </div>
              <Title class="form-title" size="h3" color="color-secondary"
                >Address</Title
              >
              <div class="form-grid">
                <Input
                  v-model="location.line1"
                  :rules="[rule]"
                  placeholder="111 Ocean Drive"
                  label="Line 1"
                ></Input>
                <Input
                  v-model="location.line2"
                  :rules="[rule]"
                  placeholder="Apt 3"
                  label="Line 2"
                ></Input>
                <Input
                  v-model="location.city"
                  :rules="[rule]"
                  placeholder="Los Angeles"
                  label="City"
                ></Input>
                <Input
                  v-model="location.postalCode"
                  :rules="[rule]"
                  type="number"
                  placeholder="83202"
                  label="Postal Code"
                ></Input>
                <Select
                  v-model="location.state"
                  :rules="[rule]"
                  placeholder="State"
                  label="State"
                  :items="states"
                />
              </div>
              <Title class="form-title" size="h3" color="color-secondary"
                >Compensation (per Hour)</Title
              >
              <div class="form-grid">
                <Input
                  v-model="compensation.low"
                  type="number"
                  :rules="[rule]"
                  placeholder="16.00"
                  label="Low Range"
                >
                  <CurrencyDollarIcon color="#0099ff" />
                </Input>
                <Input
                  v-model="compensation.high"
                  type="number"
                  :rules="[rule]"
                  placeholder="24.00"
                  label="High Range"
                >
                  <CurrencyDollarIcon color="#0099ff" />
                </Input>
              </div>
            </v-form>
            <div class="actions">
              <Button type="white"> Cancel </Button>
              <Button :disabled="!valid" type="primary" @click.native="e1 = 2">
                Next
              </Button>
            </div>
          </v-stepper-content>

          <v-stepper-content step="2">
            <Title size="h1">Description</Title>
            <p>
              Please summarize the job duties and explain what the drivers will
              expect. You can also copy and paste your existing job description.
            </p>
            <RichText @value="html = $event" />

            <div class="actions">
              <Button type="white" @click.native="e1 = 1"> Back </Button>
              <Button :disabled="!html" type="primary" @click.native="e1 = 3">
                Next
              </Button>
            </div>
          </v-stepper-content>

          <v-stepper-content step="3">
            <Title size="h1">Requirements</Title>
            <p class="requirements-text">
              We allow companies to create a custom set of questions for
              candidates to answer. Make sure to mark a question as a
              dealbreaker if you want to disqualify candidates that don’t answer
              it correctly.
            </p>

            <div
              v-for="(section, sectionIndex) in sections"
              :key="section.title"
              class="question-section"
            >
              <v-chip class="chip" label>
                Section {{ sectionIndex + 1 }}
              </v-chip>
              <div
                v-for="(question, questionIndex) in section.questions"
                :key="questionIndex"
                class="question-container"
              >
                <div class="question-header">
                  <div>
                    <strong>Question {{ questionIndex + 1 }}: </strong>
                    <Select
                      v-model="question.questionType"
                      class="question-select"
                      placeholder="Question"
                      :value="questionTypes"
                      :items="Object.keys(questionTypes)"
                    />
                  </div>
                  <div>
                    <button
                      class="remove-opt-btn"
                      @click="removeQuestion(questionIndex, sectionIndex)"
                    >
                      <XIcon size="48" color="#CCCCCC" />
                    </button>
                  </div>
                </div>

                <div v-if="question.questionType" class="question-description">
                  <div class="required-checkbox">
                    <p>Required?</p>
                    <v-checkbox
                      v-model="question.required"
                      color="primary"
                    ></v-checkbox>
                  </div>
                  <Input
                    v-model="question.title"
                    placeholder="Write out your question here"
                  ></Input>
                  <Input
                    v-model="question.label"
                    placeholder="Add a description or example here"
                  ></Input>
                  <div
                    v-if="question.questionType === 'Short Answer'"
                    class="input-preview"
                  >
                    <h3>
                      {{ question.title }}
                      {{ question.required && question.title ? "*" : "" }}
                    </h3>
                    <input
                      type="text"
                      readonly
                      placeholder="The answer will be typed here"
                    />
                  </div>
                  <div
                    v-if="question.questionType === 'Long Answer'"
                    class="input-preview"
                  >
                    <h3>
                      {{ question.title }}
                      {{ question.required && question.title ? "*" : "" }}
                    </h3>
                    <textarea
                      type="text"
                      readonly
                      placeholder="The answer will be typed here"
                    />
                  </div>
                  <div
                    v-for="(option, optionIndex) in question.options"
                    v-if="
                      question.questionType === 'Multiple Choices' ||
                      question.questionType === 'Checkbox'
                    "
                    :key="optionIndex"
                    class="option"
                  >
                    <v-checkbox
                      v-if="question.questionType === 'Checkbox'"
                    ></v-checkbox>
                    <v-radio
                      v-if="question.questionType === 'Multiple Choices'"
                    ></v-radio>
                    <Input
                      v-model="option.value"
                      :placeholder="`Option ${optionIndex + 1}`"
                    ></Input>

                    <button
                      class="remove-opt-btn"
                      @click="
                        removeOption(optionIndex, questionIndex, sectionIndex)
                      "
                    >
                      <XIcon color="#CCCCCC" />
                    </button>
                  </div>
                  <button
                    v-if="
                      question.questionType === 'Multiple Choices' ||
                      question.questionType === 'Checkbox'
                    "
                    class="add-option-btn"
                    @click="addOption(question)"
                  >
                    <PlusIcon color="#33cc99;" />add option
                  </button>
                </div>
              </div>

              <Button
                type="white"
                class="add-question-button"
                @click.native="addQuestion(sectionIndex)"
              >
                <PlusIcon color="#33CC99" /> add question
              </Button>
            </div>
            <Button
              type="white"
              class="add-question-button"
              @click.native="addSection"
            >
              <PlusIcon color="#33CC99" /> add section
            </Button>
            <div class="actions">
              <Button type="white" @click.native="e1 = 2"> Back </Button>

              <v-dialog transition="dialog-bottom-transition" max-width="864">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn color="primary" v-bind="attrs" v-on="on">Submit</v-btn>
                </template>
                <template v-slot:default="dialog">
                  <div class="dialog-container">
                    <EmojiHappyIcon size="58" color="#0099ff"></EmojiHappyIcon>

                    <Title size="h2">Congrats!</Title>
                    <p>
                      Your job is currently under review. When it has been
                      approved it will be posted on Deliverful’s job board and
                      all across the internet. Don’t forget to check back on
                      your company dashboard to view candidates and contact
                      them.
                    </p>

                    <!--                     <span>
                      www.app.deliverful.co/jobs/forms/GhKL1209941=0212
                    </span>
                    <button class="copy-button">
                      Click to copy the job listing's link
                      <ClipboardIcon size="18" color="#33CC99" />
                    </button> -->
                    <div class="dialog-actions">
                      <!--                       <Button type="white">Preview job</Button> -->
                      <Button type="primary" @click.native="submit(dialog)"
                        >Done</Button
                      >
                    </div>
                  </div>
                </template>
              </v-dialog>
            </div>
          </v-stepper-content>
        </v-stepper-items>
      </v-stepper>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

import {
  CurrencyDollarIcon,
  PlusIcon,
  XIcon,
  EmojiHappyIcon
  // @ts-ignore
} from "@vue-hero-icons/solid";
import states from "~/utils/states";
import Title from "~/components/Title.vue";
import Input from "~/components/Input.vue";
import Button from "~/components/Button.vue";
import Select from "~/components/Select.vue";
import RichText from "~/components/RichText.vue";
import Loading from "~/components/Loading.vue";
import { requiredRule } from "~/utils/rules";

interface Question {
  questionType:
    | "Multiple Choices"
    | "Checkbox"
    | "Long Answer"
    | "Short Answer"
    | "";
  title: string;
  label: string;
  options: OptionDTO;
  required: Boolean;
}
type Section = {
  title: number;
  questions: Question[];
};
type OptionDTO = {
  value: string;
}[];

export default Vue.extend({
  components: {
    Title,
    Input,
    CurrencyDollarIcon,
    Button,
    Select,
    RichText,
    PlusIcon,
    XIcon,
    Loading,
    EmojiHappyIcon
  },
  data() {
    return {
      loading: false,
      e1: 1,
      jobTypes: ["contract", "full-time", "part-time"],
      jobType: "",
      states,
      state: null,
      valid: false,
      title: "",
      rule: requiredRule(),
      html: "",
      location: {
        city: "",
        line1: "",
        line2: "",
        state: "",
        postalCode: ""
      },
      compensation: {
        low: "",
        high: ""
      },
      questionTypes: {
        "Multiple Choices": "Radio",
        Checkbox: "Radio",
        "Long Answer": "Input",
        "Short Answer": "Input"
      },
      sections: [
        {
          title: 1,
          questions: [
            {
              questionType: "Multiple Choices",
              title: "",
              label: "",
              options: [],
              required: true
            }
          ]
        }
      ] as Section[],
      jobId: ""
    };
  },
  computed: {
    /*   jobCreationIsValid(): Boolean {
      return !!this.html && this.valid && !!this.questions.length;
    } */
  },
  methods: {
    addOption(question: Question) {
      question.options.push({
        value: ``
      });
    },
    addQuestion(sectionIndex: number) {
      this.sections[sectionIndex].questions.push({
        questionType: "Multiple Choices",
        title: "",
        label: "",
        options: [{ value: "" }],
        required: true
      });
    },
    addSection() {
      this.sections.push({ title: this.sections.length + 1, questions: [] });
    },
    removeOption(
      optionIndex: number,
      questionIndex: number,
      sectionIndex: number
    ) {
      this.sections[sectionIndex].questions[questionIndex].options.splice(
        optionIndex,
        1
      );
    },
    removeQuestion(index: number, sectionIndex: number) {
      this.sections[sectionIndex].questions.splice(index, 1);
    },
    async submit(dialog: any) {
      this.loading = true;
      try {
        const token = this.$store.getters.getUserToken;
        const companyId = this.$store.getters.getCompanyId;

        const response = await this.$axios.$post(
          `/companies/${companyId}/jobs`,
          {
            title: this.title,
            location: this.location,
            type: this.jobType,
            compensation: this.compensation,
            descriptionHTML: this.html
          },
          {
            headers: {
              Authorization: token
            }
          }
        );
        const { id } = response;
        this.jobId = id;
        const pages = this.sections.map((section) => {
          const questions = section.questions.map((question) => {
            return {
              htmlJSON: {
                // @ts-ignore
                element: this.questionTypes[question.questionType],
                props: {
                  title: question.title,
                  alternatives: question.options.map((option) => option.value),
                  multiple:
                    question.questionType === "Multiple Choices" ? false : true,
                  textArea:
                    question.questionType === "Long Answer" ? true : false,
                  placeholder: "Write your answer here",
                  required: question.required,
                  label: question.label
                }
              }
            };
          });
          return {
            title: section.title,
            questions
          };
        });

        this.$axios
          .$post(
            `/jobs/${id}/forms`,
            {
              title: "Requirements",
              pages: {
                questionPagesIds: pages,
                reviewPagesIds: []
              }
            },
            {
              headers: { Authorization: token }
            }
          )
          .then(() => {
            this.$router.push("/company/dashboard");
          });
      } catch (error) {
        this.loading = false;
        this.$toast.showMessage({
          content: error.response.data.error.message,
          timeout: 5000,
          color: "red"
        });
        /*         this.$router.push("/signin");
         */
      }
      dialog.value = false;
      this.loading = false;
    }
  }
});
</script>

<style lang="scss">
.company-container {
  display: flex;
  flex: 1;
  justify-content: space-between;
  align-items: center;
  flex-direction: column;
  background: #fff;
  max-width: 960px;
  border-radius: 4px;
  padding: 48px 96px;
  margin: 24px auto;
  @media screen and (max-width: 810px) {
    padding: 48px;
  }
  @media screen and (max-width: 422px) {
    padding: 18px;
  }

  .v-btn:not(.v-btn--round).v-size--default {
    height: 50px;
  }

  .steps {
    width: 100%;

    .v-stepper {
      box-shadow: none;

      .v-stepper__header {
        box-shadow: none;

        .v-stepper__step--inactive {
          span {
            background: #fff !important;
            color: #ccc;
            border: 1px solid #ccc;
            font-weight: bold;
          }
        }
        .v-stepper__step {
          padding: 24px 0;
          span {
            background: $secondary;
            font-weight: bold;
          }
        }
        .divider {
          border: 3px solid #cccccc;
          background: #ccc;
          border-radius: 15px;
          transition: 0.3s ease-out;
        }
      }

      .v-stepper__content {
        padding: 0;
      }
    }
  }

  h1 {
    margin-bottom: 24px;
    text-align: center;
  }

  .requirements-text {
    padding: 0 20px;
  }

  .question-container {
    margin-top: 48px;
    display: flex;
    flex-direction: column;

    .question-header {
      display: flex;
      justify-content: space-between;
      @media screen and (max-width: 545px) {
        flex-direction: column;
      }

      > div {
        display: flex;
        align-items: center;
        margin: 0 8px;
        @media screen and (max-width: 545px) {
          flex-direction: column;
          margin: 0;

          .select-container {
            width: 100%;
            max-width: unset;
          }

          &:nth-child(1) {
            order: 2;
          }
          &:nth-child(2) {
            order: 1;
          }
        }

        strong {
          font-size: 20px;
          margin-right: 24px;
          font-family: $primary-font;
          @media screen and (max-width: 545px) {
            margin: 0 0 16px;
          }
        }

        span {
          font-size: 20px;
          margin-right: 24px;
          font-family: $primary-font;
        }
      }
      .remove-option-btn {
        border-radius: 50%;
      }
      .remove-opt-btn {
        outline: 0;
        svg {
          transition: 0.2s ease-in-out;
        }
        &:hover {
          svg {
            fill: red;
          }
        }
      }
    }

    .question-description {
      margin-top: 24px;
      border: 1px solid #cccccc;
      padding: 25px;
      @media screen and (max-width: 545px) {
        padding: 15px;
      }

      .required-checkbox {
        display: flex;
        align-items: flex-start;
        p {
          margin-right: 5px;
        }
        .v-input {
          margin: 0;
          padding: 0;
        }
      }
      .add-option-btn {
        margin-top: 24px;
        display: flex;
        align-items: center;
        text-transform: uppercase;
        color: #33cc99;
        font-weight: bold;
      }

      input:nth-child(2) {
        border-top: 0;
        border-left: 0;
        border-radius: 0;
        border-right: 0;
        border-bottom: 3px solid #ccc;
        box-shadow: none;
        outline: 0;
      }
      .option {
        display: flex;
        align-items: center;
        max-width: 160px;
        margin-top: 26px;

        button {
          margin-left: 16px;
        }

        .remove-opt-btn {
          outline: 0;
          svg {
            transition: 0.2s ease-in-out;
          }
          &:hover {
            svg {
              fill: red;
            }
          }
        }
      }
      .input-preview {
        margin-top: 36px;
        h3 {
          font-size: 24px;
        }
        input,
        textarea {
          border-bottom: 1px solid #ccc;
          padding: 8px;
          outline: 0;
          width: 100%;
          margin-top: 12px;

          &::placeholder {
            color: #7f7f7f;
            font-style: italic;
            font-size: 12px;
          }
        }
        textarea {
          height: 100px;
          border: 1px solid #ccc;
        }
      }
    }

    .question-select {
      max-width: 230px;
    }
  }
  .question-section {
    background: #f8f8f8;
    padding: 16px;
    position: relative;
    margin-bottom: 58px;
    @media screen and (max-width: 360px) {
      padding: 4px;
    }
    .chip {
      position: absolute;
      top: -40px;
      left: -3px;
      background: $primary;
      color: $white;
      font-weight: bold;
    }
  }
  .add-question-button {
    margin: 48px auto;
    background: $white;
    color: $primary;

    @media screen and (max-width: 620px) {
      min-width: 0;
    }
    > div {
      display: flex;
      align-items: center;
    }
  }

  .form-grid {
    grid-template-columns: 1fr 1fr;
    display: grid;
    grid-gap: 0px 48px;
    width: 100%;
    margin-bottom: 48px;

    @media screen and (max-width: 768px) {
      display: block;
    }

    .jobtype-select {
      text-transform: capitalize;
    }
  }

  .form-title {
    margin-bottom: 24px;
  }
  .actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 0 48px;
    margin: 24px 0;
    @media screen and (max-width: 768px) {
      grid-template-columns: 1fr;
      grid-gap: 48px 0;

      button:nth-child(1) {
        order: 2;
      }
      button:nth-child(2) {
        order: 1;
      }
    }
  }

  .v-stepper__wrapper {
    p {
      font-size: 18px;
    }
    > p {
      margin-bottom: 58px;
    }
  }
}

.v-dialog {
  margin: 10px !important;
}

.dialog-container {
  background: #fff;
  display: flex;
  flex-direction: column;
  flex: 1;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 48px;

  @media screen and (max-width: 480px) {
    padding: 20px;
  }

  h2 {
    margin-bottom: 48px;
  }

  p {
    text-align: center;
    font-size: 18px;
    margin-bottom: 48px;
  }

  span {
    width: 100%;
    border: 1px solid #ccc;
    background: #fff;
    color: $dark-blue;
    text-align: center;
    padding: 13px;
    margin-bottom: 37px;
    border-radius: 4px;
    word-break: break-all;

    @media screen and (max-width: 480px) {
      margin-bottom: 20px;
    }
  }

  .copy-button {
    display: flex;
    align-items: center;
    color: #33cc99;
    font-size: 16px;
    text-decoration: underline;
    margin-bottom: 48px;

    > svg {
      margin-left: 5px;
    }
    @media screen and (max-width: 480px) {
      margin-bottom: 20px;
      > svg {
        display: none;
      }
    }
  }

  .dialog-actions {
    display: flex;
    width: 100%;

    /*     button:first-child {
      margin-right: 48px;

      @media screen and (max-width: 480px) {
        margin-right: 15px;
      }
    } */

    button {
      flex: 1;
    }
  }
}
</style>
