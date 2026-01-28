<template>
  <view class="container">
    <!-- 轮播图区域 -->
    <view class="carousel">
      <swiper indicator-dots circular="true" duration="400" autoplay>
        <swiper-item
          class="swiper-item"
          v-for="(item, index) in goodsInfo.album"
          :key="index"
        >
          <view class="image-wrapper">
            <image
              :src="item"
              class="loaded"
              mode="aspectFill"
              lazy-load
            ></image>
          </view>
        </swiper-item>
      </swiper>
    </view>

    <!-- 商品基本信息 -->
    <view class="introduce-section">
      <text class="title">{{ goodsInfo.name }}</text>
      <view class="price-box">
        <text class="price-tip">¥</text>
        <text class="price">{{ formatMoney(goodsInfo.price) }}</text>
        <text class="m-price">¥{{ formatMoney(goodsInfo.originPrice) }}</text>
        <!-- <text class="coupon-tip">7折</text> -->
      </view>
      <view class="bot-row">
        <text>销量: {{ goodsInfo.sales || 0 }}</text>
        <text>库存: {{ selectedSku.stock || 0 }}</text>
        <text>浏览量: {{ goodsInfo.viewCount || 768 }}</text>
      </view>
    </view>

    <!-- 分享活动区域 -->
    <view class="share-section" @click="handleShare">
      <view class="share-icon">
        <text class="yticon icon-xingxing"></text>
        返
      </view>
      <text class="tit">该商品分享可领49减10红包</text>
      <text class="yticon icon-bangzhu1"></text>
      <view class="share-btn">
        立即分享
        <text class="yticon icon-you"></text>
      </view>
    </view>

    <!-- 商品属性信息列表 -->
    <view class="c-list">
      <!-- 规格选择 -->
      <view class="c-row b-b" @click="toggleSpec('all')">
        <text class="tit">购买类型</text>
        <view class="con">
          <text
            v-if="selectedSku.name"
            class="selected-text"
          >
            {{ selectedSku.name }}
          </text>
          <text v-else class="selected-text">请选择规格</text>
        </view>
        <text class="yticon icon-you"></text>
      </view>

      <!-- 购买数量 -->
      <view class="c-row b-b">
        <text class="tit">购买数量</text>
        <view class="con">
          <view class="stepper">
            <view
              class="minus"
              :class="{ disabled: quantity <= 1 }"
              @click="decreaseQuantity"
            >
              <text class="yticon icon-jianhao"></text>
            </view>
            <input
              class="input"
              type="number"
              v-model="quantity"
              @blur="handleQuantityBlur"
              @input="handleQuantityInput"
            />
            <view
              class="plus"
              :class="{ disabled: quantity >= maxQuantity }"
              @click="increaseQuantity"
            >
              <text class="yticon icon-jia"></text>
            </view>
          </view>
        </view>
      </view>

      <!-- 优惠券 -->
      <view class="c-row b-b">
        <text class="tit">优惠券</text>
        <view class="con" @click="openCouponPopup">
          <text class="t-r red">领取优惠券</text>
        </view>
        <text class="yticon icon-you"></text>
      </view>

      <!-- 促销活动 -->
      <view class="c-row b-b">
        <text class="tit">促销活动</text>
        <view class="con-list">
          <text>新人首单送20元无门槛代金券</text>
          <text>订单满50减10</text>
          <text>订单满100减30</text>
          <text>单笔购买满两件免邮费</text>
        </view>
      </view>

      <!-- 服务保障 -->
      <view class="c-row b-b">
        <text class="tit">服务</text>
        <view class="bz-list con">
          <text>7天无理由退换货 ·</text>
          <text>假一赔十 ·</text>
        </view>
      </view>
    </view>

    <!-- 用户评价区域 -->
    <view class="eva-section">
      <view class="e-header">
        <text class="tit">评价</text>
        <text>(86)</text>
        <text class="tip">好评率 100%</text>
        <text class="yticon icon-you"></text>
      </view>
      <view class="eva-box">
        <image
          class="portrait"
          src="http://img3.imgtn.bdimg.com/it/u=1150341365,1327279810&fm=26&gp=0.jpg"
          mode="aspectFill"
          lazy-load
        ></image>
        <view class="right">
          <text class="name">Leo yo</text>
          <text class="con">商品收到了，79元两件，质量不错，试了一下有点瘦，但是加个外罩很漂亮，我很喜欢</text>
          <view class="bot">
            <text class="attr">购买类型：XL 红色</text>
            <text class="time">2019-04-01 19:21</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 商品图文详情 -->
    <view class="detail-desc">
      <view class="d-header">
        <text>图文详情</text>
      </view>
      <rich-text :nodes="formattedSpuDetail"></rich-text>
    </view>

    <!-- 底部操作菜单（固定定位） -->
    <view class="page-bottom">
      <!-- 首页导航 -->
      <navigator
        url="/pages/index/index"
        open-type="switchTab"
        class="p-b-btn"
      >
        <text class="yticon icon-xiatubiao--copy"></text>
        <text>首页</text>
      </navigator>

      <!-- 购物车导航 -->
      <navigator
        url="/pages/cart/cart"
        open-type="switchTab"
        class="p-b-btn"
      >
        <text class="yticon icon-gouwuche"></text>
        <text>购物车</text>
      </navigator>

      <!-- 收藏按钮 -->
      <view
        class="p-b-btn"
        :class="{ active: isFavorite }"
        @click="toggleFavorite"
      >
        <text class="yticon icon-shoucang"></text>
        <text>收藏</text>
      </view>

      <!-- 购买操作按钮组 -->
      <view class="action-btn-group">
        <!-- 立即购买按钮 -->
        <button
          type="primary"
          class="action-btn no-border buy-now-btn"
          @click="handleBuyNow"
        >
          立即购买
        </button>
        <!-- 加入购物车按钮 -->
        <button
          type="primary"
          class="action-btn no-border add-cart-btn"
          @click="handleAddToCart"
        >
          加入购物车
        </button>
      </view>
    </view>

    <!-- 规格选择弹窗（模态层） -->
    <view
      class="popup spec"
      :class="specClass"
      @touchmove.stop.prevent="stopPrevent"
      @click="toggleSpec('close')"
    >
      <!-- 遮罩层 -->
      <view class="mask"></view>

      <!-- 规格选择内容区域 -->
      <view class="layer attr-content" @click.stop="stopPrevent">
        <!-- 顶部商品信息 -->
        <view class="a-t">
          <image :src="selectedSku.picUrl" mode="aspectFill" />
          <view class="right">
            <text class="price">¥{{ formatMoney(selectedSku.price) }}</text>
            <text class="stock">库存：{{ selectedSku.stock || 0 }}件</text>
            <view class="selected">
              已选：
              <text
                v-for="(sItem, sIndex) in selectedSpecValues"
                :key="sIndex"
                class="selected-text"
              >
                {{ sItem.value }}
              </text>
            </view>
          </view>
        </view>

        <!-- 规格选项列表 -->
        <view
          v-for="(spec, specIndex) in specList"
          :key="spec.id || specIndex"
          class="attr-list"
        >
          <text>{{ spec.name }}</text>
          <view class="item-list">
            <text
              v-for="(specItem, specItemIndex) in spec.values"
              :key="specItem.id"
              class="tit"
              :class="{ selected: specItem.selected, disabled: !checkSpecAvailable(specIndex, specItemIndex) }"
              @click="handleSelectSpec(specIndex, specItemIndex)"
            >
              {{ specItem.value }}
            </text>
          </view>
        </view>

        <!-- 购买数量 -->
        <view class="quantity-section">
          <text class="quantity-label">购买数量</text>
          <view class="quantity-stepper">
            <view
              class="minus"
              :class="{ disabled: quantity <= 1 }"
              @click="decreaseQuantity"
            >
              <text class="yticon icon-jianhao"></text>
            </view>
            <input
              class="input"
              type="number"
              v-model="quantity"
              @blur="handleQuantityBlur"
              @input="handleQuantityInput"
            />
            <view
              class="plus"
              :class="{ disabled: quantity >= maxQuantity }"
              @click="increaseQuantity"
            >
              <text class="yticon icon-jia"></text>
            </view>
          </view>
        </view>

        <!-- 完成按钮 -->
        <button class="btn" @click="handleConfirmSpec">完成</button>
      </view>
    </view>

    <!-- 优惠券弹窗 -->
    <view>
      <uni-popup ref="couponPopupRef" class="coupon-popup" type="bottom">
        <view class="coupon-container">
          <view class="coupon-item">
            <uni-row>
              <uni-col :span="10">
                <view class="coupon-item__left">
                  <view class="coupon-left-content">
                    <view>
                      <text class="coupon-discount">1</text>折
                    </view>
                    <view class="coupon-condition">满1000元可用</view>
                  </view>
                </view>
              </uni-col>
              <uni-col :span="14">
                <view class="coupon-item__right">
                  <view class="coupon-right-content">
                    <view class="coupon-info">
                      <view>
                        <uni-tag text="通用" type="error" :inverted="true" :circle="true"></uni-tag>
                      </view>
                      <view class="coupon-desc">全场通用</view>
                    </view>
                    <view class="coupon-actions">
                      <text class="coupon-validity">领取2天有效</text>
                      <view>
                        <button size="mini" type="warn" @click="handleClaimCoupon">立即领取</button>
                      </view>
                    </view>
                  </view>
                </view>
              </uni-col>
            </uni-row>
          </view>
        </view>
      </uni-popup>
    </view>

    <!-- 分享组件 -->
    <share
      ref="shareRef"
      :contentHeight="580"
      :shareList="shareList"
    ></share>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { onLoad, onReady } from '@dcloudio/uni-app';
import share from '@/components/share';
import { getSpuDetail } from '@/api/pms/goods';
import { addCartItem } from '@/api/oms/cart';

// 响应式数据定义
const goodsInfo = ref({ // 商品基本信息
  id: undefined,
  name: '',
  originPrice: 0,
  price: 0,
  album: [],
  detail: '',
  sales: 0,
  viewCount: 0
});

const attributeList = ref([]); // 商品属性列表
const specList = ref([]); // 商品规格列表
const skuList = ref([]); // SKU库存列表
const isFavorite = ref(false); // 收藏状态
const shareList = ref([]); // 分享列表
const specClass = ref('none'); // 规格弹窗状态: none/hide/show
const selectedSku = ref({}); // 当前选中的SKU
const selectedSpecValues = ref([]); // 当前选中的规格值列表
const addCartMode = ref(false); // 是否加入购物车模式
const quantity = ref(1); // 购买数量
const maxQuantity = computed(() => selectedSku.value.stock || 99); // 最大购买数量

// 组件引用
const couponPopupRef = ref(null); // 优惠券弹窗引用
const shareRef = ref(null); // 分享组件引用

// 计算属性：格式化商品详情
const formattedSpuDetail = computed(() => {
  return formatRichText(goodsInfo.value.detail);
});

// 计算属性：是否已选择所有规格
const isAllSpecsSelected = computed(() => {
  return selectedSpecValues.value.length === specList.value.length;
});

// 页面加载
onLoad((options) => {
  const goodsId = options.id;
  console.log('🚀 页面参数:', options);
  console.log('🚀 进入商品详情页，商品ID:', goodsId);

  if (!goodsId) {
    uni.showToast({
      title: '商品ID不能为空',
      icon: 'none'
    });
    uni.navigateBack();
    return;
  }

  loadGoodsDetail(goodsId);
});

/**
 * 加载商品详情
 * @param {number} goodsId - 商品ID
 */
const loadGoodsDetail = async (goodsId) => {
  try {
    uni.showLoading({ title: '加载中...' });

    const response = await getSpuDetail(goodsId);
    console.log('🚀 加载商品详情:', response);

    const {
      goodsInfo: spuInfo,
      attributeList: attrs,
      specList: specs,    // ← 这里是规格列表
      skuList: skus
    } = response || {};

    // 更新商品信息
    goodsInfo.value = { ...goodsInfo.value, ...spuInfo };
    attributeList.value = attrs || [];
    specList.value = specs || [];
    skuList.value = skus || [];

    // 重置数量
    quantity.value = 1;

    // 如果有规格，默认选中第一个规格组合
    if (skuList.value.length > 0) {
      // 默认选中第一个SKU
      selectedSku.value = skuList.value[0];
      // 初始化规格选择
      initSpecSelectionFromSku(selectedSku.value);
    }

  } catch (error) {
    console.error('加载商品详情失败:', error);
    uni.showToast({
      title: '加载商品详情失败',
      icon: 'none'
    });
  } finally {
    uni.hideLoading();
  }
};

/**
 * 从SKU初始化规格选择
 */
const initSpecSelectionFromSku = (sku) => {
  if (!sku || !sku.specIds) return;

  selectedSpecValues.value = [];

  // 解析SKU的规格ID
  const specIds = sku.specIds.split('_').map(id => parseInt(id));

  // 查找对应的规格值
  specList.value.forEach(spec => {
    if (spec.values && spec.values.length > 0) {
      spec.values.forEach(value => {
        if (specIds.includes(value.id)) {
          value.selected = true;
          selectedSpecValues.value.push(value);
        } else {
          value.selected = false;
        }
      });
    }
  });
};

/**
 * 检查规格是否可用
 */
const checkSpecAvailable = (specIndex, specValueIndex) => {
  // 这里可以添加规格可用性检查逻辑
  // 比如检查库存、是否可售等
  return true;
};

/**
 * 更新选中的SKU
 */
const updateSelectedSku = () => {
  if (selectedSpecValues.value.length === 0) {
    selectedSku.value = {};
    return;
  }

  // 获取选中的规格ID数组
  const selectedSpecIds = selectedSpecValues.value.map(item => item.id).sort();

  // 查找匹配的SKU
  const matchedSku = skuList.value.find(sku => {
    if (!sku.specIds) return false;
    const skuSpecIds = sku.specIds.split('_').map(id => parseInt(id)).sort();
    return selectedSpecIds.length === skuSpecIds.length &&
      selectedSpecIds.every((id, index) => id === skuSpecIds[index]);
  });

  selectedSku.value = matchedSku || {};

  // 如果未找到匹配的SKU，显示提示
  if (!matchedSku) {
    console.warn('未找到匹配的SKU');
  }

  // 重置数量为1
  quantity.value = 1;
};

/**
 * 格式化富文本（处理图片自适应）
 * @param {string} html - 原始HTML
 * @returns {string} 格式化后的HTML
 */
const formatRichText = (html) => {
  if (!html) return '';

  // 处理图片自适应
  return html.replace(/<(img).*?(\/>|<\/img>)/g, (match) => {
    if (match.indexOf('style') < 0) {
      return match.replace(/<\s*img/, '<img style="max-width:100%;height:auto;"');
    } else {
      return match.replace(/style=("|')/, 'style=$1max-width:100%;height:auto;');
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

/**
 * 切换规格弹窗显示状态
 * @param {string} action - 操作类型: 'all'查看所有, 'close'关闭
 */
const toggleSpec = (action) => {
  if (action === 'close') {
    if (specClass.value === 'show') {
      specClass.value = 'hide';
      setTimeout(() => {
        specClass.value = 'none';
      }, 250);
    }
  } else if (action === 'all') {
    if (specClass.value === 'none') {
      specClass.value = 'show';
    }
  } else {
    // 默认切换
    if (specClass.value === 'show') {
      specClass.value = 'hide';
      setTimeout(() => {
        specClass.value = 'none';
      }, 250);
    } else if (specClass.value === 'none') {
      specClass.value = 'show';
    }
  }
};

/**
 * 选择规格
 * @param {number} specIndex - 规格索引
 * @param {number} specValueIndex - 规格值索引
 */
const handleSelectSpec = (specIndex, specValueIndex) => {
  const spec = specList.value[specIndex];
  if (!spec || !spec.values) return;

  // 检查是否可用
  if (!checkSpecAvailable(specIndex, specValueIndex)) {
    return;
  }

  // 更新选中状态
  spec.values.forEach((value, index) => {
    value.selected = index === specValueIndex;
  });

  // 更新选中的规格值
  selectedSpecValues.value = [];
  specList.value.forEach(item => {
    const selectedValue = item.values?.find(v => v.selected);
    if (selectedValue) {
      selectedSpecValues.value.push(selectedValue);
    }
  });

  // 更新选中的SKU
  updateSelectedSku();

  console.log('当前选择的SKU:', selectedSku.value);
};

/**
 * 确认规格选择
 */
const handleConfirmSpec = () => {
  if (!isAllSpecsSelected.value) {
    uni.showToast({
      title: '请选择完整规格',
      icon: 'none'
    });
    return;
  }

  // 关闭弹窗
  toggleSpec('close');

  // 如果是加入购物车模式，执行加入购物车
  if (addCartMode.value) {
    addCartMode.value = false;
    doAddToCart();
  }
};

/**
 * 减少数量
 */
const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

/**
 * 增加数量
 */
const increaseQuantity = () => {
  if (quantity.value < maxQuantity.value) {
    quantity.value++;
  }
};

/**
 * 处理数量输入
 */
const handleQuantityInput = (e) => {
  let value = parseInt(e.detail.value) || 1;
  if (value < 1) {
    value = 1;
  } else if (value > maxQuantity.value) {
    value = maxQuantity.value;
  }
  quantity.value = value;
};

/**
 * 处理数量输入框失去焦点
 */
const handleQuantityBlur = () => {
  if (!quantity.value || quantity.value < 1) {
    quantity.value = 1;
  } else if (quantity.value > maxQuantity.value) {
    quantity.value = maxQuantity.value;
  }
};

/**
 * 打开分享面板
 */
const handleShare = () => {
  if (shareRef.value) {
    shareRef.value.toggleMask();
  }
};

/**
 * 切换收藏状态
 */
const toggleFavorite = async () => {
  isFavorite.value = !isFavorite.value;

  const action = isFavorite.value ? '收藏' : '取消收藏';
  uni.showToast({
    title: `${action}成功`,
    icon: 'success'
  });

  // TODO: 调用收藏接口
};

/**
 * 立即购买
 */
const handleBuyNow = () => {
  if (!selectedSku.value.id) {
    // 如果没有选择规格，打开弹窗
    toggleSpec('all');
    return;
  }

  const skuId = selectedSku.value.id;
  if (!skuId) {
    uni.showToast({
      title: '请先选择商品规格',
      icon: 'none'
    });
    return;
  }

  uni.navigateTo({
    url: `/pages/order/createOrder?skuId=${skuId}&count=${quantity.value}`,
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
 * 加入购物车
 */
const handleAddToCart = () => {
  if (!selectedSku.value.id) {
    // 如果没有选择规格，设置模式并打开弹窗
    addCartMode.value = true;
    toggleSpec('all');
  } else {
    // 如果已经选择了规格，直接加入购物车
    doAddToCart();
  }
};

/**
 * 执行加入购物车操作
 */
const doAddToCart = async () => {
  const skuId = selectedSku.value.id;

  console.log('添加购物车所需要的库存ID:', skuId);
  if (!skuId) {
    uni.showToast({
      title: '请先选择商品规格',
      icon: 'none'
    });
    return;
  }

  try {
    uni.showLoading({ title: '添加中...' });

    await addCartItem(skuId, quantity.value);

    uni.showToast({
      title: '添加成功',
      icon: 'success'
    });

    // 延迟跳转，让toast显示完整
    setTimeout(() => {
      uni.switchTab({
        url: '/pages/cart/cart',
        fail: (err) => {
          console.error('跳转到购物车失败:', err);
        }
      });
    }, 1500);

  } catch (error) {
    console.error('添加购物车失败:', error);
    uni.showToast({
      title: '添加购物车失败:'+ error.message,
      icon: 'none'
    });
  } finally {
    uni.hideLoading();
  }
};

/**
 * 打开优惠券弹窗
 */
const openCouponPopup = () => {
  if (couponPopupRef.value) {
    couponPopupRef.value.open('bottom');
  }
};

/**
 * 领取优惠券
 */
const handleClaimCoupon = () => {
  uni.showToast({
    title: '领取成功',
    icon: 'success'
  });

  // 关闭弹窗
  if (couponPopupRef.value) {
    couponPopupRef.value.close();
  }
};

/**
 * 阻止事件冒泡
 */
const stopPrevent = () => {};

// 监听选中的规格值变化
watch(selectedSpecValues, () => {
  updateSelectedSku();
}, { deep: true });
</script>

<style lang="scss" scoped>
/* 页面容器 */
.container {
  background-color: #f8f8f8; /* 页面背景色 */
  padding-bottom: 180rpx; /* 为底部操作栏留出空间 */
  min-height: 100vh;
  box-sizing: border-box;
}

/* 图标右箭头样式 */
.icon-you {
  font-size: 28rpx; /* 字体大小 */
  color: #888; /* 灰色 */
}

/* 轮播图区域 */
.carousel {
  height: 722rpx; /* 固定高度 */
  position: relative;
  background-color: #fff; /* 白色背景 */
  overflow: hidden;

  swiper {
    width: 100%;
    height: 100%;
  }

  .image-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .swiper-item {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 750rpx;
    overflow: hidden;

    image {
      width: 100%;
      height: 100%;
      object-fit: cover; /* 保持图片比例 */
    }
  }
}

/* 商品信息介绍区域 */
.introduce-section {
  background-color: #fff; /* 白色背景 */
  padding: 20rpx 30rpx;
  margin-top: 16rpx;
  border-radius: 16rpx 16rpx 0 0; /* 圆角 */

  .title {
    font-size: 32rpx; /* 标题字体大小 */
    color: #333; /* 深灰色 */
    line-height: 1.5;
    font-weight: 600; /* 加粗 */
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2; /* 最多显示两行 */
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .price-box {
    display: flex;
    align-items: baseline; /* 基线对齐 */
    margin-top: 20rpx;
    padding: 10rpx 0;
  }

  .price-tip {
    font-size: 24rpx;
    color: #e54d42; /* 主色调红色 */
    margin-right: 4rpx;
  }

  .price {
    font-size: 40rpx; /* 大字体 */
    color: #e54d42;
    font-weight: bold;
  }

  .m-price {
    margin-left: 20rpx;
    font-size: 24rpx;
    color: #999; /* 浅灰色 */
    text-decoration: line-through; /* 删除线 */
  }

  .coupon-tip {
    margin-left: 20rpx;
    padding: 4rpx 12rpx;
    background: linear-gradient(135deg, #e54d42, #ff6b6b); /* 渐变背景 */
    font-size: 20rpx;
    color: #fff; /* 白色文字 */
    border-radius: 8rpx;
  }

  .bot-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 20rpx;
    padding-top: 20rpx;
    border-top: 1px solid #f0f0f0; /* 上边框 */
    font-size: 24rpx;
    color: #666; /* 中灰色 */

    text {
      flex: 1;
      text-align: center;

      &:not(:last-child) {
        border-right: 1px solid #f0f0f0; /* 分隔线 */
      }
    }
  }
}

/* 分享活动区域 */
.share-section {
  display: flex;
  align-items: center;
  background: linear-gradient(to right, #fdf5f6, #fbebf6); /* 粉色渐变 */
  margin: 20rpx 30rpx;
  padding: 20rpx 24rpx;
  border-radius: 12rpx;
  color: #333;
  font-size: 24rpx;

  .share-icon {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80rpx;
    height: 40rpx;
    line-height: 1;
    border: 2rpx solid #e54d42;
    border-radius: 8rpx;
    overflow: hidden;
    font-size: 20rpx;
    color: #e54d42;

    &::before {
      content: '';
      position: absolute;
      left: -20rpx;
      top: -20rpx;
      width: 60rpx;
      height: 60rpx;
      border-radius: 50%;
      background-color: #e54d42;
    }
  }

  .icon-xingxing {
    position: relative;
    z-index: 1;
    font-size: 24rpx;
    margin: 0 8rpx;
    color: #fff;
  }

  .tit {
    flex: 1;
    margin-left: 20rpx;
    font-size: 26rpx;
  }

  .icon-bangzhu1 {
    margin: 0 20rpx;
    font-size: 32rpx;
    color: #e54d42;
  }

  .share-btn {
    display: flex;
    align-items: center;
    font-size: 24rpx;
    color: #e54d42;

    .icon-you {
      margin-left: 8rpx;
      font-size: 24rpx;
      color: #e54d42;
    }
  }
}

/* 商品属性信息列表 */
.c-list {
  background-color: #fff;
  margin: 20rpx 30rpx;
  border-radius: 12rpx;
  overflow: hidden;
  font-size: 28rpx;

  .c-row {
    display: flex;
    align-items: center;
    padding: 24rpx 30rpx;
    position: relative;

    &.b-b::after {
      content: '';
      position: absolute;
      left: 30rpx;
      right: 0;
      bottom: 0;
      height: 1px;
      background-color: #f0f0f0; /* 下边框 */
    }
  }

  .tit {
    width: 160rpx;
    color: #666; /* 中灰色 */
  }

  .con {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    color: #333; /* 深灰色 */

    .selected-text {
      margin-right: 10rpx;
      padding: 4rpx 12rpx;
      background-color: #f8f8f8;
      border-radius: 6rpx;
      font-size: 24rpx;
    }

    /* 数量选择器样式 */
    .stepper {
      display: flex;
      align-items: center;
      border: 1px solid #e0e0e0;
      border-radius: 6rpx;
      overflow: hidden;
      width: 200rpx;
      height: 60rpx;

      .minus, .plus {
        width: 60rpx;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #f8f8f8;
        font-size: 24rpx;
        color: #333;

        &.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        &:active:not(.disabled) {
          background-color: #f0f0f0;
        }
      }

      .input {
        flex: 1;
        height: 100%;
        border: none;
        text-align: center;
        font-size: 28rpx;
        color: #333;
        background-color: #fff;

        &::-webkit-inner-spin-button,
        &::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      }
    }
  }

  .bz-list {
    text {
      display: inline-block;
      margin-right: 20rpx;
      color: #333;
    }
  }

  .con-list {
    flex: 1;
    display: flex;
    flex-direction: column;
    color: #333;
    line-height: 1.6;

    text {
      margin-bottom: 8rpx;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .red {
    color: #e54d42; /* 红色 */
  }

  .t-r {
    text-align: right;
  }
}

/* 评价区域 */
.eva-section {
  background-color: #fff;
  margin: 20rpx 30rpx;
  padding: 20rpx 24rpx;
  border-radius: 12rpx;

  .e-header {
    display: flex;
    align-items: center;
    padding-bottom: 20rpx;
    border-bottom: 1px solid #f0f0f0;
    font-size: 24rpx;
    color: #666;

    .tit {
      font-size: 28rpx;
      color: #333;
      font-weight: 600;
      margin-right: 10rpx;
    }

    .tip {
      flex: 1;
      text-align: right;
    }

    .icon-you {
      margin-left: 10rpx;
    }
  }
}

.eva-box {
  display: flex;
  padding: 20rpx 0;

  .portrait {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%; /* 圆形头像 */
    flex-shrink: 0;
  }

  .right {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding-left: 20rpx;
    font-size: 24rpx;
    color: #666;

    .name {
      font-size: 26rpx;
      color: #333;
      font-weight: 500;
    }

    .con {
      margin: 10rpx 0;
      line-height: 1.6;
      color: #333;
    }

    .bot {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 10rpx;
      font-size: 22rpx;
      color: #999;

      .attr {
        flex: 1;
      }

      .time {
        text-align: right;
      }
    }
  }
}

/* 商品详情区域 */
.detail-desc {
  background-color: #fff;
  margin: 20rpx 30rpx;
  padding: 20rpx 24rpx;
  border-radius: 12rpx;

  .d-header {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 80rpx;
    font-size: 28rpx;
    color: #333;
    position: relative;

    text {
      padding: 0 20rpx;
      background-color: #fff;
      position: relative;
      z-index: 1;
    }

    &::before {
      content: '';
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translateX(-50%);
      width: 300rpx;
      height: 1px;
      background-color: #ddd; /* 水平线 */
    }
  }
}

/* 规格选择弹窗 */
.popup {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  pointer-events: none; /* 默认不可点击 */

  &.show {
    display: block;
    pointer-events: auto; /* 显示时可点击 */

    .mask {
      animation: fadeIn 0.3s ease forwards;
    }

    .layer {
      animation: slideUp 0.3s ease forwards;
    }
  }

  &.hide {
    .mask {
      animation: fadeOut 0.3s ease forwards;
    }

    .layer {
      animation: slideDown 0.3s ease forwards;
    }
  }

  &.none {
    display: none;
  }

  .mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5); /* 半透明黑色遮罩 */
    opacity: 0;
  }

  .layer {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    max-height: 80vh;
    background-color: #fff;
    border-radius: 20rpx 20rpx 0 0;
    transform: translateY(100%);
    padding: 20rpx 30rpx 40rpx;
    overflow-y: auto;

    .a-t {
      display: flex;
      margin-bottom: 30rpx;
      padding-bottom: 20rpx;
      border-bottom: 1px solid #f0f0f0;

      image {
        width: 160rpx;
        height: 160rpx;
        border-radius: 12rpx;
        flex-shrink: 0;
        object-fit: cover;
      }

      .right {
        flex: 1;
        padding-left: 20rpx;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        .price {
          font-size: 36rpx;
          color: #e54d42;
          font-weight: bold;
        }

        .stock {
          font-size: 24rpx;
          color: #666;
        }

        .selected {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          font-size: 24rpx;
          color: #666;

          .selected-text {
            margin: 0 8rpx 8rpx 0;
            padding: 4rpx 12rpx;
            background-color: #f8f8f8;
            border-radius: 6rpx;
          }
        }
      }
    }

    .attr-list {
      margin-bottom: 30rpx;

      &:last-child {
        margin-bottom: 0;
      }

      & > text {
        display: block;
        font-size: 28rpx;
        color: #333;
        font-weight: 500;
        margin-bottom: 20rpx;
      }
    }

    .item-list {
      display: flex;
      flex-wrap: wrap;
      gap: 20rpx; /* 网格间距 */

      .tit {
        padding: 12rpx 24rpx;
        background-color: #f8f8f8;
        border-radius: 8rpx;
        font-size: 24rpx;
        color: #333;
        cursor: pointer;
        transition: all 0.3s ease;

        &:active {
          transform: scale(0.95);
        }

        &.selected {
          background-color: #ffe6e6;
          color: #e54d42;
          font-weight: 500;
        }

        &.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          text-decoration: line-through;
        }
      }
    }

    /* 数量选择区域 */
    .quantity-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 30rpx 0;
      border-top: 1px solid #f0f0f0;
      margin-top: 20rpx;

      .quantity-label {
        font-size: 28rpx;
        color: #333;
        font-weight: 500;
      }

      .quantity-stepper {
        display: flex;
        align-items: center;
        border: 1px solid #e0e0e0;
        border-radius: 8rpx;
        overflow: hidden;
        width: 240rpx;
        height: 70rpx;

        .minus, .plus {
          width: 70rpx;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f8f8f8;
          font-size: 28rpx;
          color: #333;

          &.disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          &:active:not(.disabled) {
            background-color: #f0f0f0;
          }
        }

        .input {
          flex: 1;
          height: 100%;
          border: none;
          border-left: 1px solid #e0e0e0;
          border-right: 1px solid #e0e0e0;
          text-align: center;
          font-size: 32rpx;
          color: #333;
          background-color: #fff;

          &::-webkit-inner-spin-button,
          &::-webkit-outer-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
        }
      }
    }

    .btn {
      margin-top: 20rpx;
      width: 100%;
      height: 80rpx;
      background: linear-gradient(135deg, #e54d42, #ff6b6b);
      color: #fff;
      font-size: 28rpx;
      border-radius: 40rpx;
      border: none;

      &:active {
        opacity: 0.9;
      }
    }
  }

  /* 动画定义 */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  @keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }

  @keyframes slideDown {
    from { transform: translateY(0); }
    to { transform: translateY(100%); }
  }
}

/* 底部操作栏 */
.page-bottom {
  position: fixed;
  left: 30rpx;
  bottom: 30rpx;
  z-index: 999;
  display: flex;
  align-items: center;
  width: 690rpx;
  height: 100rpx;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20rpx); /* 毛玻璃效果 */
  border-radius: 20rpx;
  box-shadow: 0 0 20rpx rgba(0, 0, 0, 0.1);

  .p-b-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100rpx;
    height: 100%;
    font-size: 20rpx;
    color: #666;

    .yticon {
      font-size: 40rpx;
      margin-bottom: 8rpx;
      color: #999;
    }

    &.active {
      color: #e54d42;

      .yticon {
        color: #e54d42;
      }
    }
  }

  .action-btn-group {
    flex: 1;
    display: flex;
    height: 76rpx;
    border-radius: 38rpx;
    overflow: hidden;
    box-shadow: 0 8rpx 16rpx rgba(229, 77, 66, 0.3);
    margin-left: 20rpx;
    background: linear-gradient(to right, #ffac30, #e54d42, #f56c6c);

    .action-btn {
      flex: 1;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 27rpx; /* 从 28rpx 改为 24rpx */
      color: #fff;
      border: none;
      position: relative;
      transition: opacity 0.2s;
      white-space: nowrap; /* 防止换行 */
      padding: 0 8rpx; /* 添加内边距 */

      &:active {
        opacity: 0.9;
      }

      &.buy-now-btn {
        background: linear-gradient(135deg, #ffac30, #e54d42);
      }

      &.add-cart-btn {
        background: linear-gradient(135deg, #e54d42, #f56c6c);
      }

      &.no-border {
        border: none;
        outline: none;
      }
    }
  }
}

/* 优惠券弹窗 */
.coupon-popup {
  z-index: 1001;

  .coupon-container {
    width: 100%;
    padding: 20rpx 0;
    background-color: #fff;
    border-radius: 20rpx 20rpx 0 0;

    .coupon-item {
      margin: 20rpx 30rpx;
      border: 2rpx dashed #e54d42;
      border-radius: 12rpx;
      overflow: hidden;

      &__left {
        background: linear-gradient(135deg, #e54d42, #ff6b6b);
        height: 140rpx;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .coupon-left-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        color: #fff;

        .coupon-discount {
          font-size: 40rpx;
          font-weight: bold;
        }

        .coupon-condition {
          margin-top: 10rpx;
          font-size: 20rpx;
        }
      }

      &__right {
        background-color: #fff;
        height: 140rpx;
      }

      .coupon-right-content {
        padding: 20rpx;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      .coupon-info {
        display: flex;
        align-items: center;

        .coupon-desc {
          margin-left: 20rpx;
          font-size: 24rpx;
          color: #333;
        }
      }

      .coupon-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .coupon-validity {
          font-size: 20rpx;
          color: #999;
        }

        button {
          padding: 0 20rpx;
          height: 50rpx;
          line-height: 50rpx;
        }
      }
    }
  }
}
</style>
