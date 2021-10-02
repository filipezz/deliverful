<template>
  <div class="adminContainer">
    <v-skeleton-loader v-if="loading" type="article"></v-skeleton-loader>
    <div v-else class="jobsContainer">
      <h2>
        Pending jobs: <span class="jobCount">{{ jobCounter }}</span>
      </h2>
      <v-data-table
        :headers="headers"
        :items="jobsFormatted"
        hide-default-footer
        class="elevation-1"
      >
        <template v-slot:item.id="{ item }">
          <a target="_blank" :href="item.jobUrl">
            {{ item.id }}
          </a>
        </template>

        <template v-slot:item.appCastCheckbox="{ item }">
          <v-simple-checkbox v-model="item.appCastCheckbox"></v-simple-checkbox>
        </template>

        <template v-slot:item.cpaInput="{ item }">
          <Input v-model="item.cpaInput" v-mask="mask" placeholder="$000,000" />
        </template>

        <template v-slot:item.budgetInput="{ item }">
          <Input
            v-model="item.budgetInput"
            v-mask="mask"
            placeholder="$000,000"
          />
        </template>

        <template v-slot:item.action="{ item }">
          <Button @click.prevent.native="approveJob(item)"> APPROVE </Button>
        </template>
      </v-data-table>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

import { format } from "date-fns";
import createNumberMask from "text-mask-addons/dist/createNumberMask";
import Button from "../components/Button.vue";
import Input from "../components/Input.vue";

const currencyMask = createNumberMask({
  prefix: "$",
  allowDecimal: true,
  includeThousandsSeparator: true,
  allowNegative: false,
  decimalLimit: 2
});

export default Vue.extend({
  components: {
    Button,
    Input
  },
  data() {
    return {
      mask: currencyMask,
      valid: false,
      loading: true,
      headers: [
        {
          text: "Company",
          align: "start",
          value: "companyName",
          sortable: true
        },
        { text: "Name", value: "title" },
        { text: "Location", value: "formattedLocation" },
        { text: "Created", value: "formattedCreatedAt" },
        { text: "ID", value: `id` },
        { text: "AppCast", value: "appCastCheckbox", sortable: false },
        { text: "CPA", value: "cpaInput", sortable: false },
        { text: "Budget", value: "budgetInput", sortable: false },
        { value: "action", sortable: false }
      ],
      jobs: [],
      jobCounter: ""
    };
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      const state = vm.$store.state;
      if (state.user.roles === undefined || state.user === null) {
        return vm.$router.push("/");
      }
      if (state.user && state.user.roles[0] === "superAdmin") {
        next();
      } else {
        return vm.$router.push("/signin");
      }
    });
  },
  computed: {
    jobsFormatted(): any {
      return this.jobs.map((job: any) => {
        try {
          const formattedDate = new Date(job.createdAt);
          return {
            ...job,
            formattedLocation:
              job.location.line1 +
              " " +
              job.location.line2 +
              " " +
              job.location.city +
              " " +
              job.location.state +
              " " +
              job.location.postalCode,
            formattedCreatedAt: format(formattedDate, "MM/dd/yyyy'"),
            appCastCheckbox: false,
            cpaInput: "",
            budgetInput: "",
            approveButton: "",
            jobUrl: `${window.location.origin}/${job.id}/job-description`
          };
        } catch (error) {
          this.$toast.showMessage({
            content: error.response.data.error.message,
            timeout: 5000,
            color: "red"
          });
        }
      });
    }
  },
  async mounted() {
    try {
      this.loading = true;
      const response = await this.$axios.$get("/jobs/?status=pending");
      this.jobs = response;
      this.jobCounter = response.length;
      // let jobUrls = [];
      // jobUrls = this.jobs.map((job) => {
      //   return `${this.$axios.defaults.baseURL}${job.id}/job-description`;
      // });
      // console.log(jobUrls);
      // this.jobUrlsArray = jobUrls;
      this.loading = false;
    } catch (error) {
      this.$toast.showMessage({
        content: error.response.data.error.message,
        timeout: 5000,
        color: "red"
      });
    }
  },
  methods: {
    async getJobs() {
      try {
        const response = await this.$axios.$get("/jobs/?status=pending");
        this.jobCounter = response.length;
        this.jobs = response;
      } catch (error) {
        this.$toast.showMessage({
          content: error.response.data.error.message,
          timeout: 5000,
          color: "red"
        });
      }
    },
    async approveJob(item: any) {
      if (item.appCastCheckbox) {
        // TODO: Check if cpa and budget input is both filled, in other words, not empty
        if (item.cpaInput !== "" && item.budgetInput !== "") {
          try {
            await this.$axios.$post(`/jobs/${item.id}/update-status/active`);

            await this.$axios.$post(`/jobs/${item.id}/appcast`, {
              active: true,
              cpa: item.cpaInput,
              budget: item.budgetInput
            });

            return this.getJobs();
          } catch (error) {
            if (error.response.status === 401) {
              this.$toast.showMessage({
                content: error.response.data.error.message,
                timeout: 5000,
                color: "red"
              });
              this.$router.push("/signin");
            }
            this.$toast.showMessage({
              content: error.response.data.error.message,
              timeout: 5000,
              color: "red"
            });
          }
        } else {
          // If either CPA or Budget field is empty, show user a toast message.
          this.$toast.showMessage({
            content: "CPA and Budget must be filled",
            timeout: 5000,
            color: "red"
          });
        }
      } else {
        try {
          await this.$axios.$post(`/jobs/${item.id}/update-status/active`);

          return this.getJobs();
        } catch (error) {
          this.$toast.showMessage({
            content: error.response.data.error.message,
            timeout: 5000,
            color: "red"
          });
        }
      }
    }
  }
});
</script>

<style lang="scss">
.adminContainer {
  width: 100%;
  background-color: white;

  .jobsContainer {
    padding: 15px;
  }

  .jobCount {
    color: #0099ff;
  }

  .input-container {
    flex-direction: row;
  }

  .v-data-table-header th {
    white-space: nowrap;
  }

  .input-container > input {
    height: 15px;
    padding: 10px 8px;
    margin-top: 0px;
    margin-bottom: 0px;
    width: 100%;
  }

  a {
    color: $secondary;
  }

  button {
    height: 25px !important;
  }

  table {
    border: 1px solid #cccccc;
    border-radius: 4px;
  }

  h2 {
    size: 32px;
    margin-bottom: 2%;
  }

  th {
    background-color: #0099ff;
  }
  th span {
    color: white;
  }

  tr {
    text-align: left;
  }

  tbody {
    text-align: left;
  }
}
</style>
