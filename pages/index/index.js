//index.js
import {
  cloudRequest
} from "../../cloudRequest/cloudRequest.js"
//获取应用实例
const app = getApp()
//数据库调用初始化以及数据库引用
wx.cloud.init()
const db = wx.cloud.database()

var pages = 0 //一开始的页码
Page({
  data: {
    searchVal: '',
    tabs: [{
        id: 0,
        name: "学院新闻",
        isActive: true
      },
      {
        id: 1,
        name: "学术科研",
        isActive: false
      },
      {
        id: 2,
        name: "党政办公",
        isActive: false
      },
      {
        id: 3,
        name: "本科教学",
        isActive: false
      },
      {
        id: 4,
        name: "研究生教学",
        isActive: false
      },
      {
        id: 5,
        name: "学生工作",
        isActive: false
      },
      {
        id: 6,
        name: "招生就业",
        isActive: false
      },
      {
        id: 7,
        name: "培训中心",
        isActive: false
      },
    ],
    news: [],
    allPages: '',
  },
  onLoad: function () {
    // console.log(1);
    //清空new缓存
    try {
      for (let index = 0; index < this.data.tabs.length; index++) {
        wx.removeStorageSync('wxb52bd3f9641f1839news' + index)
      }
    } catch (e) {
      console.log(e);
    }
    this.onPullDownRefresh()
    //test
    // cloudRequest({name: 'nowTime' })
    // .then( res => { 
    //    console.log(res.result)
    //  }).catch (err => {
    //    console.log(err)
    //  })
  },

  //下拉刷新
  onPullDownRefresh: function () {
    //显示加载中
    wx.showNavigationBarLoading() //在标题栏中显示加载
    wx.showLoading({
      title: '加载中',
      mask: true
    })

    let that = this
    for (let index = 0; index < that.data.tabs.length; index++) {
      const element = that.data.tabs[index];
      if (element.isActive) {
        cloudRequest({
            name: 'newsGet',
            data: {
              urlIndex: index,
            }
          })
          .then(res => {
            //存入本地缓存
            try {
              wx.removeStorageSync('wxb52bd3f9641f1839news' + index)
              wx.setStorageSync('wxb52bd3f9641f1839news' + index, res.result)
            } catch (e) {
              console.log(e);
            }
            let allPages = res.result.pop(); //删除最后一项,并取得最后一项
            that.setData({
              news: res.result,
              allPages: allPages
            })

            wx.hideNavigationBarLoading() //完成停止加载
            wx.stopPullDownRefresh() //停止下拉刷新
            //关闭加载中图标
            wx.hideLoading()
          }).catch(err => {
            console(err)
          })
      }
    }

  },

  //触底
  onReachBottom: function () {
    let that = this;
    pages++;
    //  console.log(pages);

    let tabs = that.data.tabs; //tab不同，下拉执行的操作也不同
    let allPages = that.data.allPages;
    //  console.log(that.data.news);
    if (allPages > pages) {
      for (let index = 0; index < tabs.length; index++) {
        const element = tabs[index];
        if (element.isActive) {
          cloudRequest({
              name: 'newsGet',
              data: {
                urlIndex: index,
                pages: pages,
                allPages: allPages
              }
            })
            .then(result => {
              result.result.pop(); //删除最后一项
              //  console.log(result.result)
              let news = that.data.news;
              news = news.concat(result.result);
              //  console.log(news)
              that.setData({
                //新加载的新闻合并进数组
                news: news
              })
            }).catch(err => {
              console.log(err)
            })
        }
      }
    } else {
      // console.log('没有下一页')
      wx.showToast({
        title: '没啦'
      })
    }
  },

  //自定义事件，用来接收子组件传递过来的数据
  handleItemChange(e) {
    let that = this
    //  console.log(e)
    //接受传递过来的参数
    const {
      index
    } = e.detail;
    let {
      tabs
    } = that.data;
    tabs.forEach((v, i) => i === index ? v.isActive = true : v.isActive = false);
    that.setData({
      tabs
    })

    pages = 0; //页数置1
    for (let index = 0; index < tabs.length; index++) {
      const element = tabs[index];
      if (element.isActive) {
        try {
          var news = wx.getStorageSync('wxb52bd3f9641f1839news' + index)
          // console.log(news);
          //如果有news
          if (news) {
            console.log('从本地缓存中获取news%d数据', index);
            let allPages = news.pop(); //删除最后一项,并取得最后一项
            that.setData({
              news: news,
              allPages: allPages
            })
          } else {
            console.log('请求从云函数获取news%d数据', index);
            cloudRequest({
                name: 'newsGet',
                data: {
                  urlIndex: index
                }
              })
              .then(result => {
                //存入缓存
                try {
                  wx.setStorageSync('wxb52bd3f9641f1839news' + index, result.result)
                } catch (e) {
                  console.log(e);
                }
                //存放原数组
                let allPages = result.result.pop(); //删除最后一项,并取得最后一项
                that.setData({
                  news: result.result,
                  allPages: allPages
                })
              })
          }
        } catch (e) {
          console.log(e)
        }
      }
    }

  },
  //跳转到新闻小窗
  toWeb: function (e) {
    let webview = e.currentTarget.dataset['href'];
    wx.navigateTo({
      url: '/pages/webview/webview?webview=' + webview
    })
  },

  //跳转到newSearchList界面
  toSearch: function (e) {
    // console.log(e)
    let searchval = e.currentTarget.dataset.searchval //自动变小写了？！
    // console.log(searchval)
    if (searchval) {
      wx.navigateTo({
        url: '/pages/newSearchList/newSearchList?searchval=' + searchval
      })
    } else {
      wx.showToast({
        title: '请输入内容',
        icon: 'none',
        duration: 2000
      })
    }

  },

  //输入框输入值双向绑定
  searchContent: function (e) {
    let keyWord = e.detail.value ? e.detail.value : null;
    let that = this;
    that.setData({
      searchVal: keyWord,
    })
  },

  // 获取滚动条当前位置
  onPageScroll: function (e) {
    // console.log(e)
    if (e.scrollTop > 100) {
      this.setData({
        floorstatus: true
      });
    } else {
      this.setData({
        floorstatus: false
      });
    }
  },

  //回到顶部
  goTop: function (e) { // 一键回到顶部
    if (wx.pageScrollTo) {
      wx.pageScrollTo({
        scrollTop: 0
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },

})