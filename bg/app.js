const Koa = require('koa');
const cors = require('koa2-cors');
const app = new Koa();
var _ = require('koa-route');
const bodyParser = require('koa-bodyparser');
const xlsx = require('xlsx');
const koaBody = require('koa-body');
const {getAccessToken, getUserMsg, getGroup} = require('./service/sendserver.js');
const nodemailer = require('nodemailer');
const FileReader = require('filereader')

// 设置邮箱
const mailTransport = nodemailer.createTransport({
    host : 'smtp.exmail.qq.com',
    port: 465,
    secureConnection: true, // 使用SSL方式（安全方式，防止被窃取信息）
    auth : {
        user : 'carryzhang@21kunpeng.com',
        pass : 'n5zbdadqjLxm6Sjj'
    },
});
// 设置默认邮件模板
let templateList = [
    {
        name: '生日祝福模板',
        id: -1,
        nameLeft: 50,
        nameTop: 25,
        ageLeft: 10,
        ageTop: 10,
        imageUrl: '',
        htmlStr: '<div>888</div>'
    },
    {
        name: '司龄1年模板',
        id: 1,
        nameLeft: 50,
        nameTop: 25,
        ageLeft: 10,
        ageTop: 10,
        imageUrl: '',
        htmlStr: '<div>888</div>'
    },
    {
        name: '司龄2年模板',
        id: 2,
        nameLeft: 50,
        nameTop: 25,
        ageLeft: 10,
        ageTop: 10,
        imageUrl: '',
        htmlStr: '<div>888</div>'
    },
    {
        name: '司龄3年模板',
        id: 3,
        nameLeft: 50,
        nameTop: 25,
        ageLeft: 10,
        ageTop: 10,
        imageUrl: '',
        htmlStr: '<div>888</div>'
    },
    {
        name: '司龄4年模板',
        id: 4,
        nameLeft: 50,
        nameTop: 25,
        ageLeft: 10,
        ageTop: 10,
        imageUrl: '',
        htmlStr: '<div>888</div>'
    },
    {
        name: '司龄5年模板',
        id: 5,
        nameLeft: 50,
        nameTop: 25,
        ageLeft: 10,
        ageTop: 10,
        imageUrl: '',
        htmlStr: '<div>888</div>'
    },
    {
        name: '司龄6年模板',
        id: 6,
        nameLeft: 50,
        nameTop: 25,
        ageLeft: 10,
        ageTop: 10,
        imageUrl: '',
        htmlStr: '<div>888</div>'
    },
    {
        name: '司龄7年模板',
        id: 7,
        nameLeft: 50,
        nameTop: 25,
        ageLeft: 10,
        ageTop: 10,
        imageUrl: '',
        htmlStr: '<div>888</div>'
    },
    {
        name: '司龄8年模板',
        id: 8,
        nameLeft: 50,
        nameTop: 25,
        ageLeft: 10,
        ageTop: 10,
        imageUrl: '',
        htmlStr: '<div>888</div>'
    },
    {
        name: '司龄9年模板',
        id: 9,
        nameLeft: 50,
        nameTop: 25,
        ageLeft: 10,
        ageTop: 10,
        imageUrl: '',
        htmlStr: '<div>888</div>'
    },
    {
        name: '司龄10年模板',
        id: 10,
        nameLeft: 50,
        nameTop: 25,
        ageLeft: 10,
        ageTop: 10,
        imageUrl: '',
        htmlStr: '<div>888</div>'
    },
    {
        name: '司龄11年模板',
        id: 11,
        nameLeft: 50,
        nameTop: 25,
        ageLeft: 10,
        ageTop: 10,
        imageUrl: '',
        htmlStr: '<div>888</div>'
    },
]

let service = require('./service/webAppService.js');
let uploadExcelSrv = require('./service/uploadExcelSrv.js');

app.use(koaBody({
multipart: true,
formidable: {
    maxFileSize: 200 * 1024 * 1024 // 设置上传文件大小最大限制，默认2M
}
}));

app.use(cors()); // 开启跨域
app.use(bodyParser()); // 获取请求参数

let usesMsg = [] // 当前所有用户的信息
let accessToken = ''
// 获取 access_token
const getToken = async function (ctx, next) {
    await getAccessToken().then(data => {
        accessToken = data.access_token
        next()
    }).catch(e => {
        next()
    })
}

app.use(getToken);
// 获取历史模板
const getTemplateList = ctx => {
    ctx.body = {
        status: true,
        list: templateList
    }
}

// 保存模板
const saveTemplate = ctx => {
    const reqBody = ctx.request.body
    // 修改模板
    templateList.forEach((t, index) => {
        if (t.id === reqBody.id) {
            templateList[index] = reqBody
        }
    })
    ctx.body = {
        status: true,
        str: '修改模板成功'
    }
}
console.log(888)
// 解析excel 获取员工信息
const uploadExcel = async function (ctx, next) {
    try{
        const getRes = await uploadExcelSrv.getExcelObjs(ctx);
        const objs = getRes.datas[0];
        ctx.body = {
            status: true,
            msg: '上传数据成功',
            list: objs
          };
          console.log(getRes, 77)
          if (getRes.status) {
            if (getRes.datas.length > 1) {
              // errorResult.errorRes(ctx, '暂时不支持多个sheet存在');
            } else { //得到的是数组
           
             
              // 完善员工信息
              // setUserMsg(objs)
            }
          } else {
          //   errorResult.errorRes(ctx, getRes.msg);
          }
    }catch(e){
        ctx.body = {
            status: true,
            msg: '上传数据失败',
            list: null
          };

    }

    
};

// 上传图片
const uploadImg = async function (ctx, next) {
    ctx.body='上传成功'
};

// 获取员工的详细信息并存储
const setUserMsg = (list = []) => {
    // 循环获取excel中员工信息
    list.forEach(user => {
        // userId为英文名 根据userId获取企业微信详细信息
        getUserMsg(user['英文名'], accessToken).then(data => {
            // 合并用户的excel信息和企业微信信息
            usesMsg.push(Object.assign(user, data))
        })
    })
}

// 发送生日邮件
const sendMail = (user, type) => {
    // 确定模板内容 todo
    const str = templateList[0].htmlStr
    // 设置收件人
    const to = setRecipient(user)
    // 设置抄送人
    const cc = setCcRecipient(user)
    // 设置参数
    let options = {
        from: '我是可以被自定义的测试邮箱',
        to,
        cc,  //抄送
        subject        : `祝${user['英文名']}生日快乐`,
        // html           : '<h1>你好，这是一封来自NodeMailer的邮件！</h1><p><img src="cid:00000001"/></p>',
        html           : str,
    };
    // 发送
    mailTransport.sendMail(options, function(err, msg){
        if(err){
            console.log('发送错误', err);
        }
        else {
            console.log('发送成功', msg);
        }
    });
}

const setRecipient = (user) => {
    return user.email
}
// 设置抄送人员
const setCcRecipient = (user) => {
    let ccList = []
    /**
     * 生日 默认抄送本组（最小）
     * 司龄 默认抄送 suri eileen crush
     */
    // 获取本组成员
    const departmentId = user.department && user.department[0]
    getGroup(departmentId, accessToken)
        .then(({errcode, userlist}) => {
            if (errcode === 0) {
                ccList = userlist.map(u => u.email)
            }
            return ccList
        })
        .catch(e => {
            console.log(e)
        })
}

// 测试发邮件功能
const sendTestMail = (ctx) => {
    ctx.body = usesMsg[0]
    // 循环发送
    usesMsg.forEach(user => {
        sendMail(user)
    })
}

app.use(_.get('/getTemplateList', getTemplateList))
app.use(_.post('/uploadExcel', uploadExcel))
app.use(_.post('/saveTemplate', saveTemplate))
app.use(_.post('/uploadImg', uploadImg))
app.use(_.get('/send', sendTestMail))

app.listen(3000);
console.log('listening on port 3000');