import { QQbot, MyWebSocket } from 'qqbot';
export declare class CqApi {
    ws: MyWebSocket;
    bot: QQbot;
    constructor(ws: MyWebSocket, bot: QQbot);
    safeXml(str: string): string;
    sendJson(data: any): void;
    send(data: any): void;
    /**
     * CQApi 调用，返回promise
     * @param {string} action - 要调用的api端点
     * @param {object} params - 参数
     * @param {number} timeout - 超时时间（ms）
     */
    apiCall(action: string, params?: {}, timeout?: number): Promise<unknown>;
    /**
     * 发送消息 / send_msg
     * @param {number} user_id - 目标QQ号 The target QQ number
     * @param {number} group_id - 目标群号 The target QQ group number
     * @param {string} message - content
     * @param {boolean} auto_escape - 不解析消息内容 send as plain text
     */
    sendMsg(params: {
        user_id: number;
        group_id: number;
        message: any;
        auto_escape: boolean;
    }, timeout?: number): Promise<unknown>;
    /**
     * 发送私聊消息 / send_private_msg
     * @param {number} user_id - 目标QQ号 The target QQ number
     * @param {number} group_id - 主动发起临时会话群号
     * @param {string} message - content
     * @param {boolean} auto_escape - 不解析消息内容 send as plain text
     */
    sendPrivateMsg(params: {
        user_id: number;
        group_id: number;
        message: any;
        auto_escape: boolean;
    }, timeout?: number): Promise<unknown>;
    /**
     * 发送群消息 / send_group_msg
     * @param {number} group_id - 目标群号 The target QQ group number
     * @param {number} message - content
     * @param {boolean} auto_escape - 不解析消息内容 send as plain text
     */
    sendGroupMsg(params: {
        group_id: number;
        message: any;
        auto_escape: boolean;
    }, timeout?: number): Promise<unknown>;
    /**
     * 合并转发消息节点 / send_group_forward_msg
     * @param {number} group_id - 目标群号 The target QQ group number
     * @param {array} messages - CQnode, Doc: https://docs.go-cqhttp.org/cqcode/#合并转发消息节点
     */
    sendGroupForwardMsg(params?: {
        group_id: any;
        messages: ({
            type: string;
            data: {
                name: string;
                uin: string;
                content: {
                    type: string;
                    data: {
                        text: string;
                    };
                }[];
            };
        } | {
            type: string;
            data: {
                name: string;
                uin: string;
                content: string;
            };
        })[];
    }, timeout?: number): Promise<unknown>;
    /**
     * 撤回消息 / delete_msg
     * @param {number} message_id - 消息id The message id
     */
    deleteMsg(params?: {
        message_id: number;
    }, timeout?: number): Promise<unknown>;
    /**
     * 获取消息 / get_msg
     * @param {number} message_id - 消息id The message id
     */
    getMsg(params?: {
        message_id: any;
    }, timeout?: number): Promise<unknown>;
    /**
     * 获取合并转发消息 / get_forward_msg
     * @param {number} message_id - 消息id The message id
     */
    getForwardMsg(params?: {
        message_id: number;
    }, timeout?: number): Promise<unknown>;
    /**
     * 获取图片信息 / get_image
     * @param {string} file - 图片缓存文件名 File cache name (CQ)
     */
    getImage(params?: {
        file: string;
    }, timeout?: number): Promise<unknown>;
    /**
     * QQ群踢人 / set_group_kick
     * @param {number} group_id - QQ Group number
     * @param {number} user_id - Target user QQ number
     * @param {boolean} reject_add_request - 拒绝此人的加群请求
     */
    groupKick(params?: {
        group_id: number;
        user_id: number;
        reject_add_request: boolean;
    }, timeout?: number): Promise<unknown>;
    /**
     * QQ群禁言 / set_group_ban
     * @param {number} group_id - QQ Group number
     * @param {number} user_id - Target user QQ number
     * @param {number} duration - 禁言时长, 单位秒, 0 表示取消禁言
     */
    groupBan(params?: {
        group_id: number;
        user_id: number;
        duration: 300;
    }, timeout?: number): Promise<unknown>;
    /**
     * QQ群禁言匿名用户 / set_group_anonymous_ban
     * @param {number} group_id - QQ Group number
     * @param {object} anonymous - Target anonymous object (from message)
     * @param {string} anonymous_flag - Target anonymous flag (from message)
     * @param {number} duration - 禁言时长, 单位秒, 无法取消
     */
    groupBanAnonymous(params?: {
        group_id: number;
        anonymous: object;
        anonymous_flag: string;
        duration: number;
    }, timeout?: number): Promise<unknown>;
    /**
     * QQ群全体禁言 / set_group_whole_ban
     * @param {number} group_id - QQ Group number
     * @param {boolean} enable - 是否开启
     */
    groupBanAll(params?: {
        group_id: number;
        enable: boolean;
    }, timeout?: number): Promise<unknown>;
    /**
     * QQ群设置管理员 / set_group_admin
     * @param {number} group_id - QQ Group number
     * @param {number} user_id - Target user QQ number
     * @param {boolean} enable - 是否设为管理员
     */
    setGroupAdmin(params?: {
        group_id: number;
        user_id: number;
        enable: boolean;
    }, timeout?: number): Promise<unknown>;
    /**
     * QQ群设置匿名聊天 / set_group_anonymous
     * @param {number} group_id - QQ Group number
     * @param {boolean} enable - 是否设为管理员
     */
    setGroupAnonymous(params?: {
        group_id: undefined;
        enable: boolean;
    }, timeout?: number): Promise<unknown>;
    /**
     * QQ群设置用户群名片 / set_group_card
     * @param {number} group_id - QQ Group number
     * @param {number} user_id - Target user QQ number
     * @param {string} card - 群名片内容，为空将删除
     */
    setGroupCard(params?: {
        group_id: number;
        user_id: number;
        card: string;
    }, timeout?: number): Promise<unknown>;
    /**
     * QQ群设置群名 / set_group_name
     * @param {number} group_id - QQ Group number
     * @param {string} group_name - New group name
     */
    setGroupName(params?: {
        group_id: number;
        group_name: string;
    }, timeout?: number): Promise<unknown>;
    /**
     * QQ群退群或解散 / set_group_leave
     * @param {number} group_id - QQ Group number
     * @param {boolean} is_dismiss - 是否解散 （仅群主可用）
     */
    groupLeave(params?: {
        group_id: number;
        is_dismiss: boolean;
    }, timeout?: number): Promise<unknown>;
    /**
     * QQ群设置用户专属头衔 / set_group_special_title
     * @param {number} group_id - QQ Group number
     * @param {number} user_id - Target user QQ number
     * @param {string} special_title - Title 头衔，为空将删除
     * @param {number} duration - 持续时间，可能无效
     */
    groupSetUserTitle(params?: {
        group_id: number;
        user_id: number;
        special_title: string;
        duration: number;
    }, timeout?: number): Promise<unknown>;
    /**
     * 处理好友请求 / set_friend_add_request
     * @param {string} flag - From message
     * @param {boolean} approve - 同意或拒绝
     * @param {string} remark - 备注
     */
    friendAddHandle(params?: {
        flag: string;
        approve: boolean;
        remark: string;
    }, timeout?: number): Promise<unknown>;
    /**
     * 处理加群请求 / set_group_add_request
     * @param {string} flag - From message
     * @param {string} sub_type - 'add' or 'invite' (From message)
     * @param {boolean} approve - 同意或拒绝
     * @param {string} reason - 拒绝理由
     */
    groupAddHandle(params?: {
        flag: string;
        sub_type: string;
        approve: boolean;
        reason: string;
    }, timeout?: number): Promise<unknown>;
    /**
     * 获取登录QQ号信息 / get_login_info
     */
    getLoginInfo(params?: {}, timeout?: number): Promise<unknown>;
    /**
     * 获取好友列表 / get_friend_list
     */
    getFriendList(params?: {}, timeout?: number): Promise<unknown>;
    /**
     * 获取QQ群列表 / get_group_list
     */
    getGroupList(params?: {}, timeout?: number): Promise<unknown>;
    /**
     * 获取指定QQ号信息 / get_stranger_info
     * @param {number} user_id - QQ number
     * @param {boolean} no_cache - 不使用缓存
     */
    getTargetQQInfo(params?: {
        user_id: number;
        no_cache: boolean;
    }, timeout?: number): Promise<unknown>;
    /**
     * 获取指定QQ群信息 / get_group_info
     * @param {number} group_id - QQ group number
     * @param {boolean} no_cache - 不使用缓存
     */
    getTargetGroupInfo(params?: {
        group_id: number;
        no_cache: boolean;
    }, timeout?: number): Promise<unknown>;
    /**
     * 获取指定群成员信息 / get_group_member_info
     * @param {number} group_id - QQ group number
     * @param {number} user_id - QQ number
     * @param {boolean} no_cache - 不使用缓存
     */
    getGroupMemberInfo(params?: {
        group_id: number;
        user_id: number;
        no_cache: boolean;
    }, timeout?: number): Promise<unknown>;
    /**
     * 获取群成员列表 / get_group_member_list
     * @param {number} group_id - QQ group number
     */
    getGroupMemberList(params?: {
        group_id: number;
    }, timeout?: number): Promise<unknown>;
    /**
     * 获取群荣誉信息 / get_group_honor_info
     * @param {number} group_id - QQ group number
     * @param {string} type - input: talkative / performer / legend / strong_newbie / emotion / all
     */
    getGroupHonorInfo(params?: {
        group_id: number;
        type: string;
    }, timeout?: number): Promise<unknown>;
    /**
     * 获取Cookies / get_cookies
     * @param {string} domain - Target domain
     */
    getCookies(params?: {
        domain: string;
    }, timeout?: number): Promise<unknown>;
    /**
     * 获取CsrfToken / get_csrf_token
     */
    getCsrfToken(params?: {}, timeout?: number): Promise<unknown>;
    /**
     * 获取Credentials凭证 / get_credentials
     */
    getCredentials(params?: {}, timeout?: number): Promise<unknown>;
    /**
     * 获取语音 / get_record
     * @param {string} file - 消息段的 file 参数, 如 0B38145AA44505000B38145AA4450500.silk
     * @param {string} out_format - input: mp3 / amr / wma / m4a / spx / ogg / wav / flac
     */
    getRecord(params?: {
        file: string;
        out_format: string;
    }, timeout?: number): Promise<unknown>;
    /**
     * 检查是否可以发送图片 / can_send_image
     */
    checkCanSendImage(params?: {}, timeout?: number): Promise<unknown>;
    /**
     * 检查是否可以发送语音 / can_send_record
     */
    checkCanSendRecord(params?: {}, timeout?: number): Promise<unknown>;
    /**
     * 获取版本信息 / get_version_info
     */
    getVersionInfo(params?: {}, timeout?: number): Promise<unknown>;
    /**
     * 重启 go-cqhttp / set_restart
     * @param {number} delay - 延迟 Delay ms
     */
    restartCQ(params?: {
        delay: number;
    }, timeout?: number): Promise<unknown>;
    /**
     * 清理缓存 / clean_cache
     */
    cleanCache(params?: {}, timeout?: number): Promise<unknown>;
    /**
     * 设置群头像 / set_group_portrait
     * @param {number} group_id - QQ group number
     * @param {string} file - image path: file:///C:\\xx\xx.png / http://xxx/xx.jpg / base64://xxxx==
     * @param {number} cache - 是否使用已缓存的文件 0 / 1
     */
    setGroupImage(params?: {
        group_id: number;
        file: string;
        cache: number;
    }, timeout?: number): Promise<unknown>;
    /**
     * 获取中文分词 ( 隐藏 API ) / .get_word_slices
     * @param {string} content - content
     */
    getWordSlices(params?: {
        content: string;
    }, timeout?: number): Promise<unknown>;
    /**
     * 图片 OCR / ocr_image
     * @param {string} image - 图片id
     */
    ocrImage(params?: {
        image: string;
    }, timeout?: number): Promise<unknown>;
    /**
     * 获取群系统消息 / get_group_system_msg
     */
    getGroupSystemMsg(params?: {}, timeout?: number): Promise<unknown>;
    /**
     * 上传群文件 / upload_group_file
     * @param {number} group_id - QQ group number
     * @param {string} file - local image path: file:///C:\\xx\xx.png
     * @param {string} name - 储存名称
     * @param {string} folder - 父目录ID
     */
    groupUploadFile(params?: {
        group_id: number;
        file: string;
        name: string;
        folder: string;
    }, timeout?: number): Promise<unknown>;
    /**
     * 获取群文件信息 / get_group_file_system_info
     * @param {number} group_id - QQ group number
     */
    getGroupFileInfo(params?: {
        group_id: number;
    }, timeout?: number): Promise<unknown>;
    /**
     * 获取群根目录文件列表 / get_group_root_files
     * @param {number} group_id - QQ group number
     */
    getGroupRootFileList(params?: {
        group_id: number;
    }, timeout?: number): Promise<unknown>;
    /**
     * 获取群子目录文件列表 / get_group_files_by_folder
     * @param {number} group_id - QQ group number
     * @param {number} folder_id - 文件夹ID
     */
    getGroupFilesByFolder(params?: {
        group_id: number;
        folder_id: number;
    }, timeout?: number): Promise<unknown>;
    /**
     * 获取群文件资源链接 / get_group_file_url
     * @param {number} group_id - QQ group number
     * @param {number} file_id - 文件ID
     * @param {number} busid - File type
     */
    getGroupFileUrl(params?: {
        group_id: number;
        file_id: number;
        busid: number;
    }, timeout?: number): Promise<unknown>;
    /**
     * 获取CQ状态 / get_status
     */
    getCqStatus(params?: {}, timeout?: number): Promise<unknown>;
    /**
     * 获取群 @ 全体成员 剩余次数 / get_group_at_all_remain
     * @param {number} group_id - QQ group number
     */
    getGroupAtAllRemain(params?: {
        group_id: number;
    }, timeout?: number): Promise<unknown>;
    /**
     * 对事件执行快速操作 ( 隐藏 API ) / .handle_quick_operation
     * @param {object} context - 事件数据对象
     * @param {object} context - 快速操作对象, 例如 {"ban": true, "reply": "请不要说脏话"}
     * @doc 文档 https://docs.go-cqhttp.org/event/#快速操作
     */
    quckHandle(params?: {
        context: object;
        operation: object;
    }, timeout?: number): Promise<unknown>;
    /**
     * 获取Vip状态 / _get_vip_info
     * @param {number} user_id - Target QQ number
     */
    getQQvipInfo(params?: {
        user_id: number;
    }, timeout?: number): Promise<unknown>;
    /**
     * 发送群公告 / _send_group_notice
     * @param {number} group_id - Target QQ group number
     * @param {string} content - content
     */
    groupSendNotice(params?: {
        group_id: number;
        content: string;
    }, timeout?: number): Promise<unknown>;
    /**
     * 重载事件过滤器 / reload_event_filter
     */
    reloadEventFilter(params?: {}, timeout?: number): Promise<unknown>;
    /**
     * 下载文件到缓存目录 / download_file
     * @param {string} url - download url
     * @param {string} thread_count - 下载线程数
     * @param {array} headers - 自定义请求头
     *  [
     *      "User-Agent=YOUR_UA",
     *      "Referer=https://www.baidu.com"
     *  ]
     */
    downloadFile(params?: {
        url: string;
        thread_count: string;
        headers: Array<string>;
    }, timeout?: number): Promise<unknown>;
    /**
     * 获取当前账号在线客户端列表 / get_online_clients
     * @param {boolean} no_cache - 是否无视缓存
     */
    getOnlineClients(params?: {
        no_cache: boolean;
    }, timeout?: number): Promise<unknown>;
    /**
     * 获取群消息历史记录 / get_group_msg_history
     * @param {number} message_seq - 起始消息序号, 可通过 get_msg 获得
     * @param {number} group_id - 群号
     */
    groupGetMsgHistory(params?: {
        message_seq: number;
        group_id: number;
    }, timeout?: number): Promise<unknown>;
    /**
     * 设置精华消息 / set_essence_msg
     * @param {number} message_id - msg id
     */
    setEssenceMsg(params?: {
        message_id: number;
    }, timeout?: number): Promise<unknown>;
    /**
     * 移出精华消息 / delete_essence_msg
     * @param {number} message_id - msg id
     */
    deleteEssenceMsg(params?: {
        message_id: number;
    }, timeout?: number): Promise<unknown>;
    /**
     * 获取精华消息列表 / get_essence_msg_list
     * @param {number} group_id - QQ group id
     */
    getEssenceMsgList(params?: {
        message_id: number;
    }, timeout?: number): Promise<unknown>;
    /**
     * 检查链接安全性 / check_url_safely
     * @param {string} url - url
     */
    checkUrlSafely(params?: {
        url: string;
    }, timeout?: number): Promise<unknown>;
}
//# sourceMappingURL=cq_api.d.ts.map