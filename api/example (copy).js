xport.run = ()=>{
  rep(req.headers['x-forwarded-for'] );
},
xport.info = {
    name: 'example',
    desc: 'example',
    username: 'example',
    __path: 'example2',
    method: ['get'],
    params: [],
    limits: [
        10,
        20
    ],
    //10/20s
};