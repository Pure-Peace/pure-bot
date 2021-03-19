class KoishiSession {
    constructor () {
        this.queued = {
            messages: [],
            lastSent: new Date()
        };
    }

    get userId () {
        return 'onebot:' + this.pureCtx.user_id;
    }

    get content () {
        return this.escapeSpecialChars(this.pureCtx.raw_message);
    }

    get messageId () {
        return this.pureCtx.message_id;
    }

    get nickname () {
        return this.pureCtx.sender_name;
    }

    get author () {
        return {
            userId: this.userId,
            nickname: this.nickname
        };
    }

    get parsed () {
        return {
            content: this.content
        };
    }

    send (message) {
        return this.pureCtx.client.send(message);
    }

    sendQueued (message, delay = this.options?.delay || 1000) {
        const data = {
            suppress: false
            // scheduledTime: new Date(new Date().getTime() + delay)
        };
        const resolver = new Promise((resolve, reject) => () => process.nextTick(() => {
            if (suppress) return;
            resolve(this.send(message));
        }))
            .then((res) => {
                this.#removeQueuedMessage(data);
                return res;
            });
        data.resolver = resolver;
        this.queued.messages.push(data);
        return data;
    }

    cancelQueued (queuedMessage) {
        if (!this.queued.has(queuedMessage)) throw new Error('message not exists');
        queuedMessage.suppress = true;
        this.queued.remove();
    }

    #removeQueuedMessage (queuedMessage) {
        const spliceIndex = this.queued.messages.indexOf(queuedMessage);
        if (!spliceIndex) throw new Error('message\'s missing');
        this.queued.messages.splice(spliceIndex, 1);
    }

    middleware (cb) {
        let run = true;
        // eslint-disable-next-line node/no-callback-literal
        process.nextTick(() => run && cb(this, (middleware) => { this.middleware(middleware) }));
        return () => { run = false };
    }

    // todo filled
    get logger () {
        return console;
    }

    // todo
    get bot () {}
    get user () {}
    get channel () {}
    get database () {}
}

module.exports = (pureCtx) => new KoishiSession(pureCtx);
