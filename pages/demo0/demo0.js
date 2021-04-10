import { cloudRequest } from "../../cloudRequest/cloudRequest.js"
var util = require('../../utils/util.js');
//数据库
const db =  wx.cloud.database()
const _ = db.command

Page({

  /**
   * 页面的初始数据
   */
  data: {
qdxx:[],
xkbh:22
  },

  refreshform:function () {
    let that = this
    db.collection('courseAttend').doc(that.data.xkbh).get({
      success: function(res) {
        // res.data 包含该记录的数据
        // console.log(res.data)
        that.setData({
          qdxx:res.data.qdjg[util.formatTime(new Date()).split(" ")[0]]
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    console.log(options.id);
    let that = this
    db.collection('courseAttend').doc(that.data.xkbh).get({
      success: function(res) {
        // res.data 包含该记录的数据
        // console.log(res.data)
        that.setData({
          qdxx:res.data.qdjg[util.formatTime(new Date()).split(" ")[0]]
        })
    // console.log(that.data.qdxx[0]);
      }
    })
    // console.log(util.formatTime(new Date()).split(" ")[0]);
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
    this.refreshform()
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