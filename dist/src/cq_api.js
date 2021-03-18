'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.CqApi = void 0;
const nanoid_1 = require("nanoid");
const chalk = require("chalk");
const stringify = require('fast-json-stable-stringify');
class CqApi {
    constructor(ws, bot) {
        this.ws = ws;
        this.bot = bot;
    }
    safeXml(str) {
        if (!str)
            return str;
        let s = str.replace(/&/g, '&amp;');
        s = s.replace(/,/g, '$#44');
        s = s.replace(/\[/g, '&#91;');
        s = s.replace(/]/g, '&#93');
        return s;
    }
    sendJson(data) {
        this.ws.send(stringify(data));
    }
    send(data) {
        this.ws.send(data);
    }
    apiCall(action, params = {}, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const randId = `apicall:${nanoid_1.nanoid()}`;
            const rejector = (msg) => {
                return reject({
                    data: null,
                    msg,
                    echo: randId,
                    retcode: -1,
                    status: 'failed'
                });
            };
            const callback = (msg) => {
                if (!msg) {
                    rejector('none message');
                }
                else if (msg.status !== 'ok') {
                    switch (msg.retcode) {
                        case '100':
                            this.bot.error('error code 100, please check api call params.');
                            break;
                        default:
                            this.bot.error(`error code ${msg.retcode}, please check.`);
                            break;
                    }
                    reject(msg);
                }
                else {
                    resolve(msg);
                }
            };
            this.sendJson({ action, params: params ?? {}, echo: randId });
            this.bot.eventEmitter.once(randId, callback);
            setTimeout(() => {
                this.bot.eventEmitter.removeListener(randId, callback);
                rejector('timeout');
            }, timeout ?? 5000);
            this.bot.info(`send api request: ${chalk.yellowBright(action)}; id: ${chalk.yellowBright(randId)}`);
        });
    }
    /**
     * 发送消息 / send_msg
     * @param {number} user_id - 目标QQ号 The target QQ number
     * @param {number} group_id - 目标群号 The target QQ group number
     * @param {string} message - content
     * @param {boolean} auto_escape - 不解析消息内容 send as plain text
     */
    sendMsg(params, timeout = undefined) {
        return this.apiCall('send_msg', params, timeout);
    }
    /**
     * 发送私聊消息 / send_private_msg
     * @param {number} user_id - 目标QQ号 The target QQ number
     * @param {number} group_id - 主动发起临时会话群号
     * @param {string} message - content
     * @param {boolean} auto_escape - 不解析消息内容 send as plain text
     */
    sendPrivateMsg(params, timeout = undefined) {
        return this.apiCall('send_private_msg', params, timeout);
    }
    /**
     * 发送群消息 / send_group_msg
     * @param {number} group_id - 目标群号 The target QQ group number
     * @param {number} message - content
     * @param {boolean} auto_escape - 不解析消息内容 send as plain text
     */
    sendGroupMsg(params, timeout = undefined) {
        return this.apiCall('send_group_msg', params, timeout);
    }
    /**
     * 合并转发消息节点 / send_group_forward_msg
     * @param {number} group_id - 目标群号 The target QQ group number
     * @param {array} messages - CQnode, Doc: https://docs.go-cqhttp.org/cqcode/#合并转发消息节点
     */
    sendGroupForwardMsg(params = {
        group_id: undefined,
        messages: [
            {
                type: 'node',
                data: {
                    name: '消息发送者A',
                    uin: '10086',
                    content: [
                        {
                            type: 'text',
                            data: { text: '测试消息1' }
                        }
                    ]
                }
            },
            {
                type: 'node',
                data: {
                    name: '消息发送者B',
                    uin: '10087',
                    content: '666'
                }
            }
        ]
    }, timeout = undefined) {
        return this.apiCall('send_group_forward_msg', params, timeout);
    }
    /**
     * 撤回消息 / delete_msg
     * @param {number} message_id - 消息id The message id
     */
    deleteMsg(params = { message_id: undefined }, timeout = undefined) {
        return this.apiCall('delete_msg', params, timeout);
    }
    /**
     * 获取消息 / get_msg
     * @param {number} message_id - 消息id The message id
     */
    getMsg(params = {
        message_id: undefined
    }, timeout = undefined) {
        return this.apiCall('get_msg', params, timeout);
    }
    /**
     * 获取合并转发消息 / get_forward_msg
     * @param {number} message_id - 消息id The message id
     */
    getForwardMsg(params = {
        message_id: undefined
    }, timeout = undefined) {
        return this.apiCall('get_forward_msg', params, timeout);
    }
    /**
     * 获取图片信息 / get_image
     * @param {string} file - 图片缓存文件名 File cache name (CQ)
     */
    getImage(params = {
        file: undefined
    }, timeout = undefined) {
        return this.apiCall('get_image', params, timeout);
    }
    /**
     * QQ群踢人 / set_group_kick
     * @param {number} group_id - QQ Group number
     * @param {number} user_id - Target user QQ number
     * @param {boolean} reject_add_request - 拒绝此人的加群请求
     */
    groupKick(params = {
        group_id: undefined,
        user_id: undefined,
        reject_add_request: false
    }, timeout = undefined) {
        return this.apiCall('set_group_kick', params, timeout);
    }
    /**
     * QQ群禁言 / set_group_ban
     * @param {number} group_id - QQ Group number
     * @param {number} user_id - Target user QQ number
     * @param {number} duration - 禁言时长, 单位秒, 0 表示取消禁言
     */
    groupBan(params = {
        group_id: undefined,
        user_id: undefined,
        duration: 300
    }, timeout = undefined) {
        return this.apiCall('set_group_ban', params, timeout);
    }
    /**
     * QQ群禁言匿名用户 / set_group_anonymous_ban
     * @param {number} group_id - QQ Group number
     * @param {object} anonymous - Target anonymous object (from message)
     * @param {string} anonymous_flag - Target anonymous flag (from message)
     * @param {number} duration - 禁言时长, 单位秒, 无法取消
     */
    groupBanAnonymous(params = {
        group_id: undefined,
        anonymous: undefined,
        anonymous_flag: undefined,
        duration: 300
    }, timeout = undefined) {
        return this.apiCall('set_group_anonymous_ban', params, timeout);
    }
    /**
     * QQ群全体禁言 / set_group_whole_ban
     * @param {number} group_id - QQ Group number
     * @param {boolean} enable - 是否开启
     */
    groupBanAll(params = {
        group_id: undefined,
        enable: true
    }, timeout = undefined) {
        return this.apiCall('set_group_whole_ban', params, timeout);
    }
    /**
     * QQ群设置管理员 / set_group_admin
     * @param {number} group_id - QQ Group number
     * @param {number} user_id - Target user QQ number
     * @param {boolean} enable - 是否设为管理员
     */
    setGroupAdmin(params = {
        group_id: undefined,
        user_id: undefined,
        enable: true
    }, timeout = undefined) {
        return this.apiCall('set_group_admin', params, timeout);
    }
    /**
     * QQ群设置匿名聊天 / set_group_anonymous
     * @param {number} group_id - QQ Group number
     * @param {boolean} enable - 是否设为管理员
     */
    setGroupAnonymous(params = {
        group_id: undefined,
        enable: true
    }, timeout = undefined) {
        this.bot.error('Unimplement: set_group_anonymous');
        return this.apiCall('set_group_anonymous', params, timeout);
    }
    /**
     * QQ群设置用户群名片 / set_group_card
     * @param {number} group_id - QQ Group number
     * @param {number} user_id - Target user QQ number
     * @param {string} card - 群名片内容，为空将删除
     */
    setGroupCard(params = {
        group_id: undefined,
        user_id: undefined,
        card: ''
    }, timeout = undefined) {
        return this.apiCall('set_group_card', params, timeout);
    }
    /**
     * QQ群设置群名 / set_group_name
     * @param {number} group_id - QQ Group number
     * @param {string} group_name - New group name
     */
    setGroupName(params = {
        group_id: undefined,
        group_name: undefined
    }, timeout = undefined) {
        return this.apiCall('set_group_name', params, timeout);
    }
    /**
     * QQ群退群或解散 / set_group_leave
     * @param {number} group_id - QQ Group number
     * @param {boolean} is_dismiss - 是否解散 （仅群主可用）
     */
    groupLeave(params = {
        group_id: undefined,
        is_dismiss: false
    }, timeout = undefined) {
        return this.apiCall('set_group_leave', params, timeout);
    }
    /**
     * QQ群设置用户专属头衔 / set_group_special_title
     * @param {number} group_id - QQ Group number
     * @param {number} user_id - Target user QQ number
     * @param {string} special_title - Title 头衔，为空将删除
     * @param {number} duration - 持续时间，可能无效
     */
    groupSetUserTitle(params = {
        group_id: undefined,
        user_id: undefined,
        special_title: undefined,
        duration: -1
    }, timeout = undefined) {
        return this.apiCall('set_group_special_title', params, timeout);
    }
    /**
     * 处理好友请求 / set_friend_add_request
     * @param {string} flag - From message
     * @param {boolean} approve - 同意或拒绝
     * @param {string} remark - 备注
     */
    friendAddHandle(params = {
        flag: undefined,
        approve: true,
        remark: ''
    }, timeout = undefined) {
        return this.apiCall('set_friend_add_request', params, timeout);
    }
    /**
     * 处理加群请求 / set_group_add_request
     * @param {string} flag - From message
     * @param {string} sub_type - 'add' or 'invite' (From message)
     * @param {boolean} approve - 同意或拒绝
     * @param {string} reason - 拒绝理由
     */
    groupAddHandle(params = {
        flag: undefined,
        sub_type: undefined,
        approve: true,
        reason: ''
    }, timeout = undefined) {
        return this.apiCall('set_group_add_request', params, timeout);
    }
    /**
     * 获取登录QQ号信息 / get_login_info
     */
    getLoginInfo(params = {}, timeout = undefined) {
        return this.apiCall('get_login_info', params, timeout);
    }
    /**
     * 获取好友列表 / get_friend_list
     */
    getFriendList(params = {}, timeout = undefined) {
        return this.apiCall('get_friend_list', params, timeout);
    }
    /**
     * 获取QQ群列表 / get_group_list
     */
    getGroupList(params = {}, timeout = undefined) {
        return this.apiCall('get_group_list', params, timeout);
    }
    /**
     * 获取指定QQ号信息 / get_stranger_info
     * @param {number} user_id - QQ number
     * @param {boolean} no_cache - 不使用缓存
     */
    getTargetQQInfo(params = {
        user_id: undefined,
        no_cache: false
    }, timeout = undefined) {
        return this.apiCall('get_stranger_info', params, timeout);
    }
    /**
     * 获取指定QQ群信息 / get_group_info
     * @param {number} group_id - QQ group number
     * @param {boolean} no_cache - 不使用缓存
     */
    getTargetGroupInfo(params = {
        group_id: undefined,
        no_cache: false
    }, timeout = undefined) {
        return this.apiCall('get_group_info', params, timeout);
    }
    /**
     * 获取指定群成员信息 / get_group_member_info
     * @param {number} group_id - QQ group number
     * @param {number} user_id - QQ number
     * @param {boolean} no_cache - 不使用缓存
     */
    getGroupMemberInfo(params = {
        group_id: undefined,
        user_id: undefined,
        no_cache: false
    }, timeout = undefined) {
        return this.apiCall('get_group_member_info', params, timeout);
    }
    /**
     * 获取群成员列表 / get_group_member_list
     * @param {number} group_id - QQ group number
     */
    getGroupMemberList(params = {
        group_id: undefined
    }, timeout = undefined) {
        return this.apiCall('get_group_member_list', params, timeout);
    }
    /**
     * 获取群荣誉信息 / get_group_honor_info
     * @param {number} group_id - QQ group number
     * @param {string} type - input: talkative / performer / legend / strong_newbie / emotion / all
     */
    getGroupHonorInfo(params = {
        group_id: undefined,
        type: undefined
    }, timeout = undefined) {
        return this.apiCall('get_group_honor_info', params, timeout);
    }
    /**
     * 获取Cookies / get_cookies
     * @param {string} domain - Target domain
     */
    getCookies(params = {
        domain: undefined
    }, timeout = undefined) {
        this.bot.error('Unimplement: get_cookies');
        return this.apiCall('get_cookies', params, timeout);
    }
    /**
     * 获取CsrfToken / get_csrf_token
     */
    getCsrfToken(params = {}, timeout = undefined) {
        this.bot.error('Unimplement: get_csrf_token');
        return this.apiCall('get_csrf_token', params, timeout);
    }
    /**
     * 获取Credentials凭证 / get_credentials
     */
    getCredentials(params = {}, timeout = undefined) {
        this.bot.error('Unimplement: get_credentials');
        return this.apiCall('get_credentials', params, timeout);
    }
    /**
     * 获取语音 / get_record
     * @param {string} file - 消息段的 file 参数, 如 0B38145AA44505000B38145AA4450500.silk
     * @param {string} out_format - input: mp3 / amr / wma / m4a / spx / ogg / wav / flac
     */
    getRecord(params = { file: undefined, out_format: 'mp3' }, timeout = undefined) {
        this.bot.error('Unimplement: get_record');
        return this.apiCall('get_record', params, timeout);
    }
    /**
     * 检查是否可以发送图片 / can_send_image
     */
    checkCanSendImage(params = {}, timeout = undefined) {
        return this.apiCall('can_send_image', params, timeout);
    }
    /**
     * 检查是否可以发送语音 / can_send_record
     */
    checkCanSendRecord(params = {}, timeout = undefined) {
        return this.apiCall('can_send_record', params, timeout);
    }
    /**
     * 获取版本信息 / get_version_info
     */
    getVersionInfo(params = {}, timeout = undefined) {
        return this.apiCall('get_version_info', params, timeout);
    }
    /**
     * 重启 go-cqhttp / set_restart
     * @param {number} delay - 延迟 Delay ms
     */
    restartCQ(params = { delay: 0 }, timeout = undefined) {
        return this.apiCall('set_restart', params, timeout);
    }
    /**
     * 清理缓存 / clean_cache
     */
    cleanCache(params = {}, timeout = undefined) {
        this.bot.error('Unimplement: clean_cache');
        return this.apiCall('clean_cache', params, timeout);
    }
    /**
     * 设置群头像 / set_group_portrait
     * @param {number} group_id - QQ group number
     * @param {string} file - image path: file:///C:\\xx\xx.png / http://xxx/xx.jpg / base64://xxxx==
     * @param {number} cache - 是否使用已缓存的文件 0 / 1
     */
    setGroupImage(params = {
        group_id: undefined,
        file: undefined,
        cache: 1
    }, timeout = 10000) {
        return this.apiCall('set_group_portrait', params, timeout);
    }
    /**
     * 获取中文分词 ( 隐藏 API ) / .get_word_slices
     * @param {string} content - content
     */
    getWordSlices(params = { content: undefined }, timeout = undefined) {
        return this.apiCall('.get_word_slices', params, timeout);
    }
    /**
     * 图片 OCR / ocr_image
     * @param {string} image - 图片id
     */
    ocrImage(params = { image: undefined }, timeout = 10000) {
        return this.apiCall('ocr_image', params, timeout);
    }
    /**
     * 获取群系统消息 / get_group_system_msg
     */
    getGroupSystemMsg(params = {}, timeout = undefined) {
        return this.apiCall('get_group_system_msg', params, timeout);
    }
    /**
     * 上传群文件 / upload_group_file
     * @param {number} group_id - QQ group number
     * @param {string} file - local image path: file:///C:\\xx\xx.png
     * @param {string} name - 储存名称
     * @param {string} folder - 父目录ID
     */
    groupUploadFile(params = {
        group_id: undefined,
        file: undefined,
        name: undefined,
        folder: undefined
    }, timeout = 20000) {
        return this.apiCall('upload_group_file', params, timeout);
    }
    /**
     * 获取群文件信息 / get_group_file_system_info
     * @param {number} group_id - QQ group number
     */
    getGroupFileInfo(params = {
        group_id: undefined
    }, timeout = 10000) {
        return this.apiCall('get_group_file_system_info', params, timeout);
    }
    /**
     * 获取群根目录文件列表 / get_group_root_files
     * @param {number} group_id - QQ group number
     */
    getGroupRootFileList(params = {
        group_id: undefined
    }, timeout = undefined) {
        return this.apiCall('get_group_root_files', params, timeout);
    }
    /**
     * 获取群子目录文件列表 / get_group_files_by_folder
     * @param {number} group_id - QQ group number
     * @param {number} folder_id - 文件夹ID
     */
    getGroupFilesByFolder(params = {
        group_id: undefined,
        folder_id: undefined
    }, timeout = undefined) {
        return this.apiCall('get_group_files_by_folder', params, timeout);
    }
    /**
     * 获取群文件资源链接 / get_group_file_url
     * @param {number} group_id - QQ group number
     * @param {number} file_id - 文件ID
     * @param {number} busid - File type
     */
    getGroupFileUrl(params = {
        group_id: undefined,
        file_id: undefined,
        busid: undefined
    }, timeout = undefined) {
        return this.apiCall('get_group_file_url', params, timeout);
    }
    /**
     * 获取CQ状态 / get_status
     */
    getCqStatus(params = {}, timeout = undefined) {
        return this.apiCall('get_status', params, timeout);
    }
    /**
     * 获取群 @ 全体成员 剩余次数 / get_group_at_all_remain
     * @param {number} group_id - QQ group number
     */
    getGroupAtAllRemain(params = {
        group_id: undefined
    }, timeout = undefined) {
        return this.apiCall('get_group_at_all_remain', params, timeout);
    }
    /**
     * 对事件执行快速操作 ( 隐藏 API ) / .handle_quick_operation
     * @param {object} context - 事件数据对象
     * @param {object} context - 快速操作对象, 例如 {"ban": true, "reply": "请不要说脏话"}
     * @doc 文档 https://docs.go-cqhttp.org/event/#快速操作
     */
    quckHandle(params = {
        context: undefined,
        operation: undefined
    }, timeout = undefined) {
        return this.apiCall('.handle_quick_operation', params, timeout);
    }
    /**
     * 获取Vip状态 / _get_vip_info
     * @param {number} user_id - Target QQ number
     */
    getQQvipInfo(params = { user_id: undefined }, timeout = undefined) {
        return this.apiCall('_get_vip_info', params, timeout);
    }
    /**
     * 发送群公告 / _send_group_notice
     * @param {number} group_id - Target QQ group number
     * @param {string} content - content
     */
    groupSendNotice(params = { group_id: undefined, content: undefined }, timeout = undefined) {
        return this.apiCall('_send_group_notice', params, timeout);
    }
    /**
     * 重载事件过滤器 / reload_event_filter
     */
    reloadEventFilter(params = {}, timeout = undefined) {
        return this.apiCall('reload_event_filter', params, timeout);
    }
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
    downloadFile(params = { url: undefined, thread_count: undefined, headers: [] }, timeout = undefined) {
        return this.apiCall('download_file', params, timeout);
    }
    /**
     * 获取当前账号在线客户端列表 / get_online_clients
     * @param {boolean} no_cache - 是否无视缓存
     */
    getOnlineClients(params = { no_cache: undefined }, timeout = undefined) {
        return this.apiCall('get_online_clients', params, timeout);
    }
    /**
     * 获取群消息历史记录 / get_group_msg_history
     * @param {number} message_seq - 起始消息序号, 可通过 get_msg 获得
     * @param {number} group_id - 群号
     */
    groupGetMsgHistory(params = { message_seq: undefined, group_id: undefined }, timeout = undefined) {
        return this.apiCall('get_group_msg_history', params, timeout);
    }
    /**
     * 设置精华消息 / set_essence_msg
     * @param {number} message_id - msg id
     */
    setEssenceMsg(params = { message_id: undefined }, timeout = undefined) {
        return this.apiCall('set_essence_msg', params, timeout);
    }
    /**
     * 移出精华消息 / delete_essence_msg
     * @param {number} message_id - msg id
     */
    deleteEssenceMsg(params = { message_id: undefined }, timeout = undefined) {
        return this.apiCall('delete_essence_msg', params, timeout);
    }
    /**
     * 获取精华消息列表 / get_essence_msg_list
     * @param {number} group_id - QQ group id
     */
    getEssenceMsgList(params = { message_id: undefined }, timeout = undefined) {
        return this.apiCall('get_essence_msg_list', params, timeout);
    }
    /**
     * 检查链接安全性 / check_url_safely
     * @param {string} url - url
     */
    checkUrlSafely(params = { url: undefined }, timeout = undefined) {
        return this.apiCall('check_url_safely', params, timeout);
    }
}
exports.CqApi = CqApi;
;
//# sourceMappingURL=cq_api.js.map