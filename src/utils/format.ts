//方案二：Intl.NumberFormat（推荐，支持国际化）
// utils/format.ts
/**
 * 使用 Intl.NumberFormat 格式化金额（推荐）
 * @param {number|string} value - 金额值
 * @param {Object} options - 格式化选项
 * @returns {string} 格式化后的金额字符串
 */
interface FormatMoneyOptions {
  style?: 'currency' | 'decimal' | 'percent';
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  locale?: string;
  [key: string]: any;
}

/**
 * 使用 Intl.NumberFormat 格式化金额
 */
export const formatMoney = (
  value: number | string | null | undefined,
  options: FormatMoneyOptions = {}
): string => {
  if (value === null || value === undefined || value === '') {
    return '¥0.00';
  }

  const num: number = Number(value);
  if (isNaN(num)) {
    return '¥0.00';
  }

  const {
    style = 'currency',
    currency = 'CNY',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    locale = 'zh-CN',
    ...otherOptions
  } = options;

  try {
    const formatter = new Intl.NumberFormat(locale, {
      style,
      currency,
      minimumFractionDigits,
      maximumFractionDigits,
      ...otherOptions
    });
    return formatter.format(num);
  } catch (error) {
    console.error('金额格式化失败:', error);
    // 降级处理
    return '¥' + num.toFixed(2);
  }
};
