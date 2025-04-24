/// <reference types="vite/client" />
/// <reference types="vue" />
/// <reference path="./src/types/vue-shim.d.ts" />
/// <reference path="./src/types/cms-utils.d.ts" />
/// <reference path="./src/types/store.d.ts" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
declare module 'element-plus/dist/locale/zh-cn.mjs'
