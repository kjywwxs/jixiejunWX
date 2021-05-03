// 云函数入口文件
// const cloud = require('wx-server-sdk');
const cheerio = require('cheerio');
const axios = require('axios');

// cloud.init()

// 云函数入口函数
exports.main = async (event, context ) =>{
    var newDetail = {}; 
    var res1 = axios.get(event.url).then(res => {
    // console.log(res)
    var $ = cheerio.load(res.data);
    
    // 标题
    newDetail.title = $('.three_right .three_title').text();

    //时间，来源，作者，编辑
    // console.log($('.three_from').text().slice(0, -13).replace(/[(\r\n)\r\n]+/g,'a').replace(/\s/g,'').replace(/a/g,' '));
    newDetail.heard = $('.three_from').text().slice(0, -13).replace(/[(\r\n)\r\n]+/g,'a').replace(/\s/g,'').split('a');
    newDetail.heard.forEach((item,index)=>{
      if(!item){
        newDetail.heard.splice(index,1);//删除空项
      }
    })

    //  主体内容
    // //网页新闻有几页
    //  let pagesNumber;
    //   if($('.three_right p select').text()){
    //    pagesNumber = $('.three_right p select').text().substr($('.three_right p select').text().length - 12,1)
    //    }else{
    //    pagesNumber = 1
    //   }
    //   console.log(pagesNumber);

    //如果有style,删除它
    $('.three_content #ContentPlaceHolder1_lblContent .v_news_content style').remove()
    //如果有script,获取信息并删除它,同时插入video
    var script = $('.three_content #ContentPlaceHolder1_lblContent .v_news_content script')
    if (script.length != 0) {
      var vurl = script[0].attribs.vurl
      var vwidth = script[0].attribs.vwidth
      var vheight = script[0].attribs.vheight
      script.after('<video controls="" style="background-color:#474747;float:none" align="" width="'+ vwidth +'" height="' + vheight + '"><source src="' + vurl + '" type="video/mp4"></video>')
      script.remove()
      // console.log(script[0].attribs);
    }

     var html = $('.three_content #ContentPlaceHolder1_lblContent .v_news_content').html(); 
     html = html.replace(/src="/g, 'src="https://sme.swjtu.edu.cn');   
     newDetail.content = html
    //  console.log(html);

    //  console.log(newDetail)
     return newDetail;
   })
   .catch(err => {
     return err;
   })

    //阅读人数
    var parm = event.url.substring(event.url.lastIndexOf('/')+1, event.url.lastIndexOf('.'))//请求阅读人数时带的参数
    var res2 = await axios({
      method: 'get',
      url: 'https://sme.swjtu.edu.cn/system/resource/code/news/click/dynclicks.jsp?clickid='+parm+'&owner=1444057924&clicktype=wbnews',
      headers: {
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
        'Connection': 'keep-alive',
        'Host': 'sme.swjtu.edu.cn',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin'
      }
    })
    .then(res => {
    newDetail.readNumber = res.data;
    return newDetail;
    })
    .catch(err => {
      return err;
    })

    return await Object.assign(res1,res2);
}
