import request from "@/utils/request";

const AuthAPI = {
  /**
   * 登录接口
   *
   * @param username 用户名
   * @param password 密码
   * @returns 返回 token
   */
  login(data: LoginFormData): Promise<LoginResult> {
    console.log("data", data);
    return request<LoginResult>({
      url: "/api/v1/auth/login",
      method: "POST",
      data: data,
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  },

  /**
   * 微信登录接口
   *
   * @param code 微信登录code
   * @returns 返回 token
   */
  wechatLogin(code: string): Promise<LoginResult> {

    // console.log("微信登录接口wechatLogin");

    // console.log("微信登录code", code);
    //code: "0a106x000bOLFV1Pis000Tsiqh306x0u"传递的应该是字符串而不是对象

    return request<LoginResult>({
      url: "/aioveu-auth/oauth2/token",
      method: "POST",
      data: {
        code,
        grant_type: 'wechat'
      },
      header: {
        //修改你的 API 文件，使用字符串格式参数
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic bWFsbC1hcHA6MTIzNDU2' // 客户端信息Base64加密，明文：mall-app:123456
      },
    });
  },

  /**
   * 登出接口
   */
  logout(): Promise<void> {
    return request({
      url: "/aioveu-auth/oauth/logout",
      method: "DELETE",
    });
  },
};

export default AuthAPI;

/** 登录响应 */
export interface LoginResult {
  /** 访问token */
  accessToken: string;

  /** 访问token */
  access_token: string;

  /** token 类型 */
  tokenType?: string;

  /** 刷新令牌 */
  refresh_token: number;
  /** 过期时间 */
  expires_in: number;

}

export interface LoginFormData {
  username: string;
  password: string;
}
