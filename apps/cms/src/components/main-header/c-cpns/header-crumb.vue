<template>
  <div class="breadcrumb">
    <el-breadcrumb :separator-icon="ArrowRight">
      <template
        v-for="item in breadcrumbs"
        :key="item.name"
      >
        <el-breadcrumb-item :to="{ path: item.path }">
          {{ item.name }}
        </el-breadcrumb-item>
      </template>
    </el-breadcrumb>
  </div>
</template>

<script setup lang="ts">
  import { ArrowRight } from '@element-plus/icons-vue'
  import { mapPathToBreadcrumb } from '@cms/utils'
  import useLoginStore from '@/store/login/login'
  import { useRoute } from 'vue-router'
  import { computed } from 'vue'
  const loginStore = useLoginStore()
  const route = useRoute()
  const breadcrumbs = computed(() => {
    return mapPathToBreadcrumb(
      route.path,
      loginStore.userMenus,
    )
  })
</script>
