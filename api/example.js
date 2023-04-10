xport.run = function() {




  fetch('https://api.g2-y05.repl.co/api/example2', {
proxy: '187.63.4.2:5678',
})
    .then(async function (res) {
      rep('IPY: '+(await res.text()) )
    })
    //rep(req.headers['x-forwarded-for'] );
},
xport.info = {
    name: 'example',
    desc: 'example',
    username: 'example',
    __path: 'example',
    method: ['get'],
    params: [],
    limits: [
        10,
        20
    ],
    //10/20s
};