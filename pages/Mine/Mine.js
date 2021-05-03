var util = require('../../utils/util.js');
//数据库
const db = wx.cloud.database()
const _ = db.command

Page({

  /**
   * 页面的初始数据
   */
  data: {
    kb: [],
    k: {},
    hour: Number,
    minutes: Number,
    seconds: Number,
    // sfqd:false,
    // sjc:Number,
    // djs:false,
    xkdm2: "", //用于前端显示正在上课
    xkdm1: "", //用于前端显示即将开始
    // xkdm3:"",
    // qdpd:[],
    choosen: {
      latitude: Number,
      longitude: Number
    },
    got: {},
    zhouji: null, //存放实时汉字星期几
    userInfo: [],
    isStudent: Boolean,
    openId: null,
    qdminute: Number, //用于倒计时的分钟
    // kcjstime:Number
  },
  // 生命周期函数--监听页面加载 
  onLoad: function (options) {
    let that = this
    that.setData({
      openId: options.openId
    })
    //获取实时课表将即将开始或正在进行的课程置顶
    that.getNowCoures()
    //获取实时时间
    that.getNowTime()
    //尝试获取本地缓存
    try {
      var userInfo = wx.getStorageSync('wxb52bd3f9641f1839userInfo')
      console.log(userInfo);
      //如果有userInfo
      if (userInfo) {
        console.log('从本地缓存中获取user数据');
        that.setData({
          userInfo: userInfo,
          isStudent: userInfo[0].length < 10 ? false : true
        })
      } else {
        console.log('从云数据库中获取user数据');
        //获取用户信息
        db.collection('user').get({
          complete: res => {
            that.setData({
              userInfo: res.data[0].userInfo
            })
            if (res.data[0].userInfo[0].length < 10) {
              that.setData({
                isStudent: false
              })
            } else {
              that.setData({
                isStudent: true
              })
            }
          }
        })
      }
    } catch (e) {
      console.log('catch');
      // Do something when catch error
    }
    //循环判断是否有课程开始上课
    for (let a = 0; a < that.data.kb.length; a++) {
      that.kcpd(that.data.kb[a])
    }
    //监听数据库中courseAttend里的数据变化用以判断是否有课程签到
    for (let i = 0; i < that.data.kb.length; i++) {
      try {
        db.collection('courseAttend')
          .doc(that.data.kb[i].xkbh)
          .watch({
            onChange: function (res) {
              //  console.log(res);
              //  console.log('数据发生变化');
              // console.log(that.data.kb[i]);
              //  console.log(res.docChanges[0].doc.sfqd);
              // newkb[i] = Object.assign(kb,{qdpd:res.docChanges[0].doc.sfqd})
              let kb = 'kb[' + i + ']'
              //时间戳
              let timestamp = Date.parse(new Date());
              //  console.log(!res.docChanges[0]);
              //判断数据库中是否有数据
              if (res.docChanges[0]) {
                //如果倒计时存在且时间戳小于课程结束时间戳
                if (res.docChanges[0].doc.djs && timestamp < res.docChanges[0].doc.sjc * 1000) {
                  //向课表中添加qdpd(签到判断)，djs（倒计时），sjc（时间戳）
                  that.setData({
                    [kb]: Object.assign(that.data.kb[i], {
                      qdpd: res.docChanges[0].doc.sfqd,
                      djs: res.docChanges[0].doc.djs,
                      sjc: res.docChanges[0].doc.sjc
                    }),
                  })
                } else {
                  that.setData({
                    [kb]: Object.assign(that.data.kb[i], {
                      qdpd: false,
                      djs: false,
                      sjc: 0
                    }),
                  })
                }
                console.log(that.data.kb[i]);
              } else {
                that.setData({
                  [kb]: Object.assign(that.data.kb[i], {
                    qdpd: false,
                    djs: false,
                    sjc: 0
                  }),
                })
                console.log(that.data.kb[i]);
              }
              //  if (res.docChanges[0].doc.sfqd) {
              //  that.setData({
              //    // xkdm3:res.docChanges[0].docId,
              //    // sfqd:res.docChanges[0].doc.sfqd,//是否签到
              //    sjc:res.docChanges[0].doc.sjc,//设定签到结束的的时间的时间戳
              //    djs:res.docChanges[0].doc.djs//是否设置签到结束时间
              //  })
              //  }
            },
            onError: function (err) {
              console.error('the watch closed because of error', err)
              console.log('没有数据');
            }
          })
      } catch (e) {
        console.log('catch');
        // Do something when catch error
      }
    }


  },
  //跳转到按周查看课表页面
  azckkb: function () {
    wx.navigateTo({
      url: '/pages/kcb/kcb?openId=' + this.data.openId,
    })
  },
  //更新数据：重新登陆以获取最新课表信息
  gxsj: function () {
    let that = this
    wx.showModal({
      title: '提示',
      content: "确定要重新登陆以获取最新的课程信息吗？",
      success(res) {
        if (res.confirm) {
          wx.navigateTo({
            url: '/pages/login/login?openId=' + that.data.openId
          })
        } else if (res.cancel) {}
      }
    })
  },

  //跳转到签到页面
  qiandao: function (event) {
    //判断是否是学生
    let that = this
    if (that.data.isStudent) {
      const check = db.collection('courseAttend').doc(event.currentTarget.dataset.xkbh).get({
        success: function (res) {
          that.setData({
            k: res.data,
            choosen: res.data.mbwz.res
          })
        },
        fail: function (err) {
          return true;
        }
      })
      // console.log(!event.currentTarget.dataset.qdpd);
      // console.log(!!check);
      if (!!check || !event.currentTarget.dataset.qdpd) {
        wx.showModal({
          title: '提示',
          content: '未开始签到',
          showCancel: false,
        })
        return;
      }
      wx.getLocation({
        type: 'gcj02',
        success: (res) => {
          that.setData({
            got: res
          })
          console.log(that.data.got);
        }
      })
      let radLat1 = that.data.choosen.latitude * Math.PI / 180.0;
      let radLat2 = that.data.got.latitude * Math.PI / 180.0;
      let a = radLat1 - radLat2;
      let b = that.data.choosen.longitude * Math.PI / 180.0 - that.data.got.longitude * Math.PI / 180.0;
      let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
      s = s * 6378.137;
      s = Math.round(s * 10000) / 10000;
      console.log(s)
      if (s < 10 && !!event.currentTarget.dataset.qdpd) {
        wx.showToast({
          title: '签到成功',
          icon: 'success',
          duration: 2000
        })
        //从未签到名单中除去已签到人员
        db.collection('courseAttend').doc(event.currentTarget.dataset.xkbh).update({
          data: {
            wqdmd: {
              [util.formatTime(new Date()).split(" ")[0]]: _.pull({
                xuehao: that.data.userInfo[0]
              })
            },
            yqd: {
              [util.formatTime(new Date()).split(" ")[0]]: _.push([that.data.userInfo[0] + that.data.userInfo[1] + '已签到'])
            }
          }
        })
      } else {
        wx.showToast({
          title: '签到失败',
          icon: 'error',
          duration: 2000
        })
      }
    } else {
      wx.navigateTo({
        url: '/pages/TeaQD/TeaQD?xkbh=' + event.currentTarget.dataset.xkbh + '&openId=' + this.data.openId + '&kcid=' + event.currentTarget.dataset.kcid + '&isStudent=' + this.data.isStudent + '&js=' + event.currentTarget.dataset.js,
      })
    }
  },

  //跳转到课件
  kejian: function (event) {
    wx.navigateTo({
      url: '/pages/courseFile/courseFile?xkbh=' + event.currentTarget.dataset.xkbh + '&isStudent=' + this.data.isStudent + '&kcmc=' + event.currentTarget.dataset.kcmc,
    })
  },

  //跳转到留言
  liuyan: function (event) {
    wx.navigateTo({
      url: '/pages/LiuYan/LiuYan?xkbh=' + event.currentTarget.dataset.xkbh + '&openId=' + this.data.openId + '&kcmc=' + event.currentTarget.dataset.kcmc,
    })
  },

  //获取实时课表
  getNowCoures: async function () {
    let that = this
    //尝试获取本地缓存
    try {
      var kb = wx.getStorageSync('wxb52bd3f9641f1839kb')
      // console.log(kb);
      //如果有kb
      if (kb) {
        console.log('从本地缓存中获取kb数据进行排序');
        that.setData({
          kb: that.nowCourse(kb)
        })
      } else {
        console.log('从云数据库中获取kb数据并进行排序');
        let res = await db.collection('user').get()
        // console.log(res);
        that.setData({
          kb: that.nowCourse(res.data[0].kb)
        })
      }

    } catch (e) {
      // Do something when catch error
    }

  },
  //星期几汉字化用于课程开始与否的判断
  hanzixqj: function (shuzixqj) {
    let that = this
    if (shuzixqj == 1) {
      that.setData({
        zhouji: "星期一"
      })
    } else if (shuzixqj == 2) {
      that.setData({
        zhouji: "星期二"
      })
    } else if (shuzixqj == 3) {
      that.setData({
        zhouji: "星期三"
      })
    } else if (shuzixqj == 4) {
      that.setData({
        zhouji: "星期四"
      })
    } else if (shuzixqj == 5) {
      that.setData({
        zhouji: "星期五"
      })
    } else if (shuzixqj == 6) {
      that.setData({
        zhouji: "星期六"
      })
    } else {
      that.setData({
        zhouji: "星期天"
      })
    }
    //  console.log(that.data.zhouji);
  },
  //获取实时时间
  getNowTime: function () {
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
        seconds: _seconds
      });
      //将数字星期几汉字化
      that.hanzixqj(_zhouji)
      //根据当前时间的时间戳判断是否已经过签到时间
      for (let i = 0; i < that.data.kb.length; i++) {
        if (that.data.kb[i].djs) {
          let kb = 'kb[' + i + ']'
          let timestamp = Date.parse(new Date());
          // console.log(timestamp);
          if (timestamp < that.data.kb[i].sjc * 1000) {
            let qdminute = Math.ceil((that.data.kb[i].sjc - timestamp / 1000) / 60)
            that.setData({
              [kb]: Object.assign(that.data.kb[i], {
                qdminute: qdminute
              }),
            })
          } else {
            that.setData({
              [kb]: Object.assign(that.data.kb[i], {
                qdpd: false,
                djs: false,
                qdminute: null
              }),
            })
            // let qdminute=parseInt((that.data.sjc-timestamp/1000)/60)
            // let qdminute = Math.ceil((that.data.sjc-timestamp/1000)/60)
            // console.log(qdminute);
          }
        }
      }
      //  console.log(that.data.hour);
    }, 1000)
  },
  //延时执行函数
  //  sleep:function sleep(numberMillis) {
  //   var now = new Date();
  //   var exitTime = now.getTime() + numberMillis;
  //   while (true) {
  //     now = new Date();
  //     if (now.getTime() > exitTime)
  //     return;
  //   }
  // },
  //判断课程开始时间，节数
  kcpd: function (zuixinkobj) {
    let that = this
    let time = {}
    //间隔一定时间（这里是一秒）执行此函数
    setInterval(() => {
      if (zuixinkobj.qsjs == 1) {
        time.hour = 8,
          time.minute = 0,
          // time.hour = 18,
          // time.minute = 40,
          time.kcjs = zuixinkobj.mwjs - zuixinkobj.qsjs + 1
      } else if (zuixinkobj.qsjs == 3) {
        time.hour = 9,
          time.minute = 50,
          // time.hour = 16,
          // time.minute = 40,
          time.kcjs = zuixinkobj.mwjs - zuixinkobj.qsjs + 1
      } else if (zuixinkobj.qsjs == 6) {
        time.hour = 14,
          time.minute = 0,
          time.kcjs = zuixinkobj.mwjs - zuixinkobj.qsjs + 1
      } else if (zuixinkobj.qsjs == 8) {
        time.hour = 15,
          time.minute = 50,
          time.kcjs = zuixinkobj.mwjs - zuixinkobj.qsjs + 1
      } else if (zuixinkobj.qsjs == 11) {
        time.hour = 19,
          time.minute = 30,
          time.kcjs = zuixinkobj.mwjs - zuixinkobj.qsjs + 1
      } else {}
      let kcjstime = (time.hour * 60 + time.minute + time.kcjs * 50 - 5)
      let nowtime = that.data.hour * 60 + that.data.minutes * 1
      //  console.log(nowtime);
      let kctime = time.hour * 60 + time.minute * 1
      // that.setData({kcjstime:kcjstime,nowtime:nowtime})
      //根据汉字化的星期几判断该课程是否是当天的，增加限制条件：当前时间介于课程开始前十分钟与课程结束时间之间
      if (that.data.zhouji == zuixinkobj.sjxqj && nowtime >= (kctime - 10) && nowtime < kcjstime) {
        // console.log(kctime);
        //判断此刻的时间距离课程开始还有多久，更改数据用以前端显示的判断
        if (kctime - nowtime <= 10 && kctime - nowtime > 0) {
          that.setData({
            xkdm1: zuixinkobj.xkbh,
            xkdm2: null
          })
          // if (kctime-nowtime <=10 && kctime-nowtime > 0) {
          //   that.sleep(((kctime-nowtime)*60-that.data.seconds)*1000)
          // }else{}
        } else if (nowtime - kctime >= 0 && nowtime - kctime < time.kcjs * 50 - 5) {
          that.setData({
            xkdm1: null,
            xkdm2: zuixinkobj.xkbh
          })
          // if (nowtime - kctime>= 0 && nowtime-kctime<time.kcjs*50-5) {
          //   that.sleep((((kctime+time.kcjs*50-5)-nowtime)*60-that.data.seconds)*1000)
          // }
        } else {
          that.setData({
            xkdm1: 'null',
            xkdm2: 'null'
          })
        }
      } else {}
    }, 1000);
    // console.log(that.data.xkdm1);
  },
  // 根据当前时间对课表进行排序
  nowCourse: function (kb) {
    let TIME = new Date()
    // console.log(TIME)
    // console.log(typeof TIME)
    let time = {
      timeStamp: Date.parse(TIME),
      day: TIME.getDay(), //星期几
      month: TIME.getMonth() + 1, //几月
      date: TIME.getDate(), //几号
      year: TIME.getFullYear(), //年份
      hour: TIME.getHours(), //小时
      minute: TIME.getMinutes(), //分钟
      second: TIME.getSeconds() //秒
    }
    //将0到6，改为星期几
    let dayCycleArray = ["日", "一", "二", "三", "四", "五", "六"]
    for (let i = 0; i < 7; i++) {
      if (time.day == i) {
        //将dayCycleArray的数赋值到系统星期几里面中去;
        time.day = '星期' + dayCycleArray[i];
      }
    }
    // // console.log(time)
    // console.log(wxContext.OPENID);

    //一个排序方法
    let sortByWeekday = (fst, snd) => {
      if (d2n[fst.sjxqj] - d2n[snd.sjxqj] != 0) {
        return d2n[fst.sjxqj] - d2n[snd.sjxqj]
      } else {
        //同一天
        if (fst['qsjs'] > snd['qsjs']) {
          return 1;
        } else if (fst['qsjs'] < snd['qsjs']) {
          return -1;
        } else {
          return 0;
        }
      }
    }
    //根据当天星期几的不同，排序规则变化
    let d2n = {}
    switch (TIME.getDay()) {
      case 0:
        d2n = {
          '星期一': 1,
          '星期二': 2,
          '星期三': 3,
          '星期四': 4,
          '星期五': 5,
          '星期六': 6,
          '星期日': 0,
          '星期天': 6
        }
        break;
      case 1:
        d2n = {
          '星期一': 0,
          '星期二': 1,
          '星期三': 2,
          '星期四': 3,
          '星期五': 4,
          '星期六': 5,
          '星期日': 6,
          '星期天': 6
        }
        break;
      case 2:
        d2n = {
          '星期一': 6,
          '星期二': 0,
          '星期三': 1,
          '星期四': 2,
          '星期五': 3,
          '星期六': 4,
          '星期日': 5,
          '星期天': 6
        }
        break;
      case 3:
        d2n = {
          '星期一': 5,
          '星期二': 6,
          '星期三': 0,
          '星期四': 1,
          '星期五': 2,
          '星期六': 3,
          '星期日': 4,
          '星期天': 6
        }
        break;
      case 4:
        d2n = {
          '星期一': 4,
          '星期二': 5,
          '星期三': 6,
          '星期四': 0,
          '星期五': 1,
          '星期六': 2,
          '星期日': 3,
          '星期天': 6
        }
        break;
      case 5:
        d2n = {
          '星期一': 3,
          '星期二': 4,
          '星期三': 5,
          '星期四': 6,
          '星期五': 0,
          '星期六': 1,
          '星期日': 2,
          '星期天': 6
        }
        break;
      default:
        d2n = {
          '星期一': 2,
          '星期二': 3,
          '星期三': 4,
          '星期四': 5,
          '星期五': 6,
          '星期六': 0,
          '星期日': 1,
          '星期天': 6
        }
    }
    // await 
    kb.sort(sortByWeekday)
    //当前第一门课始终是正在进行的或下一门课
    let kb1 = []
    let kb2 = []
    //将今天的课和其他课分开
    kb.forEach((item, index) => {
      if (item.sjxqj == time.day) {
        kb1.push(item)
      } else {
        kb2.push(item)
      }
    })
    // console.log(kb1)
    // console.log(kb2)
    //将今天已经上完上的课 和 正在上或还未上的课分开
    let kb3 = []
    let kb4 = []
    //js为当前时间处于的节数
    let js = Number
    // console.log(time.hour.toString() + time.minute)
    let compareNum = time.hour.toString() + time.minute
    // let compareNum = 1407
    if (compareNum >= 800 && compareNum <= 845) {
      js = 1
    } else if (compareNum >= 850 && compareNum <= 935) {
      js = 2
    } else if (compareNum >= 936 && compareNum <= 1035) {
      js = 3
    } else if (compareNum >= 1036 && compareNum <= 1125) {
      js = 4
    } else if (compareNum >= 1126 && compareNum <= 1215) {
      js = 5
    } else if (compareNum >= 1216 && compareNum <= 1445) {
      js = 6
    } else if (compareNum >= 1446 && compareNum <= 1535) {
      js = 7
    } else if (compareNum >= 1536 && compareNum <= 1635) {
      js = 8
    } else if (compareNum >= 1636 && compareNum <= 1725) {
      js = 9
    } else if (compareNum >= 1726 && compareNum <= 1815) {
      js = 10
    } else if (compareNum >= 1816 && compareNum <= 2015) {
      js = 11
    } else if (compareNum >= 2016 && compareNum <= 2105) {
      js = 12
    } else if (compareNum >= 2106 && compareNum <= 2155) {
      js = 13
    } else {
      js = 14
    }

    kb1.forEach((item, index) => {
      if (item.mwjs < js) {
        kb3.push(item)
      } else {
        kb4.push(item)
      }
    })
    // console.log(kb3)
    // console.log(kb4)
    kb = kb4.concat(kb2).concat(kb3)

    // console.log(kb)
    return kb
  },

})