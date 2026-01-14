# aioveu-app

<p align="center">
    <img src="https://img.shields.io/badge/Vue-3.3.4-brightgreen.svg"/>
    <img src="https://img.shields.io/badge/Vite-4.4.11-green.svg"/>
    <img src="https://img.shields.io/badge/Element Plus-2.4.2-blue.svg"/>
    <a src="https://github.com/hxrui" target="_blank">
        <img src="https://img.shields.io/github/stars/aioveutech/aioveu-mall.svg?style=social&label=Stars"/>
    </a>
    <a href="https://gitee.com/aioveutech/aioveu-mall" target="_blank">
        <img src="https://gitee.com/aioveutech/aioveu-mall/badge/star.svg"/>
    </a> 
    <br/>
    <img src="https://img.shields.io/badge/license-Apache%20License%202.0-blue.svg"/>
    <a href="https://github.com/ambitiouschild" target="_blank">
        <img src="https://img.shields.io/badge/Author-可我不敌可爱-orange.svg"/>
    </a>
</p>
<p align="center">
<a target="_blank" href="http://admin.aioveu.tech">在线预览</a> |  <a target="_blank" href="https://juejin.cn/post/7228990409909108793">官方文档</a> 
</p>



## 项目介绍

[aioveu-app](https://github.com/ambitiouschild/aioveu-app) 是基于 [vue3-element-admin](https://gitee.com/aioveuorg/vue3-element-admin) 升级的 Vue3 版本有来商城管理前端工程；使用前端主流技术栈 Vue3 + Vite4 + TypeScript5 + Vue Router + Pinia + Volar + Element Plus 等；实现功能包括不限于动态权限路由、按钮权限控制、国际化、主题大小切换等。

## 项目优势

- 
- 全栈技术支持: 微服务接口、Vue3 管理前端、uni-app 移动端和 K8S 持续集成交付；
- 在uniapp转微信小程序过程中经验总结：总体来说对于小一点并且功能不复杂的页面，相对于使用微信小程序语法制作小程序uniapp制作还是相对快捷，uniapp在功能组件方面大于微信小程序自带组件。uniapp在语法校验没有微信小程序严格。在自作过程中遇到的问题

## 技术栈

| 技术栈 | 描述 | 官网 |
| ------ | ---- | ---- |
|        |      |      |
|        |      |      |
|        |      |      |
|        |      |      |
|        |      |      |
|        |      |      |

## 项目预览

预览地址： [http://app.aioveu.tech](http://app.aioveu.tech/)

| ![](https://s2.loli.net/2023/06/09/VkYxOTAj9h417v6.jpg) | ![](https://s2.loli.net/2023/06/09/YaWQkxz9Z2uXbtE.jpg) |
| ------------------------------------------------------- | ------------------------------------------------------- |
| ![](https://s2.loli.net/2023/06/09/YXFI7DhNQHBt6ce.jpg) | ![](https://s2.loli.net/2023/06/09/eTXSUjOg9R175DQ.jpg) |



|      |      |
| ---- | ---- |
|      |      |
|      |      |

## 项目地址

|                    | Github                                                       | Gitee                                                        | GitCode                                                      |
| ------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 开源组织           | [可我不敌可爱](https://aioveu.com)                           | [可我不敌可爱](https://aioveu.com)                           | [可我不敌可爱](https://aioveu.com)                           |
| 技术团队           | [可我不敌可爱](https://aioveu.com)                           | [可我不敌可爱](https://aioveu.com)                           | [可我不敌可爱](https://aioveu.com)                           |
| 后端               | [aioveu-server](https://github.com/ambitiouschild/aioveu-server) | [aioveu-server](https://github.com/ambitiouschild/aioveu-server) | [aioveu-server](https://github.com/ambitiouschild/aioveu-server) |
| 管理前端           | [aioveu-admin](https://github.com/ambitiouschild/aioveu-admin) | [aioveu-admin](https://github.com/ambitiouschild/aioveu-admin) | [aioveu-admin](https://github.com/ambitiouschild/aioveu-admin) |
| 小程序/H5/移动端   | [aioveu-app](https://github.com/ambitiouschild/aioveu-app)   | [aioveu-app](https://github.com/ambitiouschild/aioveu-app)   | [aioveu-app](https://github.com/ambitiouschild/aioveu-app)   |
| vue3-element-admin | aioveu-vue3-element-admin                                    |                                                              | -                                                            |

## 📁目录结构

```
aioveu-app/                        # aioveu-app项目根目录
├── .hbuilderx/                    # HBuilderX 编辑器配置目录
│   └── launch.json                # 项目运行/调试配置（端口号、启动参数等） 
├── .idea/                         # JetBrains IDE 配置文件目录（如WebStorm）  
├── api/                           # 后端API接口请求封装 
│   ├── oms/                       # 订单管理系统接口  
│   │   ├── cart.ts                # 购物车接口
│   │   └── order.ts               # 订单接口
│   ├── pms/                       # 商品管理系统接口
│   │   ├── category.ts            # 商品分类接口
│   │   └── goods.ts               # 商品接口
│   ├── sms/                       # 营销系统接口
│   │   └── advert.ts              # 广告/活动接口
│   ├── ums/                       # 用户管理系统接口
│   │   └── address.ts             # 用户地址接口
│   └── user.js                    # 用户认证接口（登录/注册等）
├── components/                    # 通用组件目录
│   ├── mix-loading/               # 自定义加载动画组件 
│   ├── uni-load-more/             # 上拉加载更多组件 
│   ├── Winglau14-lotusAddress/    # 第三方地址选择组件
│   ├── empty.vue                  # 空状态提示组件 
│   ├── mix-list-cell.vue          # 列表项组件（带图标/箭头）
│   ├── share.vue                  # 分享功能组件 
│   ├── uni-number-box.vue         # 数字增减输入框组件
│   └── upload-images.vue          # 图片上传组件
├── filters/                       # 全局过滤器 
│   └── index.js                   # 过滤器注册（如日期格式化、价格显示）
├── node_modules/                  # npm 依赖包目录（自动生成）
├── pages/                         # 业务页面目录
│   ├── address/                   # 址管理页
│   │   ├── address.vue            # 
│   │   └── addressManage.vue            # 
│   ├── cart/                      # 购物车页
│   │   └── cart.vue            # 
│   ├── category/                  # 商品分类页
│   │   └── category.vue            # 
│   ├── detail/                    # 商品详情页
│   │   └── detail.vue            # 
│   ├── index/                     # 首页
│   │   └── index.vue            # 
│   ├── login/                     # 登录页
│   │   └── iogin.vue            # 
│   ├── money/                     # 资产/钱包页
│   │   ├── money.vue            # 
│   │   ├── pay.vue            # 
│   │   └── paySuccess.vue            # 
│   ├── notice/                    # 消息通知页
│   │   └── notice.vue            # 
│   ├── order/                     # 订单列表页
│   │   ├── createOrder.vue            # 
│   │   └── order.vue            # 
│   ├── product/                   # 商品列表页
│   │   ├── list.vue            # 
│   │   └── product.vue            # 
│   ├── set/                       # 设置页
│   │   └── set.vue            # 
│   ├── user/                      # 人中心页
│   │   └── user.vue            # 
│   └── userinfo/                  # 用户信息编辑页
│       └── user.vue            # 
├── static/                        # 静态资源目录
│   ├── temp/                      # 临时文件目录
│   └── imape.png                  # 全局图片资源（示例文件）
├── mock/                          # Mock数据目录
├── store/                         # Vuex 状态管理
│   ├── modules/                   # Vuex 模块
│   │   └── user.js                # 用户状态模块（token/用户信息等）
│   ├── getter.js                  # 全局状态访问器
│   └── index.js                   # Vuex 入口（模块整合）
├── uni_modules/                   # uni-app 插件市场安装的组件
├── unpackage/                     # 打包输出目录（生产环境代码）
├── utils/                         # 工具函数
│   └── request.js                 # 封装的axios请求库（拦截器/错误处理）
├──.gitignore                      # Git忽略文件配置
├── App.vue                        # 应用根组件（全局样式/生命周期）
├── Json.js                        # 模拟数据/配置数据（建议更名）
├── LICENSE                        # 项目许可证文件
├── mainForVue2.js                        # 应用入口（插件注册/全局配置）
├── manifest.json                  # 跨平台配置（App图标/权限等）
├── package-lock.json              # 依赖版本锁定文件
├── pages.json                     # 页面路由配置（导航栏/TabBar）
├── project.config.json            # 项目工具配置（微信小程序AppID等）
├── project.private.config.json    # 私有配置（敏感信息，本地覆盖）应加入 .gitignore 避免敏感配置提交
├── README.md                      # 项目说明文档
├── uni.scss                       # 全局SCSS变量（主题色/间距等）
└── end    
```



## 启动部署

### 环境准备

- 安装 Node

  版本：16+

- 开发工具

  WebStorm

- 必装插件

  - Vue Language Features (Volar)
  - TypeScript Vue Plugin (Volar)

### 项目启动

### H5 启动

1. 下载 [ HBuilder X](https://www.dcloud.io/hbuilderx.html) 
2. `Hbuilder X`工具栏点击 `运行`->`运行到内置浏览器` (运行到外置浏览器会有跨域限制，推荐内置浏览器访问)


### 微信小程序

1. 下载 [ HBuilder X](https://www.dcloud.io/hbuilderx.html) 和 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/stable.html)
2. [微信公众平台](https://mp.weixin.qq.com/)申请小程序，获得小程序的 AppID
3. `微信开发者工具`微信扫码登录，开启服务端口，点击工具栏`设置`->`安全设置`->`安全`->`服务端口`选择打开
4. `Hbuilder X`替换项目AppID 成您刚申请的，点击`manifest.json`文件->微信小程序配置
5. Nacos 控制台修改`aioveu-auth`配置中的微信小程序 AppID 和 AppSecret 为自己申请的小程序
6. `Hbuilder X`工具栏点击 `运行`->`运行到小程序模拟器`->`微信开发者工具`

### 项目部署

- 本地打包

  ```
  npm run build:prod
  ```

  生成的静态文件位于项目根目录 dist 文件夹下

- nginx.cofig 配置

  ```
  server {
      listen     80;
      server_name  localhost;
  
      location / {
          root /usr/share/nginx/html/web;
          index index.html index.htm;
      }
  
      # 代理转发请求至网关，prod-api标识解决跨域问题
      location /prod-api/ {
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_pass https://api.aioveu.tech/;
      }
  }
  
  ```

- JSON 文件中不允许注释，如果有必要添加注释，可以将注释内容放在一个单独的 README 文件中，或者使用 `//` 注释只在开发时使用，但在提交到仓库前删除（不推荐，容易出错）。
- 确保所有的键（key）都用双引号括起来。

## 接口

默认使用线上接口地址(https://api.aioveu.tech)，如果在本地部署 [aioveu-mall](https://gitee.com/aioveutech/aioveu-mall)  且想使用本地接口开发调试，请修改 `utils/request.js` 的接口地址 `baseURL ` 为 http://localhost:9999  即可。

![](https://s2.loli.net/2023/06/09/ruzqRBj4mE2CfXK.png)



## 交流群 🚀

> 关注「可我不敌可爱」公众号，获取交流群二维码。
>
> 如果交流群的二维码过期，加我微信，备注「前端」、「后端」或「全栈」即可。
>
> 为了避免营销广告人群混入，此举无奈，望理解！

| 公众号                                                       | 交流群                                                       |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| <img height="180px" src="https://cdn.jsdelivr.net/gh/ambitiouschild/ambitiouschild/images/ambitiouschild_Public_Platform.jpg"/> | <img src="https://cdn.jsdelivr.net/gh/ambitiouschild/ambitiouschild/images/ambitiouschild_group.jpg" height="300px"> |







# aioveu-app

可我不敌可爱aioveu-app
