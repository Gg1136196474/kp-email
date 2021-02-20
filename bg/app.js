const Koa = require('koa');
const cors = require('koa2-cors');
const app = new Koa();
var _ = require('koa-route');
// const bodyParser = require('koa-bodyparser');
// const xlsx = require('xlsx');
const koaBody = require('koa-body');
const {getAccessToken, getUserMsg, getGroup} = require('./service/sendserver.js');
const nodemailer = require('nodemailer');
// const FileReader = require('filereader')
const Imap = require('imap');
const mimemessage = require('mimemessage');
app.use(cors()); // 开启跨域
// app.use(bodyParser()); // 获取请求参数
app.use(koaBody({ // 设置上传文件相关
    multipart: true,// 支持文件上传
    formidable: {
        maxFileSize: 200 * 1024 * 1024 // 设置上传文件大小最大限制，默认2M
    }
}));
let usesMsg = [] // 当前所有用户的生日信息
let agesMsg = [] // 当前所有用户的司龄信息
let accessToken = ''
// 获取 access_token
const getToken = async (ctx, next) => {
    await getAccessToken().then(data => {
        accessToken = data.access_token
    }).catch(e => {
        console.log(e)
    })
    await next()
}
app.use(getToken);

// 发送生日邮件
const sendMail = async (user, isBirth) => {
    let cc = '';
    let str = '';
    let title = '';
    if (isBirth === 'true') { // isBirth true 代表是生日邮件
        // 确定模板内容
        str = templateList[0].htmlStr.replace('收件人名称', user['英文名'])
        // 设置抄送人
        cc = await setCcRecipient(user, isBirth)
        title = `祝${user['英文名']}生日快乐`
    } else {
        // 确定模板内容
        const age = user['司龄']
        str = templateList[age].htmlStr.replace('收件人名称', user['英文名'])
        // 设置抄送人
        cc = await setCcRecipient(user)
        title = '感恩有你'
    }
    // 设置收件人
    const to = setRecipient(user)
    
    // 设置参数
    let options = {
        from: '我是可以被自定义的测试邮箱',
        to, // 收件人
        cc,  //抄送
        subject: title,
        html: str,
    };
    console.log(888, options)
    // 设置草稿 
    setDrafts(options)
    // 发送
    // mailTransport.sendMail(options, function(err, msg){
    //     if(err){
    //         console.log('发送错误', err);
    //     }
    //     else {
    //         console.log('发送成功', msg);
    //     }
    // });
}

const setRecipient = (user) => {
    return user['英文名']+'@21kunpeng.com'
}
// 设置抄送人员
const setCcRecipient = async (user, isBirth) => {
    let ccList = []
    /**
     * 生日 默认抄送本组（最小）
     * 司龄 默认抄送 suri eileen crush
     */
    // 获取本组成员
    if (isBirth) {
        const departmentId = user.department && user.department[0]
        const {errcode, userlist} = await getGroup(departmentId, accessToken)
        console.log(999, userlist)
        if (errcode === 0) {
            ccList = userlist.map(u => u.email)
        }
    } else {
        ccList = ['suri', 'eileen', 'crush'].map(u => u+'@21kunpeng.com')
    }
    return ccList
}

// 发送邮件到草稿箱
const sendTestMail = (ctx) => {
    // 判断是否上传了用户信息
    if (ctx.query.isBirth === 'true') {
        if (!usesMsg || usesMsg.length === 0) {
            ctx.body = {
                errCode: 1,
                errmsg: '请先上传员工生日信息'
            }
            return
        }
        ctx.body = {
            errCode: 0,
            data: usesMsg[0]
        }
        // 循环用户列表并设置草稿邮件
        usesMsg.forEach(user => {
            sendMail(user, ctx.query.isBirth)
        })
        return
    }
    if (ctx.query.isBirth !== 'true') {
        if ((!agesMsg || agesMsg.length === 0)) {
            ctx.body = {
                errCode: 1,
                errmsg: '请先上传员工司龄信息'
            }
            return
        }
        ctx.body = {
            errCode: 0,
            data: agesMsg[0]
        }
        // 循环用户列表并设置草稿邮件
        agesMsg.forEach(user => {
            sendMail(user)
        })
    }
}
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
// 获取生日excel
const uploadBirthDayExcel = async (ctx) => {
    console.log(33)
    // 获取excel详情
    const objs = await uploadExcel(ctx)
    if (objs) {
        ctx.body = {
            status: true,
            msg: '上传数据成功',
            list: objs
        };
        // 根据生日userId获取详细信息
        setUserMsg(objs)
    } else {
        ctx.body = {
        status: true,
        msg: '上传数据失败',
        list: null
        };
    }
}

// 获取司龄excel
const uploadAgeExcel = async (ctx) => {
    // 获取excel详情
    const objs = await uploadExcel(ctx)
    if (objs) {
        ctx.body = {
            status: true,
            msg: '上传数据成功',
            list: objs
        };
        // 司龄信息直接存储
        agesMsg = objs
    } else {
        ctx.body = {
            status: true,
            msg: '上传数据失败',
            list: null
        };
    }
}

// 解析excel 获取员工信息
const uploadExcel = async (ctx) => {
    try{
        const getRes = await uploadExcelSrv.getExcelObjs(ctx);
        const objs = getRes.datas[0];
        
        if (getRes.status) {
        return objs
            // if (getRes.datas.length > 1) {
            //     // errorResult.errorRes(ctx, '暂时不支持多个sheet存在');
            // } else { //得到的是数组
            //     // 完善员工信息
            //     // setUserMsg(objs)
            // }
        } else {
        //   errorResult.errorRes(ctx, getRes.msg);
        }
    }catch(e){
        console.log(e)
        return
    }
};

// 上传图片
// const uploadImg = async function (ctx, next) {
//     ctx.body='上传成功'
// };

app.use(_.get('/getTemplateList', getTemplateList))
app.use(_.post('/uploadBirthDayExcel', uploadBirthDayExcel))
app.use(_.post('/uploadAgeExcel', uploadAgeExcel))
app.use(_.post('/saveTemplate', saveTemplate))
// app.use(_.post('/uploadImg', uploadImg))
app.use(_.get('/send', sendTestMail))
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
// imap设置邮箱
const imap = new Imap({
    user: 'carryzhang@21kunpeng.com',
    password: 'n5zbdadqjLxm6Sjj',
    host: 'hwimap.exmail.qq.com',
    port: 993,
    tls: true,
    // authTimeout:300000,
    tlsOptions: { rejectUnauthorized: false }
});
const setDrafts = (options) => {
    // 打开草稿箱
    imap.openBox('Drafts', false, (err, box) => {
        if (err) throw err;
        let msg, plainEntity;

        // 设置草稿邮件格式
        msg = mimemessage.factory({
            contentType: 'multipart/alternate',
            body: []
        });
        plainEntity = mimemessage.factory({
            contentType: 'text/html;charset=utf-8',
            body: options.html
        });
        msg.header('Message-ID', '<1234qwerty>');
        msg.header('To', options.to);
        msg.header('Subject', options.subject);
        msg.header('Cc', options.cc);
        msg.body.push(plainEntity); 
        // 向草稿箱放入邮件内容
        imap.append(msg.toString())
    })
}
imap.once('error', (e) => {
    console.log(e)
})
imap.once('end', () => {
    console.log('end')
})
imap.connect();
// 设置默认邮件模板
let templateList = [
    {
        name: '生日祝福模板',
        id: -1,
        nameLeft: 25,
        nameTop: 15,
        imageUrl: '',
        htmlStr: ''
    },
    {
        name: '司龄1年模板',
        id: 1,
        nameLeft: 75,
        nameTop: 25,
        imageUrl: '',
        htmlStr: ''
    },
    {
        name: '司龄2年模板',
        id: 2,
        nameLeft: 75,
        nameTop: 25,
        imageUrl: '',
        htmlStr: ''
    },
    {
        name: '司龄3年模板',
        id: 3,
        nameLeft: 75,
        nameTop: 25,
        imageUrl: '',
        htmlStr: ''
    },
    {
        name: '司龄4年模板',
        id: 4,
        nameLeft: 75,
        nameTop: 25,
        imageUrl: '',
        htmlStr: ''
    },
    {
        name: '司龄5年模板',
        id: 5,
        nameLeft: 75,
        nameTop: 25,
        imageUrl: '',
        htmlStr: ''
    },
    {
        name: '司龄6年模板',
        id: 6,
        nameLeft: 75,
        nameTop: 25,
        imageUrl: '',
        htmlStr: ''
    },
    {
        name: '司龄7年模板',
        id: 7,
        nameLeft: 75,
        nameTop: 25,
        imageUrl: '',
        htmlStr: ''
    },
    {
        name: '司龄8年模板',
        id: 8,
        nameLeft: 75,
        nameTop: 25,
        imageUrl: '',
        htmlStr: ''
    },
    {
        name: '司龄9年模板',
        id: 9,
        nameLeft: 75,
        nameTop: 25,
        imageUrl: '',
        htmlStr: ''
    },
    {
        name: '司龄10年模板',
        id: 10,
        nameLeft: 75,
        nameTop: 25,
        imageUrl: '',
        htmlStr: ''
    },
    {
        name: '司龄11年模板',
        id: 11,
        nameLeft: 75,
        nameTop: 25,
        imageUrl: '',
        htmlStr: ''
    },
]
let service = require('./service/webAppService.js');
let uploadExcelSrv = require('./service/uploadExcelSrv.js');



imap.once('ready', () => {
    // imap连接成功
    console.log('connect success')
})

// 获取员工的详细信息并存储
const setUserMsg = (list = []) => {
    // 循环获取excel中员工信息
    list.forEach(user => {
        // todo userId为英文名 根据userId获取企业微信详细信息
        getUserMsg(user['英文名'], accessToken).then(data => {
            // 合并用户的excel信息和企业微信信息
            usesMsg.push(Object.assign(user, data))
        })
    })
}


app.listen(3000);
console.log('listening on port 3000');