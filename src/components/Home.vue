<template>
  <div class="container">

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
    <div class="card bg-light">
      <div class="row">
        <div class="col-4">
          <button class="btn btn-danger" @click="deleteFile()">
            Delete &nbsp;&nbsp;<i class="fas fa-trash-alt"></i>
          </button>
        </div>
        <div class="col-cols-4 col-md-auto">
          <div class="card bg-light" v-if="status">
            <div class="card-text" style="margin-right: 50px;">
              <strong>{{ selectedDataSizes.length }}</strong> File(s) selected
            </div>
            <div class="card-text">
              Total size: <strong>{{ selectedDataTotal }}</strong>
            </div>
          </div>
        </div>
      </div>

      <hr />

      <!-- PART-1: LIST FILES -->
      <ag-grid-vue style="width: 100%; height: 500px; border: 1px solid #e7e9ea; border-radius: 4px;"
                   class="ag-theme-material"
                   :row-height=60
                   :columnDefs="columnDefs"
                   :gridOptions="gridOptions"
                   :autoGroupColumnDef="autoGroupColumnDef"
                   :frameworkComponents="frameworkComponents"
                   :suppressRowClickSelection="true"
                   :groupSelectsChildren="true"
                   :debug="true"
                   :rowSelection="rowSelection"

                   :defaultColDef="{
                              enableValue: true,
                              sortable: true,
                              resizable: true,
                              filter: true
                              }"

                   :enableRangeSelection="true"
                   animateRows
                   @rowClicked = "onRowClicked"
                   @rowSelected = "onRowSelected"
                   :paginationAutoPageSize="true"
                   :pagination="true"
                   @gridReady="onGridReady"
                   :rowData="rowData">
      </ag-grid-vue>
    </div>

    <!-- PART-3: DELETE FILE(S) -->
    <!-- Modal Component -->
    <div class="modal" v-if="mShow" v-on:change="modal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-body">
            Selected file(s) will be deleted?
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary" @click="handleOk">OK</button>
            <button class="btn btn-secondary" @click="$emit('close')">Cancel</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>


<script>
import { AgGridVue } from "ag-grid-vue3"
import filetypeCellRenderer from "../filetypeCellRenderer.js" // uploaded file type validator

import { mapState } from 'vuex'
import { sizeFormatter, dateFormatter } from '../utils' // Ag-grid display format for file size and date

export default {
  data() {
    return {
      selFile: null,
      columnDefs: null,
      autoGroupColumnDef: null,
      frameworkComponents: null,
      rowSelection: null,
      gridOptions: {},
      modal: false,
      mShow: false,
      result_id: null,
      status: false,
      selectedDataSizes: [],
      selectedDataTotal: 0
    }
  },
  components: {
    AgGridVue
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
    this.$store.dispatch('loadFiles')
    this.gridOApi = this.gridOptions.api;
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
@import "ag-grid-community/styles/ag-theme-material.css";

.ag-theme-material {
  font-size: 16px;
}

.ag-theme-material .ag-row,
.ag-theme-material .ag-row:not(.ag-row-first) {
  padding-top: 7px;
}

.ag-cell-focus,
.ag-cell-no-focus {
  border: none !important;
}

.ag-root-wrapper-body.ag-layout-normal {
  border-radius: 4px;
}

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
