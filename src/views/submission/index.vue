<script setup lang="ts">
import { tableData } from "@/views/table/base/data";

defineOptions({
  // name 作为一种规范最好必须写上并且和路由的name保持一致
  name: "Submission"
});

const columns: TableColumnList = [
  {
    label: "题目",
    prop: "problem"
  },
  {
    label: "结果",
    prop: "result"
  },
  {
    label: "分数",
    prop: "score"
  },
  {
    label: "提交日期",
    prop: "date"
  },
  {
    label: "源代码",
    prop: "source_code"
  }
];
</script>

<template>
  <pure-table :data="tableData" :columns="columns" stripe />
</template>
