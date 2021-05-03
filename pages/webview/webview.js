// pages/webview/webview.js
import { cloudRequest } from "../../cloudRequest/cloudRequest.js"
Page({
  /**
   * 页面的初始数据
   */
  data: {
    title: '',
    heard: [],
    readNumber: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    // console.log(options)
    // 接受上一个页面传来的参数
    var webview=options.webview;
    cloudRequest({name: 'newGet', data:{url:webview}})
    .then( res => { 
        // console.log(res.result)
        that.setData({
        title: res.result.title,
        heard: res.result.heard,
        readNumber: '阅读：'+res.result.readNumber,
        htmlText: res.result.content
      })
      
       })
    .catch (err => {
         console.log(err)
       })
   
  }
})