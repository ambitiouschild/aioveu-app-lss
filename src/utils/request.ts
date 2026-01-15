import { getToken, clearAll } from "@/utils/cache";
import { ResultCodeEnum } from "@/enums/ResultCodeEnum";



/**
 * 手动构建 URL 编码的参数字符串
 * 兼容微信小程序环境（没有 URLSearchParams 和 FormData）
 */
const buildQueryString = (data: any): string => {
  if (typeof data !== 'object' || data === null) {
    return String(data);
  }

  const parts: string[] = [];
  Object.keys(data).forEach(key => {
    const value = data[key];
    if (value !== undefined && value !== null) {
      // 对键和值进行 URL 编码
      const encodedKey = encodeURIComponent(key);
      const encodedValue = encodeURIComponent(String(value));
      parts.push(`${encodedKey}=${encodedValue}`);
    }
  });

  return parts.join('&');
};


/**
 * 处理数据格式
 * 如果是 application/x-www-form-urlencoded 类型，将对象转换为字符串
 * 完全兼容微信小程序环境
 */
const processData = (data: any, contentType?: string) => {
  // console.log("🔄 开始处理数据格式");
  // console.log("输入数据:", data);
  // console.log("数据类型:", typeof data);
  // console.log("Content-Type:", contentType);

  if (contentType && contentType.includes('application/x-www-form-urlencoded')) {
    // console.log("✅ 检测到 x-www-form-urlencoded 格式");

    // 如果是对象，转换为字符串
    if (typeof data === 'object' && data !== null) {
      // console.log("📦 数据是对象，开始转换...");

      // 使用手动构建函数
      const result = buildQueryString(data);
      // console.log("✅ 转换结果:", result);
      return result;
    } else if (typeof data === 'string') {
      // console.log("📄 数据已经是字符串格式");
      return data;
    }
  }

  // console.log("ℹ️ 不需要转换，直接返回");
  return data;
};

/**
 * 请求拦截器
 */
const requestInterceptor = (config: any) => {
  // console.log("🔧 请求拦截器处理", config);

  // 判断请求是否需要认证
  if (config.header?.auth === true) {
    const token = getToken();
    if (token) {
      config.header.Authorization = `Bearer ${token}`;
    }
  }

  return config;
};

/**
 * 响应拦截器
 */
const responseInterceptor = (response: any) => {
  // console.log("🔧 响应拦截器处理", response);

  const resData = response.data;
  const config = response.config;

  // 如果状态码是 401，处理认证失败
  if (response.statusCode === 401) {
    console.error("❌ 认证失败，状态码 401");
    return Promise.reject({
      code: 'AUTH_ERROR',
      message: '认证失败',
      response
    });
  }

  // 处理业务错误码
  if (resData.code === 'A0230') { // token过期
    uni.showToast({
      title: '会话已过期，请重新登录',
      success() {
        uni.navigateTo({
          url: `/pages/login/login`,
        });
      }
    });
    return Promise.reject(resData);
  }

  return resData;
};

/**
 * 统一的请求函数
 */
export default function request<T>(options: UniApp.RequestOptions): Promise<T> {
  // console.log("=== 开始请求处理 ===");

  // 1. 记录环境变量
  // console.log("🔍 环境变量检查:", {
  //   "VITE_APP_API_URL": import.meta.env.VITE_APP_API_URL,
  //   "VITE_APP_BASE_API": import.meta.env.VITE_APP_BASE_API,
  //   "MODE": import.meta.env.MODE,
  //   "BASE_URL": import.meta.env.BASE_URL
  // });

  // 2. 记录传入的配置
  // console.log("🔍 传入的配置:", {
  //   url: options.url,
  //   method: options.method,
  //   data: options.data,
  //   header: options.header
  // });

  // 3. 检查URL和方法是否正确
  // if (options.url.includes('/login')) {
  //   console.error("❌ 警告：传入的URL包含/login，这可能被其他地方修改了！");
  //   console.error("❌ 原始URL应该是: /aioveu-auth/oauth2/token");
  // }
  //
  // if (options.method === 'GET' && options.url.includes('/oauth2/token')) {
  //   console.error("❌ 警告：登录接口应该是POST方法，但传入的是GET！");
  // }

  // 4. 确定baseApi
  let baseApi = import.meta.env.VITE_APP_API_URL;
  // console.log("1️⃣ 初始baseApi (from VITE_APP_API_URL):", baseApi);

  // if (baseApi.includes('192.168.1.2')) {
  //   console.error("❌ 发现硬编码的旧地址192.168.1.2！");
  // }

  // #ifdef H5
  baseApi = import.meta.env.VITE_APP_BASE_API;
  // console.log("2️⃣ H5环境下baseApi (from VITE_APP_BASE_API):", baseApi);
  // #endif

  // console.log("3️⃣ 最终使用的baseApi:", baseApi);

  // 5. 处理请求配置
  const processedConfig = { ...options };

  // 应用请求拦截器
  try {
    Object.assign(processedConfig, requestInterceptor(processedConfig));
  } catch (error) {
    console.error("请求拦截器错误:", error);
    return Promise.reject(error);
  }

  // 处理数据格式
  const contentType = processedConfig.header?.['Content-Type'] || processedConfig.header?.['content-type'];
  processedConfig.data = processData(processedConfig.data, contentType);


  // 6. 创建完整URL
  const fullUrl = `${baseApi}${processedConfig.url}`;
  // console.log("4️⃣ 拼接的完整URL:", fullUrl);
  //
  // console.log("=== 结束请求处理参数 ===");

  return new Promise((resolve, reject) => {
    // console.log("🔧 创建Promise对象");

    // 构建最终请求头
    const requestHeaders = { ...processedConfig.header };

    // 关键：只有在没有Authorization头且有token时，才添加Bearer token
    if (!requestHeaders.Authorization) {
      const token = getToken();
      if (token) {
        requestHeaders.Authorization = `Bearer ${token}`;
      }
    }

    // console.log("🔧 最终请求配置:", {
    //   url: fullUrl,
    //   method: processedConfig.method,
    //   data: processedConfig.data,
    //   header: requestHeaders
    // });

    // 发起请求
    uni.request({
      url: fullUrl,
      method: processedConfig.method,
      data: processedConfig.data,
      header: requestHeaders,
      success: (response) => {
        console.log("✅ 请求成功回调");
        // console.log("响应状态码:", response.statusCode);
        // console.log("响应数据:", response.data);
        // console.log("响应头:", response.header);

        const responseWithConfig = {
          ...response,
          config: processedConfig
        };

        // 应用响应拦截器
        try {
          const interceptorResult = responseInterceptor(responseWithConfig);

          // 如果拦截器返回了Promise.reject，走失败流程
          if (interceptorResult && interceptorResult.then && interceptorResult.catch) {
            interceptorResult
              .then(resolve)
              .catch(reject);
            return;
          }

          // 正常处理业务响应
          const resData = response.data as ResponseData<T>;

          if (resData.code === ResultCodeEnum.SUCCESS) {

            //这里已经进行了数据解构
            resolve(resData.data);
          } else if (resData.code === ResultCodeEnum.TOKEN_INVALID) {
            console.log("令牌失效或过期处理");
            clearAll();
            uni.reLaunch({
              url: "/packageA/pages/login/login",
            });
            reject(resData);
          } else {
            uni.showToast({
              title: resData.msg || "业务处理失败",
              icon: "none",
            });
            reject({
              message: resData.msg || "业务处理失败",
              code: resData.code,
            });
          }
        } catch (error) {
          console.error("响应拦截器错误:", error);
          reject(error);
        }
      },
      fail: (error) => {
        console.log("❌ 请求失败:", error);

        // 网络错误处理
        let errorMessage = "网络请求失败";
        if (error.errMsg) {
          if (error.errMsg.includes("fail") || error.errMsg.includes("timeout")) {
            errorMessage = "网络连接失败，请检查网络";
          }
        }

        uni.showToast({
          title: errorMessage,
          icon: "none",
          duration: 2000,
        });

        reject({
          message: errorMessage,
          error,
        });
      },
    });
  });
}
