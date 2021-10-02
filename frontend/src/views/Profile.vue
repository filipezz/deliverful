<template lang="pug">
ion-card.card
  ion-card-header
    ion-grid
      ion-row
        ion-col
          img(
            :src="user.info.picture || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMRXuqkqbjXJ59EvVnIBjqLb1sqhCNt1Pyxg&usqp=CAU'"
          )
        ion-col
          ion-card-title {{ user.info.name }}
          ion-card-subtitle.placeholder Los Angeles, CA

      span.bio.placeholder A short bio gos here and should be no more than 140 characters. Try to keep it short and sweet, like a tweet.

  ion-card-content
    ion-title(v-if="user.gigs") Gig Experience

    div(v-for="gig in user.gigs", :key="gig.id")
      ion-grid
        ion-row
          ion-col {{ gig.employer }}
          ion-col {{ toMonthnameYearOrPresent(gig.hireDatetime) }} - {{ toMonthnameYearOrPresent(gig.terminationDatetime) }}

      ion-grid
        ion-row
          ion-col
            span {{ gig.rating }}
            br
            span Rating

          ion-col
            span {{ gig.trips }}
            br
            span Trips

          ion-col
            span ⭐
            br
            span.placeholder Awards
</template>

<script lang="ts">
import {
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonTitle,
} from "@ionic/vue";

import { defineComponent } from "vue";
import userStore from "../stores/user.store";
import { toMonthnameYearOrPresent } from "../formatters/datetime";

export default defineComponent({
  name: "Profile",
  components: {
    IonCard,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonTitle,
  },

  setup() {
    const user = userStore;

    return { user, toMonthnameYearOrPresent };
  },
});
</script>

<style lang="postcss" scoped>
img {
  max-width: 10rem;
}

.placeholder {
  color: aquamarine;
}

ion-grid {
  witdh: 100%;
  max-width: 25rem;
}

ion-card {
}

.bio {
  word-wrap: break-word;
  max-width: 100%;
}

--ion-grid-width: 20rem;
</style>