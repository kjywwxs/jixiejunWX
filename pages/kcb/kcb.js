// import { cloudRequest } from "../../cloudRequest/cloudRequest.js"
wx.cloud.init()
const db = wx.cloud.database()
Page({
  data: {
    colorArrays: ["#85B8CF", "#90C652", "#D8AA5A", "#FC9F9D", "#0A9A84", "#61BC69", "#12AEF3", "#E29AAD"],
    ab: null,
    a: [],
    userInfo: null,
  },
  onLoad: function (options) {
    let that = this
    try {
      var kb = wx.getStorageSync('wxb52bd3f9641f1839kb')
      //如果有
      if (kb) {
        console.log('kcb页面从本地缓存中获取kb数据');
        that.setData({
          a: that.kbxqj(kb)
        })
      } else {
        console.log('kcb页面从云数据库中获取kb数据');
        db.collection('user').doc(options.openId).get({
          success: function (res) {
            // res.data 包含该记录的数据
            that.setData({
              a: that.kbxqj(res.data.kb),
              userInfo: res.data.userInfo
            })

          }
        })
      }
    } catch (e) {
      // Do something when catch error
    }
  },
  //结束
  //将课表中星期几转为数字
  kbxqj: function (kb) {
    kb.forEach((item, index) => {
      if (item.sjxqj == '星期一') {
        item.sjxqj == '1'
      } else if (item.sjxqj == '星期二') {
        item.sjxqj = '2'
      } else if (item.sjxqj == '星期三') {
        item.sjxqj = '3'
      } else if (item.sjxqj == '星期四') {
        item.sjxqj = '4'
      } else if (item.sjxqj == '星期五') {
        item.sjxqj = '5'
      } else if (item.sjxqj == '星期六') {
        item.sjxqj = '6'
      } else {
        item.sjxqj = '7'
      }
    })
    return kb
  }
  //结束



})