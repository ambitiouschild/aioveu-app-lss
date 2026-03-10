import request from "@/utils/request";

const PAY_BASE_URL = "/aioveu-pay/api/v1/pay-order";

const PayAPI = {
  /** 前端调用：查询支付状态 */
  verifyPaymentStatus(paymentNo: string) {
    return request({
      url: `${PAY_BASE_URL}/query/${paymentNo}`,
      method: "GET",
    });
    // 2. 后端逻辑：
    //    a) 检查本地数据库订单状态
    //    b) 如果本地状态未更新，则调用微信查询接口
    //    c) 更新本地数据库
    //    d) 返回给前端
  },
  /**
   * 获取支付订单表单数据
   *
   * @param id 支付订单ID
   * @returns 支付订单表单数据
   */
  getFormData(id: number) {
    return request<PayOrderForm>({
      url: `${PAY_BASE_URL}/${id}/form`,
      method: "GET",
    });
  },

  /**
   *  添加支付订单
   *
   *  @param data 支付订单表单数据
   */
  add(data: PayOrderForm) {
    return request({
      url: `${PAY_BASE_URL}`,
      method: "POST",
      data: data,
    });
  },

  /**
   * 更新支付订单
   *
   * @param id 支付订单ID
   * @param data 支付订单表单数据
   */
  update(id: number, data: PayOrderForm) {
    return request({
      url: `${PAY_BASE_URL}/${id}`,
      method: "PUT",
      data: data,
    });
  },

  /**
   * 批量删除支付订单，多个以英文逗号(,)分割
   *
   * @param ids 支付订单ID字符串，多个以英文逗号(,)分割
   */
  deleteByIds(ids: string) {
    return request({
      url: `${PAY_BASE_URL}/${ids}`,
      method: "DELETE",
    });
  },
};

export default PayAPI;

/** 支付订单分页查询参数 */
export interface PayOrderPageQuery extends PageQuery {
  /** 支付单号，唯一，格式：PAYyyyyMMddHHmmss+6位随机 */
  paymentNo?: string;
  /** 业务订单号（如退款单号、订单号） */
  orderNo?: string;
  /** 业务类型：REFUND-退款 ORDER-订单 RECHARGE-充值 */
  bizType?: string;
  /** 用户ID */
  userId?: number;
  /** 支付状态：0-待支付 1-支付中 2-支付成功 3-支付失败 4-已关闭 5-已退款 */
  paymentStatus?: number;
  /** 支付渠道：ALIPAY-支付宝 WECHAT-微信 UNIONPAY-银联 BALANCE-余额 */
  paymentChannel?: string;
  /** 支付时间 */
  paymentTime?: [string, string];
  /** 第三方支付单号 */
  thirdPaymentNo?: string;
  /** 创建时间 */
  createTime?: [string, string];
}

/** 支付订单表单对象 */
export interface PayOrderForm {
  /** 主键ID */
  id?: number;
  /** 支付单号，唯一，格式：PAYyyyyMMddHHmmss+6位随机 */
  paymentNo?: string;
  /** 业务订单号（如退款单号、订单号） */
  orderNo?: string;
  /** 业务类型：REFUND-退款 ORDER-订单 RECHARGE-充值 */
  bizType?: string;
  /** 用户ID */
  userId?: number;
  /** 支付/退款金额 */
  paymentAmount?: number;
  /** 支付状态：0-待支付 1-支付中 2-支付成功 3-支付失败 4-已关闭 5-已退款 */
  paymentStatus?: number;
  /** 支付渠道：ALIPAY-支付宝 WECHAT-微信 UNIONPAY-银联 BALANCE-余额 */
  paymentChannel?: string;
  /** 支付方式：APP-APP支付 H5-H5支付 JSAPI-小程序/公众号 NATIVE-扫码支付 */
  paymentMethod?: string;
  /** 支付时间 */
  paymentTime?: Date;
  /** 支付过期时间 */
  paymentExpireTime?: Date;
  /** 第三方支付单号 */
  thirdPaymentNo?: string;
  /** 第三方交易流水号 */
  thirdTransactionNo?: string;
  /** 附加数据，JSON格式 */
  attachData?: string;
  /** 异步通知地址 */
  notifyUrl?: string;
  /** 同步返回地址 */
  returnUrl?: string;
  /** 客户端IP */
  clientIp?: string;
  /** 设备信息 */
  deviceInfo?: string;
  /** 订单标题 */
  subject?: string;
  /** 订单描述 */
  body?: string;
  /** 币种，默认人民币 */
  currency?: string;
  /** 错误代码 */
  errorCode?: string;
  /** 错误信息 */
  errorMessage?: string;
  /** 通知状态：0-未通知 1-通知中 2-通知成功 3-通知失败 */
  notifyStatus?: number;
  /** 通知次数 */
  notifyCount?: number;
  /** 最后通知时间 */
  lastNotifyTime?: Date;
  /** 下次通知时间 */
  nextNotifyTime?: Date;
  /** 逻辑删除：0-未删除 1-已删除 */
  isDeleted?: number;
  /** 创建人 */
  createBy?: string;
  /** 更新人 */
  updateBy?: string;
  /** 创建时间 */
  createTime?: Date;
  /** 更新时间 */
  updateTime?: Date;
  /** 版本号（用于乐观锁） */
  version?: number;
}

/** 支付订单分页对象 */
export interface PayOrderPageVO {
  /** 主键ID */
  id?: number;
  /** 支付单号，唯一，格式：PAYyyyyMMddHHmmss+6位随机 */
  paymentNo?: string;
  /** 业务订单号（如退款单号、订单号） */
  orderNo?: string;
  /** 业务类型：REFUND-退款 ORDER-订单 RECHARGE-充值 */
  bizType?: string;
  /** 用户ID */
  userId?: number;
  /** 支付/退款金额 */
  paymentAmount?: number;
  /** 支付状态：0-待支付 1-支付中 2-支付成功 3-支付失败 4-已关闭 5-已退款 */
  paymentStatus?: number;
  /** 支付渠道：ALIPAY-支付宝 WECHAT-微信 UNIONPAY-银联 BALANCE-余额 */
  paymentChannel?: string;
  /** 支付方式：APP-APP支付 H5-H5支付 JSAPI-小程序/公众号 NATIVE-扫码支付 */
  paymentMethod?: string;
  /** 支付时间 */
  paymentTime?: Date;
  /** 支付过期时间 */
  paymentExpireTime?: Date;
  /** 第三方支付单号 */
  thirdPaymentNo?: string;
  /** 第三方交易流水号 */
  thirdTransactionNo?: string;
  /** 附加数据，JSON格式 */
  attachData?: string;
  /** 异步通知地址 */
  notifyUrl?: string;
  /** 同步返回地址 */
  returnUrl?: string;
  /** 客户端IP */
  clientIp?: string;
  /** 设备信息 */
  deviceInfo?: string;
  /** 订单标题 */
  subject?: string;
  /** 订单描述 */
  body?: string;
  /** 币种，默认人民币 */
  currency?: string;
  /** 错误代码 */
  errorCode?: string;
  /** 错误信息 */
  errorMessage?: string;
  /** 通知状态：0-未通知 1-通知中 2-通知成功 3-通知失败 */
  notifyStatus?: number;
  /** 通知次数 */
  notifyCount?: number;
  /** 最后通知时间 */
  lastNotifyTime?: Date;
  /** 下次通知时间 */
  nextNotifyTime?: Date;
  /** 逻辑删除：0-未删除 1-已删除 */
  isDeleted?: number;
  /** 创建人 */
  createBy?: string;
  /** 更新人 */
  updateBy?: string;
  /** 创建时间 */
  createTime?: Date;
  /** 更新时间 */
  updateTime?: Date;
  /** 版本号（用于乐观锁） */
  version?: number;
}
