// 云函数入口文件
const cloud = require('wx-server-sdk')
const querystring = require('querystring')
const axios = require('axios')
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  //登录请求
   let datay = {
    username: event.username,
    password: event.password,
    url: '',
    returnType: '',
    returnUrl: '',
    area: '',
    ranstring: event.ranstring
   }
   let data = querystring.stringify(datay)
   let headers = {
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Accept-Encoding': 'gzip, deflate',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
    'Connection': 'keep-alive',
    'Content-Length': data.length,
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Cookie': event.cookie,
    'Origin': 'http://jwc.swjtu.edu.cn',
    'Referer': 'http://jwc.swjtu.edu.cn/service/login.html',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36 Edg/89.0.774.54',
    'X-Requested-With': 'XMLHttpRequest'
   }
  var res = await axios({
    method: 'post',
    url: 'http://jwc.swjtu.edu.cn/vatuu/UserLoginAction',
    data: data,
    headers: headers
  })
   .then (res => {
    //  console.log(res);
    //  console.log(res.data.loginMsg);
    //  let cookie = res.headers['set-cookie']
     let msg = res.data.loginMsg
     return {msg}
   })
   .catch (err => {
     console.log(err);
   })

   console.log(res.msg)
  //定义返回的对象
   let obj = {
     judge: Boolean,
     msg:''
   }
   if ( new RegExp("登录成功").test( res.msg ) ){
     obj.judge = true
     obj.msg = '登录成功'
     //访问跳转中界面
     let datay1 = {
      url: '',
      returnUrl: '',
      returnType: '',
      loginMsg: res.msg
      }
      let data1 = querystring.stringify(datay1)
      let headers1 = {
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
        'Connection': 'keep-alive',
        'Content-Length': data1.length,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Cookie': event.cookie,
        'Origin': 'http://jwc.swjtu.edu.cn',
        'Referer': 'http://jwc.swjtu.edu.cn/service/login.html',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36 Edg/89.0.774.54',
        'X-Requested-With': 'XMLHttpRequest'
       }
       await axios({
        method: 'post',
        url: 'http://jwc.swjtu.edu.cn/vatuu/UserLoadingAction',
        data: data1,
        headers: headers1
      })
       .then (res => {
        //  console.log(res);
       })
       .catch (err => {
         console.log(err);
       })
   } else if ( new RegExp("登录失败，密码输入不正确").test( res.msg ) ){
    obj.judge = false
    obj.msg = '密码不正确'
   } else if ( new RegExp("登录错误，用户不存在").test( res.msg ) ){
    obj.judge = false
    obj.msg = '登录错误，用户不存在。如果您是新生请先完成账号注册，如果您是教师，请联系学院教务员老师添加账号'
   } else if ( new RegExp("验证码输入不正确").test( res.msg )) {
    obj.judge = false
    obj.msg = '验证码输入不正确'
   } else {
    obj.msg = '???未知错误???'
   }
   
   console.log(obj);
   return obj
}