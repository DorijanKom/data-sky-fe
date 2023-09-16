<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div id="app">
    <Header></Header>
    <Home></Home>
  </div>
</template>

<script>
import Header from './components/Header.vue'
import Home from './components/Home.vue'
export default {
  name: 'app',
  components: {
    Header,
    Home
  }
}
</script>

<style>
</style>
