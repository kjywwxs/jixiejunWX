var util = require('../../utils/util.js');
import { cloudRequest } from "../../cloudRequest/cloudRequest.js"
//数据库
const db =  wx.cloud.database()
const _ = db.command

Page({
  
  /**
   * 页面的初始数据
   */
  data: {
    kb:[],
    hour: null,
    minutes: null,
    seconds:null,
    xkdm2:"",
    xkdm1:"",
    zhouji:null,
    userInfo:[]
  },
  //更新数据
  gxsj:function () {
    wx.showModal({
      title: '提示',
      content: "确定要重新登陆以获取最新的课程信息吗？",
      success (res) {
        if (res.confirm) {
          wx.navigateTo({
            url: '/pages/login/login?id=1'
          })
        } else if (res.cancel) {
        }
      }
    })
  },
  //签到
  qiandao:function (event) {
    // let xkbh = event.currentTarget.dataset.xkbh;
    // console.log(xkbh);
    wx.navigateTo({
      url: '/pages/demo0/demo0?id='+ event.currentTarget.dataset.xkbh,
    })
  },
   //获取实时课表
   getNowCoures:function () {
      let that = this
      wx.cloud.callFunction({
        name: 'nowcourseGet',
        success: (res)=>{
          that.setData({
            kb:res.result.kb
          })
          // console.log(res.result.kb);
          for (let i = 0; i < that.data.kb.length; i++) {
            that.kcpd(that.data.kb[i])
          }
      },
        fail: (err)=>{
         console.log(err)
        },
        complete: ()=>{
       }
      })
    },
    //星期几汉字化
   hanzixqj: function(shuzixqj) {
     let that = this
     if ( shuzixqj == 1 ) {
       that.setData({
       zhouji:"星期一" 
       })
     } else if ( shuzixqj == 2) {
        that.setData({
         zhouji:"星期二" 
       })
     } else if ( shuzixqj == 3 ) {
       that.setData({
       zhouji:"星期三" 
       })
     } else if ( shuzixqj == 4 ) {
       that.setData({
        zhouji:"星期四" 
       })
     } else if ( shuzixqj == 5 ) {
       that.setData({
       zhouji:"星期五" 
       })
     } else if ( shuzixqj == 6 ) {
       that.setData({
       zhouji:"星期六" 
       })
     } else  {
     that.setData({
       zhouji:"星期天" 
       })
       }
      //  console.log(that.data.zhouji);
     },
   //获取实时时间
   getNowTime:function () {
     let that = this
         setInterval(function () {
           const _currentTime = util.formatTime(new Date()).split(" ")[1];
           const _zhouji = _currentTime.split(":")[0];
           const _hour = _currentTime.split(":")[1];
           const _minutes = _currentTime.split(":")[2];
           const _seconds = _currentTime.split(":")[3];
           that.setData({
             hour: _hour,
             minutes: _minutes,
             seconds:_seconds
           });
           that.hanzixqj(_zhouji)
          //  console.log(that.data.hour);
         }, 1000)
   },
   //
   sleep:function sleep(numberMillis) {
    var now = new Date();
    var exitTime = now.getTime() + numberMillis;
    while (true) {
      now = new Date();
      if (now.getTime() > exitTime)
      return;
    }
},
   //判断课程开始时间，节数
   kcpd: function(zuixinkobj) {
     let that = this
     let time = {}
     setInterval(() => {
    if (zuixinkobj.qsjs == 1) {
      time.hour = 8,
      time.minute = 0,
      time.kcjs = zuixinkobj.mwjs - zuixinkobj.qsjs + 1
    } else if (zuixinkobj.qsjs == 3) {
      time.hour = 9,
      time.minute = 50,
      time.kcjs = zuixinkobj.mwjs - zuixinkobj.qsjs + 1
    } else if (zuixinkobj.qsjs == 6) {
      time.hour = 14,
      time.minute = 0,
      time.kcjs = zuixinkobj.mwjs - zuixinkobj.qsjs + 1
    } else if (zuixinkobj.qsjs == 8) {
      time.hour = 15,
      time.minute = 50,
      time.kcjs = zuixinkobj.mwjs - zuixinkobj.qsjs + 1
      // time.hour = 22
      // time.minute = 14
      // time.kcjs = 3
    } else if (zuixinkobj.qsjs == 11) {
      time.hour = 19,
      time.minute = 30,
      time.kcjs = zuixinkobj.mwjs - zuixinkobj.qsjs + 1
    } else {}
    // console.log(time.kcjs);
    if (that.data.zhouji == zuixinkobj.sjxqj) {
    let nowtime = that.data.hour*60 + that.data.minutes*1
    //  console.log(nowtime);
    let kctime = time.hour*60+time.minute*1
    // console.log(kctime);
        if (kctime-nowtime <=10 && kctime-nowtime > 0) {
        that.setData({
          xkdm1:zuixinkobj.xkbh,
          xkdm2:null
          })
          if (kctime-nowtime <=10 && kctime-nowtime > 0) {
            that.sleep(((kctime-nowtime)*60-that.data.seconds)*1000)
          }else{}
        } else if (nowtime - kctime>= 0 && nowtime-kctime<time.kcjs*50-5) {
          that.setData({
            xkdm1:null,
            xkdm2:zuixinkobj.xkbh
          })
          if (nowtime - kctime>= 0 && nowtime-kctime<time.kcjs*50-5) {
            that.sleep((((kctime+time.kcjs*50-5)-nowtime)*60-that.data.seconds)*1000)
          }
        } else{
          that.setData({
            xkdm1:'null',
            xkdm2:'null'
          })
        }
        }else{}
     }, 1000);
          // console.log(that.data.xkdm1);
        },
      /**
       * 生命周期函数--监听页面加载
       */
   onLoad: function (options) {
        let that = this
        // db.collection('user').where({
        //    _openid: that.data.openId}).get().then( res => {
        //   console.log(res.data)
        //  if (res.data.length==0) {
        //   wx.reLaunch({
        //     url: '/pages/login/login',
        //   })
        //  }
        //  })
        that.getNowTime()
        that.getNowCoures()
    //获取用户信息
      db.collection('user').get({
        complete:res=>{
         that.setData({
           userInfo:res.data[0].userInfo
         })
        }
      })
   },
   

})