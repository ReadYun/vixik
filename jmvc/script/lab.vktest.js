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
    loadPlugin('jQCloud') ;  // 加载所需插件
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

          var word_list = [
            {text: "Lorem", weight: 13, link: "https://github.com/DukeLeNoir/jQCloud"},
            {text: "Ipsum", weight: 10.5, html: {title: "My Title", "class": "custom-class"}, link: {href: "http://jquery.com/", target: "_blank"}},
            {text: "Dolor", weight: 9.4},
            {text: "Sit", weight: 8},
            {text: "Amet", weight: 6.2},
            {text: "Consectetur", weight: 5},
            {text: "Adipiscing", weight: 5},
            {text: "Elit", weight: 5},
            {text: "Nam et", weight: 5},
            {text: "Leo", weight: 4},
            {text: "Sapien", weight: 4},
            {text: "Pellentesque", weight: 3},
            {text: "habitant", weight: 3},
            {text: "morbi", weight: 3},
            {text: "tristisque", weight: 3},
            {text: "senectus", weight: 3},
            {text: "et netus", weight: 3},
            {text: "et malesuada", weight: 3},
            {text: "fames", weight: 2},
            {text: "ac turpis", weight: 2},
            {text: "egestas", weight: 2},
            {text: "Aenean", weight: 2},
            {text: "vestibulum", weight: 2},
            {text: "elit", weight: 2},
            {text: "sit amet", weight: 2},
            {text: "metus", weight: 2},
            {text: "adipiscing", weight: 2},
            {text: "ut ultrices", weight: 2},
            {text: "justo", weight: 1},
            {text: "dictum", weight: 1},
            {text: "Ut et leo", weight: 1},
            {text: "metus", weight: 1},
            {text: "at molestie", weight: 1},
            {text: "purus", weight: 1},
            {text: "Curabitur", weight: 1},
            {text: "diam", weight: 1},
            {text: "dui", weight: 1},
            {text: "ullamcorper", weight: 1},
            {text: "id vuluptate ut", weight: 1},
            {text: "mattis", weight: 1},
            {text: "et nulla", weight: 1},
            {text: "Sed", weight: 1}
          ];

          console.log($("#my_favorite_latin_words")) ;
          console.log(word_list) ;
            $("#my_favorite_latin_words").jQCloud(word_list);

        },

        "button click" : function(){
        	console.log('click') ;




        	console.log($('#myTags').tagit("assignedTags")) ;
        },
    }) ;

    $('#Main').lab_vktest_main() ;
}) ;
