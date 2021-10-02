export default function ({ $axios, store }) {
  $axios.onRequest((config) => {
    if (store.state.userToken) {
      config.headers.common.Authorization = store.state.userToken;
    }
  });
}
