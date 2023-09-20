<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <router-view/>
</template>

<script>
import Layout from './components/Layout.vue'
import Login from './components/Login.vue'
export  default {
  name: 'app',
  components: {
    Layout,
    Login
  }
}
</script>

<style>
</style>
