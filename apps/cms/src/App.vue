<template>
  <div class="app">
    <el-config-provider :locale="zhCn">
      <router-view></router-view>
    </el-config-provider>
  </div>
</template>
<script setup lang="ts">
  import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
  import { ElConfigProvider } from 'element-plus'
</script>

<style lang="less" scoped>
  .app {
    height: 100vh;
    width: 100vw;
  }
</style>
