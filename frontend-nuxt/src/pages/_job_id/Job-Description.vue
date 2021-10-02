<template>
  <div class="job-application-container">
    <v-skeleton-loader v-if="loading" type="heading"></v-skeleton-loader>
    <div v-else class="company-title">
      <Title size="h1"> {{ title }}</Title>

      <img :src="companyPicture" alt="" />
    </div>

    <v-skeleton-loader
      v-if="loading"
      type="text, text"
      max-width="120px"
    ></v-skeleton-loader>
    <div v-else class="location-job-type">
      <div>
        <i>Location: </i>
        <span>{{ location }} </span>
      </div>

      <div>
        <i>Job Type:</i> <span>{{ type }}</span>
      </div>
    </div>

    <v-skeleton-loader v-if="loading" type="button"></v-skeleton-loader>
    <Button v-else type="primary" @click.native="applyToJob">Apply</Button>
    <v-skeleton-loader v-if="loading" type="article"></v-skeleton-loader>
    <v-skeleton-loader v-if="loading" type="article"></v-skeleton-loader>
    <section v-else class="description" v-html="html"></section>

    <v-skeleton-loader v-if="loading" type="button"></v-skeleton-loader>
    <Button v-else type="primary" @click.native="applyToJob">Apply</Button>
    <div class="powered-by">
      <i>Powered by </i>
      <div class="deliverful"><span class="dot">:</span>Deliverful</div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Title from "~/components/Title.vue";
import Button from "~/components/Button.vue";

export default Vue.extend({
  components: {
    Title,
    Button
  },
  data() {
    return {
      description: {},
      title: null,
      location: null,
      type: null,
      about: null,
      html: null,
      loading: true,
      companyPicture: null
    };
  },

  async mounted() {
    try {
      const data = await this.$axios.$get(`/jobs/${this.$route.params.job_id}`);

      this.description = data.descriptionJSON;
      this.about = data.about;
      this.location = data.location.city;
      this.title = data.title;
      this.type = data.type;
      this.html = data.descriptionHTML;
      this.companyPicture = data.companyPicture;

      const id = data.formsObjs[0].id;

      const { questions, title } = data.formsObjs[0].pages.questionPagesObjs[0];

      this.$store.commit("saveRequirementsInfo", { id, questions, title });
    } catch (error) {
      console.log(error);
    }
    this.loading = false;
  },

  methods: {
    applyToJob() {
      const query = this.$route.query;

      this.$store.commit("setSourceQueryStrings", query);

      const user = this.$store.getters.getLoggedUser;
      if (user?.info?.id) {
        return this.$router.push(
          `/${this.$route.params.job_id}/form/requirements-info`
        );
      }
      return this.$router.push(`/${this.$route.params.job_id}/form/basic-info`);
    }
  }
});
</script>

<style lang="scss">
.job-application-container {
  max-width: 1390px;
  display: flex;
  margin: 15px auto;
  width: 100%;
  flex-direction: column;
  font-family: "Montserrat";
  color: $dark-blue;
  background: #fff;
  padding: 48px;
  border-radius: 4px;
  min-height: 700px;

  @media screen and (max-width: 1390px) {
    margin: 0 auto;
    padding: 48px 24px;
  }

  @media screen and (max-width: 1390px) {
    margin: 0 auto;
    padding: 48px 24px;
  }

  .company-title {
    display: flex;
    justify-content: space-between;

    > img {
      height: 84px;
      width: 84px;
      object-fit: scale-down;
    }
  }

  h1 {
    margin-bottom: 16px;
  }
  .location-job-type {
    div {
      margin-bottom: 16px;

      i {
        color: $dark-gray;
        margin-right: 16px;
        margin-bottom: 16px;
      }
      span {
        color: $dark-blue;
        text-transform: capitalize;
      }
    }
  }
  section {
    h3 {
      margin-top: 24px;
      margin-bottom: 16px;
    }
    p {
      line-height: 24px;
    }
    li {
      line-height: 24px;
      list-style: disc outside none;
    }
  }
  button {
    margin: 24px 0;
  }
  .powered-by {
    display: flex;
    align-items: center;
    justify-content: center;

    > i {
      font-size: 12px;
      color: $dark-gray;
      margin-right: 15px;
    }
  }
  .description {
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;

    h1 {
      font-size: 2rem !important;
    }

    h2 {
      font-size: 1.5rem !important;
    }
    h3 {
      font-size: 1.17rem !important;
    }
    ul,
    ol {
      padding-left: 1.2rem !important;
    }
    h1,
    h2,
    h3 {
      line-height: 1.3 !important;
    }
    blockquote,
    h1,
    h2,
    h3,
    ol,
    p,
    pre,
    ul {
      margin: 1rem 0 !important;
    }
    li > p,
    li > ol,
    li > ul {
      margin: 1rem 0 !important;
    }

    a {
      color: inherit !important;
    }
  }
  .v-skeleton-loader__article {
    margin-bottom: 20px;
  }
  .v-skeleton-loader__heading {
    margin-bottom: 20px;
  }
  .v-skeleton-loader__button {
    height: 50px;
    width: 100%;
    margin: 15px 0;
  }
}
</style>
