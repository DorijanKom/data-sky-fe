import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex, axios)

export default new Vuex.Store({
  state: {
    rowData: []
  },

  actions: {
    loadFiles({ commit }, directory_id) {
      axios
        .get('api/list-contents/', {
          params: { directory_id: directory_id }
        })
        .then(data => {
          let rowData = data.data
          commit('SET_FILES', rowData)
        })
        .catch(error => {
          console.log(error)
        })
    },

    postFile({ dispatch, commit }, { newFile, directory_id }) {
      const formData = new FormData()
      formData.append('file', newFile)
      formData.append('directory', directory_id)
      const config = {
        onUploadProgress(e) {
          const percentCompleted = Math.round((e.loaded * 100) / e.total);
          console.log(`Upload progress: ${percentCompleted}%`);
        },
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      axios
        .post('api/file/', formData, config)
        .then(() => {

          commit('POST_FILE', file);

          dispatch('loadFiles');
        })
        .catch(error => {
          console.error('Error:', error);
        });
    },

    deleteFilesAndDirectories({ dispatch }, deleteData) {
      axios
        .delete('api/directory/', {
          data: deleteData,
        })
        .then(() => {
          dispatch('loadFiles');
        })
        .catch(error => {
          console.error('Error:', error);
        });
    },

    createDirectory({ dispatch, commit }, newDirectory) {
      axios
        .post('api/directory/', newDirectory)
        .then(() => {
          dispatch('loadFiles');
        })
        .catch(error => {
          console.error('Error:', error)
        })
    },

    downloadFile({ dispatch }, filename) {
      axios({
        url: `media/${filename}`,
        method: 'GET',
        responseType: 'blob',
      })
        .then((res) => {
          const url = window.URL.createObjectURL(new Blob([res.data]))
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', filename)
          document.body.appendChild(link)
          link.click()
        })
    }
  },

  mutations: {
    SET_FILES(state, files) {
      state.rowData = files
    },
    POST_FILE(state, newFile) {
      state.rowData.push(newFile)
    }
  }
})