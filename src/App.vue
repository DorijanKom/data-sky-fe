<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <router-view/>
</template>

<script>
import Layout from './views/Layout.vue'
import Login from './views/Login.vue'
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
