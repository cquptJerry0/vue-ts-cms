## 二. 权限管理：什么是动态路由？实现动态路由的方案有哪些？

### 简介

动态路由是指根据用户角色、权限或其他条件，在应用运行时动态生成和注册路由。 这样可以实现细粒度的访问控制，确保用户只能看到和使用他们有权访问的应用程序部分。 本节将探讨动态路由的概念，并介绍不同的实现策略。

### 什么是动态路由？

与静态路由（所有路由都预先定义）不同，动态路由允许应用程序根据实时因素调整其导航结构。 这对于具有用户角色、权限或其他动态约束的应用程序至关重要。

### 实现动态路由的方案

#### 方案一：基于角色(Role)的动态路由管理

##### 实现方式

这种方法涉及将角色与特定的路由集合相关联。 当用户登录时，他们的角色用于确定应将哪些路由添加到 Vue Router 实例。

```javascript
// 角色对象的示例
const roles = {
  "superadmin": [/* 所有路由 */], // 例如，router.main.children
  "admin":      [/* 路由的子集 */], // 例如，过滤后的 router.main.children
  "service":    [/* 有限的路由 */],   // 例如，过滤后的 router.main.children
  "manager":    [/* 来自后端的路由 */] // 从后端以 JSON 格式获取
};
```

##### 具体实现步骤

1.  **定义所有路由：** 在前端应用程序中创建一组全面的路由配置。
2.  **获取用户角色：** 登录后，从身份验证服务或后端检索用户的角色。
3.  **将路由与角色匹配：** 使用该角色在 `roles` 对象中查找相应的路由。
4.  **动态添加路由：** 使用 `router.addRoute` 注册 Vue Router 允许的路由。

##### 优点

-   对于角色数量有限的应用程序，易于实现和维护。
-   前端控制的路由提供清晰的结构。
-   路由更改不需要后端修改。

##### 缺点

-   在处理复杂的权限场景时缺乏灵活性。
-   角色和路由之间的紧密耦合。
-   添加新角色需要修改前端代码。
-   对于大型复杂系统，可扩展性有限。

#### 方案二：基于菜单(Menu)的动态路由管理

##### 简介

此策略依赖于后端提供的菜单结构。 菜单数据包含有关路由、其关联组件以及任何必要元数据的信息。

##### 实现方式

```javascript
// 来自后端的菜单数据示例
const userMenus = [
  {
    path: '/main/analysis/overview',
    name: '概览',
    icon: 'el-icon-data-analysis',
    children: []
  },
  {
    path: '/main/system/user',
    name: '用户管理',
    icon: 'el-icon-user',
    children: []
  },
  // ...更多菜单
];

// 将菜单映射到路由的函数
function mapMenusToRoutes(userMenus) {
  const routes = [];

  userMenus.forEach(menu => {
    const route = {
      path: menu.path,
      name: menu.name, // 添加了 name 以进行路由识别
      component: () => import(`@/views${menu.path}`), // 懒加载
    };
    routes.push(route);
  });

  return routes;
}
```

##### 具体实现步骤

1.  **获取菜单数据：** 登录后，从后端检索用户的菜单数据。
2.  **将菜单映射到路由：** 将菜单数据转换为 Vue Router 兼容的路由配置。
3.  **动态注册路由：** 使用 `router.addRoute` 注册动态生成的路由。
4.  **渲染侧边栏：** 使用菜单数据动态渲染应用程序的侧边栏导航。

##### 优点

-   高度灵活，权限完全由后端控制。
-   支持细粒度的权限控制和个性化菜单。
-   前端和后端之间清晰的分离。
-   无需修改前端代码即可调整权限。
-   适用于需求经常变化的大型复杂系统。

##### 缺点

-   比基于角色的方法更难实现。
-   前端和后端之间增加的通信开销。
-   对后端数据格式的强烈依赖。
-   需要处理路由懒加载。
-   路由注册时序的潜在问题。

#### 方案选择建议

1.  **小型项目/简单角色：** 使用基于角色的方法以简化操作。
2.  **中型/大型项目/复杂权限：** 选择基于菜单的方法以获得更大的灵活性。
3.  **最佳实践：** 结合这两种方法。 使用基于菜单的方法进行 UI 显示，并实现 API 级别的权限检查。 将前端路由守卫与后端授权结合使用，以增强安全性。

对于需要高度灵活的权限管理的系统，通常首选基于菜单的方法，尤其是在同一角色中的用户可能具有不同级别的访问权限时。

## 三. 如何实现登录成功后，跳转到第一个页面？

### 简介

用户成功登录后，重要的是将他们重定向到应用程序中的适当起始位置。 本节概述了几种实现此目的的策略，从简单的固定重定向到更动态和用户感知的方法。

### 1. 固定跳转方案

这是最简单的方法，登录后将用户重定向到预定义的页面。

```javascript
// 登录成功后
router.push("/main"); // 重定向到主页
```

### 2. 基于菜单的动态跳转方案

这种方法根据用户的菜单权限动态确定第一个可访问的页面。

```javascript
async loginAccountAction(account: IAccount) {
  // 登录逻辑...

  // 获取用户菜单
  const userMenusResult = await getUserMenusByRoleId(this.userInfo.role.id);
  const userMenus = userMenusResult.data;

  // 查找第一个可访问的菜单项
  const firstMenu = findFirstMenu(userMenus);

  // 重定向到第一个可访问的页面
  router.push(firstMenu?.url || "/main");
}

// 查找第一个可访问的菜单项的函数
function findFirstMenu(userMenus) {
  if (!userMenus || userMenus.length === 0) return null;

  for (const menu of userMenus) {
    if (menu.children && menu.children.length) {
      const childMenu = findFirstMenu(menu.children);
      if (childMenu) return childMenu;
    } else {
      return menu; // 返回第一个叶节点
    }
  }

  return null;
}
```

### 3. 优化方案：缓存菜单路径映射

为了提高性能，尤其是在大型应用程序中，您可以缓存菜单路径和菜单项之间的映射。

```typescript
// 生成路径到菜单的映射
function generatePathToMenuMap(menus) {
  const pathMap = {};

  function mapMenu(menuList) {
    for (const menu of menuList) {
      pathMap[menu.path] = menu;
      if (menu.children && menu.children.length) {
        mapMenu(menu.children);
      }
    }
  }

  mapMenu(menus);
  return pathMap;
}
```

### 4. 面包屑组件的实现

#### 简介

面包屑组件帮助用户了解他们在应用程序层次结构中的当前位置。 本节演示如何创建一个动态面包屑组件，该组件可以适应当前路由。

```typescript
import { useRoute } from "vue-router";
import { computed } from "vue";
import { useStore } from "vuex"; // 或者使用 Pinia

export default {
  setup() {
    const route = useRoute();
    const store = useStore();

    // 从 store 获取用户菜单
    const userMenus = computed(() => store.state.login.userMenus);

    // 根据当前路径计算面包屑
    const breadcrumbs = computed(() => {
      const currentPath = route.path;
      return pathMapToBreadcrumbs(userMenus.value, currentPath);
    });

    // 将路径映射到面包屑的函数
    function pathMapToBreadcrumbs(menus, currentPath) {
      const breadcrumbs = [];

      function findMenu(menus, path, breadcrumbs) {
        for (const menu of menus) {
          if (menu.path === path) {
            breadcrumbs.unshift(menu);
            return true;
          } else if (menu.children && menu.children.length) {
            breadcrumbs.unshift(menu);
            if (findMenu(menu.children, path, breadcrumbs)) {
              return true;
            }
            breadcrumbs.pop();
          }
        }
        return false;
      }

      findMenu(menus, currentPath, breadcrumbs);
      return breadcrumbs;
    }

    return { breadcrumbs };
  },
};
```

### 5. 优化：动态路由参数处理

#### 简介

动态路由通常包含参数（例如，`/user/:id`）。 本节介绍如何规范化具有动态参数的路径，以正确匹配菜单项。

```typescript
function normalizePath(path) {
  // 匹配动态路由参数，例如，/user/123
  const regex = /\/[^\/]+\/\d+/;
  const match = path.match(regex);

  if (match) {
    // 将动态参数替换为通配符，例如，/user/:id
    return path.replace(regex, "/:id");
  }

  return path;
}
```

### 6. 菜单高亮显示

#### 简介

突出显示当前活动的菜单项可向用户提供视觉反馈。 本节演示如何使用 Vue Router 和 Vuex（或 Pinia）实现此目的。

```vue
<template>
  <el-menu
    :default-active="activeIndex"
    :router="true"
    @open="handleOpen"
    @close="handleClose"
    mode="vertical"
    :collapse="isCollapse"
  >
    <template v-for="item in menuList" :key="item.path">
      <el-sub-menu v-if="item.children && item.children.length" :index="item.path">
        <template #title>
          <el-icon><component :is="item.icon"></component></el-icon>
          <span>{{ item.name }}</span>
        </template>
        <el-menu-item v-for="child in item.children" :key="child.path" :index="child.path" :route="child.path">
          <el-icon><component :is="child.icon"></component></el-icon>
          <span>{{ child.name }}</span>
        </el-menu-item>
      </el-sub-menu>
      <el-menu-item v-else :index="item.path" :route="item.path">
        <el-icon><component :is="item.icon"></component></el-icon>
        <span>{{ item.name }}</span>
      </el-menu-item>
    </template>
  </el-menu>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex"; // 或者使用 Pinia

const route = useRoute();
const store = useStore();
const activeIndex = ref("");
const openedSubmenus = ref([]);

// 根据路由查找菜单路径的函数
const findMenuPath = (menus, currentPath) => {
  const menuPaths = [];

  for (const menu of menus) {
    if (menu.path === currentPath) {
      menuPaths.push(menu.path);
      return menuPaths;
    } else if (menu.children && menu.children.length) {
      const childPaths = findMenuPath(menu.children, currentPath);
      if (childPaths.length) {
        menuPaths.push(menu.path, ...childPaths);
        return menuPaths;
      }
    }
  }

  return menuPaths;
};

// 设置默认菜单状态的函数
const setDefaultMenuStatus = () => {
  activeIndex.value = route.path;

  const openedPaths = findMenuPath(store.state.menu.menuList, route.path)
    .filter((item) => item.children && item.children.length)
    .map((item) => item.path);

  openedSubmenus.value = openedPaths;
};

// 监听路由变化
watch(
  () => route.path,
  () => setDefaultMenuStatus(),
  { immediate: true },
);

// 在组件挂载时设置菜单状态
onMounted(() => {
  setDefaultMenuStatus();
});
</script>
```

### 7. 处理刷新页面的情况

#### 简介

刷新页面时，需要恢复菜单状态以提供一致的用户体验。 本节介绍两种处理页面刷新的方法。

#### 方法一：使用路由信息

```javascript
onMounted(() => {
  const savedActiveIndex = sessionStorage.getItem("activeIndex");
  const savedOpenedSubmenus = sessionStorage.getItem("openedSubmenus");

  if (savedActiveIndex) {
    activeIndex.value = savedActiveIndex;
  }

  if (savedOpenedSubmenus) {
    openedSubmenus.value = JSON.parse(savedOpenedSubmenus);
  }

  // 如果没有保存的状态，则基于当前路由设置
  if (!savedActiveIndex) {
    setDefaultMenuStatus();
  }
});
```

### 8. 优化：状态共享与重用

#### 简介

对于较大的应用程序，最好在集中式存储（例如，Vuex 或 Pinia）中管理菜单状态，以方便跨组件的状态共享和重用。

```typescript
// store/menu.js
import { defineStore } from "pinia";

export const useMenuStore = defineStore("menu", {
  state: () => ({
    activeIndex: "",
    openedSubmenus: [],
    menuList: [],
  }),
  actions: {
    setActiveIndex(index) {
      this.activeIndex = index;
    },
    setOpenedSubmenus(submenus) {
      this.openedSubmenus = submenus;
    },
    setMenuList(menuList) {
      this.menuList = menuList;
    },
  },
  persist: true, // 可选：跨页面重新加载持久化状态
});
```

### 9. 常见页面布局

#### 简介

本节提供 CMS 中常见页面布局的示例，演示如何在实践中应用动态路由和菜单管理。

1.  **首页**

    -   欢迎信息
    -   快捷入口

2.  **仪表盘/总览页面**

    -   数据概览
    -   图表统计
    -   快捷操作

3.  **用户管理**

    -   用户列表
    -   用户创建/编辑
    -   权限分配

4.  **角色/权限管理**

    -   角色列表
    -   权限配置
    -   菜单分配

### 10. 高级功能实现

#### 批量操作

```vue
<template>
  <div class="batch-actions">
    <el-button :disabled="selectedRows.length === 0" @click="handleBatchDelete">
      批量删除
    </el-button>

    <el-button
      :disabled="selectedRows.length === 0"
      @click="handleBatchEnable(true)"
    >
      批量启用
    </el-button>

    <el-button
      :disabled="selectedRows.length === 0"
      @click="handleBatchEnable(false)"
    >
      批量禁用
    </el-button>
  </div>

  <el-table :data="tableData" @selection-change="handleSelectionChange">
    <el-table-column type="selection" width="55" />
    <!-- 其他列... -->
  </el-table>
</template>

<script setup>
import { ref } from "vue";
import { ElMessage } from 'element-plus';
import userService from '@/services/userService'; // 示例服务

const selectedRows = ref([]);
const tableData = ref([]); // 你的表格数据

const handleSelectionChange = (rows) => {
  selectedRows.value = rows;
};

const handleBatchDelete = async () => {
  // 确认删除...

  // 提交批量删除请求
  try {
    const ids = selectedRows.value.map((row) => row.id);
    await userService.batchDelete(ids);
    ElMessage.success("批量删除成功");
    fetchData(); // 刷新表格数据
  } catch (error) {
    ElMessage.error("批量删除失败");
  }
};

// 示例函数，用于获取数据（替换为你的实际实现）
const fetchData = async () => {
  // 从你的 API 获取数据
  // tableData.value = ...;
};
</script>
```

#### 导入导出功能

```vue
<template>
  <el-button @click="handleExport">导出数据</el-button>
  <el-upload
    action="#"
    :auto-upload="false"
    :on-change="handleFileChange"
    :limit="1"
  >
    <el-button type="primary">导入数据</el-button>
  </el-upload>
</template>

<script setup>
import { ElMessage } from 'element-plus';
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import userService from '@/services/userService'; // 示例服务
import { ref } from 'vue';

// 导出数据
const handleExport = async () => {
  try {
    // 获取所有数据
    const result = await userService.getList({ page: 1, size: 10000 });
    const data = result.data.list;

    // 转换数据格式
    const exportData = data.map((item) => ({
      用户名: item.name,
      真实姓名: item.realname,
      手机号: item.cellphone,
      状态: item.enable ? "启用" : "禁用",
    }));

    // 创建工作簿
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "用户数据");

    // 导出文件
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "用户数据.xlsx");
  } catch (error) {
    ElMessage.error("导出失败");
  }
};

// 导入数据
const handleFileChange = (file) => {
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      // 获取第一个工作表
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      // 转换为 JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // 转换为系统格式
      const importData = jsonData.map((item) => ({
        name: item["用户名"],
        realname: item["真实姓名"],
        cellphone: item["手机号"],
        enable: item["状态"] === "启用",
      }));

      // 提交导入
      await userService.batchImport(importData);
      ElMessage.success("导入成功");
      fetchData();
    } catch (error) {
      ElMessage.error("导入失败");
    }
  };
  reader.readAsArrayBuffer(file.raw);
};
</script>
