/**
 * Name        : test.index.js
 * Description : js for Public/mainsearch.html
 *
 * Create-time : 2012-8-14 18:14:09
 * Author      : ReadYun
 * Copyright   : VixiK
 * Version     : 1.0.00
 */

steal('init.js')
.then(function($){

    /*
     * 页面总控制器
     *
     **/
    $.Controller('Lab.Index.Init', {
        defaults : {
            models$ : {}  ,//模型实例
            $item   : {}   //选项父元素对应题目对象DOM
        }
    }, {
        init : function(){
        	console.log('Lab.Index.Init') ;
        },

        "div.vk-lab-elem click" : function(el){
        	var href = el.attr('data-href') ;

            $.post(
                __API_GET_SERVER_URL__, 
                {name:'/lab'},function(data){
                	if(data.status){
                    	window.location.href = data.data + '/' + href ;
                	}
                }
            ) ;
        }
    }) ;

    $('#Main').lab_index_init() ;
}) ;
