// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const TIME = new Date()
  let time = {
    timeStamp: Date.parse(TIME),
    day: TIME.getDay(),//星期几
    month: TIME.getMonth() + 1,//几月
    date: TIME.getDate(),//几号
    year: TIME.getFullYear(),//年份
    hour: TIME.getHours(), //小时
    minute: TIME.getMinutes(), //分钟
    second: TIME.getSeconds() //秒
  }
  return {
    time
  }
}