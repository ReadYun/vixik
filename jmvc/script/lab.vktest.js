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
    loadPlugin('tagit', 'Headroom') ;  // 加载所需插件
})
.then(function($){

    // setTimeout(function(){
    //     var header = new Headroom(document.querySelector("#Header"), {
    //         tolerance: 5,
    //         offset : 0,
    //         classes: {
    //           initial: "animated",
    //           pinned: "slideDown",
    //           unpinned: "slideUp"
    //         }
    //     });
    //     header.init();
    // }, 1000) ;

    // $('#Header').headroom() ;

    /*
     * 页面总控制器
     *
     **/
    $.Controller('Lab.Vktest.Header', {
        defaults : {
            models$ : {}  ,//模型实例
            $item   : {}   //选项父元素对应题目对象DOM
        }
    }, {
        init : function(){
            window.scrollTo(0, 0) ;
            var $this = this ;
            var scroll = $(window).scrollTop() ;

            $(window).scroll(function(event) {
                if(Math.abs(scroll - $(window).scrollTop()) > 10){
                    if($(window).scrollTop() - scroll > 0){
                        // 下拉
                        console.log('下') ;
                        $this.element.slideUp() ;
                        // $this.element.fadeOut() ;
                    }else{
                        // 上拉
                        console.log('上') ;
                        $this.element.slideDown() ;
                        // $this.element.fadeIn() ;
                    }
                    scroll = $(window).scrollTop() ;
                }
            });


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

    $('#Header').lab_vktest_header() ;
}) ;
