<template>
  <div class="container d-flex flex-column justify-content-center">

    <br />

    <!-- PART-2: UPLOAD A FILE -->
    <div class="card bg-light">
      <input type="file" v-on:change="selFile" ref="form" class="form-control-file" />
      <button class="btn btn-primary" @click="submitFile()">
        Submit &nbsp; &nbsp;<i class="fas fa-upload"></i>
      </button>
    </div>

    <br />

    <!-- PART-3: DELETE FILE(S) -->
    <div class="d-flex flex-column bg-light">
      <div class="d-flex px-2">
        <div>
          <button class="btn btn-danger" @click="deleteFile()">
            Delete &nbsp;&nbsp;<i class="fas fa-trash-alt"></i>
          </button>
        </div>
        <div class="col-auto" v-if="status">
          <div class="card bg-light">
            <div class="card-text" style="margin-right: 50px;">
              <strong>{{ selectedDataSizes.length }}</strong> File(s) selected
            </div>
            <div class="card-text">Total size: <strong>{{ selectedDataTotal }}</strong></div>
          </div>
        </div>
      </div>

      <hr />

      <!-- PART-1: LIST FILES -->
      <div class="container">
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
            <tr v-for="item in data" :key="item.id">
              <td>
                <input type="checkbox" v-model="selectedItems" :value="item.id" />
              </td>
              <td>{{ item.name }}</td>
              <td>{{ item.type }}</td>
              <td>{{ item.size || item.date_created }}</td>
              <td>{{ item.added || '' }}</td>
              <td><button v-if="item.type !== 'directory'" type="button" class="btn btn-warning align-items-center">Download</button></td>
            </tr>
          </tbody>
        </table>
      </div>


    </div>

    <!-- PART-3: DELETE FILE(S) -->
    <!-- Modal Component -->
    <div class="modal" v-if="mShow" v-on:change="modal" tabindex="-1" role="dialog">
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

  </div>
</template>


<script>
import filetypeCellRenderer from "../filetypeCellRenderer.js" // uploaded file type validator

import { computed, ref } from 'vue';
import { mapState, useStore } from 'vuex';
import { sizeFormatter, dateFormatter } from '../utils.js'; // Ag-grid display format for file size and date

export default {

  setup() {
    const store = useStore();
    const data = computed(() => store.state.rowData);

    return {
      data,
    }
  },

  data() {
    return {
      selFile: null,
      directory_id: null,
    }
  },

  beforeMount() {
    this.columnDefs = [
      {
        headerName: 'Name',
        field: 'name',
        width: 300,
        filterParams: { newRowsAction: "keep" },
        checkboxSelection: params => {
          return params.columnApi.getRowGroupColumns().length === 0;
        },
        headerCheckboxSelection: function (params) {
          return params.columnApi.getRowGroupColumns().length === 0;
        },
      },
      {
        headerName: 'Filetype',
        field: 'filetype',
        width: 55,
        cellRenderer: 'filetypeCellRenderer',
        filterParams: { newRowsAction: "keep" },
      },
      {
        headerName: 'Size',
        field: 'size',
        valueFormatter: sizeFormatter,
        width: 55,
        filterParams: { newRowsAction: "keep" }
      },
      {
        headerName: 'Added',
        field: 'since_added',
        width: 90,
        sort: 'desc',
        valueFormatter: dateFormatter
      }
    ]

    this.frameworkComponents = {
      filetypeCellRenderer: filetypeCellRenderer
    }

    this.autoGroupColumnDef = {
      headerName: "Group",
      width: 250,
      field: "name",
      valueGetter: params => {
        if (params.node.group) {
          return params.node.key;
        } else {
          return params.data[params.colDef.field];
        }
      },
      headerCheckboxSelection: true,
      cellRenderer: "agGroupCellRenderer",
      cellRendererParams: { checkbox: true }
    };

    this.rowSelection = "multiple";

  },

  mounted() {
    const directory_id = null;
    this.$store.dispatch('loadFiles', directory_id);
  },

  computed: {
    ...mapState([
      'rowData'
    ])

  },
  methods: {

    onGridReady(params) {
      this.gridApi = params.api;
      this.columnApi = params.columnApi;
      params.api.sizeColumnsToFit();
      params.api.setRowData();
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

    submitFile() {
      if (this.selFile.size < 5 * 1024 * 1024) {
        var vm = this
        const fd = new FormData()
        fd.append('file', vm.selFile)
        this.$store.dispatch('postFile', fd)
      } else {
        alert("File size must be smaller than 5MB")
      }
    },

    deleteFile() {
      const selectedNodes = this.gridApi.getSelectedNodes()
      if (selectedNodes.length > 0) {
        const selectedData = selectedNodes.map(node => node.data);
        const result_id = selectedData.map(node => node.file_id)
        console.log(result_id)
        this.result_id = result_id
        this.mShow = true
        this.modal = true
      }
    },

    handleOk() {
      this.$store.dispatch('deleteFile', this.result_id)
      this.mShow = false
      this.status = false
    },

    onRowClicked(event) {
      let file_id = event.node.data.file_id
      let filename = event.node.data.name
      this.$store.dispatch('downloadFile', filename)

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
