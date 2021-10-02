<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>{{ title }}</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">{{ title }}</ion-title>
        </ion-toolbar>
      </ion-header>
    
      <div id="container">
        <router-view/>
      </div>
      <!-- Waiting for bug to be fixed. Route props are not being passed to component 
        <ion-router-outlet id="container"/> -->

    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { IonRouterOutlet, IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { useRoute, RouterView } from 'vue-router';
import { ref, computed, watch } from 'vue';

export default {
  name: 'Page',
  components: {
    IonButtons,
    IonContent,
    IonHeader,
    IonMenuButton,
    IonPage,
    IonTitle,
    IonToolbar,
    //IonRouterOutlet,
    RouterView,
  },
  props: {
    title: String,
  }
}
</script>

<style scoped lang="postcss">
ion-menu-button {
  color: var(--ion-color-primary);
}

#container {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}
</style>