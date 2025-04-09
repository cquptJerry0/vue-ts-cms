<template>
  <div class="search">
    <!-- 1.输入搜索关键字的表单 -->
    <el-form :model="searchForm" ref="formRef" class="demo-form-inline" size="large" label-width="80px">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="用户名">
            <el-input v-model="searchForm.name" placeholder="请输入用户名" clearable prop="name" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="真实姓名">
            <el-input v-model="searchForm.realName" placeholder="请输入真实姓名" clearable prop="realName" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="手机号">
            <el-input v-model="searchForm.cellphone" placeholder="请输入手机号" clearable prop="cellphone" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="状态">
            <el-select v-model="searchForm.enable" placeholder="请输入查询的状态" style="width: 100%" clearable prop="enable">
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="创建时间">
            <el-date-picker v-model="searchForm.createAt" type="datetimerange" start-placeholder="开始时间"
              end-placeholder="结束时间" format="YYYY-MM-DD HH:mm:ss" date-format="YYYY/MM/DD ddd" time-format="A hh:mm:ss"
              prop="createAt" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <!-- 2.搜索和重置按钮 -->
    <div class="btns">
      <el-button icon="Refresh" @click="onReset">
        重置
      </el-button>
      <el-button type="primary" @click="onSubmit">
        搜索
      </el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import type { ElForm } from 'element-plus'
const searchForm = reactive({
  name: '',
  realName: '',
  cellphone: '',
  enable: 1,
  createAt: [],
})

// 重置操作
const formRef = ref<InstanceType<typeof ElForm>>()
const onReset = () => {
  console.log(formRef.value)
  formRef.value?.resetFields()
}

// 搜索操作
const onSubmit = () => {
  console.log('submit!')
}
</script>

<style lang="less" scoped>
.search {
  background-color: #fff;
  padding: 20px;


  .el-form-item {
    padding: 20px 30px;
    margin-bottom: 0;
  }

  .btns {
    text-align: right;
    padding: 0 50px 10px 0;

    .el-button {
      height: 36px;
    }
  }
}
</style>
