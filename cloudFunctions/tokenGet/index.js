// 云函数入口文件
const cloud = require('wx-server-sdk')
const axios = require('axios')
let appid = 'wxb52bd3f9641f1839'
let secret = '973858ad04bd89f30ef8746d89ea430b'
let tokenUrl = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='+appid+'&secret='+secret

cloud.init()

//数据库
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  //获取token 两小时获取一次
  let tokenResponse = await axios(tokenUrl)
  //将token存入数据库
  if (tokenResponse.data.hasOwnProperty('access_token')) {
    // console.log(tokenResponse.data.access_token);
    return await db.collection('key').where({
      type: "accesstoken"
    }).update({
      data: {
        accesstoken: tokenResponse.data.access_token,
        datearray: _.unshift(new Date(new Date().getTime())),
        num: _.inc(1)
      }
    })
    
  }
}