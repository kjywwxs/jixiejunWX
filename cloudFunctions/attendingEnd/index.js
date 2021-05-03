// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  // try {
  //   let res = await db.collection('attendingCourse').get()
  //   //当前时间戳
  //   let timeStamp = (new Date()).valueOf()
  //   // console.log(timeStamp);
  //   //为正在签到的课组成的数组
  //   let attendingCourse = res.data
  //   // console.log(attendingCourse);
  //   // 为需要停止签到的课的选课编号
  //   let endArr = []
  //   for (let index = 0; index < attendingCourse.length; index++) {
  //     const element = attendingCourse[index];
  //     //如果当前时间晚于签到截止时间
  //     if (timeStamp > element.endTimeStamp) {
  //       endArr.push(element._id)
  //     }
  //   }

  //   return [
  //     //修改courseattend里的课的sfqd(是否签到)属性
  //     await db.collection('courseAttend').where({
  //       _id: _.in(endArr)
  //     }).update({
  //       // data 传入需要局部更新的数据
  //       data: {
  //         sfqd: false
  //       },
  //       success: function (res) {
  //         console.log(res.data)
  //       }
  //     }),
  //     // //attendingCourse移除数据
  //     await db.collection('attendingCourse').where({
  //       _id: _.in(endArr)
  //     }).remove()
  //   ]
  // } catch (e) {
  //   console.error(e)
  // }

  try {
    let res1 = await db.collection('attendingCourse').get()
    //为一小时前正在签到的课组成的数组
    let attendingCourse1 = res1.data
    console.log(attendingCourse1);
    let endArr1 = attendingCourse1[0].attendingArr
  
    let res2 = await db.collection('courseAttend').where({
      sfqd: true
    }).get()
    //为现在正在签到的课组成的数组
    let attendingCourse2 = res2.data
    console.log(attendingCourse2);
    let endArr2 = []
    for (let index = 0; index < attendingCourse2.length; index++) {
      const element = attendingCourse2[index];
      //如果当前时间晚于签到截止时间
      endArr2.push(element._id)
    }
    // 为需要关闭签到的的课的选课编号
    //取交集
    // console.log(endArr1);
    // console.log(endArr2);
    let endArr = endArr1.filter(function (val) {
      return endArr2.indexOf(val) > -1
    })
    // console.log(endArr);
    return [
      await db.collection('courseAttend').where({
        _id: _.in(endArr)
      }).update({
        // data 传入需要局部更新的数据
        data: {
          sfqd: false
        },
        success: function (res) {
          console.log(res.data)
        }
      }),
      //把新的数据放入用于下次比较
      await db.collection('attendingCourse').where({
        _id: '28ee4e3e608230db116d389c334cfef9'
      }).update({
        // data 传入需要局部更新的数据
        data: {
          attendingArr : endArr2
        },
        success: function (res) {
          console.log(res.data)
        }
      })
    ]
  } catch (e) {
    console.error(e)
  }
}