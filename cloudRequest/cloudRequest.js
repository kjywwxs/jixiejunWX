//封装调用云函数的方法
export const cloudRequest = (params) =>{
  //显示加载中
  wx.showLoading({
    title: '加载中',
    mask: true
  })
  return new Promise ((resolve, reject) => {
    wx.cloud.callFunction({
      ...params,
      success: (result)=>{
        resolve(result);
      },
      fail: (err)=>{
        reject(err);
      },
      complete: ()=>{
        //关闭加载中图标
        wx.hideLoading()
      }
    })
  })
}