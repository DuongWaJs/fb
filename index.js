global. cwd = process.cwd();
global. pkg = {}; for (let $ of Object.keys(require(cwd+'/package.json').dependencies))pkg[$] = require($);
global. log = console.log;
global.cache = {};
let app = pkg.express();
let isURL = url=>/^http(|s):\/\//.test(url);

app.set('json spaces', 4);
app.use('/api', loadAPI());
app.listen(2739, err=>!!err?log(err): log(`Đã Mở Máy Chủ.`)); 


function loadAPI(router = pkg.express.Router()) {
    for (let file of pkg.fs.readdirSync(cwd+'/api'))try {
        let xport = {}; eval(pkg.fs.readFileSync(`${cwd}/api/${file}`, 'utf8'));

        for (let method of xport.info.method)router[method](`/${xport.info.__path}`, async function(req, res, next) {
            let xport = {}; eval(pkg.fs.readFileSync(`${cwd}/api/${file}`, 'utf8'));
            let rep = (data, status = 200)=>res.status(status).send(data);
            let rep4xx = ()=>rep(`Người Dùng Nhập Thiếu Dữ Liệu!`, 400);
            let rep5xx = ()=>rep(`Đã Xảy Ra Lỗi Phía Máy Chủ!`, 500);

            try {
                await xport.run();
            }catch(e) {
                log(`API Eror: ${file}`);
                log(e);
                rep5xx();
            };
        });
    } catch (e) {
        log(e); continue;
    };

    return router;
};