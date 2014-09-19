/**
 * Name        : plugin.js
 * Description : 核心插件加载配置
 *
 * Create-time : 2012-12-18 18:14:09
 * Author      : ReadYun
 * Copyright   : VixiK
 * Version     : 1.0.00
 */

//必须加载的插件
steal('./json/json.js',        //JSON处理插件
      './cookie/cookie.js',    //cookie处理插件
      './moment/moment.js'     //日期插件
) ;

/* ======================== 已包含的自助插件配置 · 外部插件 ========================= */

//日期处理插件（倒计时）
var countdown = [
		"countdown.min.js"    //插件主文件（已编译）
	] ;

//图表插件：Chart
var chart = [
		"chart.min.js"    //插件主文件（已编译）
	] ;

//表单美化插件：jqtransform
//此插件源码是基于jQuery1.2.6版本，主文件中的很多方法已经被jQuery1.9及以上版本废弃（如$.browser）
//因为使用中的报错有机会了解jQuery1.9+版本更新差异，现降级回到jQuery1.8.3。。以后如果要升级jQuery版本，需要改造此插件
var jqtransform = [
		"jqtransform.js",   //插件主文件
		"jqtransform.css",  //插件样式文件
	] ;

//Bootstrap 开关（switch）控件
var bswitch = [
		"bswitch.js",           //插件主文件
		"bswitch.css"          	//插件样式文件
		// "flat-ui-fonts.css"    //flat-ui样式
	] ;

//Font Awesome图标字体
var fontAwesome = [
		"font-awesome.min.css"   //字体主文件
	] ;

//Jcrop 图像裁剪插件
var Jcrop = [
		"jquery.Jcrop.min.js",   //插件主文件
		"jquery.Jcrop.min.css"   //插件样式文件
	] ;

//Uploadify jQuery上传插件
var uploadify = [
		"uploadify.min.js",  //插件主文件
		"uploadify.css"      //插件样式文件
	] ;

//jQueryFormPlugin 将以HTML形式提交的表单升级成采用AJAX技术提交的表单，还包括各种表单方法
var jqueryform = [
		"jquery.form.min.js"  //插件主文件
	] ;

//于jQuery开发的网页弹出层插件
var thinkbox = [
		"thinkbox.js",     //插件主文件
		"thinkbox.css"     //插件样式文件
	] ;

//VixiK表单插件
var iCheck = [
		"jquery.icheck.min.js",     //插件主文件
		"skins/minimal/_all.css",   //皮肤样式
	] ;

//VixiK表单插件
var bsDatetimepicker = [
		"js/bootstrap-datetimepicker.min.js",    //插件主文件
		"js/bootstrap-datetimepicker.zh-CN.js",  //插件语言文件zh-CN
		"css/datetimepicker.css",                //插件样式文件
	] ;

//VixiK表单插件
var pin = [
		"jquery.pin.min.js",    //插件主JS文件
	] ;

/* ======================== 已包含的自助插件配置 · 项目插件 ========================= */

//VIVIK分页插件：vkpaging
//不能独立使用。。只能JavascriptMVC架构环境下使用
var vkPaging = [
		"vkPaging.js"    ,//插件主文件
		"vkPaging.css"   ,//插件样式文件
	] ;

//用于调用ECharts图表库的插件
var vkChart = [
		"vkChart.js"    //插件主文件
	] ;

//VixiK图表插件vhighChart（此函数需要依赖图表库HighCharts）
var vkHighChart = [
		"vkHighChart.js"    //插件主文件
	] ;

//VixiK表单插件
var vkForm = [
		"vkForm.js"     ,//插件JS文件
		"vkForm.css"    ,//插件样式文件
	] ;

//VixiK数组插件
var vkData = [
		"vkData.js"     //插件主文件
	] ;

/* ================================================= *
 *
 * Function Name : loadPlugin
 * Description   : 自助加载插件函数
 * Param         : para_arguments  任意数量插件名称参数（插件名称需提前配置好）
 *
 * ================================================= */
function loadPlugin(para_arguments){
	var para , arr , file , eval_str ;

	//遍历参数列表
	for(var i = 0; i < arguments.length; i++){
		para = arguments[i] ;
		
		if(para){
			//定义以插件文件路径常量
			eval_str = "__PLUGIN_" + para.toUpperCase() + "__ = __JMVC_PLUGIN__ + '" + para + "/'" ;
			eval(eval_str) ;

			//取参数名称对应的插件文件下文件名称
			eval_str = "arr = " + para ;
			eval(eval_str) ;

			//遍历插件包含的文件名称
			for(var n = 0; n < arr.length; n++){
				//引入插件相关文件
				file = __JMVC_PLUGIN__ + para + '/' + arr[n] ;
				steal(file) ;
			}
		}else{

		}
	}
}
