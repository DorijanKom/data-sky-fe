<template>
  <div class="container d-flex flex-column justify-content-center">

    <br />

    <!-- PART-2: UPLOAD A FILE -->
    <div class="card bg-light">
      <form ref="fileForm" class="d-flex flex-column" @submit.prevent="submitFile">
        <input type="file" @change="onFileSelected" ref="form" class="form-control-file" />
        <button class="btn btn-primary">
          Submit &nbsp; &nbsp;<i class="bi bi-cloud-upload"></i>
        </button>
      </form>
    </div>

    <br />

    <!-- PART-3: DELETE FILE(S) -->
    <div class="d-flex flex-column bg-light">
      <div class="d-flex px-2">
        <div>
          <button class="btn btn-danger" @click="deleteFile()">
            <i class="bi bi-trash3"></i> Delete &nbsp;&nbsp;
          </button>
        </div>
        <div class="d-flex px-2">
          <button class="btn btn-info"  @click="createDirectory()">
            <i class="bi bi-folder-plus"></i> Create directory &nbsp;&nbsp;
          </button>
        </div>
<!--         <div class="col-auto" v-if="status">
          <div class="card bg-light">
            <div class="card-text" style="margin-right: 50px;">
              <strong>{{ selectedDataSizes.length }}</strong> File(s) selected
            </div>
            <div class="card-text">Total size: <strong>{{ selectedDataTotal }}</strong></div>
          </div>
        </div> -->
      </div>

      <hr />
      <div v-if="isLoading" class="spinner-border" role="status">
        <span class="sr-only"></span>
      </div>
      <!-- PART-1: LIST FILES -->
      <div v-else class="container">
        <table class="table table-bordered">
          <thead>
            <tr>
              <!-- Define your table header columns -->
              <th scope="col">#</th>
              <th scope="col">Name</th>
              <th scope="col">Type</th>
              <th scope="col">Size</th>
              <th scope="col">Added</th>
              <!-- Add more header columns as needed -->
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in paginatedData" :key="index">
              <td>
                <input type="checkbox" v-model="selectedItems" :value="item.id" />
              </td>
              <td>
                <span v-if="item.type === 'directory'" @click="loadDirectoryContents(item.id)"
                  style="cursor: pointer; text-decoration: underline;">
                  {{ item.name }}
                </span>
                <span v-else>{{ item.name }}</span>
              </td>
              <td>{{ item.type }}</td>
              <td>{{ item.size }}</td>
              <td>{{ item.date_created }}</td>
              <div class="d-flex justify-content-center align-items-center">
                <td>
                  <button @click="onRowClicked(item)" v-if="item.type !== 'directory'" type="button"
                  class="btn btn-warning align-items-center"><i class="bi bi-box-arrow-in-down"></i> Download</button>
              </td>
              </div>
            </tr>
          </tbody>
        </table>
        <nav aria-label="Page navigation">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <a class="page-link" @click="prevPage" href="#" aria-label="Previous">
                <span aria-hidden="true">&laquo;</span>
              </a>
            </li>
            <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: currentPage === page }">
              <a class="page-link" @click="changePage(page)" href="#">
                {{ page }}
              </a>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <a class="page-link" @click="nextPage" href="#" aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
              </a>
            </li>
          </ul>
        </nav>
        <button class="btn btn-info" @click="goBack" v-if="directoryHistory.length > 1"><i
            class="bi bi-arrow-return-left"></i></button>
      </div>


    </div>

    <!-- PART-3: DELETE FILE(S) -->
    <!-- Modal Component -->
    <div class="modal" v-if="modalShow" v-on:change="modal" tabindex="-1" role="dialog">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-body">Selected file(s) will be deleted?</div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="$emit('close')">Cancel</button>
            <button type="button" class="btn btn-primary" @click="handleOk">OK</button>
          </div>
        </div>
      </div>
    </div>

    
    <!-- PART-4: CREATE DIRECTORY -->
    <!-- Modal Component -->
    <Transition>
      <div class="modal" ref="createDirectory" v-show="modalShow" tabindex="-1" role="dialog">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Create Directory</h5>
          </div>
          <div class="modal-body">
              <form>
                <div class="form-group">
                  <label for="name" class="col-form-label">Directory name</label>
                  <input type="text" class="form-control" id="name">
                </div>
              </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="$emit('close')">Cancel</button>
            <button type="button" class="btn btn-primary" @click="handleOk">Create</button>
          </div>
        </div>
      </div>
    </div>
    </Transition>

  </div>
</template>


<script>
import filetypeCellRenderer from "../filetypeCellRenderer.js";

import { computed, onBeforeMount, ref, Transition } from 'vue';
import { mapState, useStore } from 'vuex';
import { sizeFormatter, dateFormatter } from '../utils.js';

export default {

  setup() {
    const store = useStore();
    const data = computed(() => store.state.rowData);
    const directoryHistory = computed(() => store.state.directoryHistory);

    return {
      data,
      directoryHistory,
    }
  },

  data() {
    return {
      selFile: null,
      directory_id: null,
      selectedItems: [],
      currentPage: 1,
      itemsPerPage: 7,
      isLoading: true,
      modalShow: false,
    }
  },


  mounted() {
    console.log(this.modalShow);
    this.fetchData();
  },

  computed: {
    ...mapState([
      'rowData'
    ]),

    paginatedData() {
      if (this.data && this.data.results) {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return this.data.results.slice(startIndex, endIndex);
      }
      return []; // Provide a default value if data is undefined
    },

    totalPages() {
      if (this.data && this.data.results) {
        return Math.ceil(this.data.results.length / this.itemsPerPage);
      }
      return 0; // Provide a default value if data is undefined
    },
  },
  methods: {

    fetchData() {
      console.log(this.directory_id);
      this.$store.dispatch('loadFiles', this.directory_id)
        .then(() => {
          this.isLoading = false;
        })
        .catch(error => {
          console.error('Failed to fetch data:', error);
        });
    },

    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage -= 1;
      }
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage += 1;
      }
    },

    changePage(page) {
      this.currentPage = page;
    },

    onFileSelected(event) {
      this.selFile = event.target.files[0];
    },

    goBack() {
      const directoryHistory = this.$store.state.directoryHistory;
      if (directoryHistory.length > 1) {
        directoryHistory.pop();
        const previousDirectory = directoryHistory[directoryHistory.length - 1];
        this.$store.commit('POP_DIRECTORY');
        this.directory_id = previousDirectory;
        this.fetchData();
      }
    },

    onRowSelected(event) {
      const selectedNodes = this.gridApi.getSelectedNodes();
      const selectedData = selectedNodes.map(node => node.data);
      const selectedDataStringPresentation = selectedData.map(node => node.name + ' ' + node.file_id).join(', ');
      this.selectedDataSizes = selectedData.map(node => node.size)

      // get the total size
      const add = (a, b) => a + b
      if (this.selectedDataSizes.length > 0) {
        this.status = true
        const totalSize = { value: this.selectedDataSizes.reduce(add) }
        this.selectedDataTotal = sizeFormatter(totalSize)
      } else { this.status = false }
    },

    submitFile(event) {
      if (this.isLoading) {
        alert('Data is still loading. Please wait.');
        return;
      }
      if (this.selFile) {
        if (this.selFile.size < 2 * 1024 * 1024 * 1024) {
          if (this.directory_id === null) {
            this.directory_id = '';
          }
          const formData = {
            "file": this.selFile,
            "directory": this.directory_id
          }

          event.preventDefault();

          this.$store.dispatch('postFile', formData);
          this.$refs.fileForm.reset();
        } else {
          alert("File size must be smaller than 2GB")
        }
      } else {
        alert("Please select a file");
      }
    },

    loadDirectoryContents(directory_id) {
      this.directory_id = directory_id;
      this.fetchData();
    },

    deleteFile() {
      const selectedNodes = this.selectedItems
      if (selectedNodes.length > 0) {
        const selectedData = selectedNodes.map(node => node.data);
        const result_id = selectedData.map(node => node.file_id)
        console.log(result_id)
        this.result_id = result_id
        this.modalShow = true
        this.modal = true
      }
    },

    createDirectory() {
      this.modalShow = true;
      console.log(this.modalShow)
    },

    handleOk() {
      this.$store.dispatch('deleteFile', this.result_id)
      this.modalShow = false
      this.status = false
    },

    onRowClicked(event) {
      let file_id = event.id
      let filename = event.name
      this.$store.dispatch('downloadFile', file_id)

    }
  }
}

</script>

<style lang="scss">
/* Style buttons */
.btn {
  margin-top: 20px;
  border: none;
  /* Remove borders */
  color: white;
  /* White text */
  padding: 12px 16px;
  /* Some padding */
  font-size: 16px;
  /* Set a font size */
  cursor: pointer;
  /* Mouse pointer on hover */
}

/* Darker background on mouse-over */
.btn:hover {
  background-color: Gray;
}
</style>
