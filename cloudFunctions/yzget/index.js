// 云函数入口文件
const cloud = require('wx-server-sdk')
const axios = require('axios')
cloud.init()


// 云函数入口函数
exports.main = async (event, context) => {

  var url = 'http://jwc.swjtu.edu.cn/vatuu/GetRandomNumberToJPEG?test='+ new Date().getTime();

  let res
  //根据是否有cookie传入判断是给出验证码还是刷新验证码
  if ( event.cookie ) {
    res = await axios({
      method: 'get',
      url: url,
      responseType: 'arraybuffer',
      headers: {
        'Cookie': event.cookie
      }
    }).then( res => {
      // console.log(res)
      let imgurl = 'data:image/png;base64,' + res.data.toString('base64')
      // console.log(imgurl)
      return {imgurl}
    })
  } else {
    res = await axios({
      method: 'get',
      url: url,
      responseType: 'arraybuffer',
      // headers: headers
    }).then( res => {
      // console.log(res)
      let imgurl = 'data:image/png;base64,' + res.data.toString('base64')
      let cookie = res.headers['set-cookie']
      // console.log(imgurl)
      return {imgurl,cookie}
    })
  }

  return res
}