import { createRouter, createWebHistory } from "vue-router";
import store from "./store";
import Layout from './views/Layout.vue';
import Login from './views/Login.vue';
import Register from './views/Register.vue'

const routes = [
    { path: '/', redirect: '/dashboard' },
    { path: '/dashboard', component: Layout, meta: { requiresAuth: true } },
    { path: '/login', component: Login, meta: { requiresAuth: false } },
    { path: '/register', component: Register, meta: { requiresAuth: false } },
  ];
  
  const router = createRouter({
    history: createWebHistory(),
    routes,
  });

  router.beforeEach((to, from, next) => {
    const isAuthenticated = store.state.auth.isAuthenticated;

    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (!isAuthenticated) {
            next('/login'); // Redirect to login when authentication is required but not authenticated
        } else {
            next(); // Proceed to the route when authenticated
        }
    } else {
        next(); // Proceed to the route when authentication is not required
    }
});

export default router;