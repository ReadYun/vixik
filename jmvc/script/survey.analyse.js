/**
 * Name        : survey.analyse.js
 * Description : js for survey/analyse.html
 *
 * Create-time : 2012-8-14 18:14:09
 * Author      : ReadYun
 * Copyright   : VixiK
 * Version     : 1.0.00
 */

steal('init.js')
.then(function($){  
    loadPlugin('vkHighChart', 'vkData', /*'vkChart',*/ 'iCheck', 'vkForm', 'vkPaging') ;  // 加载所需插件
})
.then('script/public.header.js')
.then('script/survey.analyse.model.js')
.then('script/survey.analyse.ctrl.sub.js')
.then('script/survey.analyse.ctrl.stats.js')
.then(function($){

    /*
     * 页面副栏模块控制器
     *
     **/
    $.Controller('Survey.Analyse.Ctrl.Nav', {
        defaults : {
            models$   : {}                         ,// 页面总模型
            $ssButton : $('.survey-switch>button') ,
            $ssNav    : $('.switch-content li')    ,
        }
    }, {
        init : function(){
        },

        // 总对象用户数据更新时触发
        "{vixik$} user" : function(){
            this.options.models$.user_code = vixik$.user$.user_code ;
            this.options.models$.sv_switch() ;
        },

        // 调查信息模型刷新触发操作
        "{models$} sv_info" : function(){
            this.user_photo() ;
        },

        // 调查发布者头像初始化
        user_photo : function(){
            var $photo = this.element.find('div.nav-bar-photo>img') ;

            if(this.options.models$.survey$){
                this.options.models$.survey$.info.user_photo == 1 ?
                    $photo.attr('src', __JMVC_IMG__ + 'user/' + this.options.models$.survey$.info.user_code + '_60.jpg') :
                    $photo.attr('src', __JMVC_IMG__ + 'user/' + 'user.jpg') ;
            }
        },

        // 调查清单模型刷新触发操作
        "{models$} sv_switch" : function(){
            var data$,
                $this = this ;

            if($this.options.models$.list$){
                this.element.find('.vkpaging').each(function(){
                    data$ = $this.options.models$.list$[$(this).attr('data-model')] ;

                    // 如果有数据才显示调查列表
                    if(data$ && data$ .length){
                        //调用分页插件功能
                        $(this).addClass('active').vkPaging({
                            data$     : data$                                             ,//要分页的源数据
                            $pagBody  : $(this).find('.vkpaging-body')                    ,//分页内容的容器对象
                            $pagNav   : $(this).find('.vkpaging-nav')                     ,//分页内容的容器对象
                            view_list : __JMVC_VIEW__ + 'survey.analyse.switch.list.ejs'  ,//列表模板路径
                            num_list  : 10                                                ,//每页数据量
                            num_nav   : 10                                                ,//导航分页数
                        }) ;
                    }
                }) ;

                this.options.$ssButton.attr('data-toggle', 'dropdown') ;
            }else{
                this.options.$ssButton.attr('data-toggle', '') ;
            }
        },

        // 调查清单模型刷新触发操作
        sv_list : function(){
        },

        // 未登录用户点击切换调查按钮弹出登录框
        ".survey-switch click" : function(el, ev){
            vixik$.user_verify({trigger$:{false:['login']}}) ;
        },

        // 打开切换调查菜单
        ".survey-switch mouseover" : function(el){
            if(vixik$.user_verify()){
                el.addClass('open') ;
            }
        },

        // 关闭切换调查菜单
        ".survey-switch mouseout" : function(el){
            el.removeClass('open') ;
        },

        // 在dropdown菜单里使用nav无效，只好单独实现其功能
        "{$ssNav} click" : function(el, ev){
            ev.stopPropagation();    //  阻止事件冒泡
            el.parent().children('li').removeClass('active') ;
            el.addClass('active') ;

            el.parents('.tabbable').find('.tab-content .tab-pane').removeClass('active') ;
            el.parents('.tabbable').find('.tab-content #' + el.find('a').attr('data-target')).addClass('active') ;
        },

        //问卷列表分页
        paging : function($pagBox, data$, view_list){
            var $noContent = $pagBox.find('.no-content-box'),
                $Content   = $pagBox.find('.content-box'),
                $pagBody   = $pagBox.find('.content-paging-box'),
                $pagNav    = $pagBox.find('.content-paging-nav'),
                $footer    = $pagBox.find('.content-footer') ;

            if(!data$ || !data$.length){
                $footer.hide() ;
                $Content.hide() ;
                $noContent.show() ;
            }else{
                $noContent.hide() ;
                $Content.show() ;
                $footer.show() ;

                //调用分页插件功能
                $pagBox.vkPaging({
                    data$     : data$      ,//要分页的源数据
                    $pagBody  : $pagBody   ,//分页内容的容器对象
                    $pagNav   : $pagNav    ,//分页内容的容器对象
                    view_list : view_list  ,//列表模板路径
                    num_list  : 10         ,//每页数据量
                    num_nav   : 10         ,//导航分页数
                }) ;
            }
        },

        // 切换调查菜单点击调查跳转切换
        ".sv-list click" : function(el){
            $.vixik('get_url', {name:'survey/analyse', tail:'/s/' + el.attr('data-survey-code'), open:'cur'}) ;
        },

        "div.nav-bar-photo click" : function(el, ev){
            $.vixik('get_url', {name:'user/visit', tail:'/u/' + this.options.models$.user_code, open:'new'}) ;
        },

        "button.btn.follow mouseover" : function(el, ev){
            if(el.attr('data-action') == 'del'){
                el.text('取消' + el.attr('data-title')) ;
            }
        },

        "button.btn.follow mouseleave" : function(el, ev){
            if(el.attr('data-action') == 'del'){
                el.text('已' + el.attr('data-title')) ;
            }
        },

        "button.btn click" : function(el, ev){
            var $this       = this,
                user_code   = this.options.models$.user_code,
                survey_code = this.options.models$.survey_code,
                action      = el.attr('data-action'),
                type        = el.parents('div.sv-button').attr('data-type') ;

            // 通过判断state属性来确定是否点击到按钮触发后续操作
            if(action){
                switch(type){
                    case 'action' :  // 参与功能
                        if(action > 0){  // 如果是未参与状态转入新建的调查参与页面
                            $.vixik('get_url', {name:'survey/answer', tail:'/code/' + survey_code, open:'new'}) ;
                        }else{
                            alert('您已参与过本次调查') ;
                        }
                        break ;

                    case 'follow' :  // 收藏功能     
                        $.ajax({
                            type    : 'post',
                            url     : __API_USER_FOLLOW_UPDATE__,
                            data    : {
                                        user_code   : user_code    ,// 用户编码
                                        follow_type : 'survey'     ,// 关注对象类型（调查）
                                        follow_code : survey_code  ,// 关注对象编码（调查编码）
                                        update_type : action       ,// 根据入参确定更新行为类型
                                      },
                            async   : false,
                            success : function(data$){
                                if(data$.status){
                                    $this.refresh('follow') ;
                                }else{
                                    alert('收藏调查不成功') ;
                                }
                            }
                        });
                        break ;

                    case 'share' :   // 分享功能
                        break ;
                }
            }
        },

        // 副标题栏信息刷新
        refresh : function(type){
            var user_code   = this.options.models$.user_code ;
            var survey_code = this.options.models$.survey_code ;
            var $target     = $('#navButton').children('[data-type=' + type + ']') ;
            var $button     = $target.find('button') ;
            var $stats      = $target.find('div.stats-box') ;
            var stats$      = {} ;

            switch(type){
                case 'follow' :  // 关注功能更新
                    // 取调查收藏数据：访问用户关注与收藏信息查询接口
                    $.ajax({
                        type    : 'post',
                        url     : __API_USER_FOLLOW_QUERY__,
                        data    : {
                                    follow_type : 'survey'     ,// 查询类型
                                    query_type  : 'count'      ,// 查询方式类型
                                    user_code   : user_code    ,// 用户编码
                                    follow_code : survey_code  ,// 关注对象编码
                                  },
                        async   : false,
                        success : function(data$){
                            stats$.flag = data$.data ;
                        }
                    });

                    $.ajax({
                        type    : 'post',
                        url     : __API_USER_FOLLOW_QUERY__,
                        data    : {
                                    follow_type : 'survey'     ,// 查询类型
                                    query_type  : 'count'      ,// 查询方式类型
                                    follow_code : survey_code   // 关注对象编码
                                  },
                        async   : false,
                        success : function(data$){
                            stats$.count = data$.data ;
                        }
                    });

                    $stats.text(stats$.count) ;
                    if(stats$.flag > 0){
                        $button.attr('data-action', 'del') ;
                        $button.text('已' + $button.attr('data-title')) ;
                    }else{
                        $button.attr('data-action', 'add') ;
                        $button.text($button.attr('data-title')) ;
                    }
                    break ;

                case 'answer' : 
                    $.ajax({
                        type    : 'post',
                        url     : __API_SURVEY_ACTION_SELECT__,  // 调查参与信息查询接口
                        data    : {survey_code:survey_code, user_code:user_code, type:'simple'},    
                        async   : false,
                        success : function(data$){
                            stats$ = data$.status ;
                        }
                    });

                    if(stats$){
                        $button.attr('data-action', '0') ;
                        $button.text('已' + $button.attr('data-title')) ;
                    }else{
                        $button.attr('data-action', '1') ;
                        $button.text($button.attr('data-title')) ;
                    }
                    break ;
            }
        },
    }) ;

    /*
     * 调查内容控制器
     *
     **/
    $.Controller('Survey.Analyse.Ctrl.Sv.Content', {
        defaults : {
            models$ : {}                     // 页面总模型
        },
        listensTo : ["hint"]
    }, {
        init : function(){
            this.element.find('.qt-xz input').iCheck({
                checkboxClass: 'icheckbox_minimal-grey',
                   radioClass: 'iradio_minimal-grey'
            }).iCheck('uncheck').parent().addClass('icheck') ;
        },

        // 单项评分选项评分值选择
        ".pr-mid-elem click" : function(el){
            el.parent().children().not(el.addClass('ok')).removeClass('ok') ;
        },

        // 多项评分选项评分值选择
        ".vs-option click" : function(el){
            el.parents('.vf-elem-option').addClass('ok').attr('data-value', el.attr('data-value'))
            .find('.dropdown-toggle').text(el.attr('data-value')) ;
        },
    }) ;

    /*
     * 页面总控制器
     *
     **/
    $.Controller('Survey.Analyse.Ctrl.Main', {
        defaults : {
            models$        : {}                   ,// 页面总模型
            $navBox        : $('#navBox')         ,// 页面副栏模块
            $surveyStats   : $('#surveyStats')    ,// 整体分析模块
            $questionStats : $('#questionStats')  ,// 题目分析模块
            $surveyContent : $('#surveyContent')  ,// 调查内容模块
            $surveySetting : $('#surveySetting')  ,// 调查设置模块
            $surveyComment : $('#surveyComment')  ,// 网友评论模块
        }
    }, {
        init : function(){
            var user_code   = $.cookie('user_code'),
                survey_code = this.element.attr('data-survey'),
                href        = window.location.hash ;

            // 解析URL如果有指定某一个模块名称，直接转向该模块
            if(href){
                this.element.find('a[href=' + href +']').click() ;
            }

            // 新建模型实例并初始化
            this.options.models$ = new Survey.Analyse.Model({
                user_code   : user_code,
                survey_code : survey_code
            }) ;

            // 页面副栏模块控制器
            this.options.$navBox.survey_analyse_ctrl_nav({
                models$ : this.options.models$
            }) ;

            // 整体分析模块控制器
            this.options.$surveyStats.survey_analyse_ctrl_sv_stats({
                models$ : this.options.models$
            }) ;

            // 题目分析模块控制器
            this.options.$questionStats.survey_analyse_ctrl_qt_stats({
                models$ : this.options.models$
            }) ;

            // 调查内容模块控制器
            this.options.$surveyContent.survey_analyse_ctrl_sv_content({
                models$ : this.options.models$
            }) ;

            // // 调查设置模块控制器
            // this.options.$surveySetting.survey_analyse_ctrl_sv_setting({
            //     models$ : this.options.models$
            // }) ;

            // // 网友评论模块控制器
            // this.options.$surveyComment.survey_analyse_ctrl_sv_comment({
            //     models$ : this.options.models$
            // }) ;

            // 开始调用模型去相关数据
            this.options.models$.survey_info() ;
            this.options.models$.sv_switch() ;
            
            this.element.addClass('active') ;
        },
    }) ;

    $('#Main').survey_analyse_ctrl_main() ;

}) ;


