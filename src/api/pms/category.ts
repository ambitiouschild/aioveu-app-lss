import request from '@/utils/request'

export function getCategoryList(parentId) {
	return request({
		url: '/aioveu-pms/app-api/v1/categories',
		method: 'get',
		params: {
			parentId: parentId
		}
	})
}
