<template>
  <view class="uni-numbox">
    <!-- 减号按钮 -->
    <view
      class="uni-numbox-minus"
      :class="{ 'uni-numbox-disabled': isMin || disabled }"
      @click="handleMinus"
    >
      <text class="yticon icon--jianhao"></text>
    </view>

    <!-- 输入框 -->
    <input
      class="uni-numbox-value"
      type="number"
      :disabled="disabled"
      :value="currentValue"
      @input="handleInput"
      @blur="handleBlur"
    >

    <!-- 加号按钮 -->
    <view
      class="uni-numbox-plus"
      :class="{ 'uni-numbox-disabled': isMax || disabled }"
      @click="handlePlus"
    >
      <text class="yticon icon-jia2"></text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'uni-number-box',

  // 组件属性定义
  props: {
    isMax: {  // 是否达到最大值
      type: Boolean,
      default: false
    },
    isMin: {  // 是否达到最小值
      type: Boolean,
      default: false
    },
    index: {  // 组件索引（用于在列表中使用时区分）
      type: Number,
      default: 0
    },
    value: {  // 当前值
      type: Number,
      default: 0
    },
    min: {  // 最小值
      type: Number,
      default: 0
    },
    max: {  // 最大值
      type: Number,
      default: 9999
    },
    step: {  // 步长
      type: Number,
      default: 1
    },
    disabled: {  // 是否禁用整个组件
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      currentValue: this.value,  // 内部维护的当前值
    }
  },

  // 监听属性变化
  watch: {
    // 监听外部传入的value变化
    value(newVal) {
      if (newVal !== this.currentValue) {
        this.currentValue = this.validateValue(newVal);
      }
    },

    // 监听内部currentValue变化
    currentValue(newVal, oldVal) {
      if (newVal !== oldVal) {
        // 触发change事件
        this.$emit('eventChange', {
          number: newVal,
          index: this.index
        });
      }
    }
  },

  methods: {
    /**
     * 处理减号点击
     */
    handleMinus() {
      if (this.disabled || this.isMin) return;

      let newValue = this.currentValue - this.step;

      // 边界检查
      if (newValue < this.min) {
        newValue = this.min;
      }

      this.currentValue = newValue;
    },

    /**
     * 处理加号点击
     */
    handlePlus() {

      console.log('➕ 加号被点击');
      console.log('当前值:', this.currentValue);
      console.log('isMax:', this.isMax);
      console.log('disabled:', this.disabled);
      console.log('max:', this.max);
      if (this.disabled || this.isMax) return;

      let newValue = this.currentValue + this.step;

      // 边界检查
      if (newValue > this.max) {
        newValue = this.max;
      }

      this.currentValue = newValue;
    },

    /**
     * 处理输入框输入
     * @param {Object} event - 输入事件
     */
    handleInput(event) {
      let value = parseFloat(event.detail.value);

      // 如果输入的不是有效数字，保持原值
      if (isNaN(value)) {
        return;
      }

      // 验证并更新值
      this.currentValue = this.validateValue(value);
    },

    /**
     * 处理输入框失去焦点
     * @param {Object} event - 失去焦点事件
     */
    handleBlur(event) {
      let value = parseFloat(event.detail.value);

      // 如果输入框为空，设为最小值
      if (isNaN(value)) {
        value = this.min;
      }

      // 验证并更新值
      const validValue = this.validateValue(value);

      // 如果值有变化才更新
      if (validValue !== this.currentValue) {
        this.currentValue = validValue;
      }
    },

    /**
     * 验证并修正数值
     * @param {number} value - 要验证的值
     * @returns {number} 修正后的值
     */
    validateValue(value) {
      // 确保是数字
      if (typeof value !== 'number' || isNaN(value)) {
        return this.min;
      }

      // 确保是整数
      value = Math.round(value);

      // 边界检查
      if (value < this.min) {
        return this.min;
      }
      if (value > this.max) {
        return this.max;
      }

      return value;
    }
  }
}
</script>

<style>
.uni-numbox {
  /* 移除绝对定位，使用相对定位 */
  position: relative;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 230upx;
  height: 70upx;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 8upx;
  overflow: hidden;
  box-sizing: border-box;
}

.uni-numbox-minus,
.uni-numbox-plus {
  margin: 0;
  width: 70upx;
  height: 100%;
  line-height: 70upx;
  text-align: center;
  background-color: #f8f8f8;
  transition: background-color 0.2s;
}

.uni-numbox-minus .yticon,
.uni-numbox-plus .yticon {
  font-size: 36upx;
  color: #333;
  transition: color 0.2s;
}

.uni-numbox-minus {
  border-right: 1px solid #e0e0e0;
}

.uni-numbox-plus {
  border-left: 1px solid #e0e0e0;
}

/* 禁用状态 */
.uni-numbox-disabled {
  background-color: #f0f0f0 !important;
  pointer-events: none;
}

.uni-numbox-disabled .yticon {
  color: #d6d6d6 !important;
}

/* 点击效果 */
.uni-numbox-minus:active:not(.uni-numbox-disabled),
.uni-numbox-plus:active:not(.uni-numbox-disabled) {
  background-color: #e8e8e8;
}

/* 输入框样式 */
.uni-numbox-value {
  flex: 1;
  width: 90upx;
  height: 50upx;
  border: none;
  text-align: center;
  padding: 0;
  font-size: 30upx;
  color: #333;
  background-color: #fff;
  box-sizing: border-box;

  /* 移除数字输入框的上下箭头 */
  -moz-appearance: textfield;
}

.uni-numbox-value::-webkit-outer-spin-button,
.uni-numbox-value::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* 禁用输入框样式 */
.uni-numbox-value:disabled {
  background-color: #f8f8f8;
  color: #999;
}
</style>
