
/**
 * Name        : vixik-ui-1.0.custom.js
 * Description : VixiK专用UI插件
 *
 * Create-time : 2012-8-24 22:24:17
 * Author      : ReadYun
 * Copyright   : VixiK
 * Version     : 1.0.00
 */

/* ================================================= *
 *
 * Plugins Name : vTabs()
 * Description  : 选项卡插件
 * Create date  : 2012-8-24
 * Version      : 1.0.0
 *
 * ================================================= */

 ;(function($){
    $.fn.extend({
        vTabs:function(options){
            // 处理参数
            options = $.extend({
                event : 'mouseover',
                timeout : 0,
                auto : 0,
                callback : null
            },options) ;
            var self = $(this),
                tabBox = self.children('div.tab_box').children('div'),
                menu = self.children('ul.tab_menu'),
                items = menu.find('li'),
                timer ;
            var tabHandle = function(elem){
                elem.siblings('li')
                    .removeClass('current')
                    .end()
                    .addClass('current') ;

                tabBox.siblings('div')
                      .addClass('hide')
                      .end()
                      .eq(elem.index())
                      .removeClass('hide') ;
                },
                delay = function(elem,time){
                    time ? setTimeout(function(){
                        tabHandle(elem) ;
                    },time) : tabHandle(elem) ;
                },
                start = function(){
                        if(!options.auto) return ;
                        timer = setInterval(autoRun,options.auto) ;
                },
                autoRun = function(){
                var current = menu.find('li.current'),
                    firstItem = items.eq(0),
                    len = items.length,
                    index = current.index() + 1,
                    item = index === len ? firstItem : current.next('li'),
                    i = index === len ? 0 : index ;

                current.removeClass('current') ;
                item.addClass('current') ;

                tabBox.siblings('div')
                      .addClass('hide')
                      .end()
                      .eq(i)
                      .removeClass('hide') ;
                } ;

                items.bind(options.event,function(){
                    delay($(this),options.timeout) ;
                    if(options.callback){
                        options.callback(self) ;
                    }
                }) ;

                if(options.auto){
                    start() ;
                    self.hover(function(){
                        clearInterval(timer) ;
                        timer = undefined ;
                    },function(){
                        start() ;
                    }) ;
                }

                return this ;
        }
    }) ;
})(jQuery) ;