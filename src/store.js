import { createApp } from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import auth from './auth';
import { error } from 'jquery';

const Vue = createApp({})

Vue.use(Vuex, axios)

export default new Vuex.Store({
  state: {
    rowData: [],
    directoryHistory: [],
    sharedLink: null,
  },

  modules: {
    auth,
  },

  actions: {
    loadFiles({ commit }, directory_id) {

      const apiDirectoryId = directory_id || '';
      console.log(apiDirectoryId);

      axios
        .get(`api/list-contents/${apiDirectoryId}`)
        .then(data => {
          let rowData = data.data;
          commit('SET_FILES', rowData);
          commit('PUSH_DIRECTORY', apiDirectoryId);
          console.log(rowData);
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
        timeout: 10000,
      };
      axios
        .post('api/file/', formData, config) // Update the URL to match the correct origin
        .then(() => {
          commit('POST_FILE', file);
          dispatch('loadFiles', directory);
        })
        .catch(error => {
          console.error('Error:', error.config);
        });
    },


    deleteFilesAndDirectories({ dispatch }, deleteData) {
      axios
        .delete('api/directory', {
          headers: {
            'Content-Type': 'application/json',
          },
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
        .post('api/directory/', {
          name: newDirectory.name,
          parent_directory: newDirectory.parent_directory
        })
        .then(() => {
          dispatch('loadFiles');
        })
        .catch(error => {
          console.error('Error:', error);
        });
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
    },

    async shareLink({ commit }, fileId) {
      try {
        
        const response = await axios.get(`api/file/${fileId}`);
        const sharedLink = response.data;

       
        commit('SET_SHARED_LINK', sharedLink);

        return sharedLink;
      } catch (error) {
        console.error("Error fetching shared link:", error);
        throw error;
      }
    },
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
    SET_SHARED_LINK(state, link) {
      state.sharedLink = link;
    },
  },
})