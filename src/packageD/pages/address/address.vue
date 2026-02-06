<template>
  <view class="content b-t">
    <!-- 地址列表 -->
    <view
      class="list b-b"
      v-for="(item, index) in addressList"
      :key="index"
      @click="checkAddress(item)"
    >
      <view class="wrapper">
        <view class="address-box">
          <!-- 默认地址标签 -->
          <text v-if="item.defaulted==1" class="tag">默认</text>
          <!-- 详细地址 -->
          <text class="address">
            {{ item.province }}{{item.city}}{{item.area}} {{ item.detailAddress }}
          </text>
        </view>
        <!-- 联系人信息 -->
        <view class="u-box">
          <text class="name">{{ item.consigneeName }}</text>
          <text class="mobile">{{ item.consigneeMobile }}</text>
        </view>
      </view>
      <!-- 编辑按钮 -->

<!--      最可靠的方案是使用SVG图标，它不受字体加载问题影响，兼容性最好。-->
      <text
        class="yticon icon-bianji"
        @click.stop="addAddress('edit', item)"
      ></text>
    </view>

    <!-- 新增地址按钮 -->
    <button class="add-btn" @click="addAddress('add')">新增地址</button>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { list } from '@/packageD/api/ums/address';
import { useUserStore } from '@/store';

// 使用组合式API定义响应式数据
const addressList = ref([]); // 地址列表数据
const source = ref(0); // 来源：0-普通查看，1-选择地址

// 获取用户store
const userStore = useUserStore();

// 计算属性：是否已登录
const hasLogin = computed(() => userStore.hasLogin);

// 计算属性：会员ID
const memberId = computed(() => userStore.memberId);

/**
 * 页面加载生命周期
 * @param {Object} options - 页面参数
 */
onLoad((options) => {
  console.log('========>> 进入会员地址列表页面');
  // 从参数获取来源
  source.value = options.source || 0;
  getAddressList();
});

/**
 * 页面显示生命周期
 */
onShow(() => {
  // 页面显示时刷新数据
  getAddressList();
});

/**
 * 获取地址列表
 */
const getAddressList = async () => {
  try {
    // 检查是否已登录
    if (!hasLogin.value) {
      uni.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    const response = await list(memberId.value);

    console.log('获取会员地址', response);

    addressList.value = response;
  } catch (error) {
    console.error('获取地址列表失败:', error);
    uni.showToast({
      title: '获取地址失败',
      icon: 'none'
    });
  }
};

/**
 * 选择地址
 * @param {Object} item - 地址对象
 */
const checkAddress = (item) => {
  // 如果是从订单页面跳转过来的（source=1），则返回选择的地址
  if (source.value == 1) {
    // 获取页面栈
    const pages = getCurrentPages();
    if (pages.length >= 2) {
      const prevPage = pages[pages.length - 2];
      // 设置上一页的数据
      if (prevPage && prevPage.$vm) {
        prevPage.$vm.selectedAddress = item;
      }
    }
    uni.navigateBack();
  }
};

/**
 * 新增/编辑地址
 * @param {string} type - 操作类型：add(新增)/edit(编辑)
 * @param {Object} item - 地址对象（编辑时传递）
 */
const addAddress = (type, item = null) => {


  let url = `/packageD/pages/address/addressManage?type=${type}`;

  if (type === 'edit' && item) {
    // 确保正确编码JSON数据
    url += `&data=${encodeURIComponent(JSON.stringify(item))}`;
  }

  console.log('跳转到编辑地址管理页面地址数据:', item);

  console.log('跳转到地址管理页面URL:', url);

  // 跳转到地址管理页面
  uni.navigateTo({

    //微信小程序环境中不支持原生的 URLSearchParams对象
    url: url
  });
};

/**
 * 刷新地址列表
 * 在地址添加/编辑成功后调用
 */
const refreshList = () => {
  getAddressList();
};

// 暴露方法，供子组件调用
defineExpose({
  refreshList
});
</script>

<style lang="scss" scoped>
/* 页面样式 */
.content {
  position: relative;
  padding-bottom: 120rpx; // 为底部按钮预留空间
}

/* 地址项样式 */
.list {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  background: #fff;
  position: relative;
  border-bottom: 1px solid #f5f5f5; // 底部边框

  &:last-child {
    border-bottom: none; // 最后一项无边框
  }
}

/* 地址内容包装器 */
.wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
}

/* 地址信息区域 */
.address-box {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;

  /* 默认地址标签 */
  .tag {
    font-size: 24rpx;
    color: $base-color;
    margin-right: 10rpx;
    background: #fffafb;
    border: 1px solid #ffb4c7;
    border-radius: 4rpx;
    padding: 4rpx 10rpx;
    line-height: 1;
    flex-shrink: 0; // 防止标签被压缩
  }

  /* 详细地址 */
  .address {
    font-size: 30rpx;
    color: $font-color-dark;
    line-height: 1.4;
  }
}

/* 联系人信息区域 */
.u-box {
  font-size: 28rpx;
  color: $font-color-light;

  .name {
    margin-right: 30rpx;
  }

  .mobile {
    color: #666;
  }
}

/* 在分包页面中重新定义字体 */
@font-face {
  font-family: 'yticon';
  font-weight: normal;
  font-style: normal;
  src: url('https://at.alicdn.com/t/font_1078604_w4kpxh0rafi.ttf') format('truetype');
}

/* 在分包页面中定义图标样式 */
.iconfont {
  font-family: "yticon" !important;
  font-size: 16px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.icon-bianji:before {
  content: "\e646";
}

/* 编辑图标样式 */
.edit-icon {
  display: flex;
  align-items: center;
  height: 80rpx;
  font-size: 40rpx;
  color: $font-color-light;
  padding-left: 30rpx;
  flex-shrink: 0;

  &:active {
    opacity: 0.7;
  }
}

/* 新增地址按钮 */
.add-btn {
  position: fixed;
  left: 30rpx;
  right: 30rpx;
  bottom: 16rpx;
  z-index: 95;
  display: flex;
  align-items: center;
  justify-content: center;
  width: calc(100% - 60rpx); // 响应式宽度
  height: 80rpx;
  font-size: 32rpx;
  color: #fff;
  background-color: $base-color;
  border-radius: 10rpx;
  box-shadow: 1px 2px 5px rgba(219, 63, 96, 0.4);
  border: none; // 去除默认边框

  &:active {
    opacity: 0.9; // 点击效果
    transform: scale(0.99); // 轻微缩放效果
  }

  &:disabled {
    opacity: 0.6; // 禁用状态
  }
}

/* 空状态提示 */
.empty-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
  color: #999;
  font-size: 28rpx;

  .icon {
    font-size: 120rpx;
    margin-bottom: 20rpx;
    color: #ddd;
  }
}
</style>
