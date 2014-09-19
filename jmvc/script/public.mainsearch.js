/**
 * Name        : mainsearch.js
 * Description : js for Public/mainsearch.html
 *
 * Create-time : 2012-8-14 18:14:09
 * Author      : ReadYun
 * Copyright   : VixiK
 * Version     : 1.0.00
 */

steal('init.js')
.then(function($){
    $.Controller('Ctrl.Public.Mainsearch.Init', {
        defaults : {
            models$       : {}                                     ,//页面总模型
            $ms_input     : $('input.search')                      ,//搜索输入
            $ms_submit    : $('#searchBtn>button.submit')          ,//搜索提交
            $ms_option    : $('#searchBtn>ul.dropdown-menu>li')     //搜索选项
        }
    }, {
        init : function(){
//            console.log('mainsearch') ;
        },

        "{$ms_submit} click" : function(el, ev){
            val = el.find('a').text() ;
            console.log(val) ;
        },

        "{$ms_option} click" : function(el, ev){
            val = el.attr('data-value') ;
            this.submitChange(val) ;
        },

        submitChange : function(data){
            submit_a = this.options.$ms_submit.find('a') ;
            submit_a.text(data) ;
        }
    }) ;

    $('#mainSearch').ctrl_public_mainsearch_init() ;

}) ;
