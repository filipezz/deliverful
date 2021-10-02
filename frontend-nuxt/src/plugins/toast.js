export default ({ _, store }, inject) => {
  inject("toast", {
    showMessage({ content = "", color = "", timeout = 1000 }) {
      store.commit("showMessage", { content, color, timeout });
    }
  });
};
