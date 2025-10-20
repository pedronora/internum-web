import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./router";
import App from "./App.vue";
import * as bootstrap from "bootstrap/dist/js/bootstrap.bundle";
import "bootstrap-icons/font/bootstrap-icons.css";
import "@/assets/main.css";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.provide("bootstrap", bootstrap);

app.mount("#app");
