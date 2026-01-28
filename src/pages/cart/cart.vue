<template>
  <view class="container">
    <!-- 空白页：当用户未登录或购物车为空时显示 -->
    <view v-if="!hasLogin || empty === true" class="empty">
      <image src="/static/pages/cart/emptyCart.jpg" mode="aspectFit"></image>
      <view v-if="hasLogin" class="empty-tips">
        空空如也
        <navigator class="navigator" v-if="hasLogin" url="../index/index" open-type="switchTab">随便逛逛>
        </navigator>
      </view>
      <view v-else class="empty-tips">
        空空如也
        <view class="navigator" @click="navToLogin">去登陆></view>
      </view>
    </view>

    <!-- 购物车列表：用户已登录且有商品时显示 -->
    <view v-else>
      <view class="cart-list">
        <!-- 遍历购物车商品列表 -->
        <block v-for="(item, index) in cartItemList" :key="item.skuId">
          <view class="cart-item" :class="{ 'b-b': index !== cartItemList.length - 1 }">
            <!-- 商品图片区域 -->
            <view class="image-wrapper">
              <image
                :src="item.picUrl"
                class="loaded"
                mode="aspectFill"
                lazy-load
                @load="onImageLoad('cartItemList', index)"
                @error="onImageError('cartItemList', index)">
              </image>
              <!-- 选择框：控制商品是否选中 -->
              <view
                class="yticon icon-xuanzhong2 checkbox"
                :class="{ checked: item.checked }"
                @click="handleCheckItem(index, item.skuId)">
              </view>
            </view>

            <!-- 商品信息区域 -->
            <view class="item-right">
              <text class="clamp title">{{ item.spuName }}</text>{{item.skuName}}
              <text class="price">¥{{ formatMoney(item.price) }}</text>
              <!-- 数量选择器组件 -->
              <uni-number-box
                class="step"
                :min="1"
                :max="item.stock || 999"
                :value="item.count"
                :isMax="item.count >= item.stock ? true : false"
                :isMin="item.count === 1"
                :index="index"
                @eventChange="(event) => handleChangeCount(event, item.skuId)" />
            </view>

            <!-- 删除按钮 -->
            <text
              class="del-btn yticon icon-fork"
              @click="removeCartItem_single(item.skuId)">
            </text>
          </view>
        </block>
      </view>

      <!-- 底部操作栏：全选、总价、结算 -->
      <view class="action-section">
        <view class="checkbox">
          <image
            :src="allChecked ? '/static/pages/cart/selected.png' : '/static/pages/cart/select.png'"
            mode="aspectFit"
            @click="handleCheckAll()">
          </image>
          <view
            class="clear-btn"
            :class="{ show: allChecked }"
            @click="clearCart">
            清空
          </view>
        </view>

        <!-- 价格汇总区域 -->
        <view class="total-box">
          <text class="price">¥{{ formatMoney(totalPrice) }}</text>
          <text class="coupon">
            已优惠
            <text>{{ formatMoney(coupon) }}</text>
            元
          </text>
        </view>

        <!-- 结算按钮 -->
        <button
          type="primary"
          class="no-border confirm-btn"
          @click="handleCreateOrder"
          :disabled="!hasCheckedItem">
          去结算
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
// ==========================================
// 导入部分
// ==========================================
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { onShow, onHide, onLoad } from '@dcloudio/uni-app';  // 修改这里
import { storeToRefs } from 'pinia';
import { useUserStore } from '@/store';

// 导入购物车相关API
import {
  getCart,
  checkAll,
  deleteCart,
  addCartItem,
  updateCartItem,
  removeCartItem
} from '@/api/oms/cart';

// 导入自定义组件
import uniNumberBox from '@/components/uni-number-box.vue';

// ==========================================
// 响应式数据定义
// ==========================================
const totalPrice = ref(0);		// 选中商品总价
const allChecked = ref(false);	// 全选状态
const empty = ref(false);		// 购物车是否为空
const cartItemList = ref([]);	// 购物车商品列表
const coupon = ref(0);			// 优惠金额

// 获取用户状态
const userStore = useUserStore();
const { hasLogin } = storeToRefs(userStore);


// ==========================================
// 页面生命周期钩子
// ==========================================
onLoad(() => {
  console.log('========>> 购物车页面加载');
});

// ==========================================
// 生命周期钩子  使用正确的生命周期钩子  使用 onShow而不是 onShow: function()
// ==========================================


onShow(() => {
  console.log('========>> 购物车页面显示');
  // 页面显示时加载购物车数据
  loadData();
});

onHide(() => {
  console.log('========>> 购物车页面隐藏');
});

onUnmounted(() => {
  console.log('========>> 购物车页面卸载');
});



// ==========================================
// 计算属性
// ==========================================
// 是否有选中的商品
const hasCheckedItem = computed(() => {
  return cartItemList.value.some(item => item.checked);
});

// 选中商品的数量
const checkedItemCount = computed(() => {
  return cartItemList.value.filter(item => item.checked).length;
});


// 监听购物车列表变化
watch(cartItemList, (newList) => {
  // 更新空状态
  empty.value = newList.length === 0;

  // 计算总价
  calculateTotalPrice();

  // 更新全选状态
  updateAllCheckedState();
}, { deep: true });

// ==========================================
// 业务方法
// ==========================================
/**
 * 加载购物车数据
 */
const loadData = async () => {

  // 检查用户是否登录
  if (!hasLogin.value) {
    console.log('用户未登录，不加载购物车');
    empty.value = true;
    cartItemList.value = [];
    return;
  }

  try {

    console.log('开始加载购物车数据...');
    uni.showLoading({ title: '加载中...' });

    // 调用API获取购物车列表
    const response = await getCart();
    console.log('购物车原始数据:', response);

    // 处理数据，确保每个商品都有stock
    cartItemList.value = (response || []).map(item => {
      console.log(`商品 ${item.skuName}:`, {
        count: item.count,
        stock: item.stock,
        hasStock: item.stock != null
      });

      // 确保有默认库存
      if (item.stock == null || item.stock < 0) {
        console.warn(`商品 ${item.skuName} 库存异常，设置为99`, item);
        return {
          ...item,
          stock: 99
        };
      }

      return item;
    });

    // 如果没有商品，设置为空状态
    if (cartItemList.value.length === 0) {
      empty.value = true;
    }

  } catch (error) {
    console.error('加载购物车失败:', error);
    uni.showToast({
      title: '加载购物车失败',
      icon: 'none'
    });

    empty.value = true;
    cartItemList.value = [];
  }finally {
    uni.hideLoading();
  }
};

/**
 * 图片加载完成回调
 * @param {string} key - 数据键名
 * @param {number} index - 索引
 */
const onImageLoad = (key, index) => {
  // 标记图片已加载
  cartItemList.value[index].loaded = 'loaded';
};

/**
 * 图片加载失败回调
 * @param {string} key - 数据键名
 * @param {number} index - 索引
 */
const onImageError = (key, index) => {
  // 设置错误图片
  cartItemList.value[index].picUrl = '/static/errorImage.jpg';
};

/**
 * 修改商品数量
 * @param {Object} data - 事件数据
 * @param {number} skuId - 商品SKU ID
 */
const handleChangeCount = async (data, skuId) => {

  // 检查数量是否有效
  if (!data || !data.number || data.number < 1) {
    uni.showToast({
      title: '数量不能小于1',
      icon: 'none'
    });
    return;
  }

  const newCount = data.number;
  console.log('修改商品数量:', { skuId, newCount });

  // 1. 先更新本地显示，提升用户体验
  const index = cartItemList.value.findIndex(item => item.skuId === skuId);
  if (index !== -1) {
    cartItemList.value[index].count = newCount;  // ✅ 关键：立即更新本地数据
  }

  try {
    uni.showLoading({ title: '更新中...' });

    const cartItem = {
      skuId: skuId,
      count: data.number
    };

    console.log('修改商品数量:', cartItem);

    // 调用API更新购物车
    await updateCartItem(skuId, cartItem);

    // 刷新数据 重新加载数据确保一致性
    await loadData();

    uni.showToast({
      title: '更新成功',
      icon: 'success'
    });


  } catch (error) {
    console.error('修改数量失败:', error);
    uni.showToast({
      title: '修改数量失败',
      icon: 'none'
    });
  }finally {
    uni.hideLoading();
  }
};

/**
 * 选中/取消选中单个商品
 * @param {number} index - 商品索引
 * @param {number} skuId - 商品SKU ID
 */
const handleCheckItem = async (index, skuId) => {

  if (index < 0 || index >= cartItemList.value.length) {
    console.error('无效的商品索引:', index);
    return;
  }

  try {

    // 切换选中状态
    const newCheckedState = !cartItemList.value[index].checked;
    console.log('修改商品选中状态:', { skuId, checked: newCheckedState });

    // 切换选中状态
    const params = {
      checked: !cartItemList.value[index].checked
    };

    // 调用API更新选中状态
    await updateCartItem(skuId, params);

    // 刷新数据
    await loadData();

  } catch (error) {
    console.error('修改选中状态失败:', error);
    uni.showToast({
      title: '操作失败',
      icon: 'none'
    });
  }
};

/**
 * 全选/取消全选
 */
const handleCheckAll = async () => {
  try {

    const newCheckedState = !allChecked.value;
    console.log('全选操作:', { checked: newCheckedState });
    uni.showLoading({ title: '处理中...' });

    const params = {
      checked: !allChecked.value
    };

    // 调用API设置全选
    await checkAll(params);

    // 刷新数据
    await loadData();

    uni.showToast({
      title: newCheckedState ? '已全选' : '已取消全选',
      icon: 'success'
    });


  } catch (error) {
    console.error('全选操作失败:', error);
    uni.showToast({
      title: '操作失败',
      icon: 'none'
    });
  }finally {
    uni.hideLoading();
  }
};

/**
 * 删除单个商品
 * @param {number} skuId - 商品SKU ID
 */
const removeCartItem_single = async (skuId) => {
// 确认删除
  uni.showModal({
    title: '删除商品',
    content: '确定要删除这个商品吗？',
    confirmText: '删除',
    confirmColor: '#e54d42',
    success: async (e) => {
      if (e.confirm) {
        try {
          console.log('删除商品:', skuId);
          uni.showLoading({ title: '删除中...' });

          // 调用API删除商品
          await removeCartItem(skuId);

          // 刷新数据
          await loadData();

          uni.showToast({
            title: '删除成功',
            icon: 'success'
          });

        } catch (error) {
          console.error('删除失败:', error);
          uni.showToast({
            title: '删除失败',
            icon: 'none'
          });
        } finally {
          uni.hideLoading();
        }
      }
    }
  });
};

/**
 * 清空购物车
 */
const clearCart = () => {

  // 检查购物车是否为空
  if (cartItemList.value.length === 0) {
    uni.showToast({
      title: '购物车已为空',
      icon: 'none'
    });
    return;
  }

  uni.showModal({
    title: '提示',
    content: '确定要清空购物车吗？',
    confirmText: '清空',
    confirmColor: '#e54d42',
    success: async (e) => {
      if (e.confirm) {
        try {
          uni.showLoading({ title: '清空中...' });

          // 调用API清空购物车
          await deleteCart();

          // 刷新数据
          await loadData();

          uni.showToast({
            title: '已清空',
            icon: 'success'
          });

        } catch (error) {
          console.error('清空购物车失败:', error);
          uni.showToast({
            title: '清空失败',
            icon: 'none'
          });
        } finally {
          uni.hideLoading();
        }
      }
    }
  });
};

/**
 * 计算选中商品总价
 */
const calculateTotalPrice = () => {
  if (cartItemList.value.length === 0) {
    totalPrice.value = 0;
    return;
  }

  // 筛选出选中的商品
  const checkedItems = cartItemList.value.filter(item => item.checked);

  if (checkedItems.length === 0) {
    totalPrice.value = 0;
    return;
  }

  // 计算总价：价格 × 数量
  let total = 0;
  checkedItems.forEach(item => {
    total += item.price * item.count;
  });

  totalPrice.value = total;
};

/**
 * 更新全选状态
 */
const updateAllCheckedState = () => {
  if (cartItemList.value.length === 0) {
    allChecked.value = false;
    return;
  }

  // 检查是否所有商品都被选中
  const allCheckedStatus = cartItemList.value.every(item => item.checked);
  allChecked.value = allCheckedStatus;
};

/**
 * 跳转到结算页面
 */
const handleCreateOrder = () => {
  // 检查是否有选中的商品
  if (!hasCheckedItem.value) {
    uni.showToast({
      title: '请选择要结算的商品',
      icon: 'none'
    });
    return;
  }

  // 检查用户是否登录
  if (!hasLogin.value) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    });
    navToLogin();
    return;
  }

  // 获取选中的商品ID列表
  const selectedSkuIds = cartItemList.value
    .filter(item => item.checked)
    .map(item => item.skuId);

  // 跳转到订单创建页面
  uni.navigateTo({
    url: `/packageD/pages/order/createOrder?skuIds=${selectedSkuIds.join(',')}`,
    fail: (err) => {
      console.error('跳转失败:', err);
      uni.showToast({
        title: '跳转失败',
        icon: 'none'
      });
    }
  });
};

/**
 * 跳转到登录页面
 */
const navToLogin = () => {
  uni.navigateTo({
    url: '/packageA/pages/login/login',
    fail: (err) => {
      console.error('跳转到登录页失败:', err);
    }
  });
};

/**
 * 格式化金额（分转元）
 * @param {number} money - 金额（分）
 * @returns {string} 格式化后的金额
 */
const formatMoney = (money) => {
  if (!money && money !== 0) return '0.00';
  return (money / 100).toFixed(2);
};
</script>

<style lang="scss">
.container {
  padding-bottom: 200upx;  /* 增加底部内边距，避免被底部栏遮挡 */

  /* 空白页样式 */
  .empty {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100vh;
    padding-bottom: 100upx;
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    background: #fff;

    image {
      width: 240upx;
      height: 160upx;
      margin-bottom: 30upx;
    }

    .empty-tips {
      display: flex;
      font-size: $font-sm + 1px;
      color: $font-color-disabled;

      .navigator {
        color: $uni-color-primary;
        margin-left: 16upx;
      }
    }
  }
}

/* 购物车列表项样式 */
.cart-item {
  display: flex;
  position: relative;
  padding: 30upx 40upx;

  /* 商品图片容器 */
  .image-wrapper {
    width: 230upx;
    height: 230upx;
    flex-shrink: 0;
    position: relative;

    image {
      border-radius: 8upx;
    }

    /* 选择框 */
    .checkbox {
      position: absolute;
      left: -16upx;
      top: -16upx;
      z-index: 8;
      font-size: 44upx;
      line-height: 1;
      padding: 4upx;
      color: $font-color-disabled;
      background: #fff;
      border-radius: 50px;
    }
  }

  /* 商品信息区域 */
  .item-right {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
    position: relative;
    padding-left: 30upx;

    .title,
    .price {
      font-size: $font-base + 1px;
      color: $font-color-dark;
      height: 40upx;
      line-height: 40upx;
    }

    .attr {
      font-size: $font-sm + 1px;
      color: $font-color-light;
      height: 50upx;
      line-height: 50upx;
    }

    .price {
      height: 50upx;
      line-height: 50upx;
    }
  }

  /* 删除按钮 */
  .del-btn {
    padding: 4upx 10upx;
    font-size: 34upx;
    height: 50upx;
    color: $font-color-light;
    &:active {
      color: $uni-color-error;
    }
  }
}

/* 底部操作栏样式 */
.action-section {
  /* H5环境特殊处理 */
  /* #ifdef H5 */
  margin-bottom: 100upx;
  /* #endif */

  position: fixed;
  left: 30upx;
  bottom: 30upx;
  z-index: 95;
  display: flex;
  align-items: center;
  justify-content: space-between;  /* 改为两端对齐 */

  width: 690upx;
  height: 100upx;
  padding: 0 20upx;  /* 减少内边距 */
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 20upx 0 rgba(0, 0, 0, 0.5);
  border-radius: 16upx;
  backdrop-filter: blur(20upx);  /* 毛玻璃效果 */


  /* 全选区域 */
  .checkbox {
    height: 51px;
    position: relative;
    display: flex;
    align-items: center;
    gap: 20upx; /* 在图片和清空按钮之间添加间距 */

    image {
      width: 51px;
      height: 100%;
      position: relative;
      z-index: 5;
      flex-shrink: 0; /* 防止图片被压缩 */

    }

    /* 清空按钮 */
    .clear-btn {
      /* 移除绝对定位 */
      position: static;
      left: auto;
      top: auto;
      z-index: 4;
      width: auto; /* 改为自动宽度 */
      height: 51px;
      line-height: 51px; /* 行高等于高度，垂直居中 */  /*清空按钮文字不在正中间是因为padding: 0 20upx和line-height组合的问题*/
      padding: 0 20upx; /* 左右内边距 */
      font-size: $font-base;
      color: #fff;
      background: $font-color-disabled;
      border-radius: 25px; /* 改为圆角 */
      opacity: 0;
      transition: 0.3s;
      white-space: nowrap; /* 防止文字换行 */
      overflow: hidden;
      min-width: 0; /* 初始最小宽度为0 */
      text-align: center; /* 添加：文字水平居中 */
      display: flex; /* 添加：使用flex布局确保居中 */
      align-items: center; /* 添加：垂直居中 */
      justify-content: center; /* 添加：水平居中 */

      /* 显示状态 */
      &.show {
        opacity: 1;
        min-width: 120upx; /* 显示时有最小宽度 */
        padding: 0 20upx; /* 显示时有内边距 */
      }
    }
  }

  /* 价格汇总区域 */
  .total-box {
    flex: 1;
    display: flex;
    flex-direction: column;
    text-align: right;
    padding-right: 40upx;

    .price {
      font-size: $font-lg;
      color: $font-color-dark;
    }

    .coupon {
      font-size: $font-sm;
      color: $font-color-light;

      text {
        color: $font-color-dark;
      }
    }
  }

  /* 结算按钮 */
  .confirm-btn {
    padding: 0 38upx;
    margin: 0;
    border-radius: 100px;
    height: 76upx;
    line-height: 76upx;
    font-size: $font-base + 1px;
    background: $uni-color-primary;
    box-shadow: 1px 2px 5px rgba(217, 60, 93, 0.72);

    /* 禁用状态 */
    &[disabled] {
      background: $font-color-disabled;
      box-shadow: none;
    }
  }
}

/* 复选框选中状态样式 */
.action-section .checkbox.checked,
.cart-item .checkbox.checked {
  color: $uni-color-primary;
}
</style>
