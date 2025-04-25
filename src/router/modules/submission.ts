// 最简代码，也就是这些字段必须有
import { chatai } from "@/router/enums";

export default {
  path: "/submission",
  redirect: "/submission/index",
  meta: {
    icon: "ri/chat-search-line",
    title: "submission",
    rank: chatai
  },
  children: [
    {
      path: "/submission/index",
      name: "Submission",
      component: () => import("@/views/submission/index.vue"),
      meta: {
        title: "提交记录"
      }
    }
  ]
};
