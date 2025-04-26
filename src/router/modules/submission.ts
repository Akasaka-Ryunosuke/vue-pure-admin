// 最简代码，也就是这些字段必须有
import { chatai } from "@/router/enums";
import { http } from "@/utils/http";
import { codeInfoUrlPrefix } from "@/api/utils";
import type { RefreshTokenResult } from "@/api/user";

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

export const getCodeInfo = (data?: object) => {
  return http.request<RefreshTokenResult>("get", codeInfoUrlPrefix("/list"), {
    params: data // 将 data 对象作为 params 的值传递
  });
};
