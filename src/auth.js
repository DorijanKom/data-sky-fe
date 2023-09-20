// auth.js (Vuex store module)
const state = {
    isAuthenticated: false,
};

const mutations = {
    setAuthenticated(state) {
        state.isAuthenticated = true;
    },
    clearAuthenticated(state) {
        state.isAuthenticated = false;
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
