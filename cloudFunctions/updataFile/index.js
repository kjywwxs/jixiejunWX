// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
//数据库
const db = cloud.database()
const _ = db.command


// 云函数入口函数
exports.main = async (event, context) => {

  return await  db.collection('courseFile').doc('B1106').update({
    data:{
       file: _.push(event.fileID),

     }
   })
}