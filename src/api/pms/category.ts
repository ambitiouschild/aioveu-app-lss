import request from '@/utils/request'

export function getCategoryList(queryParams: PmsCategoryPageQuery) {
	return request({
		url: '/aioveu-pms/app-api/v1/categories',
		method: "GET",
    data:queryParams,
	})
}



/** 商品分类分页查询参数 */
export interface PmsCategoryPageQuery extends PageQuery {
  /** 商品分类名称 */
  name?: string;
  /** 父级ID */
  parentId?: number;
  /** 图标地址 */
  iconUrl?: string;
  /** 排序 */
  sort?: number;
  /** 显示状态:( 0:隐藏 1:显示) */
  visible?: number;
}
