<template>
  <div class="main">
    <el-container class="main-content">
      <el-aside :width="isFold ? '60px' : '200px'">
        <main-menu :is-fold="isFold"></main-menu>
      </el-aside>
      <el-container>
        <el-header height="50px">
          <main-header @fold-change="handleFoldChange" />
        </el-header>
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
  import MainMenu from '@/components/main-menu/main-menu.vue'
  import mainHeader from '@/components/main-header/main-header.vue'
  import { ref } from 'vue'
  const isFold = ref<boolean>(false)
  function handleFoldChange(flag: boolean) {
    isFold.value = flag
  }
</script>

<style lang="less" scoped>
  .main {
    height: 100%;
  }

  .main-content {
    height: 100%;

    .el-aside {
      overflow-x: hidden;
      overflow-y: auto;
      line-height: 200px;
      text-align: left;
      cursor: pointer;
      background-color: #001529;
      scrollbar-width: none;
      /* firefox */
      -ms-overflow-style: none;
      /* IE 10+ */

      transition: width 0.3s ease;

      &::-webkit-scrollbar {
        display: none;
      }
    }

    .el-main {
      background-color: #f0f2f5;
    }
  }
</style>
