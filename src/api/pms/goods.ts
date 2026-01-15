import request from '@/utils/request'

/**
 * 获取商品分页列表
 * 
 * @param {Object} params
 */
export function listSpuPages(params:any) {
	return request({
		url: '/aioveu-pms/app-api/v1/spu/pages',
		method: "GET",
    data: params,
	})
}

/**
 * 获取秒杀商品列表
 * 
 * @param {Object} params
 */
export function listSeckillingSpus() {
	return request({
		url: '/aioveu-pms/app-api/v1/spu/seckilling',
		method: "GET",
	})
}

/**
 * 获取商品详情
 *
 * @param {Object} spuId
 */
export function getSpuDetail(spuId: number) {
	return request({
		url: '/aioveu-pms/app-api/v1/spu/' + spuId,
		method: "GET"
	})
}

