import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import axios from 'axios'
import store from './store'
import router from './router'

const app = createApp(App)

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.js';

import { library } from '@fortawesome/fontawesome-svg-core'

import {
        faFilePdf,
        faFileImage,
        faFileExcel,
        faFilePowerpoint,
        faFileWord,
        faFileVideo,
        faFileArchive,
        faFileAlt,
        faFile,
        faTrashAlt,
        faUpload,
        faTasks,
       } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(
    faFilePdf,
    faFileImage,
    faFileExcel,
    faFilePowerpoint,
    faFileWord,
    faFileVideo,
    faFileArchive,
    faFileAlt,
    faFile,
    faTrashAlt,
    faUpload,
    faTasks
  )
app.use(store);
app.use(router);

app.component('font-awesome-icon', FontAwesomeIcon)

app.config.productionTip = false

axios.defaults.baseURL = 'http://localhost:9001'
axios.defaults.withCredentials = true
axios.defaults.xsrfHeaderName = "X-CSRFToken"
axios.defaults.xsrfCookieName = 'csrftoken'


app.mount('#app')