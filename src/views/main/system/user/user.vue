<template>
  <div class="user">
    <user-search @query-click="handelQueryClick" @reset-click="handleResetClick" />
    <user-content ref="contentRef" @new-click="handleNewClick" @edit-click="handleEditClick" />
    <user-modal ref="modalRef" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import UserSearch from './c-cpns/user-search.vue'
import UserContent from './c-cpns/user-content.vue'
import userModal from './c-cpns/user-modal.vue'
import UserModal from './c-cpns/user-modal.vue'
// 对content组件的操作
const contentRef = ref<InstanceType<typeof UserContent>>()
function handelQueryClick(formData: any) {
  contentRef.value?.fetchUserListData(formData)
}

function handleResetClick() {
  contentRef.value?.fetchUserListData()
}

// 对model组件的操作
const modalRef = ref<InstanceType<typeof UserModal>>()
function handleNewClick() {
  console.log(12);
  console.log(modalRef.value);
  modalRef.value?.setModalVisible()
}

function handleEditClick(itemData: any) {
  modalRef.value?.setModalVisible(false, itemData)
}
</script>

<style lang="less" scoped>
.user {
  border-radius: 8px;
  overflow: hidden;
}
</style>
