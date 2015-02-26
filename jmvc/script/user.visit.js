
/**
 * Name        : user.visit.js
 * Description : js for user/visit.html
 *
 * Create-time : 2013-6-13, 4:18:17
 * Author      : ReadYun
 * Copyright   : VixiK
 * Version     : 1.0.00
 */

steal('init.js')
.then('script/public.topbar.js')
.then(function($){
    loadPlugin('vkPaging') ;
}) 
.then(function($){

    /*
     * 页面总模型
     *
     **/
    $.Model('User.Visit.Model', {
        defaults : {
            user_code : 0   ,// 用户编码
            user_name : ''  ,// 用户名称
            user_nick : ''  ,// 用户昵称
            publicSv$ : {}  ,// 用户已发布问卷信息
            answerSv$ : {}  ,// 用户已参与问卷信息
        }
    }, {
        init : function(){
        },

        // 手动触发模型更新事件
        trigger : function(prop){
            eval("this.attr('" + prop + "', Math.random())") ;
        },

        // 各种类型用户清单查询
        user_follow_select : function(type){
            var models$ = this ;
            
            // 访问调查参与信息查询接口
            $.ajax({
                type    : 'post',
                url     : __API__,
                data    : {api:'follow_list_select', type:'user', target:models$.user_code},
                async   : true,   
                success : function(data$){
                    if(data$.status){
                        models$.fuser$ = data$.data.follow_user ;
                        models$.trigger('follow_user') ;
                    }
                }
            });
        },

        // 各种类型调查清单查询
        survey_list_select : function(type){
            var models$ = this ;

            $.ajax({
                type    : 'post',
                url     : __API__,
                data    : {api:'survey_action_list_select', user_code:models$.user_code},
                async   : true,   
                success : function(data$){
                    if(data$.status){
                        models$.survey$ = data$.data ;

                        models$.trigger('publish_survey') ;
                        models$.trigger('answer_survey') ;
                        models$.trigger('follow_survey') ;
                    }
                }
            });
        },
    }) ;

    // 页面初始化
    $.Controller('User.Visit.Ctrl.Action', {
        defaults : {
            models$     : {}                ,// 页面总模型
        }
    }, {
        init : function(){
        },

        "{models$} follow_user" : function(){
            this.paging(
                this.element.find('#follow-user'),  
                this.options.models$.fuser$, 
                __JMVC_VIEW__ + 'user.visit.follow.user.ejs'
            ) ;
        },

        "{models$} publish_survey" : function(){
            this.paging(
                this.element.find('#publish-survey'), 
                this.options.models$.survey$.publish, 
                __JMVC_VIEW__ + 'user.visit.list.survey.ejs'
            ) ;
        },

        "{models$} answer_survey" : function(){
            this.paging(
                this.element.find('#answer-survey'), 
                this.options.models$.survey$.answer, 
                __JMVC_VIEW__ + 'user.visit.list.survey.ejs'
            ) ;
        },

        "{models$} follow_survey" : function(){
            this.paging(
                this.element.find('#follow-survey'), 
                this.options.models$.survey$.follow, 
                __JMVC_VIEW__ + 'user.visit.list.survey.ejs'
            ) ;
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
                    num_list  : 4            ,// 每页数据量
                    num_nav   : 10           ,// 导航分页数
                }) ;
            }else{
                $vkpaging.removeClass('active') ;
            }
        },
    }) ;

    // 页面初始化
    $.Controller('User.Visit.Ctrl.Main', {
        defaults : {
            models$     : {}                ,// 页面总模型
            $userAction : $('#userAction')  ,// 用户操作对象
            $actionInfo : $('#actionInfo')  ,// 用户行为信息

        }
    }, {
        init : function(){
            var user_code  = this.element.attr('data-user'),
                $userPhoto = this.element.find('#userPhoto') ;

            // 新建模型实例并初始化
            this.options.models$ = new User.Visit.Model({
                user_code : user_code     // 用户编码
            }) ;

            // 我的账户模块对象控制器
            this.options.$actionInfo.user_visit_ctrl_action({    
                models$ : this.options.models$
            }) ;

            // 用户头像初始化
            if(parseInt($userPhoto.attr('data-photo'))){
                $userPhoto.find('img').attr('src', __JMVC_IMG__ + 'user/' + user_code + '.jpg').show() ;
                $userPhoto.find('i.icon-user').hide() ;
            }

            // 模型取数据
            this.options.models$.user_follow_select() ;
            this.options.models$.survey_list_select() ;

            // 初始刷新数据
            this.data_refresh() ;
            this.element.addClass('active') ;
        },

        "{vixik$} user" : function(){
            this.data_refresh() ;
        },

        // 数据刷新
        data_refresh : function(){
            var user_code = this.options.models$.user_code,
                $action   = this.options.$userAction.children() ;

            // 用户操作初始化
            if(vixik$.user$.user_code !== user_code){
                $.ajax({
                    type    : 'post',
                    url     : __API__,
                    data    : {api:'get_server_url', name:'user/index'},
                    async   : false,   
                    success : function(data$){
                        if(data$.status){
                            $action.text('进入用户中心').attr('href', data$.data + '?code=' + user_code) ;
                        }
                    }
                });
            }else{
                $.ajax({
                    type    : 'post',
                    url     : __API__,
                    data    : {api:'user_follow_query',follow_type:'user',query_type:'count',user_code:vixik$.user$.user_code,follow_code:user_code},
                    async   : false,   
                    success : function(data$){
                        if(data$.status){
                            if(data$.data == 1){
                                $action.text('取消关注').parent().attr('data-type', 'del') ;
                            }else{
                                $action.text('关注他').parent().attr('data-type', 'add') ;
                            }
                        }
                    }
                });
            }
        },

        "{$userAction} click" : function(el){
            var type        = el.attr('data-type'),
                user_code   = vixik$.user$.user_code,
                follow_code = this.options.models$.user_code ;

            $.ajax({
                type    : 'post',
                url     : __API__,
                data    : {api:'user_follow_update', user_code:user_code, follow_type:'user', update_type:type, follow_code:follow_code},
                async   : false,   
                success : function(data$){
                    if(data$.status){
                        switch(type){
                            case 'add' : 
                                el.children().text('取消关注').parent().attr('data-type', 'del') ;
                                break ;
                            case 'del' : 
                                el.children().text('关注他').parent().attr('data-type', 'add') ;
                                break ;
                        }
                    }
                }
            });
        },

        // 用户操作
        action : function($action){
            var src_user = $.cookie('user_code'),
                vst_user = this.options.models$.user_code,
                $Action  = this.element.find('#userAction') ;

            if(src_user == vst_user){
                $Action.children('div.owner').show() ;
            }else{
                $Action.children('div.visitor').show() ;
            }
        },
    }) ;

    $('#Main').user_visit_ctrl_main() ;
}) ;