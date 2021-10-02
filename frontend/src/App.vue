<template>
  <IonApp>
    <IonSplitPane content-id="main-content">

      <Menu/>
      
      <Page id="main-content"/>

    </IonSplitPane>
  </IonApp>
</template>

<script lang="ts">
import { IonApp, IonSplitPane } from '@ionic/vue';
import { defineComponent, ref } from 'vue';
import { useRoute } from 'vue-router';

import Page from './components/Page.vue'
import Menu from './components/Menu.vue'

export default defineComponent({
  name: 'App',
  components: {
    IonApp, 
    IonSplitPane,
    Page,
    Menu,
  },
});
</script>