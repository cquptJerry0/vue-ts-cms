<template>
  <div class="login-panel">
    <h1 class="title">CMS后台管理系统</h1>

    <div class="tabs">
      <el-tabs
        type="border-card"
        stretch
        v-model="activeName"
      >
        <el-tab-pane name="account">
          <template #label>
            <div class="label">
              <el-icon>
                <UserFilled />
              </el-icon>
              <span class="text">账号登录</span>
            </div>
          </template>
          <pane-account ref="accountRef" />
        </el-tab-pane>

        <el-tab-pane name="phone">
          <template #label>
            <div class="label">
              <el-icon>
                <Callphone />
              </el-icon>
              <span class="text">手机登录</span>
            </div>
          </template>
          <pane-phone />
        </el-tab-pane>
      </el-tabs>
    </div>

    <div class="controls">
      <el-checkbox
        v-model="isRemPwd"
        label="记住密码"
        size="large"
      />
      <el-link type="primary">忘记密码</el-link>
    </div>
    <el-button
      class="login-btn"
      type="primary"
      size="large"
      @click="handleLoginBtnClick"
    >
      立即登录
    </el-button>
  </div>
</template>

<script setup lang="ts">
  import paneAccount from './pane-account.vue'
  import panePhone from './pane-phone.vue'
  import { ref, watch } from 'vue'
  import { localCache } from '@/utils/cache'

  const activeName = ref('account')
  const isRemPwd = ref<boolean>(
    localCache.getCache('isRemPwd') ?? false,
  )
  watch(isRemPwd, (newValue) => {
    localCache.setCache('isRemPwd', newValue)
  })

  const accountRef = ref<InstanceType<typeof paneAccount>>()

  function handleLoginBtnClick() {
    if (activeName.value === 'account') {
      accountRef.value?.loginAction(isRemPwd.value)
    } else {
      console.log('用户在进行手机登录')
    }
  }
</script>

<style lang="less" scoped>
  .login-panel {
    width: 330px;
    margin-bottom: 150px;

    .title {
      text-align: center;
      margin-bottom: 15px;
    }

    .lable {
      display: flex;
      align-items: center;
      justify-content: center;

      .text {
        margin-left: 5px;
      }
    }

    .controls {
      margin-top: 12px;
      display: flex;
      justify-content: space-between;
    }

    .login-btn {
      margin-top: 10px;
      width: 100%;
    }
  }
</style>
