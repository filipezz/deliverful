import Button from "../Button.vue";

export default {
  title: "Button"
};

export const primary = () => ({
  components: { Button },
  template: '<Button type="primary">primary</Button>'
});

export const white = () => ({
  components: { Button },
  template: '<Button type="white">white</Button>'
});
