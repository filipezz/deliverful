export default function ({ store }) {
  const state = JSON.parse(localStorage.getItem("@deliverful"));
  if (state) {
    store.replaceState(state);
    return state;
  } else {
    return store.state;
  }
}
