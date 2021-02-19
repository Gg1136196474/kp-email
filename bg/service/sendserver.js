const request = require('request');

// 获取 access_token
const corpid = 'ww2f0528c6536a7421'
const corpsecret = 'nrQmH4uzvuiZsUxkgJCYUNKD6t197l1t2xWZ8dwJOxM'
const getAccessToken = (address) => {
  return new Promise((resolve, reject) => {
    let url = `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${corpid}&corpsecret=${corpsecret}`
    let options = {
      method: 'GET',
      uri: url,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'  // 需指定这个参数 否则 在特定的环境下 会引起406错误
      }
    }
    request(options).on('data', function(data) {
        // 请求的返回
        resolve(JSON.parse(data))
    })
  })
}

// 获取员工信息
const getUserMsg = (userId, token) => {
  return new Promise((resolve, reject) => {
    let url = `https://qyapi.weixin.qq.com/cgi-bin/user/get?access_token=${token}&userid=${userId}`
    let options = {
      method: 'GET',
      uri: url,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'  // 需指定这个参数 否则 在特定的环境下 会引起406错误
      }
    }
    request(options).on('data', function(data) {
        // 请求的返回
        resolve(JSON.parse(data))
    })
  })
}

// 获取部门成员
const getGroup = (department_id, token) => {
  return new Promise((resolve, reject) => {
    let url = `https://qyapi.weixin.qq.com/cgi-bin/user/list?access_token=${token}&department_id=${department_id}&fetch_child=1`
    let options = {
      method: 'GET',
      uri: url,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'  // 需指定这个参数 否则 在特定的环境下 会引起406错误
      }
    }
    request(options).on('data', function(data) {
        // 请求的返回
        resolve(JSON.parse(data))
    })
  })
}



module.exports = {getAccessToken, getUserMsg, getGroup}
  