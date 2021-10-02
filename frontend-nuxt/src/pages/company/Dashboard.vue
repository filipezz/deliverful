<template>
  <div class="dashboard-container">
    <header>
      <div>
        <span> Active Jobs: <em> 3</em> </span>
        <span> Closed Jobs: <em> 3</em> </span>
      </div>
      <div><Button @click.native="createJob">Post a Job</Button></div>
    </header>
    <main>
      <h1 v-if="jobs.length === 0">There are no jobs</h1>
      <div v-for="job in jobs" :key="job.id" class="job-card">
        <header>
          <h1>{{ job.title }}</h1>
        </header>
        <div class="job-details">
          <span> <i>Location:</i>{{ job.location.city }}</span>

          <span> <i>Posted:</i>{{ job.createdAt | formatDate }}</span>
        </div>
        <div class="job-stats">
          <section><span>Total</span> <strong>10</strong></section>
          <section><span>New</span> <strong>10</strong></section>
          <section><span>Saved</span> <strong>10</strong></section>
          <section><span>Declined</span> <strong>10</strong></section>
        </div>
        <div class="job-actions">
          <Button>Candidates</Button>
          <Button type="outline">Options</Button>
        </div>
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { format } from "date-fns";
import Button from "~/components/Button.vue";

interface JobDTO {
  id: string;
  companyId: string;
  formsIds: string[];
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  updatedAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  title: string;
  location: {
    city: string;
  };
  type: string;
  compensation: {
    low: number;
    high: number;
  };
  descriptionJSON: object;
}

export default Vue.extend({
  components: {
    Button
  },
  filters: {
    formatDate(date: Date) {
      return format(new Date(date), "MM/dd/yyyy'");
    }
  },
  data() {
    return {
      loading: true,
      jobs: [] as JobDTO[]
    };
  },
  computed: {
    companyId(): string {
      return this.$store.getters.getCompanyId;
    }
  },

  watch: {
    companyId(value) {
      if (value) {
        this.getJobs();
      }
    }
  },
  methods: {
    async getJobs() {
      try {
        const response = await this.$axios.$get(
          `/companies/jobs/${this.companyId}`
        );
        this.jobs = response;
      } catch (error) {
        this.$toast.showMessage({
          content: error.response.data.error.message,
          timeout: 5000,
          color: "red"
        });
      }

      this.loading = false;
    },
    createJob() {
      this.$router.push("job-creation");
    }
  }
});
</script>

<style lang="scss">
.dashboard-container {
  background: #fff;
  border-radius: 4px;
  max-width: 1728px;
  margin: 24px auto;
  width: 100%;
  padding: 48px;
  min-height: 912px;
  @media screen and (max-width: 768px) {
    margin: 0 auto;
    padding: 24px;
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 48px;

    @media screen and (max-width: 950px) {
      flex-direction: column;
    }
    > div {
      margin-bottom: 24px;
      width: 100%;
      text-align: center;
      span {
        font-size: 20px;
        margin-right: 48px;
        font-weight: 600;
        @media screen and (max-width: 950px) {
          margin-right: 12px;
          font-size: 16px;
        }
        em {
          margin-left: 14px;
          font-weight: 600;
          color: $secondary;
          @media screen and (max-width: 950px) {
            margin-right: 0;
            margin-left: 0;
            font-size: 14px;
          }
        }
      }
    }
    button {
      width: 100%;
    }
  }
  main {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 48px;

    @media screen and (max-width: 1400px) {
      grid-template-columns: 1fr;
    }
    .job-card {
      padding: 48px;
      box-shadow: 0px 3px 9px #00000029;
      @media screen and (max-width: 768px) {
        padding: 24px;
      }

      .job-stats {
        display: flex;
        justify-content: center;
        margin-bottom: 24px;
        @media screen and (max-width: 476px) {
          flex-direction: column;
        }
        section {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-right: 1px solid #ccc;
          padding: 0 36px;

          @media screen and (max-width: 768px) {
            padding: 0 16px;
          }
          @media screen and (max-width: 476px) {
            border-bottom: 1px solid #ccc;
            border-right: 0;
            padding: 015px 0;
          }

          span {
            margin-bottom: 16px;
            font-size: 20px;
            color: $dark-blue;
          }
          strong {
            font-size: 20px;
            color: $dark-blue;
          }
        }
        section:last-child {
          border: 0;
        }
      }
      .job-actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-gap: 48px;
        @media screen and (max-width: 768px) {
          grid-template-columns: 1fr;
          grid-gap: 24px;
        }
      }
    }
    .job-details {
      display: flex;
      flex-direction: column;
      margin-bottom: 25px;
      span:nth-child(1) {
        margin-bottom: 19px;
      }
      span {
        font-size: 18px;
        color: $dark-blue;
        i {
          color: $light-gray;
          margin-right: 16px;
          font-size: 16px;
        }
      }
    }
  }
}
</style>
