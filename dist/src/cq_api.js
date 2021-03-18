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
    sendMsg(params, timeout = undefined) {
        return this.apiCall('send_msg', params, timeout);
    }
    sendPrivateMsg(params, timeout = undefined) {
        return this.apiCall('send_private_msg', params, timeout);
    }
    sendGroupMsg(params, timeout = undefined) {
        return this.apiCall('send_group_msg', params, timeout);
    }
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
    deleteMsg(params = { message_id: undefined }, timeout = undefined) {
        return this.apiCall('delete_msg', params, timeout);
    }
    getMsg(params = {
        message_id: undefined
    }, timeout = undefined) {
        return this.apiCall('get_msg', params, timeout);
    }
    getForwardMsg(params = {
        message_id: undefined
    }, timeout = undefined) {
        return this.apiCall('get_forward_msg', params, timeout);
    }
    getImage(params = {
        file: undefined
    }, timeout = undefined) {
        return this.apiCall('get_image', params, timeout);
    }
    groupKick(params = {
        group_id: undefined,
        user_id: undefined,
        reject_add_request: false
    }, timeout = undefined) {
        return this.apiCall('set_group_kick', params, timeout);
    }
    groupBan(params = {
        group_id: undefined,
        user_id: undefined,
        duration: 300
    }, timeout = undefined) {
        return this.apiCall('set_group_ban', params, timeout);
    }
    groupBanAnonymous(params = {
        group_id: undefined,
        anonymous: undefined,
        anonymous_flag: undefined,
        duration: 300
    }, timeout = undefined) {
        return this.apiCall('set_group_anonymous_ban', params, timeout);
    }
    groupBanAll(params = {
        group_id: undefined,
        enable: true
    }, timeout = undefined) {
        return this.apiCall('set_group_whole_ban', params, timeout);
    }
    setGroupAdmin(params = {
        group_id: undefined,
        user_id: undefined,
        enable: true
    }, timeout = undefined) {
        return this.apiCall('set_group_admin', params, timeout);
    }
    setGroupAnonymous(params = {
        group_id: undefined,
        enable: true
    }, timeout = undefined) {
        this.bot.error('Unimplement: set_group_anonymous');
        return this.apiCall('set_group_anonymous', params, timeout);
    }
    setGroupCard(params = {
        group_id: undefined,
        user_id: undefined,
        card: ''
    }, timeout = undefined) {
        return this.apiCall('set_group_card', params, timeout);
    }
    setGroupName(params = {
        group_id: undefined,
        group_name: undefined
    }, timeout = undefined) {
        return this.apiCall('set_group_name', params, timeout);
    }
    groupLeave(params = {
        group_id: undefined,
        is_dismiss: false
    }, timeout = undefined) {
        return this.apiCall('set_group_leave', params, timeout);
    }
    groupSetUserTitle(params = {
        group_id: undefined,
        user_id: undefined,
        special_title: undefined,
        duration: -1
    }, timeout = undefined) {
        return this.apiCall('set_group_special_title', params, timeout);
    }
    friendAddHandle(params = {
        flag: undefined,
        approve: true,
        remark: ''
    }, timeout = undefined) {
        return this.apiCall('set_friend_add_request', params, timeout);
    }
    groupAddHandle(params = {
        flag: undefined,
        sub_type: undefined,
        approve: true,
        reason: ''
    }, timeout = undefined) {
        return this.apiCall('set_group_add_request', params, timeout);
    }
    getLoginInfo(params = {}, timeout = undefined) {
        return this.apiCall('get_login_info', params, timeout);
    }
    getFriendList(params = {}, timeout = undefined) {
        return this.apiCall('get_friend_list', params, timeout);
    }
    getGroupList(params = {}, timeout = undefined) {
        return this.apiCall('get_group_list', params, timeout);
    }
    getTargetQQInfo(params = {
        user_id: undefined,
        no_cache: false
    }, timeout = undefined) {
        return this.apiCall('get_stranger_info', params, timeout);
    }
    getTargetGroupInfo(params = {
        group_id: undefined,
        no_cache: false
    }, timeout = undefined) {
        return this.apiCall('get_group_info', params, timeout);
    }
    getGroupMemberInfo(params = {
        group_id: undefined,
        user_id: undefined,
        no_cache: false
    }, timeout = undefined) {
        return this.apiCall('get_group_member_info', params, timeout);
    }
    getGroupMemberList(params = {
        group_id: undefined
    }, timeout = undefined) {
        return this.apiCall('get_group_member_list', params, timeout);
    }
    getGroupHonorInfo(params = {
        group_id: undefined,
        type: undefined
    }, timeout = undefined) {
        return this.apiCall('get_group_honor_info', params, timeout);
    }
    getCookies(params = {
        domain: undefined
    }, timeout = undefined) {
        this.bot.error('Unimplement: get_cookies');
        return this.apiCall('get_cookies', params, timeout);
    }
    getCsrfToken(params = {}, timeout = undefined) {
        this.bot.error('Unimplement: get_csrf_token');
        return this.apiCall('get_csrf_token', params, timeout);
    }
    getCredentials(params = {}, timeout = undefined) {
        this.bot.error('Unimplement: get_credentials');
        return this.apiCall('get_credentials', params, timeout);
    }
    getRecord(params = { file: undefined, out_format: 'mp3' }, timeout = undefined) {
        this.bot.error('Unimplement: get_record');
        return this.apiCall('get_record', params, timeout);
    }
    checkCanSendImage(params = {}, timeout = undefined) {
        return this.apiCall('can_send_image', params, timeout);
    }
    checkCanSendRecord(params = {}, timeout = undefined) {
        return this.apiCall('can_send_record', params, timeout);
    }
    getVersionInfo(params = {}, timeout = undefined) {
        return this.apiCall('get_version_info', params, timeout);
    }
    restartCQ(params = { delay: 0 }, timeout = undefined) {
        return this.apiCall('set_restart', params, timeout);
    }
    cleanCache(params = {}, timeout = undefined) {
        this.bot.error('Unimplement: clean_cache');
        return this.apiCall('clean_cache', params, timeout);
    }
    setGroupImage(params = {
        group_id: undefined,
        file: undefined,
        cache: 1
    }, timeout = 10000) {
        return this.apiCall('set_group_portrait', params, timeout);
    }
    getWordSlices(params = { content: undefined }, timeout = undefined) {
        return this.apiCall('.get_word_slices', params, timeout);
    }
    ocrImage(params = { image: undefined }, timeout = 10000) {
        return this.apiCall('ocr_image', params, timeout);
    }
    getGroupSystemMsg(params = {}, timeout = undefined) {
        return this.apiCall('get_group_system_msg', params, timeout);
    }
    groupUploadFile(params = {
        group_id: undefined,
        file: undefined,
        name: undefined,
        folder: undefined
    }, timeout = 20000) {
        return this.apiCall('upload_group_file', params, timeout);
    }
    getGroupFileInfo(params = {
        group_id: undefined
    }, timeout = 10000) {
        return this.apiCall('get_group_file_system_info', params, timeout);
    }
    getGroupRootFileList(params = {
        group_id: undefined
    }, timeout = undefined) {
        return this.apiCall('get_group_root_files', params, timeout);
    }
    getGroupFilesByFolder(params = {
        group_id: undefined,
        folder_id: undefined
    }, timeout = undefined) {
        return this.apiCall('get_group_files_by_folder', params, timeout);
    }
    getGroupFileUrl(params = {
        group_id: undefined,
        file_id: undefined,
        busid: undefined
    }, timeout = undefined) {
        return this.apiCall('get_group_file_url', params, timeout);
    }
    getCqStatus(params = {}, timeout = undefined) {
        return this.apiCall('get_status', params, timeout);
    }
    getGroupAtAllRemain(params = {
        group_id: undefined
    }, timeout = undefined) {
        return this.apiCall('get_group_at_all_remain', params, timeout);
    }
    quckHandle(params = {
        context: undefined,
        operation: undefined
    }, timeout = undefined) {
        return this.apiCall('.handle_quick_operation', params, timeout);
    }
    getQQvipInfo(params = { user_id: undefined }, timeout = undefined) {
        return this.apiCall('_get_vip_info', params, timeout);
    }
    groupSendNotice(params = { group_id: undefined, content: undefined }, timeout = undefined) {
        return this.apiCall('_send_group_notice', params, timeout);
    }
    reloadEventFilter(params = {}, timeout = undefined) {
        return this.apiCall('reload_event_filter', params, timeout);
    }
    downloadFile(params = { url: undefined, thread_count: undefined, headers: [] }, timeout = undefined) {
        return this.apiCall('download_file', params, timeout);
    }
    getOnlineClients(params = { no_cache: undefined }, timeout = undefined) {
        return this.apiCall('get_online_clients', params, timeout);
    }
    groupGetMsgHistory(params = { message_seq: undefined, group_id: undefined }, timeout = undefined) {
        return this.apiCall('get_group_msg_history', params, timeout);
    }
    setEssenceMsg(params = { message_id: undefined }, timeout = undefined) {
        return this.apiCall('set_essence_msg', params, timeout);
    }
    deleteEssenceMsg(params = { message_id: undefined }, timeout = undefined) {
        return this.apiCall('delete_essence_msg', params, timeout);
    }
    getEssenceMsgList(params = { message_id: undefined }, timeout = undefined) {
        return this.apiCall('get_essence_msg_list', params, timeout);
    }
    checkUrlSafely(params = { url: undefined }, timeout = undefined) {
        return this.apiCall('check_url_safely', params, timeout);
    }
}
exports.CqApi = CqApi;
;
//# sourceMappingURL=cq_api.js.map