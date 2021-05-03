const cloud = require('wx-server-sdk')
const axios = require('axios');
const cheerio = require('cheerio');
cloud.init()

//数据库
const db = cloud.database()
const _ = db.command

const HOST = 'https://sme.swjtu.edu.cn/'
const urlArr = ['xwtz/xyxw.htm', 'xwtz/xsky.htm', 'xwtz/dzbg.htm', 'xwtz/bkjx.htm', 'xwtz/yjsjx1.htm', 'xwtz/xsgz.htm', 'xwtz/zsjy.htm', 'xwtz/pxzx.htm']
exports.main = async (event, context) => {
  let pageCount = 15 //一页15条信息 
  //判断是否是第一页
  let url = ''
  if (event.pages) {
    let str = urlArr[event.urlIndex].split('.');
    url = HOST + str[0] + '/' + (event.allPages - event.pages) + '.' + str[1]
    console.log(url);
  } else {
    url = HOST + urlArr[event.urlIndex]
  }

  var res = await axios.get(url).then((body) => {
    // console.log(body)
    var news = [];
    var $ = cheerio.load(body.data);
    //获取总页数和新闻条数
    let a = $('#form1 #fanye202313').html();
    //总条数
    let rowCount = a.substring(a.indexOf('共') + 1, a.indexOf('条'))
    let allPages = Math.ceil(rowCount / pageCount)
    //只是个参数
    let start = (pageCount - rowCount % pageCount) % pageCount

    $('#form1 .three_right ul li').each((index, item) => {
      if (event.pages) {
        // 中间几页或最后一页
        if ((event.allPages - event.pages) != 1) {
          //中间几页
          // console.log('中间几页');
          // news.splice(0, start)
          // news.splice(15, 28)
          // news = news.slice(start, start + 15)
          if (index < start || index >= start + 15) {
            return true
          }
        } else {
          //最后一页
          // console.log('最后页');
          // news.splice(0, start)
          if (index < start) {
            return true
          }
        }
      }
      // 对应条数display:none;是由网页js完成的
      // if ($(item).attr('style') == 'display:none;' ) {
      //   console.log('没有');
      //   return true;
      // }
      // a为a标签节点
      let a = $(item).children('a')
      // console.log(a);
      let title = a.attr('title');
      let str = a.attr('href');
      str = str.substring(str.lastIndexOf('.', str.lastIndexOf('.') - 1) + 2)
      let href = HOST + str;
      // console.log(a[0].next.data);
      let time = a[0].next.data

      news.push({
        title,
        href,
        time
      })
    })

    news.push(allPages)
    return news
  }).catch(err => {
    return err;
  })
  return res
}