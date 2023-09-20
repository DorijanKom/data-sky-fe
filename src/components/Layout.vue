<!-- Layout.vue -->
<template>
    <div id="app" style="display: flex; flex: max-content;">
      <Header/>
      <Home/>
    </div>
  </template>
  
  <script>
  import Header from './Header.vue';
  import Home from './Home.vue';
  
  export default {
    components: {
      Header,
      Home
    },
  };
  </script>
  