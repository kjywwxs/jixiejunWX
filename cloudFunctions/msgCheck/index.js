// // 云函数入口文件
// const cloud = require('wx-server-sdk')
// const got = require('got')

// let appid = 'wxb52bd3f9641f1839'
// let secret = '973858ad04bd89f30ef8746d89ea430b'

// let msgCheckUrl = 'https://api.weixin.qq.com/wxa/msg_sec_check?access_token='
// let tokenUrl = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='+appid+'&secret='+secret

// cloud.init()

// // 云函数入口函数
// exports.main = async (event, context) => {
//   let tokenResponse = await got(tokenUrl)
//   let token = JSON.parse(tokenResponse.body).access_token
//   // console.log(token);

//   // let checkResponse = await got.post(msgCheckUrl + token,{content: event.text})
//   let checkResponse = await got.post(msgCheckUrl + token,{
//     body: JSON.stringify({
//       content: event.text
//     })
//   })

//   // console.log(checkResponse.body);
//   return JSON.parse(checkResponse.body)
// }


// const cloud = require('wx-server-sdk')
// cloud.init()
// exports.main = async (event, context) => {
//   try {
//     const result = await cloud.openapi.security.msgSecCheck({
//       content: event.text
//     })
//     // result 结构
//     // { errCode: 0, errMsg: 'openapi.templateMessage.send:ok' }
//     return result
//   } catch (err) {
//     // 错误处理
//     // err.errCode !== 0
//     // throw err
//     return err
//   }
// }


// 云函数入口文件
const cloud = require('wx-server-sdk')
const axios = require('axios')

let msgCheckUrl = 'https://api.weixin.qq.com/wxa/servicemarket?access_token='

cloud.init()

//数据库
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {

  let token = await db.collection('key').where({
    type: "accesstoken"
  }).get()
  // console.log(token);
   
  let checkResponse = await axios({
    method: 'post',
    url: msgCheckUrl + token.data[0].accesstoken,
    data: {
        "service": "wxee446d7507c68b11",
        "api": "msgSecCheck",
        "client_msg_id" : "id197411",
        "data": {
          "Action": "TextApproval",
          "Text": event.text
        }
    },
  })
  // console.log(checkResponse);
  return await JSON.parse(checkResponse.data.data)

}