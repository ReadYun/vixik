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
    loadPlugin('tagit') ;  // 加载所需插件
})
.then(function($){

    /*
     * 页面总控制器
     *
     **/
    $.Controller('Lab.Vktest.Main', {
        defaults : {
            models$ : {}  ,//模型实例
            $item   : {}   //选项父元素对应题目对象DOM
        }
    }, {
        init : function(){
        	console.log('Lab.Vktest.Main') ;


        	$("#myTags").tagit({
        		availableTags : ["c++", "java", "php", "javascript", "ruby", "python", "c"],
        		tagLimit : 5,
        		onTagLimitExceeded : function(){
        			alert('xxxxx') ;
        		},
        	}) ;

        },

        "button click" : function(){
        	console.log('click') ;




        	console.log($('#myTags').tagit("assignedTags")) ;
        },
    }) ;

    $('#Main').lab_vktest_main() ;
}) ;
