## 二. 权限管理：什么是动态路由？实现动态路由的方案有哪些？

### 什么是动态路由？

动态路由是指根据用户角色、权限或其他条件，在应用运行时动态生成和注册路由，而非在应用初始化时静态定义所有路由。这样可以实现基于用户权限的精确页面访问控制。

### 实现动态路由的方案

#### 方案一：基于角色(Role)的动态路由管理

##### 实现方式

```javascript
const roles = {
  "superadmin": [所有路由], // => router.main.children
  "admin": [一部分路由],    // => 筛选router.main.children
  "service": [少部分路由],  // => 筛选router.main.children
  "manager": [] => 重新发布/后端返回这个对象(json数据, 后端必须按特定这个json)
}
```

##### 具体实现步骤

1. 前端预定义所有路由配置
2. 用户登录后获取角色信息(role)
3. 根据角色从预设的roles对象中匹配对应的路由权限
4. 使用Vue Router的`addRoute`方法动态添加路由

##### 优点

- 前端掌控全局路由，结构清晰
- 实现简单，维护方便
- 路由变更不依赖后端，前端可独立修改
- 适合角色类型固定且分工明确的系统

##### 缺点

- 灵活性较差，新增角色需修改前端代码
- 角色与权限耦合度高，难以实现细粒度权限控制
- 前后端分离不彻底，后端权限变更需同步修改前端
- 扩展性有限，难以应对复杂的权限场景

#### 方案二：基于菜单(menu)的动态路由管理

##### 实现方式

```javascript
// 后端返回的菜单数据结构示例
const userMenus = [
  {
    path: '/main/analysis/overview',
    name: '核心技术',
    children: [...]
  },
  {
    path: '/main/system/user',
    name: '用户管理',
    children: [...]
  }
  // ...更多菜单
];

// 前端处理
function mapMenusToRoutes(userMenus) {
  const routes = [];
  // 遍历菜单，转换为路由对象
  userMenus.forEach(menu => {
    // 路由映射逻辑
    const route = {
      path: menu.path,
      component: () => import(`@/views${menu.path}`)
    };
    routes.push(route);
  });
  return routes;
}
```

##### 具体实现步骤

1. 用户登录后从后端获取菜单数据
2. 前端将菜单数据转换为路由配置
3. 动态注册路由
4. 根据菜单数据渲染侧边栏

##### 优点

- 灵活性极高，权限完全由后端控制
- 支持细粒度的权限控制和个性化菜单
- 前后端分离彻底，权限逻辑集中在后端
- 无需修改前端代码即可调整权限
- 适合复杂多变的大型系统

##### 缺点

- 实现相对复杂，需要设计合理的菜单-路由映射机制
- 增加了前后端通信成本
- 对后端数据格式依赖性强
- 需要处理路由懒加载的问题
- 可能存在路由注册时机的问题

#### 方案选择建议

1. **小型项目或角色单一**：选择基于角色的方案，实现简单明了
2. **中大型项目或权限复杂**：选择基于菜单的方案，灵活性更高
3. **最佳实践**：结合两种方案
   - 使用菜单方案控制界面显示
   - 同时在API请求层面加入权限验证
   - 前端路由守卫配合后端权限校验

当系统需要高度灵活的权限管理，特别是当不同用户即使在同一角色下也可能有不同权限时，基于菜单的方案无疑是更好的选择。

## 三. 如何实现登录成功后，跳转到第一个页面？

实现登录成功后跳转到第一个有权限的页面，有以下几种方案：

### 1. 固定跳转方案

最简单的方式是在登录成功后直接跳转到主页或固定的默认页面：

```javascript
// 登录成功后
router.push("/main"); // 跳转到主页
```

### 2. 基于菜单的动态跳转方案

更灵活的方式是根据用户权限菜单，自动跳转到第一个有权限的页面：

```javascript
async loginAccountAction(account: IAccount) {
  // 登录相关代码...

  // 获取用户菜单
  const userMenusResult = await getUserMenusByRoleId(this.userInfo.role.id);
  const userMenus = userMenusResult.data;

  // 找到第一个可跳转的页面路径
  const firstMenu = findFirstMenu(userMenus);

  // 跳转到该页面
  router.push(firstMenu.url);
}

// 查找第一个可用菜单
function findFirstMenu(userMenus) {
  if (!userMenus || userMenus.length === 0) return null;

  // 遍历查找第一个叶子节点菜单
  for (const menu of userMenus) {
    if (menu.children && menu.children.length) {
      // 如果有子菜单，递归查找
      const firstSubMenu = findFirstMenu(menu.children);
      if (firstSubMenu) return firstSubMenu;
    } else {
      // 找到第一个叶子节点
      return menu;
    }
  }

  return null;
}
```

### 3. 记住上次访问页面方案

可以记住用户上次访问的页面，下次登录后直接跳转：

```javascript
// 退出登录时记住当前路径
function logout() {
  const currentPath = router.currentRoute.value.path;
  if (currentPath !== "/login") {
    localCache.setCache("lastVisitPath", currentPath);
  }
  // 其他退出登录逻辑...
}

// 登录成功后
function loginSuccess() {
  // 获取上次访问路径
  const lastPath = localCache.getCache("lastVisitPath");

  if (lastPath && hasPermission(lastPath)) {
    // 如果有权限访问上次路径，直接跳转
    router.push(lastPath);
  } else {
    // 否则跳转到第一个有权限的页面
    const firstMenu = findFirstMenu(userMenus);
    router.push(firstMenu?.url || "/main");
  }
}

// 检查是否有权限访问某路径
function hasPermission(path) {
  // 根据用户菜单检查权限...
  return true / false;
}
```

### 最佳实践

结合上述方案，实现最灵活的跳转逻辑：

1. 优先跳转到上次访问的页面（如果有权限）
2. 如果没有上次记录或无权限，跳转到第一个有权限的菜单页面
3. 如果以上都不可行，跳转到一个通用的默认页面（如首页或仪表盘）

## 四. 如何实现面包屑的效果？根据当前的路径匹配到对应菜单？

面包屑（Breadcrumb）是一种常见的导航辅助工具，显示当前页面在网站层次结构中的位置。基于路由路径实现面包屑需要以下几个步骤：

### 1. 面包屑组件的实现

使用Element Plus的Breadcrumb组件：

```vue
<template>
  <el-breadcrumb separator="/">
    <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="index">
      <span v-if="index === breadcrumbs.length - 1">{{ item.name }}</span>
      <router-link v-else :to="item.path">{{ item.name }}</router-link>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>
```

### 2. 根据路由路径匹配菜单的核心算法

面包屑的核心是根据当前路径找到对应的菜单层级：

```typescript
import { useRoute } from "vue-router";
import { computed } from "vue";
import { useStore } from "vuex"; // 或使用 Pinia

export default {
  setup() {
    const route = useRoute();
    const store = useStore();

    // 获取用户菜单
    const userMenus = computed(() => store.state.login.userMenus);

    // 根据路径计算面包屑
    const breadcrumbs = computed(() => {
      const currentPath = route.path;
      return pathMapToBreadcrumbs(userMenus.value, currentPath);
    });

    // 路径映射到面包屑
    function pathMapToBreadcrumbs(menus, currentPath) {
      const breadcrumbs = [];

      // 递归查找匹配的菜单
      function findMenu(menus, path, breadcrumbs) {
        for (const menu of menus) {
          // 创建当前菜单对应的面包屑项
          const breadcrumb = { name: menu.name, path: menu.path };

          // 如果当前菜单匹配路径
          if (menu.path === path) {
            breadcrumbs.push(breadcrumb);
            return true;
          }

          // 如果有子菜单，递归查找
          if (menu.children && menu.children.length) {
            // 先添加当前菜单到面包屑
            breadcrumbs.push(breadcrumb);

            // 在子菜单中查找
            const isFound = findMenu(menu.children, path, breadcrumbs);

            // 如果在子菜单中找到，返回true
            if (isFound) return true;

            // 如果没找到，移除当前添加的面包屑
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

### 3. 优化方案：缓存菜单路径映射

为了提高性能，可以在加载菜单时就生成路径到菜单的映射关系：

```typescript
// 生成路径到菜单的映射
function generatePathToMenuMap(menus) {
  const pathMap = new Map();

  function recurseMenus(menus, parentPath = []) {
    for (const menu of menus) {
      const currentPath = [...parentPath, menu];

      // 将当前路径添加到映射
      if (menu.path) {
        pathMap.set(menu.path, currentPath);
      }

      // 递归处理子菜单
      if (menu.children && menu.children.length) {
        recurseMenus(menu.children, currentPath);
      }
    }
  }

  recurseMenus(menus);
  return pathMap;
}

// 使用映射获取面包屑
function getBreadcrumbsFromPath(path, pathMap) {
  const menuPath = pathMap.get(path);

  if (!menuPath) return [];

  // 转换为面包屑格式
  return menuPath.map((item) => ({
    name: item.name,
    path: item.path,
  }));
}
```

### 4. 处理特殊情况

有些情况需要特殊处理：

1. **动态路由参数**：如 `/user/:id`，需要额外处理参数部分
2. **无匹配菜单**：当路径没有对应菜单时，提供默认面包屑
3. **自定义面包屑**：某些页面可能需要自定义面包屑

```typescript
// 处理动态路由参数
function normalizePath(path) {
  // 匹配动态路由参数，如 /user/123
  const regex = /\/[^\/]+\/\d+/;
  const match = path.match(regex);

  if (match) {
    // 将动态参数替换为通配符形式，如 /user/:id
    return path.replace(/\/\d+/, "/:id");
  }

  return path;
}
```

### 最佳实践总结

1. 在路由守卫中监听路径变化
2. 使用缓存的菜单路径映射快速查找面包屑
3. 支持自定义面包屑覆盖默认行为
4. 处理动态路由参数和特殊路径

## 五. ElMenu在第一次进入或者刷新的时候如何设置默认值？

在使用ElementPlus的ElMenu组件时，需要正确设置默认展开项和默认选中项，特别是在页面刷新或首次进入时。

### 1. ElMenu关键属性

ElMenu提供了以下几个关键属性来控制默认状态：

- `default-active`：默认激活菜单的index
- `default-openeds`：默认打开的子菜单的index数组
- `unique-opened`：是否只保持一个子菜单的展开

### 2. 基于当前路由设置默认值

```vue
<template>
  <el-menu
    :default-active="activeIndex"
    :default-openeds="openedSubmenus"
    :unique-opened="true"
    :router="true"
  >
    <!-- 菜单项... -->
  </el-menu>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex"; // 或使用Pinia

const route = useRoute();
const store = useStore();
const activeIndex = ref("");
const openedSubmenus = ref([]);

// 根据路由路径找到匹配的菜单项
const findMenuPath = (menus, currentPath) => {
  const menuPaths = [];

  const findPath = (menus, path, currentMenus = []) => {
    for (const menu of menus) {
      const copyMenus = [...currentMenus, menu];

      // 如果找到匹配的菜单
      if (menu.path === path) {
        return copyMenus;
      }

      // 如果有子菜单，递归查找
      if (menu.children && menu.children.length) {
        const findResult = findPath(menu.children, path, copyMenus);
        if (findResult.length) return findResult;
      }
    }

    return [];
  };

  return findPath(menus, currentPath);
};

// 设置默认激活和打开状态
const setDefaultMenuStatus = () => {
  const currentPath = route.path;
  const userMenus = store.state.login.userMenus;

  // 找到当前路径对应的菜单路径
  const menuPath = findMenuPath(userMenus, currentPath);

  if (menuPath.length) {
    // 设置激活项为当前路径
    activeIndex.value = currentPath;

    // 设置需要打开的子菜单
    const openedPaths = menuPath
      .filter((item) => item.children && item.children.length)
      .map((item) => item.path);

    openedSubmenus.value = openedPaths;
  }
};

// 监听路由变化
watch(
  () => route.path,
  () => setDefaultMenuStatus(),
  { immediate: true },
);

// 组件挂载时也设置一次
onMounted(() => {
  setDefaultMenuStatus();
});
</script>
```

### 3. 处理刷新页面的情况

当页面刷新时，需要确保菜单状态能够正确恢复。有两种方法：

#### 方法一：使用路由信息

```typescript
// 在页面加载或刷新时根据当前路由设置菜单状态
onMounted(() => {
  // 获取当前路径
  const currentPath = route.path;

  // 设置默认激活菜单
  activeIndex.value = currentPath;

  // 找到需要打开的子菜单
  // ...
});
```

#### 方法二：保存状态到本地存储

```typescript
// 将菜单状态保存到localStorage
watch(
  () => route.path,
  (newPath) => {
    // 保存当前激活的菜单项
    localStorage.setItem("activeMenuIndex", newPath);

    // 保存打开的子菜单
    localStorage.setItem(
      "openedSubmenus",
      JSON.stringify(openedSubmenus.value),
    );
  },
);

// 在页面加载时恢复菜单状态
onMounted(() => {
  const savedActiveIndex = localStorage.getItem("activeMenuIndex");
  const savedOpenedSubmenus = localStorage.getItem("openedSubmenus");

  if (savedActiveIndex) {
    activeIndex.value = savedActiveIndex;
  }

  if (savedOpenedSubmenus) {
    openedSubmenus.value = JSON.parse(savedOpenedSubmenus);
  }

  // 如果没有保存的状态，则根据当前路由设置
  if (!savedActiveIndex) {
    setDefaultMenuStatus();
  }
});
```

### 4. 优化：状态共享与重用

如果多个组件需要使用菜单状态，可以将状态抽离到store中：

```typescript
// store/menu.js
export const useMenuStore = defineStore("menu", {
  state: () => ({
    activeIndex: "",
    openedSubmenus: [],
  }),

  actions: {
    setMenuStatus(path) {
      this.activeIndex = path;

      // 计算需要打开的子菜单
      // ...

      // 可以选择保存到localStorage
    },

    restoreMenuStatus() {
      // 从localStorage恢复或根据当前路由计算
    },
  },
});

// 组件中使用
const menuStore = useMenuStore();
onMounted(() => {
  menuStore.restoreMenuStatus();
});
```

### 最佳实践

1. 使用`watch`监听路由变化，自动设置菜单默认值
2. 对于刷新页面情况，结合localStorage保存状态
3. 将菜单状态管理逻辑抽离到独立的store或hooks中
4. 预先处理菜单数据，生成路径到菜单的映射，提高查找效率

## 六. 后台管理通常页面包括哪些功能？是如何实现增删改查的？

### 后台管理系统常见功能页面

1. **登录/认证页面**

   - 用户登录
   - 多因素认证
   - 忘记密码

2. **仪表盘/总览页面**

   - 数据概览
   - 图表统计
   - 快捷操作区

3. **用户管理**

   - 用户列表
   - 用户创建/编辑
   - 权限分配

4. **角色/权限管理**

   - 角色列表
   - 权限配置
   - 菜单分配

5. **系统管理**

   - 系统设置
   - 菜单管理
   - 日志查看

6. **数据管理页面**

   - 各种业务数据的CRUD操作
   - 数据导入/导出
   - 批量操作

7. **个人中心**
   - 个人信息
   - 修改密码
   - 操作记录

### 增删改查(CRUD)实现方案

CRUD是后台管理系统的核心功能，下面介绍常见的实现方式：

#### 1. 基础组件封装

封装通用组件减少重复代码：

```vue
<!-- 通用表格组件 -->
<template>
  <div class="common-table">
    <!-- 表格头部操作区 -->
    <div class="table-header">
      <slot name="header"></slot>
      <el-button type="primary" @click="handleAdd">新建</el-button>
    </div>

    <!-- 表格主体 -->
    <el-table
      :data="tableData"
      v-loading="isLoading"
      border
      style="width: 100%"
    >
      <slot></slot>

      <!-- 操作列 -->
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button type="text" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="text" @click="handleDelete(scope.row)"
            >删除</el-button
          >
          <slot name="extraActions" :row="scope.row"></slot>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        @current-change="handlePageChange"
        layout="total, sizes, prev, pager, next, jumper"
      />
    </div>

    <!-- 表单弹窗 -->
    <el-dialog
      :title="isEdit ? '编辑' : '新建'"
      v-model="dialogVisible"
      width="500px"
    >
      <slot name="form" :form="form" :isEdit="isEdit"></slot>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
```

#### 2. 数据请求封装

使用service层封装API请求：

```typescript
// services/crud-service.ts
import { hyRequest } from "@/service";

export default class CrudService {
  private baseUrl: string;

  constructor(url: string) {
    this.baseUrl = url;
  }

  // 获取列表
  async getList(params: any) {
    return hyRequest.post({
      url: this.baseUrl + "/list",
      data: params,
    });
  }

  // 创建
  async create(data: any) {
    return hyRequest.post({
      url: this.baseUrl,
      data,
    });
  }

  // 更新
  async update(id: string, data: any) {
    return hyRequest.patch({
      url: `${this.baseUrl}/${id}`,
      data,
    });
  }

  // 删除
  async delete(id: string) {
    return hyRequest.delete({
      url: `${this.baseUrl}/${id}`,
    });
  }

  // 获取详情
  async getById(id: string) {
    return hyRequest.get({
      url: `${this.baseUrl}/${id}`,
    });
  }
}
```

#### 3. CRUD页面实现

基于上述组件和服务实现具体的CRUD页面：

```vue
<!-- 用户管理页面 -->
<template>
  <div class="user-management">
    <common-table
      :tableData="tableData"
      :isLoading="isLoading"
      :currentPage="queryParams.page"
      :pageSize="queryParams.size"
      :total="total"
      @pageChange="handlePageChange"
    >
      <!-- 表格头部 -->
      <template #header>
        <el-input
          v-model="queryParams.name"
          placeholder="请输入用户名"
          style="width: 200px"
        />
        <el-button type="primary" @click="fetchData">搜索</el-button>
      </template>

      <!-- 表格列 -->
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="用户名" width="150" />
      <el-table-column prop="realname" label="真实姓名" width="150" />
      <el-table-column prop="cellphone" label="手机号" width="150" />
      <el-table-column prop="enable" label="状态">
        <template #default="scope">
          <el-tag :type="scope.row.enable ? 'success' : 'danger'">
            {{ scope.row.enable ? "启用" : "禁用" }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 表单 -->
      <template #form="{ form, isEdit }">
        <el-form :model="form" label-width="80px">
          <el-form-item label="用户名">
            <el-input v-model="form.name" :disabled="isEdit" />
          </el-form-item>
          <el-form-item label="密码" v-if="!isEdit">
            <el-input v-model="form.password" type="password" />
          </el-form-item>
          <el-form-item label="真实姓名">
            <el-input v-model="form.realname" />
          </el-form-item>
          <el-form-item label="手机号">
            <el-input v-model="form.cellphone" />
          </el-form-item>
          <el-form-item label="状态">
            <el-switch v-model="form.enable" />
          </el-form-item>
        </el-form>
      </template>
    </common-table>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import CommonTable from "@/components/common-table/index.vue";
import UserService from "@/services/user-service";

const userService = new UserService();

// 表格数据
const tableData = ref([]);
const isLoading = ref(false);
const total = ref(0);

// 查询参数
const queryParams = reactive({
  page: 1,
  size: 10,
  name: "",
});

// 表单数据
const form = reactive({
  id: "",
  name: "",
  password: "",
  realname: "",
  cellphone: "",
  enable: true,
});

// 获取数据
const fetchData = async () => {
  isLoading.value = true;
  try {
    const result = await userService.getList(queryParams);
    tableData.value = result.data.list;
    total.value = result.data.totalCount;
  } catch (error) {
    ElMessage.error("获取数据失败");
  } finally {
    isLoading.value = false;
  }
};

// 分页切换
const handlePageChange = (page) => {
  queryParams.page = page;
  fetchData();
};

// 编辑
const handleEdit = (row) => {
  // 拷贝数据到表单
  Object.assign(form, row);
  form.password = ""; // 清空密码
  dialogVisible.value = true;
  isEdit.value = true;
};

// 新增
const handleAdd = () => {
  // 重置表单
  Object.keys(form).forEach((key) => {
    form[key] = key === "enable" ? true : "";
  });
  dialogVisible.value = true;
  isEdit.value = false;
};

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm("确定要删除该用户吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      try {
        await userService.delete(row.id);
        ElMessage.success("删除成功");
        fetchData();
      } catch (error) {
        ElMessage.error("删除失败");
      }
    })
    .catch(() => {});
};

// 保存
const handleSave = async () => {
  try {
    if (isEdit.value) {
      await userService.update(form.id, form);
      ElMessage.success("更新成功");
    } else {
      await userService.create(form);
      ElMessage.success("创建成功");
    }
    dialogVisible.value = false;
    fetchData();
  } catch (error) {
    ElMessage.error("保存失败");
  }
};

// 初始化
onMounted(() => {
  fetchData();
});
</script>
```

#### 4. 表单验证与数据处理

实现数据验证和处理：

```javascript
// 表单验证规则
const rules = {
  name: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 3, max: 20, message: "长度在3到20个字符", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, message: "密码长度不能小于6位", trigger: "blur" },
  ],
  cellphone: [
    { required: true, message: "请输入手机号", trigger: "blur" },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: "请输入正确的手机号",
      trigger: "blur",
    },
  ],
};

// 提交前处理数据
const handleSave = async () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      // 处理表单数据
      const submitData = { ...form };

      // 如果是编辑模式且密码为空，则不提交密码
      if (isEdit.value && !submitData.password) {
        delete submitData.password;
      }

      // 提交数据...
    }
  });
};
```

#### 5. 高级功能实现

##### 批量操作

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
const selectedRows = ref([]);

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
    fetchData();
  } catch (error) {
    ElMessage.error("批量删除失败");
  }
};
</script>
```

##### 导入导出功能

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
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

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

      // 转换为JSON
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
```

### 最佳实践总结

1. **组件复用**：封装通用的CRUD组件，减少重复代码
2. **服务层封装**：将API请求逻辑抽象到服务层
3. **状态管理**：使用Pinia或Vuex管理全局状态
4. **权限控制**：基于用户角色控制页面和按钮权限
5. **表单验证**：统一的表单验证规则和处理
6. **响应式设计**：适配不同设备的界面布局
7. **性能优化**：
   - 分页加载大量数据
   - 虚拟滚动处理长列表
   - 延迟加载非关键组件
