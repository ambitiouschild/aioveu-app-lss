import request from '@/utils/request'


// 查询购物车
export function getCart() {
	return request({
		url: '/aioveu-oms/app-api/v1/carts',
		method: "GET",
		header: {
			'auth': true // 需要认证
		}
	})
}

/**
 * 全选/全不选
 * @param {Object} params
 */
export function checkAll(params :any) {
	return request({
		url: '/aioveu-oms/app-api/v1/carts/_check',
		method: "PUT",
    data: params,
		header: {
			'auth': true
		}
	})
}


// 清空购物车
export function deleteCart() {
	return request({
		url: '/aioveu-oms/app-api/v1/carts',
		method: "DELETE",
		header: {
			'auth': true
		}
	})
}


// 添加购物车
export function addCartItem(skuId :any , count = 1) {
	return request({
		url: '/aioveu-oms/app-api/v1/carts',
		method: "POST",
    data: {
			skuId: skuId,
      count: count
		},
		header: { // 使用 data 传递参数
			'auth': true
		}
	})
}

// 更新购物车商品
export function updateCartItem(skuId :any, data :any) {
	return request({
		url: '/aioveu-oms/app-api/v1/carts/skuId/' + skuId,
		method: "PUT",
		data: data,
		header: {
			'auth': true
		}
	})
}


// 批量删除购物车商品
export function removeCartItem(skuId :any , count = 1) {
	return request({

		url: '/aioveu-oms/app-api/v1/carts/skuId/' + skuId,
		method: "DELETE",
		header: {
			'auth': true
		}
	})
}
