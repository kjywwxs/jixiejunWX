wx.cloud.init()
const db = wx.cloud.database()
const _ = db.command
var util = require ( '../../utils/util.js' )
Page({
  data: {
    qdxx:[],
    xkbh:null,
    kcmc:null,
    choosedId:0,
    ksqd:'',
    jsqd:'',
    got:{},
    k:'结束签到',
    n:{},
    m:{
      student:'签到结果'
    },
    isStudent:Boolean,
    xkbh:null,
    kcmc:null,
    riqi:null,
    latitude:30.79589,
    longitude:103.90256,
  t:1,
  p:[],
  js:Number
  },
  onLoad: function (options) {
    // console.log(util.formatTime(new Date()).split(" "))
    // console.log(util.formatTime(new Date()).split(" ")[0]);
    let that=this
    that.setData({
      xkbh:options.xkbh,
      kcmc:options.kcmc,
      isStudent:options.isStudent == 'true'? true : false,
      js:options.js
    })
    db.collection('user').doc(options.openId).get({
      success:function(res){
        // console.log(res);
        that.setData({
          p:res.data.kb[options.kcid].mingdan
        })
       db.collection('courseAttend').doc(that.data.xkbh).get({
        success(res) {
          console.log(res);
          if (res.data.sfqd) {
            that.setData({
              ksqd:'已发布签到',
              jsqd:'结束签到'
            })
          }else{
            that.setData({
              ksqd:'发布签到',
              jsqd:'还未开始签到'
            })
          }
        },
        fail(){
          db.collection('courseAttend').add({
            data: {
              _id:options.xkbh,
              qdmd:res.data.kb[options.kcid].mingdan,
              yqd:{},
              mbwz:{},
              sfqd:false,
              wqdmd:{},
              djs:false,
              sjc:0
            },
        })
        that.setData({
          ksqd:'发布签到',
          jsqd:'还未开始签到'
        })
       }
      })
    }
  })
  
    wx.getLocation({
      type:'gcj02',
      success:(res)=>{
        that.setData({
          got:res
        })
      }
    })
},
  //用于获取当前显示页面的Id
  turn:function (e) {
    this.setData({
      choosedId:e.currentTarget.dataset.ymid
    })
    if (e.currentTarget.dataset.ymid == 1) {
      this.refreshform()
    }
  },
  //再次访问数据库以获取最新的签到名单
  refreshform:function () {
    let that = this
    db.collection('courseAttend').doc(that.data.xkbh).get({
      success: function(res) {
        // res.data 包含该记录的数据
        // console.log(res.data)
        that.setData({
          // qdxx:res.data.qdjg[util.formatTime(new Date()).split(" ")[0]]
          qdxx:res.data.wqdmd[util.formatTime(new Date()).split(" ")[0]]
        })
      }
    })
  },
  //结束签到，将是否签到sfqd改为false
  jsqd:function(e){
    let that=this 
    db.collection('courseAttend').doc(that.data.xkbh).update({
      data :{   
      djs:false,
      sfqd:false
    },
    success: function(res) {
      // console.log(res.data)
      wx.showModal({
        showCancel:false,
        title:'提示',
        content:"签到已结束",
        success (res) {
          that.setData({
            ksqd:'开始签到',
            jsqd:'还未开始签到'
          })
        }
      })
    }

  })
  },
  //
  //十分钟后结束签到
  shifeng:function(e){
    let that=this
    //在数据库中wqdmd和yqd中上传一条以日期为名称的数组
    db.collection('courseAttend').doc(that.data.xkbh).update({
            data: {
              wqdmd:{ [util.formatTime(new Date()).split(" ")[0]]: _.push([])
      },
      yqd:{ [util.formatTime(new Date()).split(" ")[0]]:_.push([])}
               //console.log(that.data.p)
            }
        })
    //更新数据库中wqdmd和yqd中上传一条以日期为名称的数组，使wqdmd为全部学生，yqd为空
    db.collection('courseAttend').doc(that.data.xkbh).update({
      data: {
        wqdmd:{ [util.formatTime(new Date()).split(" ")[0]]:that.data.p},
        yqd:{ [util.formatTime(new Date()).split(" ")[0]]:[]}
      }
    })
    //选择位置
    wx.chooseLocation({
      type:'gcj02',
      success:(res)=>{
        that.setData({
          latitude:res.latitude,
          longitude:res.longitude
        })
        // 将sfqd改为true，并将目标位置坐标经纬度上传至数据库mbwz
        db.collection('courseAttend').doc(that.data.xkbh).update({
          data :{   
          mbwz:db.command.set({res}),
          sfqd:true
        },
        //将开始签到按钮显示为已发布签到
        success: function(res) {
          // console.log(res.data)
          that.setData({
            ksqd:'已发布签到',
            jsqd:'结束签到'
          })
          wx.showModal({
            showCancel:false,
            title:'提示',
            content:"十分钟后将自动结束签到",
        })
        }
      })
      }
    })
      // console.log(res.data)
     //获取时间戳并上传
    let timestamp = Date.parse(new Date());  
    let newtimestamp = timestamp / 1000+600;
    console.log(timestamp)
    console.log("当前时间戳为：" + newtimestamp)
    //将倒计时djs改为true，将sjc改为结束时间戳
    db.collection('courseAttend').doc(that.data.xkbh).update({
        data :{   
        djs:true,
        sjc:newtimestamp
      }
       })
    setTimeout(function () {
      db.collection('courseAttend').doc(that.data.xkbh).update({
        data :{   
          djs:false,
          sfqd:false
        },
        success (res) {
          that.setData({
            ksqd:'开始签到',
            jsqd:'还未开始签到',
          })
        }
      })
     }, 600000)
  },
  //
  //二十分钟后结束签到
  ershifeng:function(e){
    let that=this
 //在数据库中wqdmd和yqd中上传一条以日期为名称的数组
 db.collection('courseAttend').doc(that.data.xkbh).update({
        data: {
          wqdmd:{ [util.formatTime(new Date()).split(" ")[0]]: _.push([])
  },
  yqd:{ [util.formatTime(new Date()).split(" ")[0]]:_.push([])}
           //console.log(that.data.p)
        }
    })
//更新数据库中wqdmd和yqd中上传一条以日期为名称的数组，使wqdmd为全部学生，yqd为空
db.collection('courseAttend').doc(that.data.xkbh).update({
  data: {
    wqdmd:{ [util.formatTime(new Date()).split(" ")[0]]:that.data.p},
        yqd:{ [util.formatTime(new Date()).split(" ")[0]]:[]}
  }
})
//选择位置
wx.chooseLocation({
  type:'gcj02',
  success:(res)=>{
    that.setData({
      latitude:res.latitude,
      longitude:res.longitude
    })
    // 将sfqd改为true，并将目标位置坐标经纬度上传至数据库mbwz
    db.collection('courseAttend').doc(that.data.xkbh).update({
      data :{   
      mbwz:db.command.set({res}),
      sfqd:true
    },
    //将开始签到按钮显示为已发布签到
    success: function(res) {
      // console.log(res.data)
      that.setData({
        ksqd:'已发布签到',
        jsqd:'结束签到'
      })
      wx.showModal({
        showCancel:false,
        title:'提示',
        content:"二十分钟后将自动结束签到",
    })
    }
  })
  }
})
    let timestamp = Date.parse(new Date());  
    let newtimestamp = timestamp / 1000+1200;
    console.log(timestamp)
    console.log("当前时间戳为：" + newtimestamp)
    db.collection('courseAttend').doc(that.data.xkbh).update({
      data :{   
      djs:true,
      sjc:newtimestamp
    }
     })
    setTimeout(function () {
    db.collection('courseAttend').doc(that.data.xkbh).update({
      data :{  
        djs:false, 
        sfqd:false
    },
    success (res) {
      that.setData({
        ksqd:'开始签到',
        jsqd:'还未开始签到'
      })
    }
  })
     }, 1200000)
  },
  //
  //十五分钟后结束签到
  shiwufeng:function(e){ 
    let that=this
 //在数据库中wqdmd和yqd中上传一条以日期为名称的数组
 db.collection('courseAttend').doc(that.data.xkbh).update({
        data: {
          wqdmd:{ [util.formatTime(new Date()).split(" ")[0]]: _.push([])
  },
  yqd:{ [util.formatTime(new Date()).split(" ")[0]]:_.push([])}
           //console.log(that.data.p)
        }
    })
//更新数据库中wqdmd和yqd中上传一条以日期为名称的数组，使wqdmd为全部学生，yqd为空
db.collection('courseAttend').doc(that.data.xkbh).update({
  data: {
    wqdmd:{ [util.formatTime(new Date()).split(" ")[0]]:that.data.p},
        yqd:{ [util.formatTime(new Date()).split(" ")[0]]:[]}
  }
})
//选择位置
wx.chooseLocation({
  type:'gcj02',
  success:(res)=>{
    that.setData({
      latitude:res.latitude,
      longitude:res.longitude
    })
    // 将sfqd改为true，并将目标位置坐标经纬度上传至数据库mbwz
    db.collection('courseAttend').doc(that.data.xkbh).update({
      data :{   
      mbwz:db.command.set({res}),
      sfqd:true
    },
    //将开始签到按钮显示为已发布签到
    success: function(res) {
      // console.log(res.data)
      that.setData({
        ksqd:'已发布签到',
        jsqd:'结束签到'
      })
      wx.showModal({
        showCancel:false,
        title:'提示',
        content:"十五分钟后将自动结束签到",
    })
    }
  })
  }
})
  let timestamp = Date.parse(new Date());  
    let newtimestamp = timestamp / 1000+900;
    console.log(timestamp)
    console.log("当前时间戳为：" + newtimestamp)
    db.collection('courseAttend').doc(that.data.xkbh).update({
      data :{   
      djs:true,
      sjc:newtimestamp
    }
     })
    setTimeout(function () {
      //要延时执行的代码
      db.collection('courseAttend').doc(that.data.xkbh).update({
        data :{  
          djs:false, 
          sfqd:false
      },
      success (res) {
        that.setData({
          ksqd:'开始签到',
          jsqd:'还未开始签到'
        })
      }
    })
   }, 900000)
  },
  //
  //发布签到，将是否签到sfqd改为true
  ksqd:function(e){
    let that=this
    //在数据库中wqdmd和yqd中上传一条以日期为名称的数组
    db.collection('courseAttend').doc(that.data.xkbh).update({
            data: {
              wqdmd:{ [util.formatTime(new Date()).split(" ")[0]]: _.push([])
      },
      yqd:{ [util.formatTime(new Date()).split(" ")[0]]:_.push([])}
               //console.log(that.data.p)
            }
        })
    //更新数据库中wqdmd和yqd中上传一条以日期为名称的数组，使wqdmd为全部学生，yqd为空
    db.collection('courseAttend').doc(that.data.xkbh).update({
      data: {
        wqdmd:{ [util.formatTime(new Date()).split(" ")[0]]:that.data.p},
        yqd:{ [util.formatTime(new Date()).split(" ")[0]]:[]}
      }
    })
    //选择位置
    wx.chooseLocation({
      type:'gcj02',
      success:(res)=>{
        that.setData({
          latitude:res.latitude,
          longitude:res.longitude
        })
        // 将sfqd改为true，并将目标位置坐标经纬度上传至数据库mbwz
        db.collection('courseAttend').doc(that.data.xkbh).update({
          data :{   
          mbwz:db.command.set({res}),
          sfqd:true
        },
        //将开始签到按钮显示为已发布签到
        success: function(res) {
          // console.log(res.data)
          that.setData({
            ksqd:'已发布签到',
            jsqd:'结束签到'
          })
        }
      })
      }
    })
    //
    db.collection('courseAttend').doc(that.data.xkbh).get({
      success:function(res){
        // console.log(res);
        that.setData({
          qdxx:res.data.wqdmd[util.formatTime(new Date()).split(" ")[0]]
        })
      }
  })
 
  },
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