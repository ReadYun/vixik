
/**
 * Name        : user.index.ctrl.accout.js
 * Description : js for user/index.html
 *
 * Create-time : 2013-6-13, 4:18:17
 * Author      : ReadYun
 * Copyright   : VixiK
 * Version     : 1.0.00
 */

steal('init.js')
.then(function($){
    loadPlugin('vkPaging') ;
}) 
.then(function($){

    /*
     * 我的资料模块控制器
     *
     **/
    $.Controller('User.Index.Ctrl.Accout', {
        defaults : {
            models$   : {}                ,// 页面总模型
            $scoreLog : $('#score-log')   ,// 积分日志DOM
            $coinsLog : $('#coins-log')   ,// 金币日志DOM
        }
    }, {
        init : function(){
        },
        
        "{models$} log_score" : function(){
            this.user_log(this.options.$scoreLog, this.options.models$.log$.score, 'score') ;
        },
        "{models$} log_coins" : function(){
            this.user_log(this.options.$coinsLog, this.options.models$.log$.coins, 'coins') ;
        },

        // 用户日志处理
        user_log : function(logBox$, data$, type){
            var action$ = [] ;

            for(i = 0; i < data$.length; i++){
                action$[i]             = {} ;
                action$[i].action_time = data$[i].action_time ;
                action$[i].action_name = data$[i].action_name ;
                action$[i].action_desc = data$[i].action_desc ;
                action$[i].action_url  = data$[i].action_url ;

                if(data$[i].change_value > 0){
                    action$[i].change_type = '获得' ;
                }else{
                    action$[i].change_type = '消耗' ;
                }
                action$[i].change_value = Math.abs(data$[i].change_value) ;
            }

            this.paging(logBox$, action$, __JMVC_VIEW__ + 'user.index.action.log.ejs') ;
        },

        // 分页功能
        paging : function($box, data$, view){
            if($box.find('.vkpaging').size()){
                var $vkpaging = $box.find('.vkpaging') ;
            }else{
                var $vkpaging = $box.addClass('vkpaging') ;
            }

            // 调用分页插件功能
            if(data$ && data$.length){
                $vkpaging.addClass('active').vkPaging({
                    data$     : data$        ,// 要分页的源数据
                    $pagBody  : $vkpaging.find('.vkpaging-body')  ,// 分页内容的容器
                    $pagNav   : $vkpaging.find('.vkpaging-nav')   ,// 分页内容的导航
                    view_list : view         ,// 列表模板路径
                    num_list  : 10           ,// 每页数据量
                    num_nav   : 10           ,// 导航分页数
                }) ;
            }else{
                $vkpaging.removeClass('active') ;
            }
        },
    }) ;

}) ;