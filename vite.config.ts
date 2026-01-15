import { defineConfig, type UserConfig, type ConfigEnv, loadEnv } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import AutoImport from "unplugin-auto-import/vite";
import { resolve } from "path";

export default defineConfig(async ({ mode }: ConfigEnv): Promise<UserConfig> => {
  const UnoCss = await import("unocss/vite").then((i) => i.default);
  const env = loadEnv(mode, process.cwd());

  return {

    // 您问到了一个很好的问题！这确实是很多开发者都会遇到的困惑。让我解释一下为什么之前可以，现在不行：
/*    主要原因是：Sass 编译器升级了
  1. Sass 1.78.0+ 版本更严格
  从 Sass 1.78.0 版本开始，编译器对单位运算的检查变得更加严格：
  之前（Sass 1.77.0 及以下）：
  font-size: 16px + 2upx;  // ✅ 可以编译，但会警告
  现在（Sass 1.78.0+）：
font-size: 16px + 2upx;  // ❌ 编译错误

*/


    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/variables.scss";`  // 全局注入变量
        }
      }
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),  // 确保这行存在
      },
    },
    server: {
      host: "0.0.0.0",
      port: +env.VITE_APP_PORT,
      open: true,
      // 代理配置只在 H5（浏览器）开发时生效。 其他平台（如小程序、App）在开发时不使用 Vite 的开发服务器，它们直接运行在各自的环境中。

      proxy: {
        [env.VITE_APP_BASE_API]: {
          changeOrigin: true,
          target: env.VITE_APP_API_URL,
          rewrite: (path) => path.replace(new RegExp("^" + env.VITE_APP_BASE_API), ""),
        },

        //小程序不需要代理
        //问题在于：你的登录接口路径是 /aioveu-auth/oauth2/token，并不以 /api开头，所以不会被代理到 http://localhost:9999，
        // 而是被发送到了 Vite 的开发服务器 http://192.168.1.2:9000！
        [env.VITE_APP_LOGIN_API]: {
          changeOrigin: true,
          target: env.VITE_APP_API_URL
        },

      },
    },
    plugins: [
      // https://github.com/unocss/unocss
      UnoCss(),
      AutoImport({
        imports: ["vue", "uni-app"],
        dts: "src/types/auto-imports.d.ts", // 自动生成的类型声明文件
        eslintrc: {
          enabled: false,
        },
      }),

      uni()

    ],


  };
});
