const db =  wx.cloud.database()
const _ = db.command
Page({
  data: {},

  onLoad: function (options) {
    // console.log('成功');
    wx.cloud.callFunction({ name: 'openidGet', data:{ }, 
     success: (res)=>{
      //  console.log('成功');
       db.collection('user').where({ _openid: res.result.openid}).get().then( event => {
        if (event.data.length==0) {
         wx.reLaunch({
           url: '/pages/login/login?openId='+res.result.openid,
         })
       }else{
         wx.reLaunch({
           url: '/pages/Mine/Mine?openId='+res.result.openid,
         })
       }
     })
    // console.log(this.data.openId);
    },
      fail: (err)=>{
        console.log(err);
      },
      complete: ()=>{
        console.log('judgeindex完成');
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