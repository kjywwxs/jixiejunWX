// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
//数据库
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const TIME = new Date()
  // console.log(TIME)
  // console.log(typeof TIME)
  let time = {
    timeStamp: Date.parse(TIME),
    day: TIME.getDay(),//星期几
    month: TIME.getMonth() + 1,//几月
    date: TIME.getDate(),//几号
    year: TIME.getFullYear(),//年份
    hour: TIME.getHours(), //小时
    minute: TIME.getMinutes(), //分钟
    second: TIME.getSeconds() //秒
  }
  //将0到6，改为星期几
  let dayCycleArray=["日","一","二","三","四","五","六"]
  for(let i=0;i<7;i++){
    if(time.day == i){
      //将dayCycleArray的数赋值到系统星期几里面中去;
      time.day = '星期' + dayCycleArray[i];
    }
  }
  // // console.log(time)
  // console.log(wxContext.OPENID);
  // 从数据库中拿到现在的课表
  let res = await db.collection('user').where({
      _openid: wxContext.OPENID,
  }).get()
  // console.log(res);
  let kb = res.data[0].kb
  //一个排序方法
  let sortByWeekday = (fst, snd) => {
    if(d2n[fst.sjxqj] - d2n[snd.sjxqj] != 0) {
      return d2n[fst.sjxqj] - d2n[snd.sjxqj]
    } else {
      //同一天
      if( fst['qsjs'] > snd['qsjs'] ) {      
        return 1;    
      } else if( fst['qsjs'] < snd['qsjs'] ) {      
        return -1;    
      } else {      
        return 0;    
      }  
    }
  }
  //根据当天星期几的不同，排序规则变化
  let d2n
  switch ( TIME.getDay() ) {
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
  await kb.sort(sortByWeekday)

  // console.log(kb)
  //当前第一门课始终是正在进行的或下一门课
  let kb1 = []
  let kb2 = []
  //将今天的课和其他课分开
   kb.forEach( (item,index) => {
    if ( item.sjxqj == time.day) {
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
  if ( compareNum >= 800 && compareNum <=845 ){
    js = 1
  } else if ( compareNum >= 850 && compareNum <= 935 ) {
    js = 2
  } else if ( compareNum >= 936 && compareNum <= 1035 ) {
    js = 3
  } else if ( compareNum >= 1036 && compareNum <= 1125 ) {
    js = 4
  } else if ( compareNum >= 1126 && compareNum <= 1215 ) {
    js = 5
  } else if ( compareNum >= 1216 && compareNum <= 1445 ){
    js = 6
  } else if ( compareNum >= 1446 && compareNum <= 1535 ) {
    js = 7
  } else if ( compareNum >= 1536 && compareNum <= 1635 ) {
    js = 8
  } else if ( compareNum >= 1636 && compareNum <= 1725 ) {
    js = 9
  } else if ( compareNum >= 1726 && compareNum <= 1815 ) {
    js = 10
  } else if ( compareNum >= 1816 && compareNum <= 2015 ) {
    js = 11
  } else if ( compareNum >= 2016 && compareNum <= 2105 ) {
    js = 12
  } else if ( compareNum >= 2106 && compareNum <= 2155 ) {
    js = 13
  } else {
    js = 14
  }
   kb1.forEach( (item,index) => {
    if ( item.mwjs < js ) {
      kb3.push(item)
    } else {
      kb4.push(item)
    }
  })
  // console.log(kb3)
  // console.log(kb4)
  kb = kb4.concat(kb2).concat(kb3)

  // console.log(kb)
  return {
   time,
   kb
  }
}