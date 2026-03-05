import request from "@/utils/request";

const SMSHOMEADVERT_BASE_URL = "/aioveu-sms/app-api/v1/sms-home-advert";

const SmsHomeAdvertAPI = {
    /** 获取首页广告配置（增加跳转路径）分页数据 */
    getPage(queryParams?: SmsHomeAdvertPageQuery) {
        return request<PageResult<SmsHomeAdvertPageVO[]>>({
            url: `${SMSHOMEADVERT_BASE_URL}/page`,
            method: "GET",
            // params: queryParams,
        });
    },
    /**
     * 获取首页广告配置（增加跳转路径）表单数据
     *
     * @param id 首页广告配置（增加跳转路径）ID
     * @returns 首页广告配置（增加跳转路径）表单数据
     */
    getFormData(id: number) {
        return request<SmsHomeAdvertForm>({
            url: `${SMSHOMEADVERT_BASE_URL}/${id}/form`,
            method: "GET",
        });
    },

    /**
     *  添加首页广告配置（增加跳转路径）
     *
     *  @param data 首页广告配置（增加跳转路径）表单数据
     */
    add(data: SmsHomeAdvertForm) {
        return request({
            url: `${SMSHOMEADVERT_BASE_URL}`,
            method: "POST",
            data: data,
        });
    },

    /**
     * 更新首页广告配置（增加跳转路径）
     *
     * @param id 首页广告配置（增加跳转路径）ID
     * @param data 首页广告配置（增加跳转路径）表单数据
     */
     update(id: number, data: SmsHomeAdvertForm) {
        return request({
            url: `${SMSHOMEADVERT_BASE_URL}/${id}`,
            method: "PUT",
            data: data,
        });
    },

    /**
     * 批量删除首页广告配置（增加跳转路径），多个以英文逗号(,)分割
     *
     * @param ids 首页广告配置（增加跳转路径）ID字符串，多个以英文逗号(,)分割
     */
     deleteByIds(ids: string) {
        return request({
            url: `${SMSHOMEADVERT_BASE_URL}/${ids}`,
            method: "DELETE",
        });
    }
}

export default SmsHomeAdvertAPI;

/** 首页广告配置（增加跳转路径）分页查询参数 */
export interface SmsHomeAdvertPageQuery extends PageQuery {
    /** 关联广告ID（sms_advert表） */
    advertId?: number;
    /** 广告显示名称 */
    homeAdvertName?: string;
    /** 图片模式 */
    imageMode?: string;
    /** 跳转类型：navigateTo, redirectTo, switchTab */
    jumpType?: string;
    /** 排序 */
    sort?: number;
    /** 状态：0-隐藏，1-显示 */
    status?: number;
    /** 逻辑删除：0-正常 1-删除 */
    deleted?: number;
}

/** 首页广告配置（增加跳转路径）表单对象 */
export interface SmsHomeAdvertForm {
    /** 主键ID */
    id?:  number;
    /** 关联广告ID（sms_advert表） */
    advertId?:  number;
    /** 广告显示的图标URL */
    homeAdvertIcon?:  string;
    /** 广告显示名称 */
    homeAdvertName?:  string;
    /** 高度（rpx/upx） */
    height?:  number;
    /** 图片模式 */
    imageMode?:  string;
    /** 跳转路径 */
    jumpPath?:  string;
    /** 跳转类型：navigateTo, redirectTo, switchTab */
    jumpType?:  string;
    /** 跳转参数（JSON格式） */
    jumpParams?:  string;
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

/** 首页广告配置（增加跳转路径）分页对象 */
export interface SmsHomeAdvertPageVO {
    /** 主键ID */
    id?: number;
    /** 关联广告ID（sms_advert表） */
    advertId?: number;
    /** 广告显示的图标URL */
    homeAdvertIcon?: string;
    /** 广告显示名称 */
    homeAdvertName?: string;
    /** 高度（rpx/upx） */
    height?: number;
    /** 图片模式 */
    imageMode?: string;
    /** 跳转路径 */
    jumpPath?: string;
    /** 跳转类型：navigateTo, redirectTo, switchTab */
    jumpType?: string;
    /** 跳转参数（JSON格式） */
    jumpParams?: string;
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
