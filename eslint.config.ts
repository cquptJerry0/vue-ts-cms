import pluginVue from "eslint-plugin-vue";
import {
  defineConfigWithVueTs,
  // vueTsConfigs,
} from "@vue/eslint-config-typescript";
import skipFormatting from "@vue/eslint-config-prettier/skip-formatting";
import ts from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

// 要在`.vue`文件中允许更多语言（不仅仅是`ts`），可以取消下面几行的注释：
import { configureVueProject } from "@vue/eslint-config-typescript";
configureVueProject({ scriptLangs: ["ts", "tsx"] });
// 更多信息请参考 https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    // 定义要检查的文件
    name: "app/files-to-lint",
    files: ["**/*.{ts,mts,tsx,vue}"], // 检查所有.ts、.mts、.tsx和.vue文件
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        parser: "@typescript-eslint/parser",
      },
    },
    plugins: {
      "@typescript-eslint": ts,
    },
    rules: {
      "vue/multi-word-component-names": [
        "error",
        {
          ignores: ["Login", "Main"], // 在这里添加你想要允许的组件名
        },
      ],
    },
  },

  {
    // 定义要忽略的文件
    name: "app/files-to-ignore",
    ignores: ["**/dist/**", "**/dist-ssr/**", "**/coverage/**"], // 忽略构建输出和测试覆盖率文件夹
  },

  // 使用Vue ESLint插件的基本规则集
  pluginVue.configs["flat/essential"],
  // 使用TypeScript的推荐配置
  // vueTsConfigs.recommended,
  // 跳过与Prettier冲突的格式化规则
  skipFormatting,
);
