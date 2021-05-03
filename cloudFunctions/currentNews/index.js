// 云函数入口文件
//定时获取新闻数据填入数据库
const cloud = require('wx-server-sdk')
const cheerio = require('cheerio');
const axios = require('axios');

cloud.init()
//数据库
const db = cloud.database()
const _ = db.command

const HOST = 'https://sme.swjtu.edu.cn/'
const urlArr = ['xwtz/xyxw.htm','xwtz/xsky.htm','xwtz/dzbg.htm','xwtz/bkjx.htm','xwtz/yjsjx1.htm','xwtz/xsgz.htm','xwtz/zsjy.htm','xwtz/pxzx.htm']

exports.main = async(event, context) => {
  var currentNews = []
  for(let j = 0,len=urlArr.length; j < len; j++) {  
     currentNews[j] = await axios.get( HOST + urlArr[j]).then(res => {
    // console.log(res.data)
    var news = [];
    var $ = cheerio.load(res.data);
      $('#form1 .three_right ul li a').each((index,item) => {
          let title = $(item).attr('title');
          let str = $(item).attr('href');
          str = str.substring(str.lastIndexOf('.', str.lastIndexOf('.') - 1) + 2)
          let href = HOST + str;
          let time =  $('form .three_right ul #line_u8_'+index).text().substr( $('form .three_right ul #line_u8_'+index).text().length - 10, 10) ;
         news.push({title,href,time})
      })
      //获取总页数和新闻条数
      let a = $('#form1 #fanye202313').html();
      //总条数
      let rowCount = a.substring(a.indexOf('共') + 1, a.indexOf('条'))
      let allPages = Math.ceil(rowCount/15)
      news.push (allPages)
     return news
   }).catch(err => {
     return err;
   })
  }

   //获取时间
   var TIME = new Date();

   console.log(currentNews);
   return await db.collection('currentNews').add({
    data: {
      TIME,
      currentNews
    }
   })

}

