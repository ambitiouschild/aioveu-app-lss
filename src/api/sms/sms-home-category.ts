import request from "@/utils/request";

const SMSHOMECATEGORY_BASE_URL = "/aioveu-sms/app-api/v1/sms-home-category";

const SmsHomeCategoryAPI = {
    /** 获取首页分类配置分页数据 */
    getPage(queryParams?: SmsHomeCategoryPageQuery) {
        return request<PageResult<SmsHomeCategoryPageVO[]>>({
            url: `${SMSHOMECATEGORY_BASE_URL}/page`,
            method: "GET",
            // params: queryParams,
        });
    },
    /**
     * 获取首页分类配置表单数据
     *
     * @param id 首页分类配置ID
     * @returns 首页分类配置表单数据
     */
    getFormData(id: number) {
        return request<SmsHomeCategoryForm>({
            url: `${SMSHOMECATEGORY_BASE_URL}/${id}/form`,
            method: "GET",
        });
    },

    /**
     *  添加首页分类配置
     *
     *  @param data 首页分类配置表单数据
     */
    add(data: SmsHomeCategoryForm) {
        return request({
            url: `${SMSHOMECATEGORY_BASE_URL}`,
            method: "POST",
            data: data,
        });
    },

    /**
     * 更新首页分类配置
     *
     * @param id 首页分类配置ID
     * @param data 首页分类配置表单数据
     */
     update(id: number, data: SmsHomeCategoryForm) {
        return request({
            url: `${SMSHOMECATEGORY_BASE_URL}/${id}`,
            method: "PUT",
            data: data,
        });
    },

    /**
     * 批量删除首页分类配置，多个以英文逗号(,)分割
     *
     * @param ids 首页分类配置ID字符串，多个以英文逗号(,)分割
     */
     deleteByIds(ids: string) {
        return request({
            url: `${SMSHOMECATEGORY_BASE_URL}/${ids}`,
            method: "DELETE",
        });
    }
}

export default SmsHomeCategoryAPI;

/** 首页分类配置分页查询参数 */
export interface SmsHomeCategoryPageQuery extends PageQuery {
    /** 关联商品分类ID（pms_category表） */
    categoryId?: number;
    /** 首页显示名称 */
    homeName?: string;
    /** 状态：0-隐藏，1-显示 */
    status?: number;
    /** 逻辑删除：0-正常 1-删除 */
    deleted?: number;
}

/** 首页分类配置表单对象 */
export interface SmsHomeCategoryForm {
    id?:  number;
    /** 关联商品分类ID（pms_category表） */
    categoryId?:  number;
    /** 首页显示的图标URL */
    homeIcon?:  string;
    /** 首页显示名称 */
    homeName?:  string;
    /** 跳转路径 */
    jumpPath?:  string;
    /** 跳转类型：navigateTo, redirectTo, switchTab */
    jumpType?:  string;
    /** 排序 */
    sort?:  number;
    /** 状态：0-隐藏，1-显示 */
    status?:  number;
    /** 备注 */
    remark?:  string;
    /** 创建时间 */
    createTime?:  Date;
    /** 更新时间 */
    updateTime?:  Date;
    /** 逻辑删除：0-正常 1-删除 */
    deleted?:  number;
    /** 版本号（用于乐观锁） */
    version?:  number;
}

/** 首页分类配置分页对象 */
export interface SmsHomeCategoryPageVO {
    id?: number;
    /** 关联商品分类ID（pms_category表） */
    categoryId?: number;
    /** 首页显示的图标URL */
    homeIcon?: string;
    /** 首页显示名称 */
    homeName?: string;
    /** 跳转路径 */
    jumpPath?: string;
    /** 跳转类型：navigateTo, redirectTo, switchTab */
    jumpType?: string;
    /** 排序 */
    sort?: number;
    /** 状态：0-隐藏，1-显示 */
    status?: number;
    /** 备注 */
    remark?: string;
    /** 创建时间 */
    createTime?: Date;
    /** 更新时间 */
    updateTime?: Date;
    /** 逻辑删除：0-正常 1-删除 */
    deleted?: number;
    /** 版本号（用于乐观锁） */
    version?: number;
}
