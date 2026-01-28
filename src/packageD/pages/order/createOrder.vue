<template>
  <view>
    <!-- 收货地址区域 - 整个区域可点击跳转 -->
    <navigator
      url="/packageD/pages/address/address?source=1"
      class="address-section"
    >
      <!-- 地址内容区域 -->
      <view class="order-content">
        <!-- 地址图标 -->
        <text class="yticon icon-shouhuodizhi"></text>

        <!-- ... 地址信息显示 ... -->


        <!-- 已选择地址时显示地址详情 -->
        <view v-if="selectedAddress" class="cen">
          <view class="top">
            <text class="name">{{ selectedAddress.consigneeName }}</text>
            <text class="mobile">{{ selectedAddress.consigneeMobile }}</text>
          </view>
          <text class="address">
            {{ selectedAddress.province }} {{ selectedAddress.city }}
            {{ selectedAddress.district }} {{ selectedAddress.detailAddress }}
          </text>
        </view>

        <!-- 未选择地址 -->
        <view v-else class="cen">
          <text>请选择收货地址</text>
        </view>

        <!-- 右侧箭头，指示可点击 -->
        <text class="yticon icon-you"></text>
      </view>

      <!-- 底部装饰背景图 -->
      <image
        class="a-bg"
        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAu4AAAAFCAYAAAAaAWmiAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6Rjk3RjkzMjM2NzMxMTFFOUI4RkU4OEZGMDcxQzgzOEYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6Rjk3RjkzMjQ2NzMxMTFFOUI4RkU4OEZGMDcxQzgzOEYiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpGOTdGOTMyMTY3MzExMUU5QjhGRTg4RkYwNzFDODM4RiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpGOTdGOTMyMjY3MzExMUU5QjhGRTg4RkYwNzFDODM4RiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PrEOZlQAAAiuSURBVHjazJp7bFvV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"
      />
    </navigator>

    <!-- 商品信息区域 -->
    <view class="goods-section">
      <!-- 商家头部信息 -->
      <view class="g-header b-b">
        <image class="logo" src="@/static/pages/order/logo.png" />
        <text class="name">可我不敌可爱小店</text>
      </view>

      <!-- 商品列表 -->
      <view
        class="g-item"
        v-for="(item, index) in orderItems"
        :key="item.skuId"
      >
        <image :src="item.picUrl"></image>
        <view class="right">
          <text class="title clamp">{{ item.skuName }}</text>
          <text class="spec"></text>
          <view class="price-box">
            <text class="price">￥{{ formatMoney(item.price) }}</text>
            <text class="number">x {{ item.quantity }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 优惠明细区域 -->
    <view class="yt-list">
      <!-- 优惠券选择 -->
      <view
        class="yt-list-cell b-b"
        @click="toggleMask('show')"
      >
        <view class="cell-icon">券</view>
        <text class="cell-tit clamp">优惠券</text>
        <text
          class="cell-tip active"
          v-if="couponTitle === ''"
        >选择优惠券</text>
        <text
          class="cell-tip active"
          v-else
        >{{ couponTitle }}</text>
        <text class="cell-more wanjia wanjia-gengduo-d"></text>
      </view>

      <!-- 商家促销 -->
      <view class="yt-list-cell b-b">
        <view class="cell-icon hb">减</view>
        <text class="cell-tit clamp">商家促销</text>
        <text class="cell-tip disabled">暂无可用优惠</text>
      </view>
    </view>

    <!-- 金额明细区域 -->
    <view class="yt-list">
      <!-- 商品金额 -->
      <view class="yt-list-cell b-b">
        <text class="cell-tit clamp">商品金额</text>
        <text class="cell-tip">￥{{ formatMoney(totalAmount) }}</text>
      </view>

      <!-- 优惠金额 -->
      <view class="yt-list-cell b-b">
        <text class="cell-tit clamp">优惠金额</text>
        <text class="cell-tip red">-￥{{ formatMoney(couponAmount) }}</text>
      </view>

      <!-- 运费 -->
      <view class="yt-list-cell b-b">
        <text class="cell-tit clamp">运费</text>
        <text
          class="cell-tip"
          v-if="freightAmount === 0"
        >免运费</text>
        <text
          class="cell-tip"
          v-else
        >-￥{{ formatMoney(freightAmount) }}</text>
      </view>

      <!-- 备注 -->
      <view class="yt-list-cell desc-cell">
        <text class="cell-tit clamp">备注</text>
        <input
          class="desc"
          type="text"
          v-model="remark"
          placeholder="请填写备注信息"
          placeholder-class="placeholder"
        />
      </view>
    </view>

    <!-- 底部结算区域 -->
    <view class="footer">
      <view class="price-content">
        <text>实付款</text>
        <text class="price-tip">￥</text>
        <text class="price">{{ formatMoney(paymentAmount) }}</text>
      </view>
      <text
        class="submit"
        @click="handleSubmit"
      >提交订单</text>
    </view>

    <!-- 优惠券面板 -->
    <view
      class="mask"
      :class="maskState === 0 ? 'none' : maskState === 1 ? 'show' : ''"
      @click="toggleMask"
    >
      <view
        class="mask-content"
        @click.stop="handleStopPropagation"
      >
        <!-- 优惠券列表 -->
        <view
          class="coupon-item"
          v-for="(item, index) in couponList"
          :key="index"
          @click="handleChangeCoupon(item)"
        >
          <view class="con">
            <view class="left">
              <text class="title">{{ item.title }}</text>
              <text class="time">有效期至2019-06-30</text>
            </view>
            <view class="right">
              <text class="price">{{ item.price }}</text>
              <text>满30可用</text>
            </view>
            <view class="circle l"></view>
            <view class="circle r"></view>
          </view>
          <text class="tips">限新用户使用</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
// ==========================================
// 导入依赖
// ==========================================
import { ref, onMounted, watch, computed } from 'vue';
import { onShow, onLoad } from '@dcloudio/uni-app';
import { confirm, submit as submitOrder } from '@/api/oms/order';
import { list as getAddressList } from '@/api/ums/address';

// ==========================================
// 响应式数据定义
// ==========================================
const orderToken = ref(undefined);          // 订单提交令牌，防止订单重复提交
const maskState = ref(0);                   // 优惠券面板显示状态：0-隐藏，1-显示
const remark = ref(undefined);              // 订单备注
const couponId = ref(0);                    // 选中的优惠券ID
const couponTitle = ref(undefined);         // 选中的优惠券标题
const couponAmount = ref(0);                // 优惠金额
const freightAmount = ref(0);               // 运费金额
const paymentAmount = ref(0);               // 实际支付金额
const couponList = ref([]);                 // 优惠券列表
const totalAmount = ref(0);                 // 商品总金额
const selectedAddress = ref(undefined);     // 选中的收货地址
const orderItems = ref([]);                 // 订单商品列表

// ==========================================
// 生命周期钩子
// ==========================================
onLoad((options) => {
  console.log('========>> 进入订单创建页面, 参数:', options);
});

onShow(() => {
  console.log('========>> 订单创建页面显示');

  // 获取页面参数
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = currentPage.options || {};

  // 重新加载数据，会获取最新选择的地址
  loadData(options);
});

// ==========================================
// 计算属性
// ==========================================
// 计算商品总金额
const calculateTotalAmount = () => {

  console.log('【开始计算】商品总金额，订单商品列表:', orderItems.value);

  if (!orderItems.value || orderItems.value.length === 0) {
    console.log('【计算结果】订单商品为空，总金额设为0');
    totalAmount.value = 0;
    return;
  }

  let calculatedAmount = 0;

  if (orderItems.value.length === 1) {
    // 单个商品
    const item = orderItems.value[0];
    const quantity = item.quantity || 0;
    const price = item.price || 0;
    totalAmount.value = quantity * price;

    console.log('【单个商品】计算详情:', {
      商品名称: item.skuName,
      商品ID: item.skuId,
      数量: quantity,
      单价: price,
      小计: totalAmount.value
    });

  } else {
    // 多个商品
    totalAmount.value  = orderItems.value.reduce((total, item) => {

      const quantity = item.quantity || 0;
      const price = item.price || 0;
      const itemTotal = quantity * price;

      console.log('【商品明细】', {
        商品名称: item.skuName,
        数量: quantity,
        单价: price,
        小计: itemTotal
      });

      return total + itemTotal;
    }, 0);

    console.log('【多个商品】计算完成，商品数量:{},总计：{}', orderItems.value.length, totalAmount.value);
  }

  console.log('【计算结果】商品总金额:', {
    新值: totalAmount.value,
    订单商品数: orderItems.value.length
  });

  // 重新计算支付金额
  calculatePaymentAmount();
};

// ==========================================
// 业务方法
// ==========================================
/**
 * 加载页面数据
 * @param {Object} params - 页面参数
 */
const loadData = async (params) => {
  console.log('加载订单创建数据, 参数:', params);

  // 显示加载状态
  uni.showLoading({ title: '加载中...' });

  try {
    // 获取SKU ID参数
    const skuIds = params?.skuIds;  // 正确的参数名
    console.log("获取SKU ID参数",skuIds);
    if (!skuIds) {
      throw new Error('缺少商品参数');
    }

    // 调用订单确认接口
    const response = await confirm(skuIds);
    console.log('订单确认接口响应:', response);

    // 解构响应数据
    const { orderToken: token, orderItems: items, addresses } = response || {};

    // 保存订单令牌
    orderToken.value = token;

    //在 loadData函数中，从接口返回的地址数据中选择默认地址
    // 处理收货地址
    console.log('地址处理逻辑是在订单确认之前完成的');
    if (addresses && addresses.length > 0) {
      // 优先选择默认地址
      const defaultAddress = addresses.find(item => item.defaulted === 1);
      selectedAddress.value = defaultAddress || addresses[0];
    } else {
      selectedAddress.value = undefined;
    }

    // 保存订单商品
    orderItems.value = items || [];

    // 计算商品总金额
    calculateTotalAmount();


    // 模拟优惠券数据（实际项目中应从接口获取）
    couponList.value = [
      { id: 1, title: '新用户优惠券', price: 5 },
      { id: 2, title: '满减优惠券', price: 10 }
    ];

  } catch (error) {
    console.error('加载订单数据失败:', error);

    // 显示错误提示
    uni.showToast({
      title: '加载失败',
      icon: 'none',
      duration: 2000
    });

  } finally {
    // 隐藏加载状态
    uni.hideLoading();
  }
};

/**
 * 切换优惠券面板显示状态
 * @param {string} type - 面板状态：'show'显示，其他隐藏
 */
const toggleMask = (type) => {
  console.log('切换优惠券面板状态:', type);

  // 如果没有优惠券，不显示面板
  if (couponList.value.length === 0) {
    uni.showToast({
      title: '暂无可用优惠券',
      icon: 'none',
      duration: 1500
    });
    return;
  }

  if (type === 'show') {
    // 显示面板
    maskState.value = 2;  // 过渡状态
    setTimeout(() => {
      maskState.value = 1;  // 显示状态
    }, 10);
  } else {
    // 隐藏面板
    maskState.value = 2;  // 过渡状态
    setTimeout(() => {
      maskState.value = 0;  // 隐藏状态
    }, 300);
  }
};

/**
 * 计算实际支付金额
 */
const calculatePaymentAmount = () => {
  // 支付金额 = 商品总金额 - 优惠金额 - 运费
  const total = totalAmount.value || 0;
  const coupon = couponAmount.value || 0;
  const freight = freightAmount.value || 0;
  paymentAmount.value = total - coupon - freight;

  // 确保支付金额不小于0
  if (paymentAmount.value < 0) {
    paymentAmount.value = 0;
  }

  console.log('计算支付金额（这是分）:', { total, coupon, freight, payment: paymentAmount.value });
};

/**
 * 选择优惠券
 * @param {Object} coupon - 优惠券对象
 */
const handleChangeCoupon = (coupon) => {
  console.log('选择优惠券:', coupon);

  if (!coupon) {
    return;
  }

  // 更新优惠券信息
  couponId.value = coupon.id;
  couponTitle.value = coupon.title;
  couponAmount.value = coupon.price || 0;

  // 重新计算支付金额
  calculatePaymentAmount();

  // 关闭优惠券面板
  maskState.value = 0;

  // 显示提示
  uni.showToast({
    title: '已选择优惠券',
    icon: 'success',
    duration: 1500
  });
};

/**
 * 阻止事件冒泡
 */
const handleStopPropagation = () => {
  // 阻止点击内容区域时关闭面板
  return;
};

/**
 * 提交订单
 */
const handleSubmit = async () => {
  console.log('提交订单');

  // 验证收货地址
  if (!selectedAddress.value) {
    uni.showToast({
      title: '请选择收货地址',
      icon: 'none',
      duration: 2000
    });
    return;
  }

  // 验证订单商品
  if (!orderItems.value || orderItems.value.length === 0) {
    uni.showToast({
      title: '订单商品不能为空',
      icon: 'none',
      duration: 2000
    });
    return;
  }

  // 构建提交数据
  const submitData = {
    orderToken: orderToken.value,         // 订单提交令牌，防止重复提交
    orderItems: orderItems.value,         // 订单商品列表
    totalAmount: totalAmount.value,       // 订单商品总价，用于后台验价
    shippingAddress: selectedAddress.value, // 收货地址
    remark: remark.value || '',           // 订单备注
    couponAmount: couponAmount.value,     // 优惠金额金额
    freightAmount: freightAmount.value,   // 运费金额金额
    paymentAmount: paymentAmount.value,   // 订单支付金额
    orderSource: 'APP'                    // 订单来源
  };

  console.log('订单提交数据:', submitData);

  //确认订单页面，提交后应该生成订单，然后跳转到支付页面让用户选择支付方式并完成支付。这不是直接支付，是正确的流程。
  // 确认对话框
  uni.showModal({
    title: '确认订单',
    content: `确认支付 ¥${formatMoney(paymentAmount.value)} 吗？`,
    confirmText: '提交订单',
    confirmColor: '#fa436a',
    success: async (res) => {
      if (res.confirm) {
        try {
          // 显示加载状态
          uni.showLoading({
            title: '提交中...',
            mask: true  // 添加遮罩，防止重复点击
          });

          // 禁用按钮，防止重复提交
          // isSubmitting.value = true;
          console.log('【订单提交】开始提交，数据:', JSON.stringify(submitData, null, 2));

          // 调用订单提交接口
          const response = await submitOrder(submitData);
          console.log('【订单提交】响应:', response);

          // 获取订单号
          const orderSn = response;
          if (!orderSn) {
            throw new Error('订单提交失败，未返回订单号');
          }

          console.log('【订单提交】提交成功，订单号:', orderSn);

          // 跳转到支付页面

          console.log('【页面跳转】跳转到支付页面');
          uni.redirectTo({
            url: `/packageD/pages/money/pay?orderSn=${orderSn}&paymentAmount=${paymentAmount.value}`,
            fail: (err) => {
              console.error('跳转到支付页失败:', err);
              uni.showToast({
                title: '跳转失败',
                icon: 'none',
                duration: 2000
              });
              // 跳转失败时，可以提供其他操作
              showOrderResult(orderSn);

            }
          });

        } catch (error) {
          console.error('订单提交失败:', error);

          // 隐藏加载状态
          uni.hideLoading();

          // 根据错误类型显示不同的提示
          let errorMessage = '订单提交失败';
          let errorDetail = '';

          if (error.message) {
            errorDetail = error.message;

            if (error.message.includes('商品库存不足')) {
              errorMessage = '商品库存不足，请返回购物车修改';
            } else if (error.message.includes('重复提交')) {
              errorMessage = '请勿重复提交订单';
            } else if (error.message.includes('价格发生变动')) {
              errorMessage = '商品价格已变化，请重新确认';
            } else if (error.message.includes('令牌')) {
              errorMessage = '页面已过期，请刷新后重试';
            }
          }

          console.error('【订单提交】错误详情:', errorDetail);

          // 显示错误提示   uni.showToast并没有 success回调函数，使用 showModal（推荐），showModal没有 icon和 duration参数
          uni.showModal({
            title: '订单提交失败',
            content: errorMessage,
            showCancel: false,
            confirmText: '确定',
            confirmColor: '#fa436a',
            success: (modalRes) => {
              // 用户点击确定后
              if (error.message && error.message.includes('商品库存不足')) {
                // 库存不足时返回购物车
                uni.navigateBack();
              }
            }
          });

        } finally {
          // 隐藏加载状态
          uni.hideLoading();
        }
      }
    }
  });
};

// ==========================================
// 工具方法
// ==========================================
/**
 * 格式化金额（分转元）
 * @param {number} money - 金额（分）
 * @returns {string} 格式化后的金额
 */
const formatMoney = (money) => {
  if (money === undefined || money === null || isNaN(money)) {
    return '0.00';
  }

  // 确保是数字
  const amount = Number(money);
  if (isNaN(amount)) {
    return '0.00';
  }

  // 分转元，保留两位小数
  return (amount / 100).toFixed(2);
};
</script>

<style lang="scss">
// ==========================================
// 页面基础样式
// ==========================================
page {
  background: $page-color-base;
  padding-bottom: 100upx;
  box-sizing: border-box;
}

// ==========================================
// 收货地址区域样式
// ==========================================
.address-section {
  padding: 30upx 0;
  background: #fff;
  position: relative;

  .order-content {
    display: flex;
    align-items: center;
    padding: 0 30upx;
  }

  // 地址图标
  .icon-shouhuodizhi {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 90upx;
    color: #888;
    font-size: 44upx;
  }

  // 地址信息容器
  .cen {
    display: flex;
    flex-direction: column;
    flex: 1;
    font-size: 28upx;
    color: $font-color-dark;
    margin: 0 20upx;
    overflow: hidden;

    .top {
      display: flex;
      align-items: center;
      margin-bottom: 8upx;
    }

    .name {
      font-size: 34upx;
      margin-right: 24upx;
      font-weight: 500;
    }

    .mobile {
      font-size: 28upx;
      color: $font-color-light;
    }

    .address {
      font-size: 24upx;
      color: $font-color-light;
      line-height: 1.4;
    }
  }

  // 右侧箭头
  .icon-you {
    flex-shrink: 0;
    font-size: 32upx;
    color: $font-color-light;
  }

  // 底部装饰背景
  .a-bg {
    position: absolute;
    left: 0;
    bottom: 0;
    display: block;
    width: 100%;
    height: 5upx;
    pointer-events: none;
  }
}

// ==========================================
// 商品信息区域样式
// ==========================================
.goods-section {
  margin-top: 16upx;
  background: #fff;
  padding-bottom: 1px;

  // 商家头部
  .g-header {
    display: flex;
    align-items: center;
    height: 84upx;
    padding: 0 30upx;
    position: relative;
    border-bottom: 1upx solid $border-color;

    .logo {
      display: block;
      width: 50upx;
      height: 50upx;
      border-radius: 100px;
    }

    .name {
      font-size: 30upx;
      color: $font-color-base;
      margin-left: 24upx;
      font-weight: 500;
    }
  }

  // 商品项
  .g-item {
    display: flex;
    margin: 20upx 30upx;
    padding-bottom: 20upx;
    border-bottom: 1upx solid $border-color-light;

    &:last-child {
      border-bottom: none;
    }

    image {
      flex-shrink: 0;
      display: block;
      width: 140upx;
      height: 140upx;
      border-radius: 8upx;
      object-fit: cover;
    }

    .right {
      flex: 1;
      padding-left: 24upx;
      overflow: hidden;
    }

    .title {
      display: block;
      font-size: 30upx;
      color: $font-color-dark;
      line-height: 1.4;
      margin-bottom: 8upx;
      font-weight: 500;

      &.clamp {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .spec {
      font-size: 26upx;
      color: $font-color-light;
      line-height: 1.4;
    }

    .price-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 16upx;

      .price {
        font-size: 32upx;
        color: $font-color-dark;
        font-weight: 600;

        &:before {
          content: '¥';
          font-size: 24upx;
          margin-right: 2upx;
        }
      }

      .number {
        font-size: 28upx;
        color: $font-color-light;
      }
    }
  }
}

// ==========================================
// 列表项通用样式
// ==========================================
.yt-list {
  margin-top: 16upx;
  background: #fff;

  .yt-list-cell {
    display: flex;
    align-items: center;
    padding: 20upx 30upx 20upx 40upx;
    position: relative;

    &.b-b:after {
      left: 30upx;
    }

    // 左侧图标
    .cell-icon {
      flex-shrink: 0;
      width: 40upx;
      height: 40upx;
      font-size: 24upx;
      color: #fff;
      text-align: center;
      line-height: 40upx;
      background: #f85e52;
      border-radius: 6upx;
      margin-right: 20upx;

      &.hb {
        background: #ffaa0e;
      }
    }

    // 标题
    .cell-tit {
      flex: 1;
      font-size: 28upx;
      color: $font-color-dark;

      &.clamp {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    // 提示信息
    .cell-tip {
      font-size: 28upx;
      color: $font-color-light;
      margin-right: 10upx;

      &.active {
        color: $base-color;
      }

      &.disabled {
        color: $font-color-light;
        opacity: 0.7;
      }

      &.red {
        color: $base-color;
      }
    }

    // 右侧更多图标
    .cell-more {
      font-size: 24upx;
      color: $font-color-light;
    }

    // 备注输入框
    &.desc-cell {
      .desc {
        flex: 1;
        height: 40upx;
        font-size: 28upx;
        color: $font-color-dark;
        border: none;
        outline: none;

        &::placeholder {
          color: $font-color-light;
        }
      }
    }
  }
}

// ==========================================
// 底部结算区域样式
// ==========================================
.footer {
  position: fixed;
  left: 0;
  bottom: 0;
  z-index: 995;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 100upx;
  font-size: 30upx;
  background-color: #fff;
  color: $font-color-base;
  box-shadow: 0 -2upx 10upx rgba(0, 0, 0, 0.1);
  padding: 0 20upx;
  box-sizing: border-box;

  .price-content {
    display: flex;
    align-items: baseline;

    .price-tip {
      color: $base-color;
      font-size: 24upx;
      margin: 0 4upx;
    }

    .price {
      font-size: 36upx;
      color: $base-color;
      font-weight: 600;
    }
  }

  .submit {
    flex-shrink: 0;
    width: 280upx;
    height: 72upx;
    line-height: 72upx;
    text-align: center;
    color: #fff;
    font-size: 32upx;
    font-weight: 500;
    background: linear-gradient(135deg, $base-color, darken($base-color, 10%));
    border-radius: 36upx;
    transition: all 0.3s;

    &:active {
      opacity: 0.9;
      transform: scale(0.98);
    }
  }
}

// ==========================================
// 优惠券面板样式
// ==========================================
.mask {
  display: flex;
  align-items: flex-end;
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0);
  z-index: 9999;
  transition: background-color 0.3s;

  .mask-content {
    width: 100%;
    min-height: 30vh;
    max-height: 70vh;
    background: #f8f8f8;
    border-radius: 20upx 20upx 0 0;
    transform: translateY(100%);
    transition: transform 0.3s;
    overflow-y: auto;
    padding: 20upx 0;
    box-sizing: border-box;
  }

  // 隐藏状态
  &.none {
    display: none;
  }

  // 显示状态
  &.show {
    background: rgba(0, 0, 0, 0.5);

    .mask-content {
      transform: translateY(0);
    }
  }
}

// ==========================================
// 优惠券项样式
// ==========================================
.coupon-item {
  display: flex;
  flex-direction: column;
  margin: 20upx 30upx;
  background: #fff;
  border-radius: 12upx;
  overflow: hidden;
  box-shadow: 0 2upx 12upx rgba(0, 0, 0, 0.05);

  .con {
    display: flex;
    align-items: center;
    position: relative;
    height: 120upx;
    padding: 0 30upx;

    &:after {
      position: absolute;
      left: 0;
      bottom: 0;
      content: '';
      width: 100%;
      height: 0;
      border-bottom: 1px dashed #e0e0e0;
    }
  }

  .left {
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex: 1;
    overflow: hidden;
    height: 100upx;
    padding-right: 20upx;

    .title {
      font-size: 30upx;
      color: $font-color-dark;
      font-weight: 500;
      margin-bottom: 6upx;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .time {
      font-size: 24upx;
      color: $font-color-light;
    }
  }

  .right {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 26upx;
    color: $font-color-base;
    height: 100upx;
    flex-shrink: 0;

    .price {
      font-size: 44upx;
      color: $base-color;
      font-weight: 600;
      line-height: 1.2;

      &:before {
        content: '¥';
        font-size: 30upx;
      }
    }
  }

  .tips {
    font-size: 24upx;
    color: $font-color-light;
    line-height: 60upx;
    padding-left: 30upx;
    background: #f8f8f8;
  }

  .circle {
    position: absolute;
    bottom: -10upx;
    width: 20upx;
    height: 20upx;
    background: #f8f8f8;
    border-radius: 50%;

    &.l {
      left: -10upx;
    }

    &.r {
      right: -10upx;
    }
  }
}
</style>
