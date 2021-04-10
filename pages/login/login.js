import { cloudRequest } from "../../cloudRequest/cloudRequest.js"
//数据库
const db =  wx.cloud.database()
const _ = db.command

Page({

  /**
   * 页面的初始数据
   */
  data: {
    openId:null,
    username:'',
    password:'',
    ranstring: '',
    isStudent:null,
  },
  // 刷新验证码
resetyz: function(){
  let that = this
  cloudRequest({name: 'yzget',data:{cookie:that.data.cookie}}).then( res => {
    // console.log(res)
    that.setData({
      imgurl : res.result.imgurl
    })
  })
},

//获取openID
openIdGet:function (params) {
  wx.cloud.callFunction({ name: 'openidGet', data:{ }, 
  success: (res)=>{
  // console.log(res);
  this.setData({
    openId:res.result.openid
  })
  // console.log(this.data.openId);
  },
    fail: (err)=>{
  
    },
    complete: ()=>{
    
    }
  })
},

  // 输入框双向绑定
  content1:function(e){
    let name = e.detail.value ? e.detail.value : null ;
    let that = this;
    that.setData({
      username: name,
    })
    if (name.length<10) {
      that.setData({
        isStudent:false
      })
    }else{
      that.setData({
        isStudent:true
      }) 
    }
  },
  content2:function(e){
    let name = e.detail.value ? e.detail.value : null ;
    let that = this;
    that.setData({
      password: name,
    })
  },
  content3:function(e){
    let name = e.detail.value ? e.detail.value : null ;
    let that = this;
    that.setData({
      ranstring: name,
    })

  },
 //延时函数
//  sleep:function sleep(numberMillis) {
//   var now = new Date();
//   var exitTime = now.getTime() + numberMillis;
//   while (true) {
//     now = new Date();
//     if (now.getTime() > exitTime)
//     return;
//   }
// },
  //登录
  login:function(){
    let that = this
    let form = that.data
    cloudRequest({name: 'login', data:{username:form.username , password:form.password , ranstring:form.ranstring , cookie:form.cookie}})
    .then( res => { 
      if (res.result.judge) {
        let content=res.result.msg
        // that.sleep(1000)
        wx.showModal({
          title: '提示',
          content: content,
          showCancel:false,
          success (res) {
            // if (res.confirm) {}
            that.courseGet()
              // wx.reLaunch({
              //   url: '/pages/denglu/denglu'
              // })
          }
        })

      }
      else {
        let content=res.result.msg
        wx.showModal({
          title: '提示',
          content: content,
          showCancel:false,
          success (res) {
            that.resetyz()
          }
        })
      } 
      
     }).catch (err => {

      //  console.log(err)
     })
  },



// 获取课程表
  courseGet:function(){
    let that = this
    that.openIdGet()
    wx.cloud.callFunction({
      name: 'courseGet',
      data:{cookie:that.data.cookie ,isStudent: that.data.isStudent },
      success: (res)=>{
        console.log(res);
        db.collection('user')
        .doc(that.data.openId)
        .set({
          data:res.result,
          success: function (e) {
              wx.reLaunch({
                url: '/pages/denglu/denglu'
              })
          }
        })
      },
      fail: (err)=>{},
      complete: ()=>{

      }
    }) },
    /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    wx.cloud.callFunction({
      name: 'yzget',
      success: (res)=>{
        that.setData({
          cookie : res.result.cookie,
          imgurl : res.result.imgurl
        })}
      })
  },
  onShow: function (options) {
    if (wx.canIUse('hideHomeButton')) {
      wx.hideHomeButton()
    }
  }
})