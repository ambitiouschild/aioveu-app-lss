<template>
  <view class="content">
    <!-- 联系人输入行 -->
    <view class="row b-b">
      <text class="tit">联系人</text>
      <input
        class="input"
        type="text"
        v-model="addressData.consigneeName"
        placeholder="收货人姓名"
        placeholder-class="placeholder"
        maxlength="20"
      />
    </view>

    <!-- 手机号输入行 -->
    <view class="row b-b">
      <text class="tit">手机号</text>
      <input
        class="input"
        type="number"
        v-model="addressData.consigneeMobile"
        placeholder="收货人手机号码"
        placeholder-class="placeholder"
        maxlength="11"
      />
    </view>

    <!-- 省市区选择（使用 picker 组件） -->
    <view class="row b-b">
      <text class="tit">地址</text>
      <!-- 这里直接使用 picker 组件 -->
      <picker
        mode="region"
        :value="region"
        @change="onRegionChange"
        @cancel="onPickerCancel"
      >
        <view class="input picker-input">
          {{ fullAddress || '请选择省市区' }}
          <text class="yticon icon-arrowdown"></text>
        </view>
      </picker>
    </view>

    <!-- 详细地址输入行 -->
    <view class="row b-b">
      <text class="tit">详细</text>
      <input
        class="input"
        type="text"
        v-model="addressData.detailAddress"
        placeholder="街道、楼号、门牌"
        placeholder-class="placeholder"
        maxlength="100"
      />
    </view>

    <!-- 默认地址开关行 -->
    <view class="row default-row">
      <text class="tit">设为默认</text>
      <switch
        :checked="addressData.defaulted == 1"
        color="#fa436a"
        @change="switchChange"
      />
    </view>

    <!-- 提交按钮 -->
    <button class="add-btn" @click="confirm">提交</button>

    <!-- 地址选择器 -->
    <picker
      v-if="showAddressPicker"
      mode="region"
      :value="region"
      @change="onRegionChange"
      @cancel="showAddressPicker = false"
    >
      <view></view>
    </picker>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { add, update } from '@/packageD/api/ums/address';
import { useUserStore } from '@/store';
// 地址数据
const addressData = ref({
  id: undefined,
  consigneeName: '',
  consigneeMobile: '',
  province: '',
  city: '',
  district: '',
  detailAddress: '',
  defaulted: 0
});


// 获取用户store
const userStore = useUserStore();

// 控制picker显示
const showAddressPicker = ref(false);

// 管理类型
const manageType = ref('add');

// 计算完整地址显示
const fullAddress = computed(() => {
  const { province, city, district } = addressData.value;
  if (province && city && district) {
    return `${province} ${city} ${district}`;
  }
  return '';
});

// region 值用于 picker
const region = computed(() => {
  return [addressData.value.province, addressData.value.city, addressData.value.district];
});

/**
 * 页面加载
 */
onLoad((options) => {
  console.log('========>> 进入会员地址管理页面, 参数：', options);

  let title = '新增收货地址';

  console.log("操作地址类型",options.type);

  if (options.type === 'edit'  && options.data) {
    title = '编辑收货地址';

    try {
      // 1. 先解码URL编码
      const decodedData = decodeURIComponent(options.data);  //options.data 是URL编码的
      console.log('解码后的数据:', decodedData);

      // 2. 再解析JSON
      const editData = JSON.parse(decodedData);
      console.log('解析后的数据:', editData);

      // 处理null值
      Object.keys(editData).forEach(key => {
        if (editData[key] === null) {
          editData[key] = '';
        }
      });

      // 合并到表单
      Object.assign(addressData.value, editData);

    } catch (error) {
      console.error('解析编辑数据失败:', error);
      uni.showToast({
        title: '数据解析失败，请重试',
        icon: 'none'
      });
    }
    console.log("解析后的编辑收货地址", addressData.value);

  } else {
    // 新增模式：设置默认值
    addressData.value = {
      id: undefined,
      consigneeName: '苏轼',
      consigneeMobile: '13061656199',
      province: '河南省',
      city: '郑州市',
      district: '二七区',
      detailAddress: '银基大厦',
      defaulted: 0
    };
  }

  manageType.value = options.type || 'add';

  // 设置页面标题
  uni.setNavigationBarTitle({ title });
});

/**
 * 省市区选择变化
 */
const onRegionChange = (e) => {
  const value = e.detail.value;
  addressData.value.province = value[0];
  addressData.value.city = value[1];
  addressData.value.district = value[2];
  showAddressPicker.value = false;
};

/**
 * 默认地址开关变化
 */
const switchChange = (e) => {
  addressData.value.defaulted = e.detail.value ? 1 : 0;
};

/**
 * 表单验证
 */
const validateForm = () => {
  const data = addressData.value;

  if (!data.consigneeName || data.consigneeName.trim() === '') {
    uni.showToast({ title: '请填写联系人姓名', icon: 'none' });
    return false;
  }

  const mobileReg = /^1[3-9]\d{9}$/;
  if (!mobileReg.test(data.consigneeMobile)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' });
    return false;
  }

  if (!data.province || !data.city || !data.district) {
    uni.showToast({ title: '请选择省市区', icon: 'none' });
    return false;
  }

  if (!data.detailAddress || data.detailAddress.trim() === '') {
    uni.showToast({ title: '请填写详细地址', icon: 'none' });
    return false;
  }

  return true;
};

/**
 * 提交表单
 */
const confirm = async () => {
  if (!validateForm()) return;

  try {
    const data = {
      ...addressData.value,
    };

    console.log(" 提交地址修改表单的id ",data.id);

    if (data.id) {
      await update(data.id, data);
      uni.showToast({ title: '地址修改成功', icon: 'success' });
    } else {
      await add(data);
      uni.showToast({ title: '地址添加成功', icon: 'success' });
    }

    // 通知上一页刷新
    const pages = getCurrentPages();
    if (pages.length >= 2) {
      const prevPage = pages[pages.length - 2];
      if (prevPage?.$vm?.refreshList) {
        prevPage.$vm.refreshList();
      }
    }

    setTimeout(() => {
      uni.navigateBack();
    }, 800);
  } catch (error) {
    console.error('保存地址失败:', error);
    uni.showToast({ title: '保存失败，请重试', icon: 'none' });
  }
};
</script>

<style lang="scss" scoped>
.content {
  background: $page-color-base;
  padding-top: 16rpx;
  min-height: 100vh;
  box-sizing: border-box;
}

.row {
  display: flex;
  align-items: center;
  position: relative;
  padding: 0 30rpx;
  height: 110rpx;
  background: #fff;
  margin-bottom: 1rpx;

  &:last-child {
    border-bottom: none;
  }

  &.disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .tit {
    flex-shrink: 0;
    width: 120rpx;
    font-size: 30rpx;
    color: $font-color-dark;
    font-weight: 500;
  }

  .input {
    flex: 1;
    font-size: 30rpx;
    color: $font-color-dark;
    height: 100%;
    display: flex;
    align-items: center;

    &:empty::before {
      content: attr(placeholder);
      color: $font-color-light;
    }
  }

  .icon-arrowdown {
    font-size: 36rpx;
    color: $font-color-light;
    margin-left: 20rpx;
  }

  &.b-b::after {
    content: '';
    position: absolute;
    left: 30rpx;
    right: 0;
    bottom: 0;
    height: 1px;
    background-color: $border-color;
    transform: scaleY(0.5);
  }
}

.default-row {
  margin-top: 16rpx;
  border-radius: 8rpx;
  overflow: hidden;

  .tit {
    flex: 1;
  }

  switch {
    transform: scale(0.9);
  }
}

.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: calc(100% - 60rpx);
  height: 80rpx;
  margin: 60rpx auto;
  font-size: $font-lg;
  color: #fff;
  background-color: $base-color;
  border-radius: 10rpx;
  box-shadow: 1px 2px 5px rgba(219, 63, 96, 0.4);
  border: none;

  &:active {
    opacity: 0.9;
    transform: scale(0.99);
  }

  &:disabled {
    opacity: 0.6;
    background-color: $font-color-light;
  }
}

.placeholder {
  color: $font-color-light;
  font-size: 28rpx;
}
</style>
