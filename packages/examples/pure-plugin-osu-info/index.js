const { Cluster } = require('puppeteer-cluster');
// const { unescapeSpecialChars, wait } = require('./utils');

const defaultOptions = {
    base: 'https://info.osustuff.ri.mk/cn'
};

module.exports = {
    name: 'pure-plugin-osu-info',
    async instance (options) {
        const cluster = await Cluster.launch({
            concurrency: Cluster.CONCURRENCY_CONTEXT,
            maxConcurrency: 2,
            args: ['--no-sandbox', '--disable-setuid-sandbox']

        });

        cluster.task(async ({ page, data: { url, ctx } }) => {
            console.log(url);
            await page.setViewport(VIEWPORT);
            await page.goto(url, {
                waitUntil: 'networkidle0'
            });
            // await wait(1000);
            const screen = await page.screenshot({
                type: 'png',
                encoding: 'base64',
                fullPage: true
            });
            // Store screenshot, do something else
            // const cqcode = `[CQ:image,file=base64://${screen}]`;
            meta.quote({
                image: {
                    file: `base64://${screen}`
                }
            }).catch(err => console.warn(err));
        });
        cluster.on('taskerror', (err, data, willRetry) => {
            if (willRetry) {
                console.warn(`Encountered an error while crawling ${data}. ${err.message}\nThis job will be retried`);
            } else {
                console.error(`Failed to crawl ${data}: ${err.message}`);
            }
        });

        return {
            options: {
                ...defaultOptions,
                ...options
            },
            cluster
        };
    },
    create () {
        // return array of middlewares should be acceptable
        return [
            (ctx, next) => {
                if (!ctx.message) return next(); // not a message event

                if (!ctx.message.text?.startsWith('!!pr') && !ctx.message.text?.startsWith('!!recent')) return next();
                let mode;
                const command = ctx.message.text.split(' ');
                const username = ctx.database?.user?.osu?.id || unescapeSpecialChars(command.slice(1).join(' ').trim());
                if (!username) return meta.reply('???????????????????????? !!pr(@??????:[osu, taiko, fruits, mania]) osuid\nex: !!pr arily, !!pr@mania arily');

                if (!command[0].includes('@')) mode = undefined;
                mode = command[0].split('@')[1];
                if (!['osu', 'taiko', 'fruits', 'mania', undefined].includes(mode)) return meta.reply(`????????? osu, taiko, fruits, mania. ${mode}???????????????`);

                await this.cluster.execute({
                    url: `${this.options.base}/recent/${username}/${mode || ''}`,
                    ctx
                });
            },
            (ctx, next) => {
                if (!ctx.message) return next(); // not a message event

                if (!ctx.message.text?.startsWith('!!bind')) return next();

                const command = ctx.message.text.split(' ');
                const username = ctx.database?.user?.osu?.id || unescapeSpecialChars(command.slice(1).join(' ').trim());

                ctx.database.user?.bindOsuUser(username)
                    .then(() => {
                        ctx.quote({
                            at: ctx.message.sender.id,
                            text: `??????${ctx.database?.user?.osu?.username ?? ctx.database?.user?.osu?.id ?? 'unknown'}??????????????????????????????`
                        });
                    })
                    .catch((error) => {
                        ctx.quote([
                            {
                                at: ctx.message.sender.id,
                                text: '???????????????????????????????????????????????????????????????????????????'
                            },
                            {
                                raw: error.stack()
                            }
                        ]);
                    });
            }
        ];
    },
    database: {
        fields: {
            user: {
                set (user, newVal) {
                    throw new Error('set osu user use method');
                }
            }
        },
        methods: {
            user: {
                async bindOsuUser (doc, osuid) {
                    const apiUser = await axios.get(`osu-api/users/${osuid}`).then(res => res.data);
                    if (!apiUser.id) throw new Error('user not exists');
                    doc.osu = apiUser;
                    return apiUser;
                }
            }
        },
        extend: {
            user: {
                osu: {
                    type: Object,
                    default: () => ({ id: -1 })
                }
            }
        }
    }
};
