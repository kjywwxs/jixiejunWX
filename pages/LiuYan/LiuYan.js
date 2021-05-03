import {
  cloudRequest
} from "../../cloudRequest/cloudRequest.js"
var util = require('../../utils/util.js');
//数据库
const db = wx.cloud.database()
const _ = db.command
Page({
  data: {
    xkbh: null,
    pjnr: [],
    kcmc: null,
    xuehao: null,
    xingmin: null,
    openid: null,
    zhouji: null
  },
  //提交留言，并将留言放进courseJudge中以选课代码为ID的记录中，选课编号that.data.xkbh由上一个界面传送
  formSubmit: function (e) {
    let that = this
    if (e.detail.value.suggest.length == 0) {
      wx.showModal({
        title: '提示',
        content: '留言内容不能为空',
        showCancel: false,
      })
    } else {
      cloudRequest({
        name: 'msgCheck',
        data: {
          text: e.detail.value.suggest
        }
      }).then(res => {
        console.log(res.result.Response.EvilTokens);
        if (res.result.Response.EvilTokens.length == 0) {
          let time = util.formatTime(new Date());
          time=time.split(" ")[1].split(":")
          db.collection('courseJudge').doc(that.data.xkbh).update({
            data: {
              pjnr: _.push({
                each: [{
                  name: that.data.xingmin,
                  xuehao: that.data.xuehao,
                  pjnr: e.detail.value.suggest,
                  time: util.formatTime(new Date()).split(" ")[0]+' '+that.data.zhouji+' '+time[1]+':'+time[2]+':'+time[3]
                }]
              }),
            },
            success: function(res) {
               that.refreshform()
            }
          })
          that.setData({
            suggest: ''
          });
        } else {
          wx.showModal({
            title: '提示',
            content: '内容含有不良信息，请重新编辑语言，文明用语',
            showCancel: false,
          })
          that.setData({
            suggest: ''
          })
        }
      })
    }
  },
  //再次访问数据库以获取最新的讨论内容
  refreshform: function () {
    let that = this
    db.collection('courseJudge').doc(that.data.xkbh).get({
      success: function (res) {
        that.setData({
          pjnr: res.data.pjnr
        })
      }
    })
  },
  onLoad: function (options) {
    let that = this
   if ( util.formatTime(new Date()).split(" ")[1][1] == 1 ) {
    that.setData({
    zhouji:"星期一" 
    })
  } else if ( util.formatTime(new Date()).split(" ")[1][1] == 2) {
     that.setData({
      zhouji:"星期二" 
    })
  } else if ( util.formatTime(new Date()).split(" ")[1][1] == 3 ) {
    that.setData({
    zhouji:"星期三" 
    })
  } else if ( util.formatTime(new Date()).split(" ")[1][1] == 4 ) {
    that.setData({
     zhouji:"星期四" 
    })
  } else if ( util.formatTime(new Date()).split(" ")[1][1] == 5 ) {
    that.setData({
    zhouji:"星期五" 
    })
  } else if ( util.formatTime(new Date()).split(" ")[1][1] == 6 ) {
    that.setData({
    zhouji:"星期六" 
    })
  } else  {
  that.setData({
    zhouji:"星期天" 
    })
    }
    //
    that.setData({
      xkbh: options.xkbh,
      kcmc: options.kcmc,
      openid: options.openId
    })
    //由上个界面传过来的选课编号that.data.xkbh查找courseJudge如果有就什么都不做，没有就添加以选课编号为id的记录用以存放评价内容
    db.collection('courseJudge').doc(that.data.xkbh).get({
      success: function () {

      },
      fail() {
        db.collection('courseJudge').add({
          data: {
            _id: that.data.xkbh
          }
        })
      }
    })
    //由上个界面传过来的openid获取学生姓名学号
    db.collection('user').where({
      _openid: that.data.openid
    }).get({
      complete: res => {
        that.setData({
          xuehao: res.data[0].userInfo[0],
          xingmin: res.data[0].userInfo[1]
        })
      }
    })
    //根据选课编号查询数据库获取课堂讨论内容
    db.collection('courseJudge').doc(that.data.xkbh).get({
      success: function (res) {
        that.setData({
          pjnr: res.data.pjnr
        })
      }
    })
  },
})