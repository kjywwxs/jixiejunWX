import { cloudRequest } from "../../cloudRequest/cloudRequest.js"
var util = require('../../utils/util.js');
const db =  wx.cloud.database()
const _ = db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {
openId: null,
  },
openIdGet:function (params) {
  wx.cloud.callFunction({ name: 'openidGet', data:{ }, 
  success: (res)=>{
  console.log(res);
  this.setData({
    openId:res.result.openid
  })
  console.log(this.data.openId);
  },
    fail: (err)=>{
  
    },
    complete: ()=>{
    
    }
  })
},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.openIdGet()
    // db.collection('user').where({
    //   _openid: this.data.openId,
    //   // done: false
    // })
    // .get({
    //   success: function(res) {
    //     // res.data 是包含以上定义的两条记录的数组
    //     // console.log(res.data)
    //   }
    // })
    let that = this
    db.collection('user').where({
       _openid: that.data.openId}).get().then( res => {
      console.log(res.data)
     if (res.data.length==0) {
      wx.reLaunch({
        url: '/pages/login/login',
      })
    }else{
      wx.switchTab({
        url: '/pages/denglu/denglu',
      })
    }
  })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})