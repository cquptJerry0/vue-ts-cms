import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import pinia from "./store";
import "./assets/css/index.less";

import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import registerIcons from "./global/register-icons";
const app = createApp(App);
app.use(registerIcons);
app.use(router);
app.use(pinia);
app.mount("#app");
