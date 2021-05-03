// 云函数入口文件
const cloud = require('wx-server-sdk')
const cheerio = require('cheerio')
const axios = require('axios')
cloud.init()
const HOST = 'https://sme.swjtu.edu.cn/ssjgy.jsp'
const HOST2 = 'https://sme.swjtu.edu.cn/'
// 云函数入口函数
exports.main = async (event, context) => {
  // console.log(event.pages)
   var res = axios.get(HOST, {
     params: {
       // a203627t:23,//总共几页，非必须
       a203627p: Number(event.pages),//首页页码
      //  a203627c: 15,//一页几个？貌似非必须
       a203627i: event.keywords,//搜索的关键字，必须
       wbtreeid:1094,//不知道是啥，必须
      //  Find: find,//不知道是啥，非必须 
      //  entrymode: 1,//不知道是啥，非必须 
      //  INTEXT2: '5pWZ5a2m' ,//不知道是啥，非必须 
      //  news_search_code:'',//不知道是啥，非必须 
      //  condition: 0,//不知道是啥，非必须 
      //  INTEXT:''//不知道是啥，非必须 
     }
   }).then (res => {
     // console.log(res.data)
     let $ = cheerio.load(res.data);
     //news1为存放标题，链接的数组对象
     let news1 = []
     $('#form1 .middle .page_width .seclist li a').each((index, item) => {
    let title = $(item).attr('title')
    let str = $(item).attr('href')
    let href = HOST2 + str
    news1.push({title,href})
  })
     //news2为存放时间，总标题，类别的数组对象
     let news2 = []
    //  console.log($('#form1 .middle .page_width .seclist li').text().split(/[(\r\n)\r\n]+/))//英文括号也会被认为是回车
    $('#form1 .middle .page_width .seclist li').text().split(/[\r\n]+/).forEach((item, index) => {
    var titleAll = item.replace(/^\s*|\s*$/g,"").replace(/\s*/g,"")
    news2.push({titleAll})
  })
     news2.forEach((item,index) => {
    if(!item.titleAll){
      news2.splice(index,1);//删除空项
    } 
  })
     news2.forEach((item, index) => {
    item.time = item.titleAll.substr(-10)//时间
    item.type = item.titleAll.substring( item.titleAll.indexOf('【'), item.titleAll.indexOf('】') )//类别
  })
     //合并两个数组对象
     var news = news1.map((item,index) => {
    return {...item, ...news2[index]};
  })
     //获取总页数
     let allStr = $('#form1 .page_width table tbody tr td table tbody tr td table tbody tr td').eq(0).text();
     let allPages = allStr.substr(allStr.lastIndexOf('/') + 1)

     news.push(allPages)
    //  console.log(news)
     return news
   }).catch (err => {
     return err
   })
// console.log(res)
 return res
}
