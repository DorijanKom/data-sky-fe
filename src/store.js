import { createApp } from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import auth from './auth'
import { checkSessionCookie } from './cookie'

const Vue = createApp({})

Vue.use(Vuex, axios)

export default new Vuex.Store({
  state: {
    rowData: [],
    directoryHistory: [],
  },

  modules: {
    auth,
  },

  actions: {
    loadFiles({ commit }, directory_id) {

      const apiDirectoryId = directory_id || '';

      axios
        .get('api/list-contents/' + apiDirectoryId)
        .then(data => {
          let rowData = data.data;
          commit('SET_FILES', rowData);
          commit('PUSH_DIRECTORY', apiDirectoryId);
        })
        .catch(error => {
          console.log(error)
        })
    },

    postFile({ dispatch, commit }, { file, directory }) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('directory', directory);

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
        .post('api/file/', formData, config) // Update the URL to match the correct origin
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

    downloadFile({ dispatch }, fileId) {
      axios.get(`api/file/${fileId}`)
        .then((response) => {
          console.log(response);
          const presignedUrl = response.data;

          const filename =
            response.headers['content-disposition'] ||
            presignedUrl.substring(presignedUrl.lastIndexOf('/') + 1);

            const link = document.createElement('a');
            link.href = presignedUrl;
            link.download = filename;
            if (document.body.contains(link)) {
              document.body.removeChild(link);
            }
      
            link.click();
        })
        .catch((error) => {
           console.error('Error fetching presigned URL:', error);
        })
      }
    },

    mutations: {
      SET_FILES(state, files) {
        state.rowData = files
      },
      POST_FILE(state, newFile) {
        if (!Array.isArray(state.rowData)) {
          state.rowData = [];
        }
        state.rowData.push(newFile);
      },
      PUSH_DIRECTORY(state, directory) {
        state.directoryHistory.push(directory);
      },
      POP_DIRECTORY(state) {
        state.directoryHistory.pop();
      },
    },
  })