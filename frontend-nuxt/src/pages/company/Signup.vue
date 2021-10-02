<template>
  <div class="company-signup-container">
    <Loading v-if="loading" />
    <BriefcaseIcon class="briefcase-icon" size="60" />

    <Title size="h1">Company Sign Up</Title>

    <v-form v-model="valid" data-app="true">
      <Title class="form-title" size="h3" color="color-secondary"
        >Basic Info</Title
      >
      <div class="form-grid">
        <Input
          v-model="companyName"
          :rules="rules.name"
          placeholder="Deliverful"
          label="Company Name"
        ></Input>
        <Input
          v-model="companyWebsite"
          :rules="rules.companyWebsite"
          placeholder="www.companyurl.com"
          label="Website"
        ></Input>
      </div>
      <Title class="form-title" size="h3" color="color-secondary">Adress</Title>
      <div class="form-grid">
        <Input
          v-model="line1"
          :rules="rules.line1"
          placeholder="111 Ocean Drive"
          label="Line 1"
        ></Input>
        <Input v-model="line2" placeholder="Apt 3" label="Line 2"></Input>
        <Input
          v-model="city"
          :rules="rules.city"
          placeholder="Los Angeles"
          label="City"
        ></Input>
        <Input
          v-model="postalcode"
          :rules="rules.postalcode"
          placeholder="83202"
          label="Postal Code"
        ></Input>
        <Select
          v-model="state"
          :rules="rules.state"
          placeholder="State"
          label="State"
          :items="states"
        />
      </div>
      <div class="upload-section">
        <Title class="form-title" size="h3" color="color-secondary">Logo</Title>
        <div class="upload-requirements">
          <p>
            Upload your company logo, it will be displayed on your job listings.
          </p>
          <span>
            Requirements: Dimensions should be at least 400 x 400 pixels in .jpg
            or .png format ONLY.
          </span>
        </div>

        <div class="loading-container">
          <img
            :src="
              companyPicture.url ? companyPicture.url : defaultCompanyPicture
            "
            :class="{
              uploading: companyPicture.uploading
            }"
            alt="company logo"
          />

          <lottie-player
            v-if="companyPicture.uploading"
            class="loading"
            src="https://assets3.lottiefiles.com/packages/lf20_pywyon5o.json"
            background="transparent"
            speed="1"
            style="height: 70%"
            loop
            autoplay
          ></lottie-player>
        </div>

        <div>
          <UploadButton
            :disabled="false"
            accept=".jpg, .jpeg, .png"
            file="file"
            @change.native.prevent="uploadLogo($event)"
          />
          <div class="remove-button">
            <button @click.prevent="removeLogo">Remove</button>
          </div>
        </div>
      </div>
      <Button :disabled="!valid" @click.native.prevent="submit">submit</Button>
    </v-form>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

// @ts-ignore
import { BriefcaseIcon } from "@vue-hero-icons/solid";
import states from "~/utils/states";
import Title from "~/components/Title.vue";
import Input from "~/components/Input.vue";
import Button from "~/components/Button.vue";
import UploadButton from "~/components/UploadButton.vue";
import Select from "~/components/Select.vue";
import { requiredRule } from "~/utils/rules";
import Loading from "~/components/Loading.vue";

interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget;
}

export default Vue.extend({
  components: {
    Title,
    Input,
    BriefcaseIcon,
    Button,
    UploadButton,
    Select,
    Loading
  },
  data() {
    return {
      loading: false,
      states,
      valid: false,
      defaultCompanyPicture: "https://via.placeholder.com/400x400",
      companyPicture: {
        fileName: "",
        uploading: false,
        url: "",
        uniqueName: ""
      },
      name: "",
      line1: "",
      line2: "",
      city: "",
      postalcode: "",
      state: "",
      companyWebsite: "",
      companyName: "",
      rules: {
        name: [requiredRule()],
        line1: [requiredRule()],
        city: [requiredRule()],
        postalcode: [requiredRule()],
        state: [requiredRule()],
        companyWebsite: [requiredRule()],
        companyPicture: [requiredRule()]
      }
    };
  },
  methods: {
    uploadLogo(event: HTMLInputEvent) {
      if (!event.target.files) return;

      const file = event.target.files[0];
      const name = file.name;
      const [fileName, fileExtention] = name.split(".");
      const uniqueName = fileName + Date.now().toString() + "." + fileExtention;
      this.companyPicture.uniqueName = uniqueName;

      const storageRef = this.$fire.storage.ref(
        `company-logo/${this.companyName}/${uniqueName}`
      );
      this.companyPicture.uploading = true;

      storageRef.put(file).then((_) => {
        storageRef.getDownloadURL().then((url) => {
          this.companyPicture.fileName = fileName;
          this.companyPicture.url = url;
          setTimeout(() => (this.companyPicture.uploading = false), 1000);
        });
      });
    },
    removeLogo() {
      const storageRef = this.$fire.storage.ref(
        `company-logo/${this.companyName}/${this.companyPicture.uniqueName}`
      );

      storageRef.delete().then((_) => {
        this.companyPicture.fileName = "";
        this.companyPicture.url = "";
      });
    },
    async submit() {
      this.loading = true;
      try {
        const adminToken = this.$store.getters.getUserToken;
        const response = await this.$axios.$post(
          "/companies/",
          {
            name: this.companyName,
            jobId: [],
            line1: this.line1,
            line2: this.line2,
            city: this.city,
            postalCode: this.postalcode,
            state: this.state,
            companyWebsite: this.companyWebsite,
            companyPicture: this.companyPicture.url
          },
          {
            headers: {
              Authorization: adminToken
            }
          }
        );

        const { id } = response;

        this.$store.dispatch("setCompanyId", id);
        this.$router.push("Dashboard");
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
.company-signup-container {
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

  @media screen and (max-width: 960px) {
    margin: 0 auto;
    padding: 48px 24px;
  }
  > h1 {
    margin-bottom: 48px;
  }
  .briefcase-icon {
    color: $secondary;
    align-self: center;
    margin-bottom: 16px;
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
  }

  .form-title {
    margin-bottom: 24px;
  }
  .upload-section {
    .loading-container {
      position: relative;
      justify-content: start;
      width: fit-content;

      .loading {
        display: flex;
        justify-content: center;
        align-items: center;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        position: absolute;
        z-index: 9;

        &::before {
          content: "Uploading your file...";
          position: absolute;
          bottom: 10px;
          font-weight: bold;
          color: $secondary;
        }
      }
      .uploading {
        opacity: 0.3;
      }
    }

    p {
      color: $dark-blue;
      font-size: 18px;
      margin-bottom: 15px;
    }
    span {
      font-style: italic;
      color: $dark-gray;
    }
    > div {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 48px;
      .upload-container {
        margin: 0;
        flex: 1;
      }
    }
    .upload-requirements {
      display: block;

      p {
        font-weight: 600;
      }
    }
    .remove-button {
      flex: 1;
      > button {
        width: 100%;
        color: $primary;
        text-decoration: underline;
        font-style: italic;
        transition: 0.2s;
        width: min-content;
        margin: 0 auto;
        display: block;
        &:hover {
          color: $secondary;
          font-weight: bold;
        }
      }
    }
    img {
      height: 400px;
      width: 400px;
      margin: 24px 0;

      @media screen and (max-width: 600px) {
        width: 300px;
        height: 300px;
      }
    }
  }
  button {
    width: 100%;
  }
}
</style>
