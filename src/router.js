import { createRouter, createWebHistory } from "vue-router";
import { checkSessionCookie } from "./auth";
import Home from './components/Home.vue'
import Header from './components/Header.vue'
import Login from './components/Login.vue'

const routes = [
    { path: '/', redirect: '/dashboard' },
    { path: '/login', component: Login },
    { path: '/dashboard', components: { Home, Header } , meta: { requiresAuth: true } },
  ];
  
  const router = createRouter({
    history: createWebHistory(),
    routes,
  });

router.beforeEach((to, from, next) => {
    const isAuthenticated = checkSessionCookie();
  
    if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
      next('/login');
    } else {
      next();
    }
  });

export default router;