<template>
  <div class="homepage">
    <v-skeleton-loader
      v-for="_ in 8"
      v-if="loading"
      :key="_"
      type="card"
    ></v-skeleton-loader>

    <div v-for="item in jobs" :key="item.id" class="card">
      <div @click="goToJob(item.id)">
        <header>
          <div>
            <h2>{{ item.title }}</h2>
            <h3>{{ item.companyName }}</h3>
          </div>
          <img :src="item.companyPicture" alt="Company logo" />
        </header>
        <span
          >${{ item.compensation.low }} - ${{ item.compensation.high }} /
          hour</span
        >

        <span>
          <LocationMarkerIcon color="#0099ff " />
          {{ item.location.city }}</span
        >

        <span>
          <ClockIcon color="#0099ff " />
          {{ item.type }}</span
        >
      </div>
      <hr />
      <section>
        <span>Posted {{ item.createdAt | getDifferenceInDays }}</span>
        <button><HeartIcon color="#0099ff " /> Save job</button>
      </section>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
// @ts-ignore
import { ClockIcon, LocationMarkerIcon } from "@vue-hero-icons/solid";
// @ts-ignore
import { HeartIcon } from "@vue-hero-icons/outline";
import { formatDistanceToNow } from "date-fns";

interface JobDTO {
  id: string;
  companyId: string;
  formsIds: string[];
  createdAt: Date;
  title: string;
  location: string;
  type: "full-time" | "part-time" | "contract";
  compensation: {
    low: number;
    high: number;
  };
  descriptionJSON: object;
}

export default Vue.extend({
  components: {
    HeartIcon,
    ClockIcon,
    LocationMarkerIcon
  },
  filters: {
    getDifferenceInDays(date: Date | number) {
      // @ts-ignore
      if (date._seconds) {
        // @ts-ignore
        return formatDistanceToNow(date._seconds * 1000);
      }
      return formatDistanceToNow(new Date(date));
    }
  },
  data() {
    return {
      jobs: ([] as unknown) as JobDTO,
      loading: true
    };
  },
  async mounted() {
    try {
      const response = await this.$axios.$get("/jobs/");
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
  methods: {
    goToJob(id: string) {
      this.$router.push(`/${id}/job-description`);
    }
  }
});
</script>
<style lang="scss">
.homepage {
  background: #fff;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-gap: 72px 48px;
  padding: 144px 96px;
  @media screen and (max-width: 1670px) {
    grid-template-columns: 1fr 1fr 1fr;
  }
  @media screen and (max-width: 1390px) {
    grid-template-columns: 1fr 1fr;
    padding: 40px 20px;
  }
  @media screen and (max-width: 1000px) {
    grid-template-columns: 1fr;
  }
  .card {
    box-shadow: 0px 3px 6px #00000029;
    padding: 24px;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);

    &:hover {
      box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25),
        0 10px 10px rgba(0, 0, 0, 0.22);
    }
    > div {
      display: flex;
      flex-direction: column;
      flex: 1;
      cursor: pointer;

      header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: $dark-blue;
        flex: 1;
        > div {
          flex: 4;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        h2,
        h3 {
          margin-bottom: 16px;
        }
      }
      img {
        height: 96px;
        width: 96px;
        margin-left: 8px;
        @media screen and (max-width: 390px) {
          dispnay: none;
        }
      }
      > span {
        display: flex;
        align-items: center;
        color: $dark-blue;
        font-size: 18px;
        margin-bottom: 16px;
        text-transform: capitalize;
        svg {
          margin-right: 8px;
        }
      }
    }

    hr {
      margin-bottom: 16px;
      color: #b4b4b4;
    }
    section {
      display: flex;
      color: #7f7f7f;
      align-items: center;
      justify-content: space-between;
      > button {
        background: 0;
        font-size: 12px;
        display: flex;
        align-items: center;
        font-style: italic;
        outline: 0;
        svg {
          margin-right: 8px;
        }
      }

      > span {
        font-size: 12px;
        font-style: italic;
      }
    }
  }
}
</style>
