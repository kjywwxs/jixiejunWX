// 云函数入口文件
const cloud = require('wx-server-sdk')
const axios = require('axios')
const cheerio = require('cheerio')
cloud.init()
  //获得名单的方法（老师用）
function mingdanGet(url,cookie) {
  let res = axios({
    method: 'get',
    url: url,
    headers: {
      'Cookie': cookie
    }
  })
  .then(res => {
    // console.log(res.data);
    let $ = cheerio.load(res.data)
    //md用来存放名单数据
    let md = []
     $('#table2 tr').each((index,item) => {
      let tr = $(item)
      if( index >= 1 ) {
         md.push({
           xuhao: tr.find("td").eq(0).text(),
           xuehao: tr.find("td").eq(1).text(),
           xingming: tr.find("td").eq(2).text(),
           xingbie: tr.find("td").eq(3).text(),
           banji: tr.find("td").eq(4).text()
         })
      }
    })
    return  md
  })
  .catch ( err => {
    console.log(err);
  })
  return  res
}

// 云函数入口函数
exports.main = async (event, context) => {
  //判断传递参数是否完全
  if(typeof(event.isStudent) == 'undefined') {
    return '兄弟你是老师还是学生？漏参数'
  }

  var url = 'http://jwc.swjtu.edu.cn/vatuu/CourseAction?setAction=userCourseSchedule&selectTableType=ThisTerm'
  var headers = {
		'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
		'Accept-Encoding': 'gzip, deflate',
		'Accept-Language': 'zh-CN,zh;q=0.9',
		'Connection': 'keep-alive',
		'Cookie': event.cookie,
		'Host': 'jwc.swjtu.edu.cn',
		'Referer': 'http://jwc.swjtu.edu.cn/vatuu/UserFramework',
		'Upgrade-Insecure-Requests': '1',
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36'
  }
  var html = await axios({
      method: 'get',
      url: url,
      headers: headers
    }).then(res => {
      // console.log(res.data);
      return res.data
    }).catch ( err => {
      console.log(err);
    })
  
  // console.log(html)
  var $ = cheerio.load(html);
  let userInfo = $('#userInfo').text().split(/\s+/)  
  // console.log(userInfo)

  // console.log($('#table3').text())
  //定义储存课表数组
  let kb = []
  //定义储存名单url数组
  let mdurl = []
  //表格tr个数，用于控制if
  let length = $('#table3 tr').length

  //根据老师页和学生页，执行不同的数据提取策略
  if (event.isStudent) {
  $('#table3 tr').each((index,item) => {

    if(index >= 1 && index <= length-2 ) {
    let tr = $(item)
    //上课时间地点
    let sksjdd = tr.find("td").eq(10).text()
    //\u5468为周的uniocde编码 ，以它为判据判断一周一节课以及是否是实习
    //kjs为课程节数，指一周上几次课
    let kjsArr = sksjdd.match(/[\u5468]/g)
    let kjs = kjsArr ? kjsArr.length : 0
    // if (kjsArr) {
    //   kjs = kjsArr.length
    // } else {
    //   kjs = 0
    // }
    // console.log(kjs)
    //其中一条课程对象courseInfo
    var courseInfo = {
      xuhao : tr.find("td").eq(0).text(),
      xueqi : tr.find("td").eq(1).text(),
      xkbh : tr.find("td").eq(2).text(),
      kcdm : tr.find("td").eq(3).text(),
      kcmc : tr.find("td").eq(4).text(),
      banhao : tr.find("td").eq(5).text(),
      kkxy : tr.find("td").eq(6).text(),
      rkls : tr.find("td").eq(7).text(),
      xuefen : tr.find("td").eq(8).text(),
      xingzhi : tr.find("td").eq(9).text(),
    }
    if (kjs == 1) {
    //时间 周数
    // console.log(sksjdd.substr(sksjdd.indexOf('周') - 10, 11).replace(/(^\s*)|(\s*$)/g, ''))
    courseInfo.sjzs = sksjdd.substr(sksjdd.indexOf('周') - 10, 11).replace(/(^\s*)|(\s*$)/g, '')
    //时间 星期几
    // console.log(sksjdd.substr(sksjdd.indexOf('周') + 2, 3))
    courseInfo.sjxqj = sksjdd.substr(sksjdd.indexOf('周') + 2, 3)
    //时间 节数
    // console.log(sksjdd.substr(sksjdd.indexOf('周') + 6, 4))
    courseInfo.sjjs = sksjdd.substr(sksjdd.indexOf('周') + 6, 10).replace(/(^\s*)|(\s*$)/g, '')
    //起始时间节数
    courseInfo.qsjs = courseInfo.sjjs.split('-')[0]
    //末尾时间节数
    courseInfo.mwjs = courseInfo.sjjs.split('-')[1].substr(0, courseInfo.sjjs.split('-')[1].length - 1)
    //地点
    // console.log(sksjdd.substr(sksjdd.indexOf('周') + 35, 20).replace(/(^\s*)|(\s*$)/g, ''))
    courseInfo.dd = sksjdd.substr(sksjdd.indexOf('周') + 30, 20).replace(/(^\s*)|(\s*$)/g, '')
    kb.push(courseInfo)
    } else if (kjs == 2) {
      let courseInfo1 = {
        xuhao : tr.find("td").eq(0).text(),
        xueqi : tr.find("td").eq(1).text(),
        xkbh : tr.find("td").eq(2).text(),
        kcdm : tr.find("td").eq(3).text(),
        kcmc : tr.find("td").eq(4).text(),
        banhao : tr.find("td").eq(5).text(),
        kkxy : tr.find("td").eq(6).text(),
        rkls : tr.find("td").eq(7).text(),
        xuefen : tr.find("td").eq(8).text(),
        xingzhi : tr.find("td").eq(9).text(),
      }
    //时间 周数
    // console.log(sksjdd.substr(sksjdd.indexOf('周') - 10, 11).replace(/(^\s*)|(\s*$)/g, ''))
    courseInfo1.sjzs = sksjdd.substr(sksjdd.indexOf('周') - 10, 11).replace(/(^\s*)|(\s*$)/g, '')
    //时间 星期几
    // console.log(sksjdd.substr(sksjdd.indexOf('周') + 2, 3))
    courseInfo1.sjxqj = sksjdd.substr(sksjdd.indexOf('周') + 2, 3)
    //时间 节数
    // console.log(sksjdd.substr(sksjdd.indexOf('周') + 6, 4))
    courseInfo1.sjjs = sksjdd.substr(sksjdd.indexOf('周') + 6, 10).replace(/(^\s*)|(\s*$)/g, '')
   //起始时间节数
    courseInfo1.qsjs = courseInfo1.sjjs.split('-')[0]
    //末尾时间节数
    courseInfo1.mwjs = courseInfo1.sjjs.split('-')[1].substr(0, courseInfo1.sjjs.split('-')[1].length - 1)
    //地点
    // console.log(sksjdd.substr(sksjdd.indexOf('周') + 35, 20).replace(/(^\s*)|(\s*$)/g, ''))
    courseInfo1.dd = sksjdd.substr(sksjdd.indexOf('周') + 30, 20).replace(/(^\s*)|(\s*$)/g, '')
   
    let courseInfo2 = {
      xuhao : tr.find("td").eq(0).text(),
      xueqi : tr.find("td").eq(1).text(),
      xkbh : tr.find("td").eq(2).text(),
      kcdm : tr.find("td").eq(3).text(),
      kcmc : tr.find("td").eq(4).text(),
      banhao : tr.find("td").eq(5).text(),
      kkxy : tr.find("td").eq(6).text(),
      rkls : tr.find("td").eq(7).text(),
      xuefen : tr.find("td").eq(8).text(),
      xingzhi : tr.find("td").eq(9).text(),
    }
    // console.log(sksjdd.substr(sksjdd.lastIndexOf('周') - 10, 11).replace(/(^\s*)|(\s*$)/g, ''))
    courseInfo2.sjzs = sksjdd.substr(sksjdd.lastIndexOf('周') - 10, 11).replace(/(^\s*)|(\s*$)/g, '')
    //时间 星期几
    // console.log(sksjdd.substr(sksjdd.lastIndexOf('周') + 2, 3))
    courseInfo2.sjxqj = sksjdd.substr(sksjdd.lastIndexOf('周') + 2, 3)
    //时间 节数
    // console.log(sksjdd.substr(sksjdd.lastIndexOf('周') + 6, 4))
    courseInfo2.sjjs = sksjdd.substr(sksjdd.lastIndexOf('周') + 6, 4)
    //起始时间节数
    courseInfo2.qsjs = courseInfo2.sjjs.split('-')[0]
    //末尾时间节数
    courseInfo2.mwjs = courseInfo2.sjjs.split('-')[1].substr(0, courseInfo2.sjjs.split('-')[1].length - 1)
    //地点
    // console.log(sksjdd.substr(sksjdd.lastIndexOf('周') + 35, 20).replace(/(^\s*)|(\s*$)/g, ''))
    courseInfo2.dd = sksjdd.substr(sksjdd.lastIndexOf('周') + 30, 20).replace(/(^\s*)|(\s*$)/g, '')

    kb.push(courseInfo1,courseInfo2)
    } else {}

  }

  })

  } else {

   $('#table3 tr').each((index,item) => {
      // console.log(length) 5
      if( index >= 1 ) {
      let tr = $(item)
      //上课时间地点
      let sksjdd = tr.find("td").eq(10).text()
      // console.log(sksjdd);
      //\u8282为节的uniocde编码 ，以它为判据判断一周一节课以及是否是实习
      //kjs为课程节数，指一周上几次课
      let kjsArr = sksjdd.match(/[\u8282]/g)
      // console.log(kjsArr)
      //kjs为课程节数，指一周上几次课
       let kjs = kjsArr ? kjsArr.length : 0
      //  if (kjsArr) {
      //     kjs = kjsArr.length
      //  } else {
      //     kjs = 0
      //  }
      // console.log(kjs)
      //其中一条课程对象courseInfo
      var courseInfo = {
        xuhao : tr.find("td").eq(0).text(),
        xueqi : tr.find("td").eq(1).text(),
        xkbh : tr.find("td").eq(2).text(),
        kcdm : tr.find("td").eq(3).text(),
        kcmc : tr.find("td").eq(4).text(),
        banhao : tr.find("td").eq(5).text(),
        kkxy : tr.find("td").eq(6).text(),
        rkls : tr.find("td").eq(7).text(),
        xuefen : tr.find("td").eq(8).text(),
        xingzhi : tr.find("td").eq(9).text(),
      }
      if ( kjs == 1) {
        //时间 周数
        // console.log(sksjdd.substr(sksjdd.indexOf('周') - 10, 11).replace(/(^\s*)|(\s*$)/g, ''))
        courseInfo.sjzs = sksjdd.substr(sksjdd.indexOf('周') - 10, 11).replace(/(^\s*)|(\s*$)/g, '')
        //时间 星期几
        // console.log(sksjdd.substr(sksjdd.indexOf('星期') , 3))
        courseInfo.sjxqj = sksjdd.substr(sksjdd.indexOf('星期') , 3)
        //时间 节数
        // console.log(sksjdd.substr(sksjdd.indexOf('周') + 6, 10).replace(/(^\s*)|(\s*$)/g, ''))
        courseInfo.sjjs = sksjdd.substr(sksjdd.indexOf('周') + 6, 10).replace(/(^\s*)|(\s*$)/g, '')
        //起始时间节数
        courseInfo.qsjs = courseInfo.sjjs.split('-')[0]
        //末尾时间节数
        // courseInfo.mwjs = courseInfo.sjjs.split('-')[1].substr(0, courseInfo.sjjs.split('-')[1].length - 1)
        if (courseInfo.sjjs.split('-')[1]) {
        courseInfo.mwjs = courseInfo.sjjs.split('-')[1].substr(0, courseInfo.sjjs.split('-')[1].length - 1)
        } else {
         courseInfo.mwjs = ''
        }
        //地点
        // console.log(sksjdd.substr(sksjdd.indexOf('节') +1 ).replace(/(^\s*)|(\s*$)/g, ''))
        courseInfo.dd = sksjdd.substr(sksjdd.indexOf('节') +1 ).replace(/(^\s*)|(\s*$)/g, '')

        //学生名单
          //名单请求url
        //  console.log(tr.find("td").eq(12)[0].children[7].attribs.href.replace('../', 'http://jwc.swjtu.edu.cn/')); 
        // mingdanGet( tr.find("td").eq(12)[0].children[7].attribs.href.replace('../', 'http://jwc.swjtu.edu.cn/'), event.cookie )
        //   .then( res => {
        //     courseInfo.mingdan = res
        //   })    
        mdurl.push(tr.find("td").eq(12)[0].children[7].attribs.href.replace('../', 'http://jwc.swjtu.edu.cn/'))

        kb.push(courseInfo)
      } else if ( kjs == 2) {
        let courseInfo1 = {
          xuhao : tr.find("td").eq(0).text(),
          xueqi : tr.find("td").eq(1).text(),
          xkbh : tr.find("td").eq(2).text(),
          kcdm : tr.find("td").eq(3).text(),
          kcmc : tr.find("td").eq(4).text(),
          banhao : tr.find("td").eq(5).text(),
          kkxy : tr.find("td").eq(6).text(),
          rkls : tr.find("td").eq(7).text(),
          xuefen : tr.find("td").eq(8).text(),
          xingzhi : tr.find("td").eq(9).text(),
        }
        //时间 周数
        // console.log(sksjdd.substr(sksjdd.indexOf('周') - 10, 11).replace(/(^\s*)|(\s*$)/g, ''))
        courseInfo1.sjzs = sksjdd.substr(sksjdd.indexOf('周') - 10, 11).replace(/(^\s*)|(\s*$)/g, '')
        //时间 星期几
        // console.log(sksjdd.substr(sksjdd.indexOf('星期') , 3))
        courseInfo1.sjxqj = sksjdd.substr(sksjdd.indexOf('星期') , 3)
        //时间 节数
        // console.log(sksjdd.substr(sksjdd.indexOf('周') + 6, 10).replace(/(^\s*)|(\s*$)/g, ''))
        courseInfo1.sjjs = sksjdd.substr(sksjdd.indexOf('周') + 6, 10).replace(/(^\s*)|(\s*$)/g, '')
        //起始时间节数
        courseInfo1.qsjs = courseInfo1.sjjs.split('-')[0]
        //末尾时间节数
        // courseInfo.mwjs = courseInfo.sjjs.split('-')[1].substr(0, courseInfo.sjjs.split('-')[1].length - 1)
        if (courseInfo1.sjjs.split('-')[1]) {
        courseInfo1.mwjs = courseInfo1.sjjs.split('-')[1].substr(0, courseInfo1.sjjs.split('-')[1].length - 1)
        } else {
         courseInfo1.mwjs = ''
        }
        //地点
        // console.log(sksjdd.substr(sksjdd.indexOf('节') +1 ,50))
        courseInfo1.dd = sksjdd.substr(sksjdd.indexOf('节') +1 ,50).replace(/(^\s*)|(\s*$)/g, '')

        let courseInfo2 = {
          xuhao : tr.find("td").eq(0).text(),
          xueqi : tr.find("td").eq(1).text(),
          xkbh : tr.find("td").eq(2).text(),
          kcdm : tr.find("td").eq(3).text(),
          kcmc : tr.find("td").eq(4).text(),
          banhao : tr.find("td").eq(5).text(),
          kkxy : tr.find("td").eq(6).text(),
          rkls : tr.find("td").eq(7).text(),
          xuefen : tr.find("td").eq(8).text(),
          xingzhi : tr.find("td").eq(9).text(),
        }
        //时间 周数
        // console.log(sksjdd.substr(sksjdd.indexOf('周') - 10, 11).replace(/(^\s*)|(\s*$)/g, ''))
        courseInfo2.sjzs = sksjdd.substr(sksjdd.lastIndexOf('周') - 10, 11).replace(/(^\s*)|(\s*$)/g, '')
        //时间 星期几
        // console.log(sksjdd.substr(sksjdd.indexOf('星期') , 3))
        courseInfo2.sjxqj = sksjdd.substr(sksjdd.lastIndexOf('星期') , 3)
        //时间 节数
        // console.log(sksjdd.substr(sksjdd.indexOf('周') + 6, 10).replace(/(^\s*)|(\s*$)/g, ''))
        courseInfo2.sjjs = sksjdd.substr(sksjdd.lastIndexOf('周') + 6, 10).replace(/(^\s*)|(\s*$)/g, '')
        //起始时间节数
        courseInfo2.qsjs = courseInfo2.sjjs.split('-')[0]
        //末尾时间节数
        // courseInfo.mwjs = courseInfo.sjjs.split('-')[1].substr(0, courseInfo.sjjs.split('-')[1].length - 1)
        if (courseInfo2.sjjs.split('-')[1]) {
        courseInfo2.mwjs = courseInfo2.sjjs.split('-')[1].substr(0, courseInfo2.sjjs.split('-')[1].length - 1)
        } else {
         courseInfo2.mwjs = ''
        }
        //地点
        // console.log(sksjdd.substr(sksjdd.indexOf('节') +1 ,50))
        courseInfo2.dd = sksjdd.substr(sksjdd.lastIndexOf('节') +1 ,50).replace(/(^\s*)|(\s*$)/g, '')

        // //名单获取
        // mingdanGet( tr.find("td").eq(12)[0].children[7].attribs.href.replace('../', 'http://jwc.swjtu.edu.cn/') , event.cookie ).then( res => {
        //   courseInfo1.mingdan = res
        //   courseInfo2.mingdan = res
        // }) 

        mdurl.push(tr.find("td").eq(12)[0].children[7].attribs.href.replace('../', 'http://jwc.swjtu.edu.cn/'))
        mdurl.push(tr.find("td").eq(12)[0].children[7].attribs.href.replace('../', 'http://jwc.swjtu.edu.cn/'))

        kb.push(courseInfo1,courseInfo2)
      } else {}

      }

    })
    //将名单添入
    // console.log(mdurl);
    // for(let i = 0 ; i < kb.length ; i++) {
    //   kb[i].mingdan = await mingdanGet( mdurl[i], event.cookie )
    // }
    await Promise.all([ 
      mingdanGet( mdurl[0], event.cookie) ,
      mingdanGet( mdurl[1], event.cookie) ,
      mingdanGet( mdurl[2], event.cookie) ,
      mingdanGet( mdurl[3], event.cookie) 
    ]).then((result) => {
      // console.log(result);
      for(let i = 0 ; i < result.length ; i++) {
          kb[i].mingdan = result[i]
       }
    })

  }
  // console.log(kb)

  return { kb, userInfo }
}

