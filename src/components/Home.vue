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
          <button class="btn btn-danger" data-bs-toggle="modal" data-bs-target="#deleteContents">
            <i class="bi bi-trash3"></i> Delete &nbsp;&nbsp;
          </button>
        </div>
        <div class="d-flex px-2">
          <button type="button" class="btn btn-success" data-bs-toggle="modal" data-bs-target="#createDirectory">
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
              <div class="d-flex justify-content-center">
                <th scope="row">
                <div class="btn-group align-items-center" role="group">
                  <button @click="onRowClicked(item)" v-if="item.type !== 'directory'" type="button"
                    class="btn btn-warning btn-sm"><i class="bi bi-box-arrow-in-down"></i> Download</button>
                  <button @click="shareFile(item)" v-if="item.type !== 'directory'" type="button" data-bs-toggle="modal"
                    data-bs-target="#shareFile" class="btn btn-info btn-sm"><i class="bi bi-share"></i>
                    Share...</button>
                </div>
              </th>
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
    <div class="modal" id="deleteContents" v-show="modalShow" tabindex="-1" role="dialog">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-body">Selected file(s) will be deleted?</div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-danger" data-bs-dismiss="modal" @click="deleteFile">Delete</button>
          </div>
        </div>
      </div>
    </div>

  </div>
  <!-- PART-4: CREATE DIRECTORY -->
  <!-- Modal Component -->
  <Transition>
    <div class="modal" id="createDirectory" v-show="modalShow" tabindex="-1" role="dialog">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Create Directory</h5>
          </div>
          <div class="modal-body">
            <form>
              <div class="form-group">
                <label for="name" class="col-form-label">Directory name</label>
                <input type="text" v-model="directoryName" class="form-control" id="name">
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" data-bs-dismiss="modal" @click="createDirectory">Create</button>
          </div>
        </div>
      </div>
    </div>
  </Transition>


  <!-- PART-5: SHARE FILE -->
<!-- Modal component -->
<Transition>
  <div class="modal fade" id="shareFile" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">Share</h5>
        </div>
        <div class="modal-body">
          <form>
            <div class="form-group">
              <label for="link" class="col-form-label">Link:</label>
              <div class="input-group d-flex align-items-end">
                <input v-model="sharedLink" ref="sharedLink" class="form-control" id="link" readonly>
                <div class="input-group-append">
                  <button type="button" class="btn btn-light" @click="copyLink"><i class="bi bi-copy"></i></button>
                </div>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>
</Transition>

</template>


<script>

import { computed, ref, Transition } from 'vue';
import { mapState, useStore } from 'vuex';

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
      directoryName: "",
      sharedLink: ""
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
      const fileIdsToDelete = [];
      const directoryIdsToDelete = [];

      console.log(this.selectedItems)

      this.paginatedData.forEach((item) => {
        if (this.selectedItems.includes(item.id)) {
          if (item.type === 'directory') {
            directoryIdsToDelete.push(item.id);
          } else {
            fileIdsToDelete.push(item.id);
          }
        }
      });

      const deleteData = {
        'file_ids': fileIdsToDelete,
        'directory_ids': directoryIdsToDelete
      }

      this.$store.dispatch('deleteFilesAndDirectories', deleteData);
    },

    showDirectoryModal() {
      this.modalShow = true;
      console.log(this.modalShow);
    },

    createDirectory() {
      if (this.directory_id === null) {
        this.directory_id = '';
      }
      const directoryData = {
        'name': this.directoryName,
        'parent_directory': this.directory_id
      };
      this.$store.dispatch('createDirectory', directoryData);
      this.modalShow = false;
    },

    onRowClicked(event) {
      let file_id = event.id
      this.$store.dispatch('downloadFile', file_id)

    },

    async shareFile(event) {
      let id = event.id
      const sharedLink = await this.$store.dispatch('shareLink', id);
      console.log(sharedLink);

      this.sharedLink = sharedLink;
    },

    copyLink() {
      this.$refs.sharedLink.select();
      document.execCommand('copy');
      window.getSelection().removeAllRanges();
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
