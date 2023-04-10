let isFB = url=>/^http(|s):\/\/([^]*)(facebook|fb)\.(com|watch)\//.test(url);
xport.run = async function() {
    let type = req.params.type;

    let url = req.url.slice(req.url.indexOf('url=')+4);
    if (!url || !isURL(url))return rep(`Chưa Nhập Liên Kết Bài Đăng.`, 400);
    if (!isFB(url))return rep(`Liên Kết Chưa Xác Định.`); if (/story\.php/.test(url))url = url.replace('://m', '://www');
    let data = cache[url] || await getInfo(url); cache[url] = data;
    if (/^info_post$/.test(type)) {
        let clude = (req.query.clude || '').split(',').map($=>$.split(/\[|\]|\./));
        let out = allValueByKey(data, clude);

        clude.forEach((key, i, o, d = out[key[0]])=>d.length == 0?out[key[0]] = null: out[key[0]] = eval(`(()=>(d${(key[1]?key.splice(1): [0]).filter($=>$ != '').map($=>`?.['${$}']`).join('')} || null))();`))

        return rep(clude == 0?data: out);
    };
    if (/^info-post$/.test(type)) {
        let repData = {
            message: '',
            attachment: [],
        };
        let _ = allValueByKey(data, [['attachment'], ['attachments'], ['message'], ['unified_stories'], ['video'], ['five_photos_subattachments']]);
        let msg = (i, m = _.message)=>m?.[i]?.story?.message?.text || m?.[i]?.text;
        repData.message = msg(2) || msg(0) || null;

        if (/(\/reel\/|watch)/.test(url)) {
            if (_.attachments.length > 0 && typeof _.attachments[0][0].media == 'object')repData.attachment.push(_.attachments[0][0].media); else if (_.video.length > 0)repData.attachment.push((_.video[0].__typename = 'Video', _.video[0]));
        };
        if (/\/stories\//.test(url)) {
            for (let i of _.unified_stories)for (let e of i.edges) {
                let media_story = e?.node?.attachments?.[0]?.media;

                if (!!media_story)repData.attachment.push(media_story);
            };
        };
        if (/\/((posts|permalink|videos)\/|story\.php)/.test(url)) {
            let a = _.attachment;
            let fpsa = _.five_photos_subattachments[0]?.nodes;
            let b = a?.[0]?.all_subattachments?.nodes || (fpsa?.[0]?fpsa: fpsa) || (a?.[0]?[a[0]]: []);
            repData.attachment.push(...b.map($=> {
                let vd = $?.media?.video_grid_renderer;

                if (!!vd)delete $.media.video_grid_renderer;

                return {
                    ...$.media,
                    ...(vd?.video || {}),
                };
            }));
            if (_.attachments.length > 0)repData.attachment.push(_.attachments[0][0].media);
        };
        repData.attachment = repData.attachment.filter($=>!!$).map($=>newObjByKey($, ['__typename', 'id', 'preferred_thumbnail', 'playable_url', 'playable_url_quality_hd', 'image', 'photo_image', 'owner']));
        rep(repData);
    };
};
xport.info = ({
    name: 'Facebook',
    desc: 'công cụ fb',
    username: '@nam',
    __path: 'fb/:type',
    method: ['get'],
    params: [],
    limits: [10, 20],
    //10/20s
});

function getInfo(url) {
    return fetch(url, {
        headers: {
            "accept": "text/html, application/xhtml+xml, application/xml;q=0.9, */*;q=0.8",
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-User': '?1',
            "encoding": "gzip",
            "cookie": "datr=Q7aIY_4VvYa_KTqrfpqBlLkw; sb=Q7aIY7MveB44l6Xh28UiIBD5; c_user=100087849783043; xs=41%3AOwTiF8JPYqypwA%3A2%3A1675589931%3A-1%3A3747; m_page_voice=100087849783043; fbl_ci=556648182932943; vpd=v1%3B668x360x2; locale=en_GB; fbl_st=101437830%3BT%3A28013240; fbl_cs=AhDsHD80iKx0%2F12sHKB7TLhdGG5ZPVpiRi83ZEJoTkNUMXlITXluS0xRVw; m_pixel_ratio=2; dpr=2; wd=980x1818; presence=C%7B%22t3%22%3A%5B%5D%2C%22utc3%22%3A1681141504787%2C%22v%22%3A1%7D; fr=0iR7tjNGruYnSXq0w.AWXiUCsmoJSBYKGtVSQbFQxyfAU.BjiLZD.Aq.AAA.0.0.BkNDCC.AWXkLMd5d08; useragent=TW96aWxsYS81LjAgKExpbnV4OyBBbmRyb2lkIDExOyBSTVgzMjMxKSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvMTA3LjAuMC4wIE1vYmlsZSBTYWZhcmkvNTM3LjM2; _uafec=Mozilla%2F5.0%20(Linux%3B%20Android%2011%3B%20RMX3231)%20AppleWebKit%2F537.36%20(KHTML%2C%20like%20Gecko)%20Chrome%2F107.0.0.0%20Mobile%20Safari%2F537.36;",
            "user-agent": "Mike ozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36",
        },
    }).then(res=>res.text()).then(text=>text.split(/data\-sjs>|<\/script>/).filter($=>/^\{"require":/.test($)).map($=>JSON.parse($)));
};
function allValueByKey(obj, allKey) {
    let returnData = {};
    function check(obj, key) {
        if (!returnData[key])returnData[key] = [];
        for (let $ of Object.entries(obj)) {
            if ($[0] == key && !returnData[key].some($1=>JSON.stringify($1) == JSON.stringify($[1])))returnData[key].push($[1]);
            if (!!$[1] && typeof $[1] == 'object')check($[1], key);
        };
    };
    allKey.forEach($=>check(obj, $[0]));

    return returnData;
};
function newObjByKey(obj, key) {
    let data = {};

    for (let $ of key)if (!!obj[$])data[$] = obj[$];

    return data;
};