<template>
  <div class="personalinfo-container">
    <PersonalInformationForm />
  </div>
</template>

<script>
import Vue from "vue";

import PersonalInformationForm from "~/components/PersonalInformationForm";
export default Vue.extend({
  components: {
    PersonalInformationForm
  }
});
</script>

<style lang="scss">
.personalinfo-container {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  max-width: 960px;
  margin: 15px auto;
  background: #fff;
  border-radius: 4px;
  padding: 48px;
  @media screen and (max-width: 960px) {
    margin: 0 auto;
    padding: 48px 20px;
  }
}
</style>
