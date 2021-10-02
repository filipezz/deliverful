<template>
  <div class="personalform-container">
    <div class="basic-info-header">
      <InformationCircleIcon class="info-icon" size="60" />
      <Title size="h1"> Basic Information </Title>
      <Title size="h4"
        >Some information may be autofilled from your gig accounts, please make
        sure everything is correct.</Title
      >
    </div>
    <Title class="form-title" size="h3" color="color-secondary"
      >Personal Information</Title
    >

    <v-form v-model="isPersonalInformationDataValid" class="form-grid">
      <Input
        v-for="(personalInfo, index) in personalInformationData"
        v-if="personalInfo.type !== 'date'"
        :key="index"
        v-model="personalInfo.value"
        :type="personalInfo.type"
        class="input-form"
        :rules="personalInfo.rule"
        :label="index"
        :mask="personalInfo.mask ? personalInfo.mask : ''"
        :placeholder="index"
      />
      <Input
        v-for="(personalInfo, index) in personalInformationData"
        v-if="personalInfo.type === 'date'"
        :key="index"
        v-model="personalInfo.value"
        :type="personalInfo.type"
        :rules="personalInfo.rule"
        :label="index"
        :mask="personalInfo.mask ? personalInfo.mask : ''"
        :placeholder="index"
      />
    </v-form>

    <Title class="form-title" size="h3" color="color-secondary">
      Address
    </Title>

    <v-form
      v-model="isAddressInformationDataValid"
      class="form-grid"
      data-app="true"
    >
      <Input
        v-for="(addressInfo, index) in addressInformationData"
        v-if="addressInfo.inputType === 'input'"
        :key="index"
        v-model="addressInfo.value"
        :rules="addressInfo.rule"
        class="input-form"
        :type="addressInfo.type"
        :label="index"
        :placeholder="index"
      />
      <div>
        <label class="select-label">State</label>
        <v-select
          v-for="(addressInfo, index) in addressInformationData"
          v-if="addressInfo.inputType === 'dropdown'"
          :key="index"
          v-model="addressInfo.value"
          placeholder="State"
          :items="states"
          solo
        ></v-select>
      </div>
    </v-form>

    <Title class="form-title" size="h3" color="color-secondary">
      When are you available to work?
    </Title>

    <v-form v-model="isAvailabilityDataValid">
      <div
        v-for="(availability, index) in availabilityData"
        :key="index"
        class="select-container"
      >
        <div>
          <label class="select-label">Day of the Week:</label>
          <v-select
            v-model="availability.weekDay"
            :rules="availability.rule"
            placeholder="Select"
            class="form-select"
            :items="weekDays"
            solo
          ></v-select>
        </div>
        <Input
          v-model="availability.startTime"
          label="Start-time:"
          :rules="availability.rule"
          placeholder="Select"
          type="time"
          solo
        ></Input>

        <Input
          v-model="availability.endTime"
          label="End-time:"
          :rules="availability.rule"
          placeholder="Select"
          type="time"
          solo
        ></Input>
      </div>
      <Button type="outline" @click.prevent.native="addMoreAvailability"
        >Add More Availability</Button
      >
      <Button
        v-if="availabilityData.length > 1"
        type="outline"
        @click.prevent.native="removeAvailability"
        >Remove Availability</Button
      >
    </v-form>
    <Button
      :disabled="!isFormValid"
      class="personalinfo-next-button"
      type="primary"
      @click.native="goToUploadDocuments"
      >next</Button
    >
  </div>
</template>

<script lang="ts">
import Vue from "vue";
// @ts-ignore
import { InformationCircleIcon } from "@vue-hero-icons/solid";
import { requiredRule, validEmail } from "../utils/rules";
import states from "../utils/states";
import Input from "./Input.vue";
import Button from "./Button.vue";
import Title from "./Title.vue";

export default Vue.extend({
  components: {
    Input,
    Title,
    Button,
    InformationCircleIcon
  },

  data() {
    return {
      states,
      weekDays: [
        "Weekdays",
        "Weekends",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      availabilityData: [
        {
          weekDay: undefined,
          startTime: undefined,
          endTime: undefined,
          rule: [requiredRule()]
        }
      ],
      personalInformationData: {
        "first name": {
          value: "",
          rule: [requiredRule()],
          mask: "",
          inputType: "input",
          type: "text"
        },
        "last name": {
          value: "",
          rule: [requiredRule()],
          mask: "",
          inputType: "input",
          type: "text"
        },
        email: {
          value: this.$store.getters.getLoggedUser?.info?.email ?? null,
          rule: [validEmail(), requiredRule()],
          mask: "",
          inputType: "input",
          type: "text"
        },
        "phone number": {
          value: "",

          rule: [requiredRule()],
          mask: "+1 ###-###-####",
          inputType: "input",
          type: "text"
        },
        birthdate: {
          value: "",
          mask: "",
          rule: [requiredRule()],
          type: "date"
        }
      },
      addressInformationData: {
        "line 1": {
          value:
            this.$store.getters.getLoggedUser?.info?.address?.line1 ?? null,
          rule: [requiredRule()],
          inputType: "input",
          type: "text",
          mask: ""
        },
        "line 2": {
          rule: [],
          value:
            this.$store.getters.getLoggedUser?.info?.address?.line2 ?? null,
          inputType: "input",
          type: "text",
          mask: ""
        },
        city: {
          value: this.$store.getters.getLoggedUser?.info?.address?.city ?? null,
          rule: [requiredRule()],
          inputType: "input",
          type: "text",
          mask: ""
        },
        state: {
          value:
            this.$store.getters.getLoggedUser?.info?.address?.state ?? null,
          rule: [requiredRule()],
          inputType: "dropdown",
          type: "text",
          mask: ""
        },
        "postal code": {
          value:
            this.$store.getters.getLoggedUser?.info?.address?.postalCode ??
            null,
          rule: [requiredRule()],
          inputType: "input",
          type: "text",
          mask: ""
        }
      },

      isPersonalInformationDataValid: false,
      isAddressInformationDataValid: false,
      isAvailabilityDataValid: false,
      isDriverLicenseDataValid: false
    };
  },
  computed: {
    isFormValid(): boolean {
      return (
        this.isPersonalInformationDataValid &&
        this.isAddressInformationDataValid &&
        this.isAvailabilityDataValid
      );
    }
  },
  mounted() {
    const fullName = this.$store.getters.getLoggedUser?.info?.name;
    const [firstName, ...lastNames] = fullName ? fullName.split(" ") : [];
    const lastName = lastNames.join(" ");

    /*     const issuedDate = this.$store.getters.getLoggedUser?.driver?.license
      ?.issuedDate;
    const expirationDate = this.$store.getters.getLoggedUser?.driver?.license
      ?.expirationDate;

    const formattedIssuedDate = issuedDate
      ? this.$dateFns.format(issuedDate, "yyyy-MM-dd")
      : "";
    const formattedExpirationDate = expirationDate
      ? this.$dateFns.format(expirationDate, "yyyy-MM-dd")
      : ""; */

    this.personalInformationData["first name"].value = firstName;
    this.personalInformationData["last name"].value = lastName;
    /*     this.driverLicenseData["Issued Date"].value = formattedIssuedDate;
    this.driverLicenseData["Expiration Date"].value = formattedExpirationDate; */
  },
  methods: {
    goToUploadDocuments() {
      this.$store.commit("saveBasicInfo", {
        personalInformationData: this.personalInformationData,
        addressInformationData: this.addressInformationData,
        availabilityData: this.availabilityData
      });
      this.$router.push(`/${this.$route.params.job_id}/form/upload-documents`);
    },

    removeAvailability() {
      this.availabilityData.pop();
    },
    addMoreAvailability() {
      this.availabilityData.push({
        endTime: undefined,
        startTime: undefined,
        weekDay: undefined,
        rule: [requiredRule()]
      });
    }
  }
});
</script>

<style lang="scss">
input[type="date"]::-webkit-calendar-picker-indicator {
  background: transparent;
  bottom: 0;
  color: transparent;
  cursor: pointer;
  height: auto;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  width: auto;
}

input[type="time"]::-webkit-calendar-picker-indicator {
  background: transparent;
  bottom: 0;
  color: transparent;
  cursor: pointer;
  height: auto;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  width: auto;
}

.personalform-container {
  .basic-info-header {
    display: flex;
    flex-direction: column;
    align-items: center;

    .info-icon {
      color: $secondary;
    }

    h4 {
      margin-top: 16px;
      text-align: center;
      font-family: $secondary-font;
      color: $dark-blue;
      font-weight: normal;
    }
  }

  .form-grid {
    grid-template-columns: auto auto;
    display: grid;
    grid-gap: 24px 48px;

    @media screen and (max-width: 768px) {
      display: block;
    }
  }

  .form-title {
    margin-top: 36px;
    margin-bottom: 24px;

    @media screen and (min-width: 768px) {
      margin-bottom: 48px;
    }
  }
  form {
    .avaiability-container {
      display: flex;
      flex: 1;
      flex-wrap: wrap;
      justify-content: space-between;
      margin-bottom: 24px;

      > div {
        flex: 1;
        margin-right: 15px;

        &:last-child {
          margin-right: 0;
        }
      }
    }

    .input-form {
      flex: 1;
    }

    label {
      color: $dark-gray;
      font-family: $secondary-font;
      font-size: 12px;
      font-style: italic;
      text-transform: capitalize;
    }

    .v-input__slot {
      height: 56px;
      background: $white;
      border: 1px solid $light-gray;
      border-radius: 4px;
      padding: 20px 16px;
      color: $dark-blue;
      font-family: $secondary-font;
      outline-color: $secondary;
      box-shadow: 0px 3px 6px rgb(0 0 0 / 16%) !important;
      margin-bottom: 10px;
    }
    .availability-inputs {
      display: flex;
      .input-container:nth-child(1) {
        margin-right: 10px;
      }
    }
    button {
      width: 100%;
      margin-bottom: 15px;
    }
  }
  .personalinfo-next-button {
    margin-top: 36px;
    width: 100%;
  }

  .select-container {
    display: grid;
    grid-template-areas:
      "a a"
      "b c";
    grid-gap: 0 15px;

    > div {
      margin-right: 0;
    }

    > div:nth-child(1) {
      grid-area: a;
    }
    > div:nth-child(2) {
      grid-area: b;
    }
    > div:nth-child(3) {
      grid-area: c;
    }

    @media screen and (min-width: 768px) {
      display: flex;
      flex: 1;
      flex-wrap: wrap;
      justify-content: space-between;

      > div {
        flex: 1;
        margin-right: 15px;

        &:last-child {
          margin-right: 0;
        }
      }
    }
  }

  .upload {
    width: 100%;

    .loading-container {
      position: relative;

      .loading {
        display: flex;
        justify-content: center;
        align-items: center;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        position: absolute;
        z-index: 999;

        &::before {
          content: "Uploading your file...";
          position: absolute;
          bottom: 10px;
          font-weight: bold;
          color: $secondary;
        }
      }
    }

    .uploading {
      opacity: 0.3;
    }

    img {
      margin-top: 8px;
      width: 100%;
    }

    p {
      margin-top: 30px;
      color: $dark-blue;
      font-weight: bold;
      font-family: $secondary-font;
    }

    span {
      font-family: $secondary-font;
      color: $dark-blue;
    }
  }
}
</style>
