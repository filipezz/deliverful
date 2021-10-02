<template>
  <div class="upload-documents-container">
    <div class="upload-header">
      <UploadIcon class="upload-icon" size="60" />
      <Title size="h1">Upload Documents</Title>
      <Title class="sub-title" size="h3"
        >Upload your resume and driver’s license to be considered for this
        job.</Title
      >
    </div>
    <Title class="form-title" size="h3" color="color-secondary">
      Driver's License
    </Title>
    <v-form v-model="isDriverLicenseDataValid">
      <Input
        v-for="(driverLicense, index) in driverLicenseData"
        :key="index"
        v-model="driverLicense.value"
        class="input-form"
        :type="driverLicense.type"
        :rules="driverLicense.rule"
        :mask="driverLicense.mask"
        :label="index"
        :placeholder="index"
      />
      <Select
        v-model="licenseType"
        :items="licenseTypes"
        placeholder="License Type"
        label="License Type"
      />
    </v-form>

    <div class="upload">
      <p>Front of driver’s license</p>
      <div class="loading-container">
        <img
          :class="{ uploading: license.front.uploading }"
          :src="license.front.url ? license.front.url : defaultImage"
        />

        <lottie-player
          v-if="license.front.uploading"
          class="loading"
          src="https://assets3.lottiefiles.com/packages/lf20_pywyon5o.json"
          background="transparent"
          speed="1"
          style="height: 70%"
          loop
          autoplay
        ></lottie-player>
      </div>

      <span v-if="license.front.fileName"
        >Image Filename: <strong>{{ license.front.fileName }}</strong></span
      >
      <UploadButton
        :disabled="license.front.uploading"
        accept="image/*"
        file="file"
        @change.native="uploadLicense($event, 'front')"
      />
    </div>

    <div class="upload">
      <p>Back of driver’s license</p>
      <div class="loading-container">
        <img
          :class="{ uploading: license.back.uploading }"
          :src="license.back.url ? license.back.url : defaultImage"
        />
        <lottie-player
          v-if="license.back.uploading"
          class="loading"
          src="https://assets3.lottiefiles.com/packages/lf20_pywyon5o.json"
          background="transparent"
          speed="1"
          style="height: 70%"
          loop
          autoplay
        ></lottie-player>
      </div>
      <span v-if="license.back.fileName"
        >Image Filename: <strong>{{ license.back.fileName }}</strong></span
      >
      <UploadButton
        :disabled="license.back.uploading"
        accept="image/*"
        file="file-back"
        @change.native="uploadLicense($event, 'back')"
      />
    </div>

    <div class="upload">
      <Title class="form-title" size="h3" color="color-secondary">
        Resume
      </Title>
      <p v-if="!resume.fileName">Please upload a copy of your resume</p>
      <span v-else
        >Uploaded resume: <strong>{{ resume.fileName }}</strong></span
      >
      <UploadButton
        :loading="resume.uploading"
        :disabled="resume.uploading"
        accept=".doc, .docx, .pdf"
        file="resume"
        @change.native="uploadResume($event)"
      />

      <Button
        :disabled="!isUploadFormValid"
        class="personalinfo-next-button"
        type="primary"
        @click.native="goToRequirements"
        >next</Button
      >
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
// @ts-ignore
import { UploadIcon } from "@vue-hero-icons/solid";
import Title from "~/components/Title.vue";
import UploadButton from "~/components/UploadButton.vue";
import Select from "~/components/Select.vue";
import { requiredRule } from "~/utils/rules";

interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget;
}

export default Vue.extend({
  components: {
    UploadButton,
    UploadIcon,
    Title,
    Select
  },
  beforeRouteEnter(_, from, next) {
    if (from.name === "job_id-form-Basic-info") {
      return next();
    }
    return next("/");
  },
  data() {
    return {
      isDriverLicenseDataValid: false,
      licenseTypes: [
        "Class A",
        "Class B",
        "Class C",
        "Class D",
        "Class M",
        "Class A CDL",
        "Class B CDL",
        "Class C CDL"
      ],
      licenseType: "",
      defaultImage:
        "https://user-images.githubusercontent.com/194400/49531010-48dad180-f8b1-11e8-8d89-1e61320e1d82.png",
      personalInformationData: this.$store.getters.getPersonalInformation,
      driverLicenseData: {
        "license number": {
          value:
            this.$store.getters.getLoggedUser.driver?.license?.number ?? null,
          rule: [requiredRule()],
          mask: "",
          type: "text"
        },
        "Issued Date": {
          value: "",
          type: "date",
          mask: "",

          rule: [requiredRule()]
        },
        "Expiration Date": {
          value: "",
          rule: [requiredRule()],
          type: "date",
          mask: ""
        }
      },
      license: {
        front: {
          fileName: "",
          url: "",
          uploading: false
        },
        back: {
          fileName: "",
          url: "",
          uploading: false
        }
      },
      resume: {
        fileName: "",
        url: null,
        uploading: false
      }
    };
  },
  computed: {
    isUploadFormValid(): Boolean {
      return (
        this.isDriverLicenseDataValid &&
        !!this.license.front.fileName &&
        !!this.license.back.fileName &&
        !!this.resume.fileName
      );
    }
  },
  methods: {
    uploadLicense(event: HTMLInputEvent, galleryIndex: "back" | "front") {
      if (!event.target.files) return;
      const file = event.target.files[0];
      const name = file.name;
      const [fileName, fileExtention] = name.split(".");
      const uniqueName = fileName + Date.now().toString() + "." + fileExtention;

      const storageRef = this.$fire.storage.ref(
        `${this.personalInformationData.email}/license/${galleryIndex}/${uniqueName}`
      );

      this.license[galleryIndex].uploading = true;

      storageRef.put(file).then((_) => {
        storageRef.getDownloadURL().then((url) => {
          this.license[galleryIndex].fileName = name;
          this.license[galleryIndex].url = url;
          setTimeout(
            () => (this.license[galleryIndex].uploading = false),
            1000
          );
        });
      });
    },
    uploadResume(event: HTMLInputEvent) {
      if (!event.target.files) return;
      const file = event.target.files[0];
      const name = file.name;
      const [fileName, fileExtention] = name.split(".");
      const uniqueName = fileName + Date.now().toString() + "." + fileExtention;

      const storageRef = this.$fire.storage.ref(
        `${this.personalInformationData.email}/resume/${uniqueName}`
      );

      this.resume.uploading = true;

      storageRef.put(file).then((_) => {
        storageRef.getDownloadURL().then((url) => {
          this.resume.fileName = name;
          this.resume.url = url;
          this.resume.uploading = false;
        });
      });
    },
    goToRequirements() {
      this.$store.commit("setDriverLicenseData", {
        number: this.driverLicenseData["license number"].value,
        issuedDate: this.driverLicenseData["Issued Date"].value,
        expirationDate: this.driverLicenseData["Expiration Date"].value,
        licenseType: this.licenseType,
        frontFileUrl: this.license.front.url,
        backFileUrl: this.license.back.url
      });

      this.$store.commit("setDriverResume", {
        fileName: this.resume.fileName,
        url: this.resume.url
      });

      this.$router.push(`/${this.$route.params.job_id}/form/requirements-info`);
    }
  }
});
</script>

<style lang="scss">
.upload-documents-container {
  background: #fff;
  padding: 48px;
  border-radius: 4px;
  max-width: 960px;
  margin: 15px auto;
  display: flex;
  flex: 1;
  flex-direction: column;

  @media screen and (max-width: 960px) {
    margin: 0 auto;
    padding: 48px 24px;
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

  .upload-header {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    text-align: center;

    .title {
      margin-top: 16px;
      font-weight: bold;
    }

    .sub-title {
      margin-top: 16px;
      font-style: $secondary-font;
      font-weight: normal;
    }
  }

  .upload-icon {
    color: $secondary;
  }

  .form-title {
    margin-top: 36px;
    margin-bottom: 24px;
  }
  > form {
    width: 100%;

    .input-form {
      margin-bottom: 24px;
    }
    label {
      color: $light-gray;
      font-family: $secondary-font;
      font-size: 12px;
      font-style: italic;
      text-transform: capitalize;
    }
    .v-input__slot {
      margin-top: 5px;
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
  }
  .personalinfo-next-button {
    margin-top: 36px;
    width: 100%;
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
      margin-top: 16px;
      font-family: $secondary-font;
      color: $dark-blue;
    }
  }
}
</style>
