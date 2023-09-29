// auth.js (Vuex store module)
const state = {
    isAuthenticated: localStorage.getItem('isAuthenticated') === 'true' || false,
};

const mutations = {
    setAuthenticated(state) {
        state.isAuthenticated = true;
        localStorage.setItem('isAuthenticated', 'true');
    },
    clearAuthenticated(state) {
        state.isAuthenticated = false;
        localStorage.setItem('isAuthenticated', 'false');
    },
};

const actions = {
    login({ commit }) {
        commit('setAuthenticated');
    },
    logout({ commit }) {
        commit('clearAuthenticated');
    },
};

export default {
    state,
    mutations,
    actions,
};
