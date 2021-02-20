# kp-email
# 世纪鲲鹏企业微信登录，邮件模板设置，邮件管理系统

## 经和hr沟通需求后，修改需求为保存定制邮件到草稿箱中，可编辑

### 关于测试
由于企业微信权限原因，暂时只能给研发中心前端开发组发邮件，通过测试后，可联系guanguan开启全公司权限

### demo运行方法
- 本地需要有node环境 没有需要下载 [点击下载]('https://nodejs.org/zh-cn/download/')
- git clone https://github.com/18640905576/kp-email.git
- 切换到master分支
- cd fe
- npm run serve（首次需要npm install）

- cd bg
- node app（首次需要npm install）

- 修改本地hosts文件（[教程 windows修改hosts 文件](https://www.jianshu.com/p/f618c58e01ad)
）
在文件底部增加 127.0.0.1    carry666.com

访问：carry666.com:8080 并企业微信扫码，即可开始使用

### 测试邮箱设置
当前使用的是carryzhang@21kunpeng.com, 修改到其他邮箱需要开启邮箱验证码权限并联系carry修改代码配置
【腾讯企业邮箱获取授权码修改教程】(https://www.yiyisoft.com/news/402.html)
