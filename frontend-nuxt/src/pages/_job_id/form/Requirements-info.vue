<template>
  <div class="requiriments-container">
    <CheckCircleIcon class="check-icon" size="60" />
    <Title size="h1">Requirements</Title>
    <Title size="h3"
      >To be considered for this position you must meet the following
      requirements:</Title
    >
    <RequirementsInformationForm />
  </div>
</template>

<script>
import Vue from "vue";
import { CheckCircleIcon } from "@vue-hero-icons/solid";

import Title from "~/components/Title";
import RequirementsInformationForm from "~/components/RequirementsInformationForm";

export default Vue.extend({
  components: {
    Title,
    RequirementsInformationForm,
    CheckCircleIcon
  },
  beforeRouteEnter(_, from, next) {
    if (
      from.name === "job_id-form-Upload-Documents" ||
      from.name === "job_id-Job-Description"
    ) {
      return next();
    }
    return next("/");
  }
});
</script>

<style lang="scss">
.requiriments-container {
  background: #fff;
  border-radius: 4px;
  padding: 48px;
  display: flex;
  max-width: 960px;
  margin: 15px auto;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;

  @media screen and (max-width: 960px) {
    margin: 0;
    padding: 48px 24px;
  }

  .check-icon {
    color: $secondary;
  }

  h3 {
    margin-top: 16px;
    font-weight: normal;
    text-align: center;
  }
}
</style>
