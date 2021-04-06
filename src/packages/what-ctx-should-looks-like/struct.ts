// @ts-nocheck

// const text = 'suitable message type!';
// const MessageEvent = {
//     platform: 'onebot',
//     message: {
//         id: '123456',
//         text,
//         raw: text,
//         segments: [{
//             text: text
//         }],
//         sender: {
//             name: 'ari',
//             id: {
//                 get platform () {
//                     return MessageEvent.platform;
//                 },
//                 userId: '1234567',
//                 toString () {
//                     return `${this.platform}@${this.userId}`;
//                 }
//             }
//         }
//     },
//     send (message: string | Message | [Message]) {
//         if (Array.isArray(message)) return message.map(m => this.send(m));
//         if (typeof message === 'string') return this.send({ text: message });
//         if (message.quote) console.log('quote to messageId', message.quote);
//         if (message.notify) console.log('notify', message.notify);
//         console.log('sending message:', message.text);
//         console.log('======');
//     },
//     quote (quote: string | Message | [Message]) {
//         if (Array.isArray(quote)) return quote.map(m => this.send(m));
//         if (typeof quote === 'string') return this.quote({ text: quote });
//         return this.send({
//             quote: this.message.id,
//             ...quote
//         });
//     }
// } as MessageContext;

// const PublicMessageEvent = Object.assign({
//     get publicMessage () {
//         return this.message;
//     }
// }, MessageEvent) as MessageContext;
// const GroupMessageEvent = Object.assign({
//     get groupMessage () {
//         return this.message;
//     }
// }, PublicMessageEvent) as MessageContext;
// const OnebotGroupMessageEvent = Object.assign({
//     get groupMessage () {
//         return this.message;
//     },
//     get onebot () {
//         return this;
//     }
// }, PublicMessageEvent) as MessageContext;

// console.log(GroupMessageEvent.message === GroupMessageEvent.onebot?.groupMessage);
// console.log(OnebotGroupMessageEvent.message === OnebotGroupMessageEvent.onebot?.groupMessage);
// console.log();
// GroupMessageEvent.quote('quote to message');
// GroupMessageEvent.send({
//     notify: GroupMessageEvent.message.sender.id.toString(),
//     text: 'notify sender'
// });
// GroupMessageEvent.send('a quick message');
