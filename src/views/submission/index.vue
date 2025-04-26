<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed } from "vue";
// 导入你的 getCodeInfo 函数
// !!! 请根据你项目的实际路径进行调整 !!!
import { getCodeInfo } from "@/router/modules/submission"; // 示例导入路径

// 假设 TableColumnList 和 PaginationResponse 类型已全局可用或从某处导入
// 如果没有全局定义，你可能需要在这里定义它们或导入
// interface TableColumnList { /* ... */ }
interface PaginationResponse<T> {
  success: boolean;
  code: number | string; // 或者 string
  message: string;
  data: {
    list: T[]; // 当前页的数据列表
    total: number; // 总记录数
    page?: number; // 可选，如果后端返回实际页码
    page_size?: number; // 可选，如果后端返回实际每页数量
    // ... 其他可能的字段
  };
  // ... 其他顶层字段
}

// --- 在 <script setup> 内部定义 Composable 函数 ---
// 这个函数包含了分页状态、加载状态、错误状态以及数据获取逻辑
// 接受一个可选的过滤参数对象
function usePaginationTable<T = any>(initialFilters: object = {}) {
  const loading = ref(true);
  const error = ref<Error | null>(null);
  // tableData 存储的是当前页的数据
  const tableData = ref<T[]>([]);

  // 分页状态，reactive 包裹
  const pagination = reactive({
    currentPage: 1, // 默认当前页
    pageSize: 10, // 默认每页数量
    total: 0, // 总记录数，初始为 0
    pageSizes: [10, 20, 50, 100], // 可选的每页数量列表
    layout: "total, sizes, prev, pager, next, jumper" // 分页控件布局 (Element Plus 风格)
  });

  // --- 异步获取数据的核心函数 ---
  async function fetchData() {
    loading.value = true;
    error.value = null;

    try {
      // 构建请求参数，结合了外部过滤器和当前分页状态
      const params = {
        ...initialFilters, // 合并初始/外部过滤参数
        page: pagination.currentPage, // 当前页码
        page_size: pagination.pageSize // 每页数量
      };

      // 调用 getCodeInfo 函数，它应该使用 GET 方法发送 params
      const response = (await getCodeInfo(params)) as PaginationResponse<T>; // 假定 getCodeInfo 返回 Promise<PaginationResponse<T>>

      // 检查后端返回的嵌套结构是否符合期望
      if (
        response &&
        response.success === true &&
        response.data &&
        Array.isArray(response.data.list) &&
        typeof response.data.total === "number"
      ) {
        // 更新表格数据为当前页的数据列表
        tableData.value = response.data.list;
        // 更新总记录数
        pagination.total = response.data.total;

        // 可选：同步前端分页状态与后端返回的实际值
        // if (response.data.page !== undefined) pagination.currentPage = response.data.page;
        // if (response.data.page_size !== undefined) pagination.pageSize = response.data.page_size;
      } else {
        console.error("API response:", response);
        throw new Error("Unexpected response format from API");
      }
    } catch (err) {
      console.error("Error fetching table data:", err);
      error.value = err as Error;
      tableData.value = [];
      pagination.total = 0;
    } finally {
      loading.value = false;
    }
  }

  // --- Event Handlers：由 pure-table 的事件触发，更新状态并触发 watch ---
  const onSizeChange = (newSize: number) => {
    pagination.pageSize = newSize;
    pagination.currentPage = 1; // 改变每页数量时重置到第一页
    // watch 会监听到变化并调用 fetchData
  };

  const onCurrentChange = (newPage: number) => {
    pagination.currentPage = newPage;
    // watch 会监听到变化并调用 fetchData
  };

  // --- Watcher: 监听分页状态变化并触发数据获取 ---
  watch(
    [() => pagination.currentPage, () => pagination.pageSize],
    () => {
      // 监听页码或每页数量变化，然后重新获取数据
      fetchData();
    },
    {
      // immediate: true 会在 watch 刚建立时执行一次。
      // 如果依赖 onMounted 初次加载，这里设为 false。
      // 如果移除 onMounted，这里设为 true 让 watch 负责初次加载。
      immediate: false
    }
  );

  // --- 生命周期钩子：组件挂载后，执行首次数据获取 ---
  onMounted(() => {
    fetchData();
  });

  // 返回组件模板需要使用的数据和方法
  return {
    loading,
    error,
    tableData, // 当前页数据
    pagination, // 分页状态对象
    onSizeChange, // size 改变事件处理函数
    onCurrentChange // page 改变事件处理函数
  };
}

// --- 在 <script setup> 的顶层调用 Composable 函数 ---
// 定义表格列 (可以移到单独的文件，这里直接写出)
// 假设 TableColumnList 类型存在
const columns /*: TableColumnList*/ = [
  // 假设类型存在
  { label: "题目", prop: "question_id" },
  { label: "结果", prop: "code_type" },
  { label: "分数", prop: "score" },
  { label: "提交日期", prop: "date" },
  { label: "源代码", prop: "source_code" }
];

// 使用上面定义的 usePaginationTable 函数
// 传递固定的过滤条件，如果需要的话
const { loading, error, tableData, pagination, onSizeChange, onCurrentChange } =
  usePaginationTable({ user_id: 8 }); // 示例：应用 user_id = 8 的过滤

// 如果你需要访问 pure-table 的方法，保留这个 ref
const tableRef = ref();

// 如果你有 loadingConfig 和 adaptiveConfig，可以在这里定义
// const loadingConfig = { text: "正在努力加载数据..." /* ... */ };
// const adaptiveConfig = { offsetBottom: 0 /* ... */ };
</script>

<template>
  <div>
    <div
      v-if="loading && tableData.length === 0 && !error"
      style=" padding: 20px;text-align: center"
    >
      正在加载数据...
    </div>
    <div
      v-else-if="error"
      style=" padding: 20px; color: red;text-align: center"
    >
      加载数据失败: {{ error.message }}
    </div>

    <div v-else-if="!error">
      <pure-table
        ref="tableRef"
        border
        adaptive
        row-key="code_id"
        alignWhole="center"
        showOverflowTooltip
        :loading="loading"
        :data="tableData"
        :columns="columns"
        :pagination="pagination"
        @page-size-change="onSizeChange"
        @page-current-change="onCurrentChange"
      />
    </div>
  </div>
</template>

<style scoped>
/* 如果需要，可以在这里添加样式 */

/* .el-pagination { margin-top: 15px; justify-content: center; } /* 示例样式，如果使用 ElPagination */
</style>
