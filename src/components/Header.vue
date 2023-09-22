<script setup>
  import { RouterLink } from 'vue-router';
  import axios from 'axios';
  import { useStore } from 'vuex';
  import { checkSessionCookie } from '../cookie';

  const store = useStore();

  const logout = async () => {
    try {
      const response = axios.post('api/user/logout')
      store.dispatch('logout');
      console.log("message:", response)
    } catch (error) {
      console.error('error:', error)
    }
    
    
  }
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary fixed-top" style="padding: 0px 30px;"> <!-- Added fixed-top class -->
    <a class="navbar-brand" href="#">
      <i class="bi bi-cloud-haze2 col"></i>&nbsp; &nbsp; DataSky
    </a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav"
      aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse justify-content-end" id="navbarNav">
      <ul class="navbar-nav">
        <li class="nav-item">
          <router-link to="/login" class="nav-link text-white" @click="logout">Logout</router-link>
        </li>
      </ul>
    </div>
  </nav>
</template>


<style>
@import "bootstrap-icons/font/bootstrap-icons.css";
</style>