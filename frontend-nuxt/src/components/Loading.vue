<template>
  <div class="loading-container">
    <lottie-player
      src="https://assets3.lottiefiles.com/packages/lf20_pywyon5o.json"
      background="transparent"
      speed="1"
      style="width: 300px; height: 300px"
      loop
      autoplay
    ></lottie-player>
  </div>
</template>

<style lang="scss" scoped>
.loading-container {
  background: rgba(255, 255, 255, 0.7);
  width: 100vw;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  height: 100vh;
  margin: 0;
  z-index: 99999;
  overflow: hidden;
}
</style>
