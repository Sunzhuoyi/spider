'use strict';

//引入模块
var http = require('http');
var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');

//爬虫的URL信息
var otp = {
	hostname:'localhost',
	path:'/douban.html',
	port:3000
};

//创建http get 请求
http.get(otp,function(res){
	var html = '';
	var movies = [];
	
	//设置编码
	res.setEncoding('utf-8');
	
	//抓取页面内容
	res.on('data',function (chunk) {
		html += chunk;
	});
	
	res.on('end',function () {
		
		var $ = cheerio.load(html);
		
		$('.item').each(function () {
			//获取图片链接
			var picUrl = $('.pic img', this).attr('src');
			var movie = {
				title:$('.title',this).text(),//获取电影名称
				star:$('.info .star em',this).text(),//获取电影评分
				link:$('a',this).attr('href'),//获取电影详情页链接
				picUrl:/^http/.test(picUrl) ? picUrl : 'http://localhost:3000' + picUrl//组装电影图片链接

			}
			movies.push(movie);
		});
		console.log(movies);
	});

}).on('error',function (err) {
	console.log(err);
});

//保存数据到本地
function saveData(path,movies) {
	fs.writeFile(path,JSON.stringify(movies,null,4),function (err) {
		if(err){
			return console.log(err);
		}
		console.log('Data saved');

	});
}
//下载图片
function downloadImg(imgDir,url) {
	http.get(url,function (res) {
		var data = '';
		res.setEncoding('binary');
		res.on('data',function (chunk) {
			data += chunk;
		});
		res.on('end',function () {
			fs.writeFile(imgDir + path.basename(url),data,'binary',function (err) {
				if (err){
					return console.log(err);
				}
				console.log('Image downloaded: ',path.basename(url));
			})
		})
	}).on('error',function (err) {
		console.log(err);
	});

}