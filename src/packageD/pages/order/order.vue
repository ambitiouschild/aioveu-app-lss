<template>
  <view class="content">
    <!-- 订单列表顶部tab页切换 -->
    <view class="navbar">
      <!-- 遍历导航标签项 -->
      <view
        v-for="(item, index) in navList"
        :key="index"
        class="nav-item"
        :class="{ current: tabCurrentIndex === index }"
        @click="tabClick(index)"
      >
        {{ item.text }}
      </view>
    </view>

    <!-- 滑动切换内容区域 -->
    <swiper
      :current="tabCurrentIndex"
      class="swiper-box"
      :duration="300"
      @change="changeTab"
    >
      <!-- 每个标签对应的内容 -->
      <swiper-item
        class="tab-content"
        v-for="(tabItem, tabIndex) in navList"
        :key="tabIndex"
      >
<!--        你设置了 @scrolltolower="loadData"事件，每次滚动到底部都会触发 loadData，但没有检查是否已经加载完毕。需要添加加载状态检查和分页控制。-->
        <scroll-view
          class="list-scroll-content"
          scroll-y
          @scrolltolower="loadData"
        >
          <!-- 空白页：当没有订单数据时显示 -->
          <empty v-if="tabItem.loaded === true && tabItem.orderList.length === 0"></empty>

          <!-- 订单列表：遍历当前标签的订单数据 -->
          <view
            v-for="(order, index) in tabItem.orderList"
            :key="index"
            class="order-item"
          >
            <!-- 订单顶部信息：时间、状态、操作按钮 -->
            <view class="i-top b-b">

              <text class="time">{{ formatTime(order.createTime) }}</text>


              <!-- 如果有退款状态，优先显示退款状态 -->
              <text
                v-if="order.refundStatus && order.refundStatus !== 0"
                class="status"
                :style="{color: getAfterSaleStatusColor(order.refundStatus)}"
              >
                {{ getAfterSaleStatusText(order.refundStatus) }}
              </text>

<!--              给不同订单状态设置不同的颜色-->
              <!-- 否则显示订单状态 -->
              <text
                v-else
                class="status"
                :style="{color: getStatusColor(order.status)}"
              >
                {{ getOrderStatusText(order.status) }}
              </text>


              <!-- 已关闭订单显示删除按钮 -->
              <text
                v-if="order.status === 5 || order.status === 6"
                class="del-btn yticon icon-iconfontshanchu1"
                @click="deleteOrder(order.id)"
              ></text>
            </view>

            <!-- 多个商品时：横向滚动展示 -->
            <scroll-view
              v-if="order.orderItems && order.orderItems.length > 1"
              class="goods-box"
              scroll-x
            >
              <view
                v-for="(orderItem, itemIndex) in order.orderItems"
                :key="itemIndex"
                class="goods-item"
              >
                <image
                  class="goods-img"
                  :src="orderItem.picUrl"
                  mode="aspectFill"
                ></image>
              </view>
            </scroll-view>

            <!-- 单个商品时：详细展示商品信息 -->
            <view
              v-if="order.orderItems && order.orderItems.length === 1"
              class="goods-box-single"
            >
              <view
                v-for="(orderItem, itemIndex) in order.orderItems"
                :key="itemIndex"
                class="goods-item-single"
              >
                <image
                  class="goods-img"
                  :src="orderItem.picUrl"
                  mode="aspectFill"
                ></image>
                <view class="right">
                  <text class="title clamp">{{ orderItem.spuName || '商品'}}</text>
                  <text class="attr-box">{{ orderItem.skuName || ''}} x {{ orderItem.quantity || 1  }}</text>
                  <text class="price">¥{{ formatMoney(orderItem.price) }}</text>
                </view>
              </view>
            </view>

            <!-- 订单价格汇总 -->
            <view class="price-box">
              共<text class="num">{{ order.totalQuantity }}</text>件商品 实付款
              <text class="price">¥{{ formatMoney(order.paymentAmount) }}</text>
            </view>

            <!-- 订单操作按钮区域 -->
            <view
              class="action-box b-t"
              v-if="order.status === 1"
            >
              <button
                class="action-btn"
                @click="cancelOrder(order)"
              >取消订单</button>
              <button
                class="action-btn recom"
                @click="doPay(order)"
              >立即支付</button>
            </view>

            <!-- ✅ 新增：待发货状态显示申请退款按钮 -->
            <view
              class="action-box b-t"
              v-else-if="order.status === 2"
            >
              <button
                class="action-btn"
                @click="applyRefund(order)"
              >申请退款</button>
            </view>

            <!-- ✅ 新增：已发货状态显示申请退款/退货按钮 -->
            <view
              class="action-box b-t"
              v-else-if="order.status === 3"
            >
              <button
                class="action-btn"
                @click="applyRefund(order, 'refund')"
              >申请退款</button>
              <button
                class="action-btn recom"
                @click="applyRefund(order, 'return')"
              >申请退货</button>
            </view>

            <!-- ✅ 新增：已完成状态显示申请售后按钮 -->
            <view
              class="action-box b-t"
              v-else-if="order.status === 4 && canApplyAfterSale(order)"
            >
              <button
                class="action-btn"
                @click="applyAfterSale(order)"
              >申请售后</button>
            </view>


          </view>



          <!-- 加载更多组件 -->
          <uni-load-more
            :status="tabItem.loadingType"
            @clickLoadMore="clickLoadMore"
          ></uni-load-more>
        </scroll-view>
      </swiper-item>
    </swiper>
  </view>
</template>

<script setup>
// ==========================================
// 导入依赖
// ==========================================
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { onLoad, onShow, onHide } from '@dcloudio/uni-app';
// import uniLoadMore from '@/components/uni-load-more/uni-load-more.vue';
import empty from '@/components/empty';
import {
  cancelOrder as cancelOrderApi,
  deleteOrder as deleteOrderApi,
  listOrdersWithPage,
// 导入退款相关的API
  applyRefund as applyRefundApi,
  getRefundDetail,
  getAfterSalesList

} from '@/api/oms/order';


// ==========================================
// 响应式数据定义
// ==========================================
const pageNum = ref(1);                     // 当前页码
const pageSize = ref(10);                   // 每页显示数量
const reload = ref(false);                  // 是否重新加载
const status = ref('more');                 // 加载状态
const tabCurrentIndex = ref(0);             // 当前选中的标签索引


/*简化后的优势：
1.状态清晰：只有6个核心状态
2.数字连续：1-6，便于理解和维护
3.扩展性好：如果需要细分状态，可以添加子状态
4.国际化友好：有明确的编码和描述
5.前端友好：状态码简单，便于前端处理
6.业务逻辑清晰：状态流转规则明确*/

// 导航标签列表
const navList = ref([
  {
    status: 0,          // 0表示全部
    text: '全部',
    loadingType: 'more',
    orderList: [],
    loaded: false
  },
  {
    status: 1,        // 待付款
    text: '待付款',
    loadingType: 'more',
    orderList: [],
    loaded: false
  },
  {
    status: 2,        // 待发货
    text: '待发货',
    loadingType: 'more',
    orderList: [],
    loaded: false
  },
  {
    status: 3,        // 已发货
    text: '已发货',
    loadingType: 'more',
    orderList: [],
    loaded: false
  },
  {
    status: 4,        // 已完成
    text: '已完成',
    loadingType: 'more',
    orderList: [],
    loaded: false
  }
]);

// 订单状态映射 - 使用后端的状态码
const orderStatusMap = {
  0: '全部订单',
  1: '待付款',
  2: '待发货',
  3: '已发货',
  4: '已完成',
  5: '已关闭',
  6: '已取消'
};

// 新增：退款类型常量
const REFUND_TYPE = {
  REFUND_ONLY: 1,      // 仅退款
  REFUND_RETURN: 2,    // 退货退款
  EXCHANGE: 3          // 换货
};

// 退款原因选项
const refundReasons = ref([
  { value: 1, label: '不想要了' },
  { value: 2, label: '拍错了/重复下单' },
  { value: 3, label: '商品信息描述不符' },
  { value: 4, label: '质量问题' },
  { value: 5, label: '快递/物流问题' },
  { value: 6, label: '未按时发货' },
  { value: 7, label: '其他原因' }
]);



// 状态颜色映射
const statusColorMap = {
  0: '#e6a23c',  // 待发货 - 橙色
  1: '#fa436a',  // 待付款 - 红色，突出显示
  2: '#e6a23c',  // 待发货 - 橙色
  3: '#409eff',  // 已发货 - 蓝色
  4: '#67c23a',  // 已完成 - 绿色
  5: '#909399',  // 已关闭 - 灰色
  6: '#909399'   // 已取消 - 灰色
};
// ==========================================
// 生命周期钩子
// ==========================================
onLoad((options) => {
  console.log('========>> 进入订单列表页面, 参数:', options);

  // 根据传入的状态参数设置当前标签
  if (options && options.status) {
    const statusValue = parseInt(options.status);
    console.log('页面参数 status:', statusValue);

    // 找到对应的标签索引
    const index = navList.value.findIndex(item => item.status === statusValue);
    console.log('找到的索引:', index);


    if (index !== -1) {
      tabCurrentIndex.value = index;
    }else if (statusValue === 0) {
      // 0 表示全部
      tabCurrentIndex.value = 0;
    }
  }
  console.log('当前标签索引:', tabCurrentIndex.value);
  // 初始加载数据
  loadData();
});

onShow(() => {
  console.log('========>> 订单列表页面显示');
});

onHide(() => {
  console.log('========>> 订单列表页面隐藏');
});

// ==========================================
// 计算属性
// ==========================================
// 获取当前选中的导航项
const currentNavItem = computed(() => {
  return navList.value[tabCurrentIndex.value];
});

// ==========================================
// 业务方法
// ==========================================
/**
 * 加载订单数据
 * @param {string} source - 数据来源标识
 */
const loadData = async (source) => {
  console.log('加载订单数据, 来源:', source || '初始加载');

  const navItem = currentNavItem.value;
  console.log('导航值是多少：', navItem);
  console.log('当前加载状态:', navItem.loadingType);
  console.log('当前页码:', pageNum.value);

  // 防止重复加载 - 增强检查
  if (navItem.loadingType === 'loading' || navItem.loadingType === 'noMore') {
    console.log('正在加载中或已无更多数据，跳过');
    return;
  }

  const statusValue = navItem.status === 0 ? navItem.status : navItem.status;
  console.log('status是多少：', statusValue);

  try {
    // 设置加载状态
    navItem.loadingType = 'loading';

    // 构建请求参数
    const params = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      status: statusValue
    };

    console.log('请求参数:', params);

    // 调用API获取订单数据
    const response = await listOrdersWithPage(params);
    console.log('订单列表响应:', response);

    // 处理返回数据
    if (response && Array.isArray(response.list)) {
      console.log('✅ 进入正确的处理分支');
      const orderList = response.list;
      const total = response.total || 0;  // 从 response 中获取 total

      console.log('获取到订单数据:', orderList.length, '条，总共:', total, '条');


      // 更新订单列表
      if (pageNum.value === 1) {
        // 第一页，直接替换
        navItem.orderList = orderList;
        console.log('第一页，替换订单列表，现在有', orderList.length, '条');
      } else {
        // 后续页面，追加数据
        navItem.orderList = [...navItem.orderList, ...orderList];
        console.log('追加数据，现在总共:', navItem.orderList.length, '条');
      }

      // 更新加载状态
      if (orderList.length < pageSize.value) {
        // 数据不足一页，表示没有更多数据
        navItem.loadingType = 'noMore';
        console.log('数据不足一页，标记为 noMore');
      } else {
        // 还有更多数据
        navItem.loadingType = 'more';
        pageNum.value += 1;
        console.log('还有更多数据，页码增加到:', pageNum.value);
      }
    } else {
      console.log('❌ 进入了错误分支');
      // 数据格式异常
      console.error('订单数据格式异常:', response);
      navItem.loadingType = 'more';
    }

    // 标记已加载完成
    navItem.loaded = true;

  } catch (error) {
    console.error('加载订单数据失败:', error);

    // 显示错误提示
    uni.showToast({
      title: '加载失败'+ (error.message || '未知错误'),
      icon: 'none',
      duration: 3000
    });

    // 恢复加载状态
    navItem.loadingType = 'more';

  } finally {
    // 无论成功失败，都隐藏加载状态
    uni.hideLoading();
  }
};

/**
 * 切换标签
 * @param {Object} e - 事件对象
 */
const changeTab = (e) => {
  console.log('标签切换:', e.detail.current);

  const newIndex = e.detail.current;
  if (newIndex === tabCurrentIndex.value) {
    return;
  }

  // 更新当前标签索引
  tabCurrentIndex.value = newIndex;

  // 重置页码
  pageNum.value = 1;

  // 加载新标签的数据
  loadData('tabChange');
};

/**
 * 点击标签
 * @param {number} index - 标签索引
 */
const tabClick = (index) => {
  console.log('点击标签:', index);

  if (index === tabCurrentIndex.value) {
    return;
  }

  // 更新当前标签索引
  tabCurrentIndex.value = index;

  // 重置页码
  pageNum.value = 1;

  // 加载新标签的数据
  loadData('tabClick');
};

/**
 * 删除订单
 * @param {string|number} orderId - 订单ID
 */
const deleteOrder = async (orderId) => {
  console.log('删除订单:', orderId);

  // 确认对话框
  uni.showModal({
    title: '提示',
    content: '确定要删除这个订单吗？',
    confirmText: '删除',
    confirmColor: '#e54d42',
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '删除中...' });

          // 调用API删除订单
          await deleteOrderApi(orderId);

          // 刷新数据
          await loadData('delete');

          uni.showToast({
            title: '删除成功',
            icon: 'success'
          });

        } catch (error) {
          console.error('删除订单失败:', error);
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
 * 取消订单
 * @param {Object} order - 订单对象
 */
const cancelOrder = async (order) => {
  console.log('取消订单:', order);

  // 确认对话框
  uni.showModal({
    title: '提示',
    content: '确定要取消这个订单吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '处理中...' });

          // 调用API取消订单
          await cancelOrderApi(order.id);

          // 刷新数据
          await loadData('cancel');

          uni.showToast({
            title: '取消成功',
            icon: 'success'
          });

        } catch (error) {
          console.error('取消订单失败:', error);
          uni.showToast({
            title: '取消失败',
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
 * 订单支付
 * @param {Object} order - 订单对象
 */
const doPay = (order) => {
  console.log('订单支付:', order);

  // 跳转到支付页面
  uni.redirectTo({
    url: `/pages/money/pay?orderSn=${order.orderSn}&paymentAmount=${order.paymentAmount}`,
    fail: (err) => {
      console.error('跳转到支付页失败:', err);
      uni.showToast({
        title: '跳转失败',
        icon: 'none'
      });
    }
  });
};

// ==========================================
// 业务方法 - 新增退款相关方法
// ==========================================

/**
 * 申请退款
 * @param {Object} order - 订单对象
 * @param {string} type - 退款类型: 'refund' | 'return'
 */
const applyRefund = async (order, type = 'refund') => {
  console.log('申请退款/退货:', { order, type });

  // 确认对话框
  uni.showModal({
    title: '提示',
    content: type === 'refund' ? '确定要申请退款吗？' : '确定要申请退货吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '处理中...' });

          // 获取用户输入的退款原因和金额
          const refundInfo = await showRefundInput(order, type);

          if (!refundInfo) {
            uni.hideLoading();
            return; // 用户取消输入
          }

          // 构建退款申请参数
          const params = {
            orderId: order.id,
            orderSn: order.orderSn,
            refundType: type === 'refund' ? REFUND_TYPE.REFUND_ONLY : REFUND_TYPE.REFUND_RETURN,
            refundAmount: refundInfo.amount, // 单位：分
            refundReason: refundInfo.reason,
            description: refundInfo.description || '',
            proofImages: refundInfo.proofImages || []
          };

          console.log('提交退款申请参数:', params);

          // 调用API申请退款
          const response = await applyRefundApi(params);
          console.log('退款申请响应:', response);

          // 刷新订单数据
          await loadData('refund');

          uni.showToast({
            title: '申请提交成功',
            icon: 'success',
            duration: 2000
          });

          // 跳转到退款详情页面
          setTimeout(() => {
            uni.navigateTo({
              url: `/pages/order/refund-detail?id=${response.id}`,
              fail: (err) => {
                console.log('跳转失败:', err);
                uni.showToast({
                  title: '跳转失败',
                  icon: 'none'
                });
              }
            });
          }, 1500);

        } catch (error) {
          console.error('申请退款失败:', error);
          uni.showToast({
            title: error.message || '申请失败',
            icon: 'none',
            duration: 3000
          });
        } finally {
          uni.hideLoading();
        }
      }
    }
  });
};

/**
 * 显示退款输入对话框
 * @param {Object} order - 订单对象
 * @param {string} type - 退款类型
 * @returns {Promise<Object|null>} 退款信息或null
 */
const showRefundInput = (order, type) => {
  return new Promise((resolve) => {
    // 计算最大可退款金额
    const maxRefundAmount = order.paymentAmount; // 单位：分
    const maxRefundYuan = (maxRefundAmount / 100).toFixed(2);

    uni.showModal({
      title: type === 'refund' ? '申请退款' : '申请退货退款',
      content: `最大可${type === 'refund' ? '退款' : '退货退款'}金额：¥${maxRefundYuan}`,
      editable: true,
      placeholderText: '请输入退款原因',
      confirmText: '下一步',
      cancelText: '取消',
      success: (res1) => {
        if (res1.confirm && res1.content) {
          // 第一步：输入退款原因
          const reason = res1.content.trim();

          // 第二步：输入退款金额
          uni.showModal({
            title: '退款金额',
            content: '请输入退款金额（元）',
            editable: true,
            placeholderText: `0.00 - ${maxRefundYuan}`,
            confirmText: '提交',
            cancelText: '上一步',
            success: (res2) => {
              if (res2.confirm && res2.content) {
                const amountYuan = parseFloat(res2.content);

                // 验证金额
                if (isNaN(amountYuan) || amountYuan <= 0) {
                  uni.showToast({
                    title: '请输入有效的金额',
                    icon: 'none'
                  });
                  resolve(null);
                  return;
                }

                if (amountYuan > parseFloat(maxRefundYuan)) {
                  uni.showToast({
                    title: '金额不能超过最大可退金额',
                    icon: 'none'
                  });
                  resolve(null);
                  return;
                }

                // 转换金额为分
                const amount = Math.round(amountYuan * 100);

                // 第三步：可选输入详细描述
                uni.showModal({
                  title: '补充说明',
                  content: '请补充说明退款情况（可选）',
                  editable: true,
                  placeholderText: '请详细描述退款原因...',
                  confirmText: '提交申请',
                  cancelText: '跳过',
                  success: (res3) => {
                    resolve({
                      reason,
                      amount,
                      description: res3.confirm ? res3.content.trim() : '',
                      proofImages: [] // 可以后续添加图片上传功能
                    });
                  }
                });
              } else if (res2.cancel) {
                // 返回上一步
                showRefundInput(order, type).then(resolve);
              } else {
                resolve(null);
              }
            }
          });
        } else {
          resolve(null);
        }
      }
    });
  });
};

/**
 * 申请售后（已完成订单）
 * @param {Object} order - 订单对象
 */
const applyAfterSale = (order) => {
  console.log('申请售后:', order);

  uni.showActionSheet({
    itemList: ['仅退款', '退货退款', '换货'],
    success: (res) => {
      const typeIndex = res.tapIndex;
      let type = '';

      switch (typeIndex) {
        case 0:
          type = 'refund';
          break;
        case 1:
          type = 'return';
          break;
        case 2:
          type = 'exchange';
          break;
        default:
          return;
      }

      applyRefund(order, type);
    },
    fail: (err) => {
      console.log('选择失败:', err);
    }
  });
};


/**
 * 检查订单是否可以申请售后
 * @param {Object} order - 订单对象
 * @returns {boolean} 是否可以申请售后
 */
const canApplyAfterSale = (order) => {
  if (!order || order.status !== 4) return false;

  // 检查订单完成时间是否在售后期限内（比如7天内）
  if (order.completeTime) {
    const completeTime = new Date(order.completeTime).getTime();
    const now = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000; // 7天的毫秒数

    // 如果超过7天，不能申请售后
    if (now - completeTime > sevenDays) {
      return false;
    }
  }

  // 检查是否已经申请过售后
  // 这里可以调用API检查该订单是否有未完成的售后申请
  // 暂时返回true
  return true;
};

/**
 * 查看退款进度
 * @param {string|number} orderId - 订单ID
 */
const viewRefundProgress = async (orderId) => {
  try {
    uni.showLoading({ title: '加载中...' });

    // 调用API获取退款详情
    const refundDetail = await getRefundDetail(orderId);

    uni.hideLoading();

    // 跳转到退款详情页面
    uni.navigateTo({
      url: `/pages/order/refund-detail?id=${refundDetail.id}`,
      fail: (err) => {
        console.error('跳转失败:', err);
        uni.showToast({
          title: '跳转失败',
          icon: 'none'
        });
      }
    });

  } catch (error) {
    console.error('获取退款详情失败:', error);
    uni.hideLoading();
    uni.showToast({
      title: error.message || '加载失败',
      icon: 'none'
    });
  }
};

// ==========================================
// 工具方法 - 新增退款相关工具方法
// ==========================================

/**
 * 格式化售后状态
 * @param {number} status - 售后状态码
 * @returns {string} 状态文本
 */
const getAfterSaleStatusText = (status) => {
  const statusMap = {
    0: '待处理',
    1: '审核中',
    2: '审核通过',
    3: '审核拒绝',
    4: '退款中',
    5: '退款成功',
    6: '退款失败',
    7: '买家发货',
    8: '卖家收货',
    9: '换货发货',
    10: '换货完成',
    11: '已取消',
    12: '已关闭'
  };
  return statusMap[status] || '未知状态';
};

/**
 * 获取售后状态颜色
 * @param {number} status - 售后状态码
 * @returns {string} 颜色值
 */
const getAfterSaleStatusColor = (status) => {
  const colorMap = {
    0: '#e6a23c',  // 待处理 - 橙色
    1: '#409eff',  // 审核中 - 蓝色
    2: '#67c23a',  // 审核通过 - 绿色
    3: '#f56c6c',  // 审核拒绝 - 红色
    4: '#409eff',  // 退款中 - 蓝色
    5: '#67c23a',  // 退款成功 - 绿色
    6: '#f56c6c',  // 退款失败 - 红色
    7: '#409eff',  // 买家发货 - 蓝色
    8: '#67c23a',  // 卖家收货 - 绿色
    9: '#409eff',  // 换货发货 - 蓝色
    10: '#67c23a', // 换货完成 - 绿色
    11: '#909399', // 已取消 - 灰色
    12: '#909399'  // 已关闭 - 灰色
  };
  return colorMap[status] || '#909399';
};



/**
 * 点击加载更多
 */
const clickLoadMore = () => {
  console.log('点击加载更多');
  loadData('loadMore');
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
  if (!money && money !== 0) return '0.00';
  return (money / 100).toFixed(2);
};

/**
 * 获取订单状态文本
 * @param {number} status - 订单状态码
 * @returns {string} 状态文本
 */
const getOrderStatusText = (status) => {
  return orderStatusMap[status] || '全部订单';
};

/**
 * 获取状态颜色
 */
const getStatusColor = (status) => {
  return statusColorMap[status] || '#909399';  // 默认灰色
};

/**
 * 格式化时间
 * @param {string} timeStr - 时间字符串
 * @returns {string} 格式化后的时间
 */
const formatTime = (timeStr) => {
  if (!timeStr) return '';

  try {
    // 如果是时间戳
    if (/^\d+$/.test(timeStr)) {
      const date = new Date(parseInt(timeStr));
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    }

    // 如果是ISO格式时间字符串
    const date = new Date(timeStr);
    if (!isNaN(date.getTime())) {
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    }

    // 其他格式，直接返回
    return timeStr;

  } catch (error) {
    console.error('格式化时间失败:', error, timeStr);
    return timeStr;
  }
};
</script>

<style lang="scss">
// ==========================================
// 页面基础样式
// ==========================================
page,
.content {
  background: $page-color-base;
  height: 100%;
  overflow: hidden;
}

.swiper-box {
  height: calc(100% - 40px);
}

.list-scroll-content {
  height: 100%;
  box-sizing: border-box;
}

// ==========================================
// 导航栏样式
// ==========================================
.navbar {
  display: flex;
  height: 40px;
  padding: 0 5px;
  background: #fff;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.06);
  position: relative;
  z-index: 10;

  .nav-item {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    font-size: 15px;
    color: $font-color-dark;
    position: relative;
    cursor: pointer;
    transition: color 0.3s;

    // 当前选中状态
    &.current {
      color: $base-color;
      font-weight: 500;

      // 底部指示条
      &:after {
        content: '';
        position: absolute;
        left: 50%;
        bottom: 0;
        transform: translateX(-50%);
        width: 44px;
        height: 0;
        border-bottom: 2px solid $base-color;
      }
    }

    // 点击效果
    &:active {
      opacity: 0.7;
    }
  }
}

.uni-swiper-item {
  height: auto;
  overflow: hidden;
}

// ==========================================
// 订单项样式
// ==========================================
.order-item {
  display: flex;
  flex-direction: column;
  margin: 16upx 16upx 0;
  padding: 0 16upx;
  background: #fff;
  border-radius: 12upx;
  box-shadow: 0 2upx 12upx rgba(0, 0, 0, 0.05);

  // 顶部信息区域
  .i-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 80upx;
    padding: 0 4upx;
    font-size: $font-base;
    color: $font-color-dark;
    position: relative;
    border-bottom: 1upx solid $border-color;

    .time {
      flex: 1;
      font-size: $font-sm;
      color: $font-color-light;
    }

    .status {
      font-size: $font-sm;
      color: $base-color;
      font-weight: 500;
      margin: 0 20upx;
    }

    // 删除按钮
    .del-btn {
      padding: 10upx 0 10upx 36upx;
      font-size: $font-lg;
      color: $font-color-light;
      position: relative;
      cursor: pointer;

      &:after {
        content: '';
        width: 0;
        height: 30upx;
        border-left: 1px solid $border-color-dark;
        position: absolute;
        left: 20upx;
        top: 50%;
        transform: translateY(-50%);
      }

      // 点击效果
      &:active {
        opacity: 0.7;
      }
    }
  }

  // 多个商品的横向滚动区域
  .goods-box {
    height: 160upx;
    padding: 20upx 0;
    white-space: nowrap;

    .goods-item {
      display: inline-block;
      width: 120upx;
      height: 120upx;
      margin-right: 24upx;
      border-radius: 8upx;
      overflow: hidden;

      &:last-child {
        margin-right: 0;
      }

      .goods-img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }

  // 单个商品的详细展示
  .goods-box-single {
    padding: 20upx 0;

    .goods-item-single {
      display: flex;
      align-items: center;

      .goods-img {
        display: block;
        width: 120upx;
        height: 120upx;
        border-radius: 8upx;
        object-fit: cover;
        flex-shrink: 0;
      }

      .right {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 0 30upx 0 24upx;
        overflow: hidden;

        .title {
          font-size: $font-base + 1px;
          color: $font-color-dark;
          line-height: 1.4;
          margin-bottom: 8upx;

          // 文本超出显示省略号
          &.clamp {
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }

        .attr-box {
          font-size: $font-sm + 1px;
          color: $font-color-light;
          line-height: 1.4;
          margin-bottom: 8upx;
        }

        .price {
          font-size: $font-base + 1px;
          color: $font-color-dark;
          font-weight: 500;

          //&:before {
          //  content: '¥';
          //  font-size: $font-sm;
          //  margin-right: 2upx;
          //}
        }
      }
    }
  }

  // 价格汇总区域
  .price-box {
    display: flex;
    justify-content: flex-end;
    align-items: baseline;
    padding: 20upx 0;
    font-size: $font-sm + 1px;
    color: $font-color-light;

    .num {
      margin: 0 8upx;
      color: $font-color-dark;
      font-weight: 500;
    }

    .price {
      font-size: $font-lg;
      color: $font-color-dark;
      font-weight: 600;
      margin-left: 8upx;

      //&:before {
      //  content: '¥';
      //  font-size: $font-sm;
      //  font-weight: normal;
      //  margin-right: 2upx;
      //}
    }
  }

  // 操作按钮区域
  .action-box {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height: 100upx;
    padding: 0 4upx;
    border-top: 1upx solid $border-color;

    .action-btn {
      width: 160upx;
      height: 60upx;
      margin: 0;
      margin-left: 24upx;
      padding: 0;
      text-align: center;
      line-height: 60upx;
      font-size: $font-sm + 1px;
      color: $font-color-dark;
      background: #fff;
      border: 1px solid $border-color-dark;
      border-radius: 100px;
      transition: all 0.3s;
      cursor: pointer;

      // 推荐按钮（立即支付）
      &.recom {
        background: $base-color;
        color: #fff;
        border-color: $base-color;
      }

      // 点击效果
      &:active {
        opacity: 0.8;
        transform: scale(0.98);
      }

      // 禁用状态
      &:disabled {
        opacity: 0.5;
        pointer-events: none;
      }
    }

    /* 退款相关按钮样式 */
    .action-btn.refund {
      border-color: #e6a23c;
      color: #e6a23c;
    }

    .action-btn.refund:active {
      background: rgba(230, 162, 60, 0.1);
    }

    /* 售后按钮样式 */
    .action-btn.after-sale {
      border-color: #409eff;
      color: #409eff;
    }

    .action-btn.after-sale:active {
      background: rgba(64, 158, 255, 0.1);
    }



  }
}

// ==========================================
// 加载更多组件样式
// ==========================================
.uni-load-more {
  display: flex;
  flex-direction: row;
  height: 80upx;
  align-items: center;
  justify-content: center;
  margin: 20upx 0;

  &__text {
    font-size: 28upx;
    color: #999;
  }

  &__img {
    height: 24px;
    width: 24px;
    margin-right: 10px;

    & > view {
      position: absolute;

      & view {
        width: 6px;
        height: 2px;
        border-top-left-radius: 1px;
        border-bottom-left-radius: 1px;
        background: #999;
        position: absolute;
        opacity: 0.2;
        transform-origin: 50%;
        animation: load 1.56s ease infinite;
      }
    }
  }
}

// 加载动画
@keyframes load {
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0.2;
  }
}
</style>
