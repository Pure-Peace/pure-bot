import { Context } from 'types';
import { segment } from 'koishi';
export const transformSegment = (message: Context.MessageSegment) => {
    const messages = [];
    if (message.quote) messages.push(segment('quote', message.quote));
    if (message.notify) messages.push(segment('at'), message.notify);
    if (message.raw) messages.push(message.raw);
    if (message.text) messages.push(message.text.toString());
    const { file, image, audio } = message;
    Object.entries({ file, image, audio }).forEach(([k, v]) => {
        if (v) messages.push(segment(k, { url: v[k]?.url, file: v[k]?.path, type: v[k]?.type }));
    });
    // if (message.file) messages.push(segment('file', { url: message.file?.url, file: message.file?.path }));
    // if (message.image) messages.push(segment('image', { url: message.image?.url, file: message.image?.path }));
    return messages.join('');
};
export const transformKoishiSegment = (message) => {
    const m: Context.MessageSegment = {};
    if (message.type === 'quote') m.quote = message.data;
    if (message.type === 'at') m.notify = message.data;
    if (message.type === 'text') m.text = message.data.content;
    // if (message.type === 'file') m.file = { url: message.data.url, path: message.data.file };
    // if (message.type === 'image') m.image = { url: message.data.url, path: message.data.file };
    ['file', 'image', 'audio'].forEach(k => {
        if (message.type === k) m[k] = { url: message.data.url, path: message.data.file };
    });
    return m;
};

export const stringMessage = (message) => {
    if (typeof message === 'string') return message;
    if (Array.isArray(message)) return message.map(stringMessage).join('');
    else if (typeof message === 'object') return transformSegment(message);
};
