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
    isStudent:Boolean,
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

  // 输入框双向绑定
  content1:function(e){
    let name = e.detail.value ? e.detail.value : null ;
    let that = this;
    that.setData({
      username: name,
    })
    if (name.length>9) {
      that.setData({
        isStudent:true
      })
    }else{
      that.setData({
        isStudent:false
      })
    }
    // console.log(that.data.isStudent);
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

  //登录
  login:function(){
    let that = this
    let form = that.data
    cloudRequest({name: 'login', data:{username:form.username , password:form.password , ranstring:form.ranstring , cookie:form.cookie}})
    .then( res => { 
      if (res.result.judge) {
        let content=res.result.msg
        wx.showModal({
          title: '提示',
          content: content,
          showCancel:false,
          success (res) {
            that.courseGet()
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
    wx.showLoading({
      title: '跳转中',
    })
    wx.cloud.callFunction({
      name: 'courseGet',
      data:{cookie:that.data.cookie ,isStudent: that.data.isStudent },
      success: (res)=>{
        //先删除缓存,再存入缓存
        try {
          wx.removeStorageSync('wxb52bd3f9641f1839kb')
          wx.removeStorageSync('wxb52bd3f9641f1839userInfo')
          wx.setStorageSync('wxb52bd3f9641f1839kb', res.result.kb)
          wx.setStorageSync('wxb52bd3f9641f1839userInfo', res.result.userInfo)
        } catch (e) { console.log(e); }
        // console.log(res);
        db.collection('user')
        .doc(that.data.openId)
        .set({
          data:res.result,
          success: function (e) {
              wx.reLaunch({
                url: '/pages/Mine/Mine?isStudent=' + that.data.isStudent+'&openId='+ that.data.openId,
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
    that.setData({
      openId:options.openId
    })
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