/**
 * Name        : survey.type.js
 * Description : js for survey/type.html
 *
 * Create-time : 2012-9-26
 * Author      : ReadYun
 * Copyright   : VixiK
 * Version     : 1.0.00
 */

steal('init.js')
.then('script/public.header.js')
.then(function($){  
    loadPlugin('vkData', 'jQCloud') ;  // 加载所需插件
})
.then(function($){

    /*
     * 页面总模型
     *
     **/
    $.Model('Survey.Trade.Model', {
        defaults : {
            dataAction$ : {}  ,// 参与问卷用户统计数据
            dataArea$   : {}   // 用户来源统计数据
        }
    }, {
        init : function(){
        },

        // 手动触发模型更新事件
        trigger : function(prop){    
            eval("this.attr('" + prop + "', Math.random())") ;
        },

        get_data : function(data$){
            var trigger, 
                $this = this,
                api$  = $.extend({api:'search_survey'}, data$ || {}) ;

            // 访问问卷参与情况统计接口
            $.ajax({
                type    : 'post',
                url     : __API__, 
                data    : api$,
                success : function(data$){
                    if(data$.status){
                        $this.data$ = data$.data ;    // 搜索数据
                        $this.trigger('list_more') ;
                    }else{
                        console.log('没有符合条件的数据。。') ;
                        $this.trigger('list_no') ;
                    }
                }
            });
        },
    }) ;

    /*
     * 调查列表模块控制器
     *
     **/
    $.Controller('Survey.Trade.Ctrl.List', {
        defaults : {
            models$ : {}                       ,// 页面总模型
            $button : $('button.survey-more')  ,// 加载更多调查按钮
        }
    }, {
        init : function(){
            this.list_more() ;
        },

        "{models$} list_more" : function(){
            this.survey_list(this.options.models$.data$) ;
        },

        list_more : function(){
            var data$ = {} ;

            data$.page   = parseInt(this.element.attr('data-page')) ;
            data$.pnum   = parseInt(this.element.attr('data-pnum')) ;
            data$.filter = "survey_state in(3,4) and survey_trade = " + this.options.models$.sv_trade ;

            switch(this.options.models$.sv_mode){
                case 'new' :
                    data$.order = "survey_state, start_time desc, recomm_grade, answer_num" ;
                    break ;

                case 'hot' :
                    data$.order = "survey_state, answer_num desc, start_time, recomm_grade" ;
                    break ;

                case 'rec' :
                    data$.order = "survey_state, recomm_grade, start_time desc, answer_num" ;
                    break ;
            }

            this.options.models$.get_data(data$) ;
        },

        // 调查列表
        survey_list : function(data$){
            var $this = this,
                list$ = data$.list,
                next$ = data$.next,
                page  = data$.page ;

            for(var i = 0; i < list$.length; i++){
                if(parseInt(list$[i].user_photo)){
                    list$[i].user_photo = __JMVC_IMG__ + 'user/' + list$[i].user_code + '_60.jpg' ;
                }else{
                    list$[i].user_photo = __JMVC_IMG__ + 'user/user.jpg' ;
                }
            }

            // 题目状态列表栏生成
            $this.element.attr('data-page', parseInt(page) + 1).find('.sv-list-body').append(
                __JMVC_VIEW__ + 'search.list.survey.ejs',  // 题目状态列表模板路径
                {data: list$}                              // 调用快速序列生成满足题目数量序列
            ) ;

            if(!next$.length){
                $this.element.find('.sv-list-footer').hide() ;
            }
        },

        // 点击加载更多调查按钮
        "{$button} click" : function(el){
        	if(!el.hasClass('disabled')){
            	this.survey_list() ;
        	}
        },
    }) ;

    /*
     * 页面总控制器
     *
     **/
    $.Controller('Survey.Trade.Ctrl.Main', {
        defaults : {
            models$     : {}                ,// 页面总模型
            $surveyList : $('#surveyList')  ,// 调查列表

        }
    }, {
        init : function(){
            var $this = this ;

            // 新建模型实例并初始化
            this.options.models$ = new Survey.Trade.Model({
	            sv_trade : this.element.attr('data-trade') ,// 调查行业
	            sv_mode  : this.element.attr('data-mode')  ,// 查询模式
            }) ;

            // 调查列表模块控制器
            this.options.$surveyList.survey_trade_ctrl_list({    
                models$ : this.options.models$,
                $main   : this.element,
            }) ;

            this.element.find('.sh-main>img').attr('src', __JMVC_IMG__ + 'svtrade/' + this.element.attr('data-trade') + '.jpg') ;

            // 调查类型和模式显示定位
            this.element.find(".st-sub[data-type='" + this.options.models$.sv_type + "']").addClass('active') ;
            this.element.find(".sv-mode[data-mode='" + this.options.models$.sv_mode + "']").addClass('active') ;

            // 热门行业显示初始化
            this.element.find('.type-hot .th-elem').each(function(){
                $(this).find('img').attr('src', __JMVC_IMG__ + 'svtype/' + $(this).attr('data-code') + '.jpg') ;
            }) ;

            // 活跃用户排行榜显示初始化
            $this.element.find('.rank-elem').each(function(){
                if($(this).attr('data-photo')){
                    $(this).find('img').attr('src', __JMVC_IMG__ + 'user/' + $(this).attr('data-code') + '.jpg') ;
                }else{
                    $(this).find('img').attr('src', __JMVC_IMG__ + 'user/user.jpg') ;
                }
            }) ;

            $this.tag_hot() ;
            $this.trade_follow() ;
            $('body').show() ;
        },

        // 总模型用户信息更新
        "{vixik$} user" : function(){
            this.trade_follow() ;
        },

        // 鼠标进入用户头像打开用户信息菜单
        "#switchBox mouseover" : function(el){
            el.addClass('open') ;
        },

        "#switchBox mouseout" : function(el){
            el.removeClass('open') ;
        },

        // 切换调查行业
        ".switch-trade-elem click" : function(el){
            $.post(__API__, {api:'get_server_url', name:'survey/trade'}, 
                function(data$){
                    if(data$.status){
                        window.location.href = data$.data + '?trade=' + el.attr('data-trade') ;
                    }
                }
            ) ;
        },

        // 调查行业关注与取消关注
        ".follow-button>button click" : function(el){
            var $this = this,
                $desc = el.parents('.sv-trade-follow').find('.follow-desc'),
                api$  = $.extend({api:'user_follow_svprop_update'}, {}) ;

            if(vixik$.user_verify({trigger$:{false:['login_open']}})){
                api$.update_type  = el.attr('data-action') ;
                api$.user_code    = vixik$.user$.user_code ;
                api$.svprop_type  = 'survey_trade' ;
                api$.svprop_value = $this.options.models$.sv_trade ;

                // 访问接口更新关注状态
                $.post(__API__, api$, 
                    function(data$){
                        if(data$.status){
                            // 更新成功后处理
                            switch(el.attr('data-action')){
                                case 'add' :
                                    el.parent().removeClass('unfollow').addClass('followed') ;
                                    $desc.find('span').text(parseInt($desc.find('span').text()) + 1) ;
                                    break ;

                                case 'del' :
                                    el.parent().removeClass('followed').addClass('unfollow') ;
                                    $desc.find('span').text(parseInt($desc.find('span').text()) - 1) ;
                                    break ;
                            }
                            
                        }
                    }
                ) ;
            }
        },

        // 切换调查模式
        ".sv-mode click" : function(el){
            if(!el.hasClass('active')){
                var mode = el.attr('data-mode'),
                    type = this.element.find('.st-sub.active').attr('data-type') ;

                $.post(__API__, {api:'get_server_url', name:'survey/type'}, 
                    function(data$){
                        if(data$.status){
                            window.location.href = data$.data + '?type=' + type + '&mode=' + mode ;
                        }
                    }
                ) ;
            }
        },

        // 创建或参与该行业调查
        ".action-now>button click" : function(el){
            var str,
                type = this.element.find('.st-sub.active').attr('data-type') ;

            switch(type.length){
                case 4 :
                    str = '?type=' + type ;
                    break ;
                case 5 :
                    str = '?type=' + this.element.find('.st-sub.all').attr('data-type') + '&typesub=' + type ;
                    break ;
            }

            $.post(__API__, {api:'get_server_url', name:'survey/' + el.attr('data-action')}, 
                function(data$){
                    if(data$.status){
                        window.location.href = data$.data + str ;
                    }
                }
            ) ;
        },

        // 调查类型关注
        trade_follow : function(){
            var $this   = this,
                $follow = $this.element.find('.follow-button'),
                api$    = $.extend({api:'user_follow_svprop_select'}, {}) ;

            if(vixik$.user$ && vixik$.user$.user_code){
                api$.user_code    = vixik$.user$.user_code ;
                api$.svprop_value = $this.options.models$.sv_trade ;
                api$.svprop_type  = 'survey_trade' ;

                $.post(__API__, api$, 
                    function(data$){
                        if(data$.status){
                            $follow.removeClass('unfollow').addClass('followed') ;
                        }else{
                            $follow.removeClass('followed').addClass('unfollow') ;
                        }
                    }
                ) ;
            }else{
                $follow.removeClass('followed').addClass('unfollow') ;
            }
        },

        // 热门标签
        tag_hot : function(){
            var cond, 
                tags$   = [],
                $this   = this,
                $target = $this.element.find('.tag-hot .sb-body') ;


            switch(this.options.models$.sv_trade.length){
                case 4 :
                    cond = "survey_type = " + this.options.models$.sv_trade ;
                    break ;

                case 5 :
                    cond = "survey_type_sub = " + this.options.models$.sv_trade ;
                    break ;
            }

            // 访问问卷参与情况统计接口
            $.ajax({
                type    : 'post',
                url     : __API__, 
                data    : {api:'stats_tag_hot', cond: cond},
                success : function(data$){
                    if(data$.status){
                        for(var i = 0; i < data$.data.length; i++){
                            var tag$ = {} ;

                            tag$.text      = data$.data[i].tag_name ;
                            tag$.weight    = parseInt(data$.data[i].cnt) / 2 ;
                            tag$.link      = {} ;
                            tag$.link.href = data$.data[i].url_tag ;

                            tags$.push(tag$) ;
                        }

                        $target.jQCloud(tags$) ;
                    }
                }
            });
        },
    }) ;

    $('#Main').survey_trade_ctrl_main() ;
}) ;

