// pages/newSearchList/newSearchList.js
import { cloudRequest } from "../../cloudRequest/cloudRequest.js"
var pages//页码
Page({
  data: {
    news: [],
    allPages: '',
    keywords: ''
  },

  onLoad: function (options) {
    let that = this
    let keywords = options.searchval;
    // console.log(typeof keywords)
    //keywords即上一个页面传过来的搜索关键字,此时pages
    cloudRequest({name: 'newsSearch', data: { keywords: keywords}})
    .then (result => {
      // console.log(result.result)
      let allPages = result.result.pop()
      pages = allPages
      console.log(pages)
      // this.setData({
      //   news: result.result,
      //   allPages: allPages,
      //   keywords: keywords
      // })
      cloudRequest({name: 'newsSearch', data: {pages:pages, keywords: keywords}})
      .then (result => {
        console.log(result.result)
         let allPages = result.result.pop()
         that.setData({
              news: result.result,
              allPages: allPages,
              keywords: keywords
          })
      })

    })
  },

  onReachBottom: function (){
    let that = this
    let {keywords} = that.data
    // console.log(keywords)
    pages--
    if (pages) {
      cloudRequest({name: 'newsSearch', data: {pages: pages, keywords: keywords}})
      .then (result => {
        let news = that.data.news
        // console.log(result.result)
        result.result.pop()
        // console.log(allPages)
        news = news.concat(result.result)
        that.setData({
          news: news,
        })
      })
    } else {
       wx.showToast({
          title: '没有更多了',
          icon: 'none',
          duration: 2000
      })
    }

  },

  toWeb:function(e){
    let webview = e.currentTarget.dataset['href'];
    wx.navigateTo({
      url:'/pages/webview/webview?webview='+webview
   })
 },
})