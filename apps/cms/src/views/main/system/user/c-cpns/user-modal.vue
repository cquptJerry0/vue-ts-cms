<template>
  <div class="modal">
    <el-dialog v-model="dialogVisible" :title="isNewRef ? '新建用户' : '编辑用户'" width="30%" center>
      <div class="form">
        <el-form :model="formData" label-width="80px" size="large">
          <el-form-item label="用户名" prop="name">
            <el-input v-model="formData.name" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item label="真实姓名" prop="realname">
            <el-input v-model="formData.realname" placeholder="请输入真实姓名" />
          </el-form-item>
          <el-form-item v-if="isNewRef" label="密码" prop="password">
            <el-input v-model="formData.password" placeholder="请输入密码" show-password />
          </el-form-item>
          <el-form-item label="手机号码" prop="cellphone">
            <el-input v-model="formData.cellphone" placeholder="请输入手机号码" />
          </el-form-item>
          <el-form-item label="选择角色" prop="roleId">
            <el-select v-model="formData.roleId" placeholder="请选择角色" style="width: 100%"
              :format-label="(value: any) => entireRoles.find(role => role.id === value)?.name">
              <template v-for="item in entireRoles" :key="item.id">
                <el-option :label="item.name" :value="item.id" />
              </template>
            </el-select>
          </el-form-item>
          <el-form-item label="选择部门" prop="departmentId">
            <el-select v-model="formData.departmentId" placeholder="请选择部门" style="width: 100%"
              :format-label="(value: any) => entireDepartments.find(department => department.id === value)?.name">
              <template v-for="item in entireDepartments" :key="item.id">
                <el-option :label="item.name" :value="item.id" />
              </template>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">
            取消
          </el-button>
          <el-button type="primary" @click="handleConfirmClick">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import useMainStore from '@/store/main/main'
import useSystemStore from '@/store/main/system/system'

//  1.定义内部属性
const dialogVisible = ref(false)
const formData = reactive<any>({
  name: '',
  realname: '',
  password: '',
  cellphone: '',
  roleId: '',
  departmentId: ''
})
const isNewRef = ref(true)
const editData = ref()

// 2.获取roles/department数据
const mainStore = useMainStore()
const systemStore = useSystemStore()
const { entireRoles, entireDepartments } = storeToRefs(mainStore)

// 添加计算属性
const currentRoleName = computed(() => {
  const role = entireRoles.value.find(item => item.id === formData.roleId)
  return role?.name ?? ''
})

const currentDepartmentName = computed(() => {
  const department = entireDepartments.value.find(item => item.id === formData.departmentId)
  return department?.name ?? ''
})

// 3. 定义设置dialogVisible方法
async function setModalVisible(isNew: boolean = true, itemData?: any) {
  // 确保数据加载完成
  await mainStore.fetchEntireDataAction()

  dialogVisible.value = true
  isNewRef.value = isNew

  // 重置表单
  for (const key in formData) {
    formData[key] = ''
  }

  if (!isNew && itemData) {
    // 编辑数据
    for (const key in formData) {
      formData[key] = itemData[key]
    }
    editData.value = itemData
  } else {
    editData.value = null
  }
}

// 3.点击确定的逻辑
function handleConfirmClick() {
  dialogVisible.value = false
  if (!isNewRef.value && editData.value) {
    //  编辑数据
    systemStore.editUserDataAction(editData.value.id, formData)
  } else {
    // 新建数据
    systemStore.newUserDataAction(formData)
  }
}

// 暴露出去给父组件用
defineExpose({ setModalVisible })
</script>

<style lang="css" scoped></style>
