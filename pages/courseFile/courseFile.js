// pages/courseFile/courseFile.js
const util = require("../../utils/util.js");
//数据库调用初始化以及数据库引用
// wx.cloud.init()
const db = wx.cloud.database()
const _ = db.command

Page({
  data: {
    isStudent: Boolean,
    kcmc: '',
    xkbh: '',
    file: []
  },

  //   slideButtonTap(e) {
  //     console.log(e);
  //     console.log('slide button tap', e.detail)
  //  },

  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    //左滑组件
    this.setData({
      slideButtons: [{
        type: 'warn',
        text: '删除',
        extClass: 'delete',
      }],
      xkbh: options.xkbh,
      kcmc: options.kcmc,
      isStudent: options.isStudent == 'true' ? true : false
    });
    let that = this
    //查询数据库，获取文件条目
    db.collection('courseFile').where({
        _id: that.data.xkbh
      })
      .get().then(res => {
        //关闭加载中
        wx.hideLoading()
        // console.log(res.data[0].file.length);
        if (res.data.length == 0) {
          console.log('没有查询到记录');
          wx.showToast({
            title: '好像什么都没有',
            icon: 'none',
            duration: 5000
          })
          //教师可以判断是数据库里是否有改选课编号的集合，没有就会根据xkbh和自己openid创建
          if (!that.data.isStudent) {
            db.collection('courseFile').add({
              data: {
                _id: that.data.xkbh,
                file: []
              }
            })
          }
        } else if (res.data[0].file.length != 0) {
          console.log('查询到记录');
          // console.log(res.data);
          that.setData({
            file: res.data[0].file
          })
        } else {
          wx.showToast({
            title: '好像什么都没有',
            icon: 'none',
            duration: 5000
          })
        }
      })

  },

  uploadfile: function () {
    let that = this
    wx.chooseMessageFile({
      count: 1, //能选择文件的数量
      type: 'file', //能选择文件的类型,我这里只允许上传文件.还有视频,图片,或者都可以
      success(res) {
        wx.showLoading({
          title: '上传中',
        })
        //文件名
        // console.log(res);
        let name = res.tempFiles[0].name
        //文件临时路径
        const tempFilePaths = res.tempFiles[0].path
        //后缀名的获取
        const houzhui = tempFilePaths.match(/\.[^.]+?$/)[0];
        //存储在云存储的地址
        const cloudpath = 'word/' + new Date().getTime() + houzhui;
        //获取fileID
        wx.cloud.uploadFile({
          cloudPath: cloudpath,
          filePath: tempFilePaths,
          success: res => {
            // //存储fileID，之后用的到
            // that.setData({
            //   fileid:res.fileID
            // })

            // 将file数据添加到数据库中
            console.log(that.data.xkbh);
            let fileID = res.fileID
            let time = util.formatTime(new Date()).split(" ")[0]
            console.log(fileID);
            console.log(time);
            db.collection('courseFile').doc(that.data.xkbh).update({
              data: {
                file: _.push({
                  fileID,
                  name,
                  time
                }),
              }
            }).then(res => {
              that.updataPage(that.data.xkbh)
            })

          },
          fail: err => {
            console.log(err)
          },
          complete: () => {
            wx.hideLoading()
          }
        })
      }
    })
  },

  deletefile: function (e) {
    wx.showLoading({
      title: '删除中',
    })
    let that = this
    let fileid = e.currentTarget.dataset.file.fileID;
    wx.cloud.deleteFile({
      fileList: [fileid]
    }).then(res => {
      // handle success
      //被删除文件的fileID
      console.log(res.fileList[0].fileID)
      let fileID = res.fileList[0].fileID
      //移除数据库中删除的内容
      db.collection('courseFile').doc(that.data.xkbh).update({
        data: {
          file: _.pull({
            fileID: fileID
          })
        }
      }).then(
        wx.hideLoading(),
        //更新页面
        // that.onLoad()
        that.updataPage(that.data.xkbh)
      )
    }).catch(error => {
      // handle error
    })
  },

  openfile: function (e) {
    wx.showLoading({
      title: '打开中',
    })
    console.log('点击文件传递的参数');
    console.log(e.currentTarget.dataset.file);
    var fileid = e.currentTarget.dataset.file.fileID;
    let fileType = e.currentTarget.dataset.file.name.split('.')[1]
    // console.log(fileType);
    var that = this;
    wx.cloud.getTempFileURL({
      fileList: [fileid],
      success: res => {
        that.setData({
          //res.fileList[0].tempFileURL是https格式的路径，可以根据这个路径在浏览器上下载
          src: res.fileList[0].tempFileURL
        });
        //根据https路径可以获得http格式的路径(指定文件下载后存储的路径 (本地路径)),根据这个路径可以预览
        wx.downloadFile({
          url: that.data.src,
          success: (res) => {
            that.setData({
              httpfile: res.tempFilePath
            })
            //预览文件
            wx.openDocument({
              filePath: that.data.httpfile,
              fileType: fileType,
              success: res => {
                wx.hideLoading()
              },
              fail: err => {
                console.log(err);
                wx.hideLoading()
                wx.showToast({
                  title: '暂不支持预览',
                  icon: 'none'
                })
              }
            })
          },
          fail: (err) => {
            console.log('读取失败', err)
          }
        })
      },
      fail: err => {
        console.log(err);
      }
    })

  },

  updataPage: function (xkbh) {
    db.collection('courseFile').where({
        _id: xkbh
      })
      .get().then(res => {
        this.setData({
          file: res.data[0].file
        })
      })
  }
})