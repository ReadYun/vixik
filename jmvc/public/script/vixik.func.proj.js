
/**
 * Name        : vixik.func.proj.js
 * Description : VixiK项目函数
 *
 * Create-time : 2013-11-13, 4:18:17
 * Author      : ReadYun
 * Copyright   : VixiK
 * Version     : 1.0.00
 */

(function($){
	var methods = {

		//获取目标对应URL地址
		get_url : function(option$){
			var default$ = {
				name : ''  ,//要解析的URL名称(如：'survey/create')
				tail : ''  ,//URL尾部连接字符串
				open : ''  ,//获取页面方式(cur/new/null)
			} ;
			var option$ = $.extend(default$, option$ || {}) ;    //合并自定义配置
			var url ;

			if(option$.name){
				//获取服务器对应的行为URL接口
	            $.ajax({
	                type    : 'post',
	                url     : __API_GET_SERVER_URL__,
	                data    : {name:option$.name},
	                async   : false,
	                success : function(data$){
	                    url = data$.data + option$.tail ;
	                }
	            });
	            
	            switch(option$.open){
	            	case 'cur' :  //当前页面打开URL
	                    window.location.href = url ;
	            		break ;

	            	case 'new' :  //新窗口打开URL
	                    window.open(url) ;
	            		break ;

	            	default :  //默认直接返回URL
	                    return url ;
	            		break ;
	            }
			}else{
				return false ;
			}
		},

		// //更新表单元素对象的选项
		// replace : function(data$){
		// 	var type  = this.find('input, select').attr('type') ;
		// 	var i , $tpl_option , $new_option , $target , init_val ;

		// 	$tpl_option = this.find('.tpl') ;
		// 	$target = $tpl_option.parent() ;
		// 	$target.children().not('.init, .tpl').remove() ;
		// 	$target.append($tpl_option) ;

		// 	//倒序插入数据元素
		// 	for(i = 0; i < data$.length; i ++){
		// 		$new_option = $tpl_option.clone() ; 
		// 		$new_option.find('input, select').attr('value', data$[i].value) ;
		// 		$new_option.append(data$[i].tag).removeClass('tpl').show() ;
		// 		$target.append($new_option) ;
		// 	} ;
			
		// 	if(type === 'select'){
		// 		init_val = this.find('option.init').show().val() ;
		// 		this.attr('value', init_val) ;
		// 	}
		// }
	} ;

	//定义命名空间vixik直接调用方法
	$.vixik = function(method, data){
    	if (methods[method]) {  
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1)) ;

			}else if(typeof method === 'object' || !method) {  
				return methods.init.apply(this, arguments) ;  
			}else {  
				$.error('方法 ' +  method + ' 不存在！') ;  
		}  
	}
})(jQuery) ;
