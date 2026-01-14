<template>
  <!-- 自定义导航栏的占位 -->
  <view style="width: 100%; height: var(--status-bar-height)" />

  <view class="user-container">
    <!-- 自定义导航栏 -->
    <uni-nav-bar
      title="用户管理"
      left-icon="left"
      @clickLeft="handleNavigateback"
      fixed
    />

    <!-- 排序筛选 -->
    <view class="filter-container">
      <!-- 使用 uni-popup 和 uni-grid 模拟下拉菜单 -->
      <view class="filter-bar">
        <view class="filter-item" @click="showSortPopup = true">
          <text>排序</text>
          <uni-icons type="arrowdown" size="14" color="#666"></uni-icons>
        </view>

        <view class="filter-item" @click="showFilterPopup = true">
          <text>筛选</text>
          <uni-icons type="filter" size="14" color="#666"></uni-icons>
        </view>
      </view>

      <!-- 排序弹出层 -->
      <uni-popup ref="sortPopup" type="bottom" background-color="#fff">
        <view class="popup-content">
          <view class="popup-header">
            <text class="popup-title">排序方式</text>
            <uni-icons type="close" size="20" @click="showSortPopup = false"></uni-icons>
          </view>
          <radio-group @change="handleSortChange">
            <label class="radio-item" v-for="option in sortOptions" :key="option.value">
              <radio :value="option.value" :checked="sortValue === option.value" />
              <text>{{ option.label }}</text>
            </label>
          </radio-group>
        </view>
      </uni-popup>

      <!-- 筛选弹出层 -->
      <uni-popup ref="filterPopup" type="bottom" background-color="#fff">
        <view class="popup-content">
          <view class="popup-header">
            <text class="popup-title">筛选条件</text>
            <uni-icons type="close" size="20" @click="showFilterPopup = false"></uni-icons>
          </view>

          <view class="filter-form">
            <view class="form-item">
              <text class="form-label">关键字</text>
              <uni-easyinput
                v-model="queryParams.keywords"
                placeholder="用户名/昵称/手机号"
                trim
              />
            </view>

            <view class="form-item">
              <text class="form-label">创建时间</text>
              <!-- 使用 uni-datetime-picker 替代日期组件 -->
              <uni-datetime-picker
                v-model="queryParams.createTime"
                type="daterange"
                placeholder="请选择创建时间"
              />
            </view>

            <view class="form-buttons">
              <button class="btn-reset" @click="handleResetQuery">重置</button>
              <button class="btn-query" @click="handleQuery">查询</button>
            </view>
          </view>
        </view>
      </uni-popup>
    </view>

    <!-- 数据列表 -->
    <view class="data-container">
      <uni-card v-for="item in pageData" :key="item.id" class="user-card">
        <template v-slot:title>
          <view class="card-header">
            <view class="user-info">
              <image class="user-avatar" :src="item.avatar" mode="aspectFit" />
              <view class="user-details">
                <view class="user-name">
                  <text class="nickname">{{ item.nickname }}</text>
                  <uni-icons
                    v-if="item.gender == 1"
                    type="male"
                    size="16"
                    color="#4D80F0"
                  />
                  <uni-icons
                    v-else-if="item.gender == 2"
                    type="female"
                    size="16"
                    color="#FA4350"
                  />
                </view>
                <text class="dept-name">{{ item.deptName }}</text>
              </view>
            </view>
            <view class="status-tag">
              <uni-tag
                v-if="item.status === 1"
                text="正常"
                type="success"
                size="small"
              />
              <uni-tag
                v-else-if="item.status === 0"
                text="禁用"
                type="warning"
                size="small"
              />
            </view>
          </view>
        </template>

        <view class="card-content">
          <view class="info-item">
            <uni-icons type="person" size="16" color="#666"></uni-icons>
            <text class="info-label">用户名：</text>
            <text class="info-value">{{ item.username }}</text>
          </view>

          <view class="info-item">
            <uni-icons type="staff" size="16" color="#666"></uni-icons>
            <text class="info-label">角色：</text>
            <text class="info-value">{{ item.roleNames }}</text>
          </view>

          <view class="info-item">
            <uni-icons type="phone" size="16" color="#666"></uni-icons>
            <text class="info-label">手机号码：</text>
            <text class="info-value">{{ item.mobile }}</text>
          </view>

          <view class="info-item">
            <uni-icons type="email" size="16" color="#666"></uni-icons>
            <text class="info-label">邮箱：</text>
            <text class="info-value">{{ item.email }}</text>
          </view>
        </view>

        <template v-slot:actions>
          <view class="card-footer">
            <view class="create-time">
              <text class="time-label">创建时间：</text>
              <text class="time-value">{{ item.createTime }}</text>
            </view>
            <view class="action-buttons">
              <button
                v-if="hasPermission('sys:user:edit')"
                class="btn-edit"
                @click="handleOpenDialog(item.id)"
              >
                编辑
              </button>
              <button
                v-if="hasPermission('sys:user:delete')"
                class="btn-delete"
                @click="handleDelete(item.id)"
              >
                删除
              </button>
            </view>
          </view>
        </template>
      </uni-card>

      <!-- 加载更多 -->
      <uni-load-more
        v-if="total > 0"
        :status="loadMoreStatus"
        @clickLoadMore="loadmore"
      />

      <!-- 空状态 -->
      <view v-else-if="total == 0" class="empty-tip">当前搜索无结果</view>
    </view>

    <!-- 弹窗表单 -->
    <uni-popup ref="formPopup" type="bottom" background-color="#fff">
      <view class="form-popup">
        <view class="popup-header">
          <text class="popup-title">{{ formData.id ? '编辑用户' : '新增用户' }}</text>
          <uni-icons type="close" size="20" @click="hancleCloseDialog"></uni-icons>
        </view>

        <uni-forms ref="userFormRef" :model="formData" :rules="rules" class="user-form">
          <uni-forms-item label="用户名" required name="username">
            <uni-easyinput
              v-model="formData.username"
              placeholder="请输入用户名"
              :disabled="!!formData.id"
            />
          </uni-forms-item>

          <uni-forms-item label="昵称" required name="nickname">
            <uni-easyinput v-model="formData.nickname" placeholder="请输入昵称" />
          </uni-forms-item>

          <uni-forms-item label="角色" required name="roleIds">
            <uni-data-picker
              v-model="formData.roleIds"
              :localdata="roleOptions"
              placeholder="请选择角色"
            />
          </uni-forms-item>

          <uni-forms-item label="部门" required name="deptId">
            <uni-data-picker
              v-model="formData.deptId"
              :localdata="deptOptions"
              placeholder="请选择部门"
            />
          </uni-forms-item>

          <uni-forms-item label="手机号" name="mobile">
            <uni-easyinput v-model="formData.mobile" placeholder="请输入手机号" />
          </uni-forms-item>

          <uni-forms-item label="邮箱" name="email">
            <uni-easyinput v-model="formData.email" placeholder="请输入邮箱" />
          </uni-forms-item>

          <uni-forms-item label="状态" required name="status">
            <view class="status-switch">
              <text>状态：</text>
              <switch
                :checked="formData.status === 1"
                @change="formData.status = $event.detail.value ? 1 : 0"
                color="#007AFF"
              />
              <text class="status-text">{{ formData.status === 1 ? '正常' : '禁用' }}</text>
            </view>
          </uni-forms-item>
        </uni-forms>

        <view class="form-footer">
          <button class="btn-submit" @click="handleSubmit">提交</button>
        </view>
      </view>
    </uni-popup>

    <!-- 悬浮操作按钮 -->
    <uni-fab
      v-if="hasPermission('sys:user:add')"
      horizontal="left"
      vertical="bottom"
      :pop-menu="false"
      @fabClick="handleOpenDialog"
    />
  </view>
</template>

<script lang="ts" setup>
import { onLoad, onReachBottom } from "@dcloudio/uni-app";
import { ref, reactive } from 'vue';

import UserAPI, { type UserPageQuery, UserPageVO, UserForm } from "@/api/system/user";
import RoleAPI from "@/packageB/api/system/role";
import DeptAPI from "@/packageB/api/system/dept";

// 权限检查函数
const hasPermission = (permission: string) => {
  if (!permission) return true;
  const userPermissions = ['sys:user:add', 'sys:user:edit', 'sys:user:delete'];
  return userPermissions.includes(permission);
};

// 排序相关
const sortValue = ref(0);
const showSortPopup = ref(false);
const showFilterPopup = ref(false);
const sortOptions = ref([
  { label: "默认排序", value: 0 },
  { label: "最近创建", value: 1 },
  { label: "最近更新", value: 2 },
]);

// 查询参数
let queryParams: UserPageQuery = {
  pageNum: 1,
  pageSize: 10,
};

const total = ref(0);
const pageData = ref<UserPageVO[]>([]);
const loadMoreStatus = ref<'more' | 'loading' | 'noMore'>('more');

// 弹窗引用
const sortPopup = ref();
const filterPopup = ref();
const formPopup = ref();
const userFormRef = ref();

// 表单数据
const initialFormData: UserForm = {
  id: undefined,
  roleIds: [],
  username: undefined,
  nickname: undefined,
  deptId: undefined,
  mobile: undefined,
  email: undefined,
  status: 1,
};

const formData = reactive<UserForm>({ ...initialFormData });

// 选项数据
const roleOptions = ref<any[]>([]);
const deptOptions = ref<any[]>([]);

// 表单验证规则
const rules = {
  username: {
    rules: [{ required: true, errorMessage: '请输入用户名' }]
  },
  nickname: {
    rules: [{ required: true, errorMessage: '请输入昵称' }]
  },
  roleIds: {
    rules: [{ required: true, errorMessage: '请选择角色' }]
  },
  deptId: {
    rules: [{ required: true, errorMessage: '请选择部门' }]
  },
  mobile: {
    rules: [{
      validateFunction: (rule: any, value: any, data: any, callback: any) => {
        if (!value) return callback();
        if (!/^1[3456789]\d{9}$/.test(value)) {
          callback('手机号格式不正确');
        } else {
          callback();
        }
      }
    }]
  },
  email: {
    rules: [{
      validateFunction: (rule: any, value: any, data: any, callback: any) => {
        if (!value) return callback();
        if (!/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(value)) {
          callback('邮箱格式不正确');
        } else {
          callback();
        }
      }
    }]
  }
};

/**
 * 排序改变
 */
const handleSortChange = (e: any) => {
  const value = parseInt(e.detail.value);
  sortValue.value = value;
  showSortPopup.value = false;

  if (value === 1) {
    queryParams.field = "create_time";
    queryParams.direction = "DESC";
  } else if (value === 2) {
    queryParams.field = "update_time";
    queryParams.direction = "DESC";
  } else {
    queryParams.field = "";
    queryParams.direction = "";
  }
  handleQuery();
};

/**
 * 查询
 */
const handleQuery = () => {
  showFilterPopup.value = false;
  queryParams.pageNum = 1;
  loadmore();
};

/**
 * 重置查询
 */
const handleResetQuery = () => {
  queryParams = {
    pageNum: 1,
    pageSize: 10,
  };
  handleQuery();
};

/**
 * 加载更多
 */
function loadmore() {
  loadMoreStatus.value = 'loading';
  UserAPI.getPage(queryParams)
    .then((data) => {
      if (queryParams.pageNum === 1) {
        pageData.value = data.list;
      } else {
        pageData.value = [...pageData.value, ...data.list];
      }
      total.value = data.total;
      queryParams.pageNum++;

      loadMoreStatus.value = queryParams.pageNum * queryParams.pageSize < total.value ? 'more' : 'noMore';
    })
    .catch((e) => {
      pageData.value = [];
      loadMoreStatus.value = 'more';
    });
}

/**
 * 打开弹窗
 */
async function handleOpenDialog(id?: number) {
  // 加载选项数据
  roleOptions.value = await RoleAPI.getOptions();
  deptOptions.value = await DeptAPI.getOptions();

  if (id) {
    UserAPI.getFormData(id).then((data) => {
      Object.assign(formData, { ...data });
    });
  }

  formPopup.value.open();
}

/**
 * 提交保存
 */
function handleSubmit() {
  userFormRef.value.validate().then((res: any) => {
    const userId = formData.id;
    if (userId) {
      UserAPI.update(userId, formData).then(() => {
        uni.showToast({ title: "修改成功", icon: "success" });
        hancleCloseDialog();
        handleQuery();
      });
    } else {
      UserAPI.add(formData).then(() => {
        uni.showToast({ title: "添加成功", icon: "success" });
        hancleCloseDialog();
        handleQuery();
      });
    }
  }).catch((err: any) => {
    console.log('表单验证失败:', err);
  });
}

// 重置表单
function resetForm() {
  Object.assign(formData, initialFormData);
}

// 关闭弹窗
function hancleCloseDialog() {
  formPopup.value.close();
  resetForm();
}

/**
 * 删除
 */
function handleDelete(id: number) {
  uni.showModal({
    title: "提示",
    content: "确认删除用户吗？",
    success: (res) => {
      if (res.confirm) {
        UserAPI.deleteByIds(id + "").then(() => {
          uni.showToast({ title: "删除成功", icon: "success" });
          handleQuery();
        });
      }
    }
  });
}

/**
 * 返回
 */
function handleNavigateback() {
  uni.navigateBack();
}

// 触底事件
onReachBottom(() => {
  if (loadMoreStatus.value === 'more') {
    loadmore();
  }
});

onLoad(() => {
  handleQuery();
});
</script>

<style lang="scss" scoped>
.user-container {
  padding-top: 100rpx;
  background-color: #f8f8f8;
  min-height: 100vh;
}

.filter-container {
  background: #fff;
  padding: 20rpx;
}

.filter-bar {
  display: flex;
  gap: 20rpx;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx 24rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #333;
}

.popup-content {
  padding: 40rpx;
  max-height: 70vh;
  overflow-y: auto;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40rpx;
}

.popup-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.radio-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #eee;

  radio {
    margin-right: 20rpx;
  }
}

.filter-form {
  .form-item {
    margin-bottom: 40rpx;
  }

  .form-label {
    display: block;
    margin-bottom: 16rpx;
    font-size: 28rpx;
    color: #333;
  }
}

.form-buttons {
  display: flex;
  gap: 20rpx;
  margin-top: 40rpx;

  button {
    flex: 1;
    padding: 20rpx;
    border-radius: 8rpx;
    font-size: 28rpx;
  }

  .btn-reset {
    background: #f5f5f5;
    color: #666;
  }

  .btn-query {
    background: #007AFF;
    color: white;
  }
}

.data-container {
  padding: 20rpx;
}

.user-card {
  margin-bottom: 20rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20rpx;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.user-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.user-name {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.nickname {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.dept-name {
  font-size: 24rpx;
  color: #666;
}

.status-tag {
  margin-top: 8rpx;
}

.card-content {
  padding: 20rpx 0;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.info-label {
  font-size: 28rpx;
  color: #666;
  min-width: 140rpx;
}

.info-value {
  font-size: 28rpx;
  color: #333;
  flex: 1;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20rpx;
  border-top: 1rpx solid #f5f5f5;
}

.create-time {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.time-label {
  font-size: 24rpx;
  color: #666;
}

.time-value {
  font-size: 24rpx;
  color: #333;
}

.action-buttons {
  display: flex;
  gap: 16rpx;

  button {
    padding: 12rpx 24rpx;
    border-radius: 6rpx;
    font-size: 24rpx;
    border: none;
  }

  .btn-edit {
    background: #007AFF;
    color: white;
  }

  .btn-delete {
    background: #ff4d4f;
    color: white;
  }
}

.form-popup {
  padding: 40rpx;
  max-height: 80vh;
  overflow-y: auto;
}

.user-form {
  margin-bottom: 40rpx;
}

.status-switch {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx 0;
}

.status-text {
  font-size: 28rpx;
  color: #333;
}

.form-footer {
  .btn-submit {
    width: 100%;
    padding: 24rpx;
    background: #007AFF;
    color: white;
    border-radius: 8rpx;
    font-size: 28rpx;
  }
}
</style>
