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
.then('script/public.header.js')
.then(function($){  
    loadPlugin('vkHighChart', 'vkData', /*'vkChart',*/ 'iCheck', 'vkForm', 'vkPaging') ;  // 加载所需插件
})
.then('script/survey.analyse.model.js')
.then(function($){

    /*
     * 页面副栏模块控制器
     *
     **/
    $.Controller('Survey.Analyse.Ctrl.Nav', {
        defaults : {
            models$   : {}                         ,// 页面总模型
            $ssButton : $('.survey-switch>button') ,
            $ssClose  : $('.sc-header-close>i')    ,
            $ssNav    : $('.switch-content li')    ,

        }
    }, {
        init : function(){
            // 调查发布者头像初始化
            this.element.find('div.nav-bar-photo>img')
                .attr('src', __JMVC_IMG__ + 'user/' + this.options.models$.survey$.info.user_code + '_60.jpg') ;
        },

        // 总对象用户数据更新时触发
        "{vixik$} user" : function(){
            this.options.models$.user_code = $.cookie('user_code') ;
            this.options.models$.survey_list(this.options.models$.user_code) ;
        },

        // 调查清单模型刷新触发操作
        "{models$} sv_list" : function(){
            var $this = this ;

            if($this.options.models$.list$){
                this.element.find('.vkpaging').each(function(){
                    var $list    = $(this),
                        name     = $list.attr('data-model'),
                        data$    = $this.options.models$.list$[name] ;

                    // 如果有数据才显示调查列表
                    if(data$.length){
                        //调用分页插件功能
                        $list.addClass('active').vkPaging({
                            data$     : data$                                             ,//要分页的源数据
                            $pagBody  : $list.find('.vkpaging-body')                      ,//分页内容的容器对象
                            $pagNav   : $list.find('.vkpaging-nav')                       ,//分页内容的容器对象
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

        // 切换调查菜单点击有效性判定
        "{$ssButton} click" : function(el){
            // 如果按钮没有dropdown属性，说明切换菜单无效，提示用户登录
            if(vixik$.user_verify({trigger$:{false:['login']}})){
                // el.dropdown('toggle') ;
            }

            // if(el.attr('data-toggle') !== 'dropdown'){
            //     alert('请先登录！') ;
            // }
        },

        // 关闭切换调查菜单
        "{$ssClose} click" : function(el){
            this.options.$ssButton.click() ;
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
                            $.vixik('get_url', {name:'survey/action', tail:'/s/'+survey_code, open:'new'}) ;
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
        // refresh : function(type){
        //     var user_code   = this.options.models$.user_code ;
        //     var survey_code = this.options.models$.survey_code ;
        //     var $target     = $('#navButton').children('[data-type=' + type + ']') ;
        //     var $button     = $target.find('button') ;
        //     var $stats      = $target.find('div.stats-box') ;
        //     var stats$      = {} ;

        //     switch(type){
        //         case 'follow' :  // 关注功能更新
        //             // 取调查收藏数据：访问用户关注与收藏信息查询接口
        //             $.ajax({
        //                 type    : 'post',
        //                 url     : __API_USER_FOLLOW_QUERY__,
        //                 data    : {
        //                             follow_type : 'survey'     ,// 查询类型
        //                             query_type  : 'count'      ,// 查询方式类型
        //                             user_code   : user_code    ,// 用户编码
        //                             follow_code : survey_code  ,// 关注对象编码
        //                           },
        //                 async   : false,
        //                 success : function(data$){
        //                     stats$.flag = data$.data ;
        //                 }
        //             });

        //             $.ajax({
        //                 type    : 'post',
        //                 url     : __API_USER_FOLLOW_QUERY__,
        //                 data    : {
        //                             follow_type : 'survey'     ,// 查询类型
        //                             query_type  : 'count'      ,// 查询方式类型
        //                             follow_code : survey_code   // 关注对象编码
        //                           },
        //                 async   : false,
        //                 success : function(data$){
        //                     stats$.count = data$.data ;
        //                 }
        //             });

        //             $stats.text(stats$.count) ;
        //             if(stats$.flag > 0){
        //                 $button.attr('data-action', 'del') ;
        //                 $button.text('已' + $button.attr('data-title')) ;
        //             }else{
        //                 $button.attr('data-action', 'add') ;
        //                 $button.text($button.attr('data-title')) ;
        //             }
        //             break ;

        //         case 'answer' : 
        //             $.ajax({
        //                 type    : 'post',
        //                 url     : __API_SURVEY_ACTION_SELECT__,  // 调查参与信息查询接口
        //                 data    : {survey_code:survey_code, user_code:user_code, type:'simple'},    
        //                 async   : false,
        //                 success : function(data$){
        //                     stats$ = data$.status ;
        //                 }
        //             });

        //             if(stats$){
        //                 $button.attr('data-action', '0') ;
        //                 $button.text('已' + $button.attr('data-title')) ;
        //             }else{
        //                 $button.attr('data-action', '1') ;
        //                 $button.text($button.attr('data-title')) ;
        //             }
        //             break ;
        //     }
        // },
    }) ;

    /*
     * 整体分析模块控制器
     *
     **/
    $.Controller('Survey.Analyse.Ctrl.Sv.Stats', {
        defaults : {
            models$      : {}                 ,// 页面总模型
            $itemStats   : $('#itemStats')    ,// 题目题目数量统计模块DOM
            $actionStats : $('#actionStats')  ,// 活动参与情况统计模块DOM
            $areaStats   : $('#areaStats')    ,// 参与来源地域统计模块DOM
        }
    }, {
        init : function(){
            var $chart, option$, model_option, str_eval,
                $this = this ;

            $this.item_line() ;
            $this.stats(this.options.$actionStats) ;
            $this.stats(this.options.$areaStats) ;
        },

        // 题目题目统计LINE
        item_line : function(){
            var elem_num, ratio, title,
                $itemGraphs  = this.options.$itemStats.find('div.stats-graphs'),
                question_num = parseInt($itemGraphs.attr('data-question-num')),
                $line        = $itemGraphs.find('div.graphs-line') ;

            $.each($line, function(){
                elem_num = parseInt($(this).attr('data-elem-num')) ;

                if(elem_num > 0){
                    ratio = Math.round((elem_num * 1000 / question_num)) / 10 + '%';
                    $(this).css('width', ratio) ;
                }else{
                    ratio = '0%' ;
                    $(this).css('width', '3px') ;
                }

                title = $(this).attr('title') + ' ' + ratio ;
                $(this).attr('title', title) ;
            }) ;

            $itemGraphs.css('background','#FFD700') ;
        }, 

        // 用户参与情况模型更新
        stats : function($stats){
            var srt_eval , model_key , value , option$,
                $this        = this,
                $statsDesc   = $stats.find('div.stats-value'),
                $statsChart  = $stats.find('div.stats-graphs'),
                model_stats  = $stats.attr('data-model'),
                model_option = $stats.attr('data-model-chart') ;
                

            // 分析数据展现
            $.each($statsDesc, function(){
                model_key = $(this).attr('data-model') ;

                str_eval = 'value = $this.options.models$.' + model_stats + '.' + model_key ;
                eval(str_eval) ;

                $(this).text(value) ;
            }) ;

            // 分析图表展现
            str_eval = 'option$ = $this.options.models$.' + model_stats + '.' + model_option ;
            eval(str_eval) ;

            // 调用VixiK图表插件vkChart
            $.vkchart($statsChart, option$) ;
        }
    }) ;

    /*
     * 题目分析模块控制器
     *
     **/
    $.Controller('Survey.Analyse.Ctrl.Qt.Stats', {
        defaults : {
            models$      : {}                       ,// 页面总模型
            $question    : $('div.question')        ,// 调查所有题目DOM
            $itemStats   : $('div.item-stats')      ,// 需要统计的题目模块DOM
            $qtSelect    : $('select.qt-select')    ,// 调查题目选择DOM
            $propSelect  : $('.stats-prop select')  ,// 用户属性选择DOM
            $itemAlysBtn : $('#linkItemAnalyse')    ,// 调查发布设置模块
        },
        // listensTo : ["question_stats"]
    }, {
        init : function(){
            var $this = this ;

            // 调查题目显示select初始化
            $this.element.find('select').attr('value', 0) ;

            // 初始化用户属性分析的两个select选项
            $.each(this.options.$itemStats, function(){
                var $propSelect   = $(this).find('select.prop-select'),
                    $optionSelect = $(this).find('select.option-select'),
                    prop_value    = $propSelect.find('option').eq(0).val(),
                    option_value  = $optionSelect.find('option').eq(0).val() ;

                $propSelect.attr('value', prop_value) ;
                $optionSelect.attr('value', option_value) ;
            }) ;
        }, 

        // 取到调查题目参与数据触发题目分析报表
        "{models$} flag_question" : function(){
            var quesiton_code,
                $this = this ;

            // 分别对每个题目进行分析
            $.each($this.options.$question, function(){
                if($(this).attr('data-question-type') == 'textarea'){
                    question_code = $(this).attr('data-question-code') ;
                }else{
                    $this.option_stats($(this)) ;  // 先完成各题目选项整体分析报表
                    $this.prop_stats($(this)) ;    // 然后初始化用户属性分析报表
                }
            }) ;
        },

        // 取到主观题目参与数据触发主观题数据匹配
        "{models$} flag_textarea" : function(){
            var quesiton_code,
                $this = this ;

            // 切换调查模块初始化
            if($this.options.models$.textarea$){
                this.options.$question.filter("[data-question-type='textarea']").each(function(){
                    var $text   = $(this),
                        code    = $text.attr('data-question-code'),
                        data$   = $this.options.models$.textarea$[code],
                        $pagBox = $text.find('.vkpaging-box'),
                        $pagNav = $text.find('.vkpaging-nav'),
                        view    = __JMVC_VIEW__ + 'survey.analyse.textarea.list.ejs' ;

                    // 如果有数据才显示调查列表
                    if(data$.length){
                        //调用分页插件功能
                        $text.vkPaging({
                            data$     : data$    ,//要分页的源数据
                            $pagBody  : $pagBox  ,//分页内容的容器对象
                            $pagNav   : $pagNav  ,//分页内容的容器对象
                            view_list : view     ,//列表模板路径
                            num_list  : 10       ,//每页数据量
                            num_nav   : 10       ,//导航分页数
                        }) ;
                    }
                }) ;
            }
        },

        ".text-init click" : function(el){
            var question_code = el.parents('.question').attr('data-question-code') ;

            this.element.find('.select-qt>select').attr('value', question_code).trigger('change') ;
        },

        // 整体分析选项
        option_stats : function($question){
            var value,
                $line = $question.find('div.stats-line') ;

            $.each($line, function(){
                value = parseFloat($(this).attr('data-value')) ;
                $(this).progressbar({value:value})
            }) ;
        },

        // 按用户属性分析选项
        prop_stats : function($question){
            var data$,
                models$       = this.options.models$,
                $highchart    = $question.find('div.highchart'),
                $nochart      = $question.find('div.nochart'),
                user_prop     = $question.find('select.prop-select').val(),
                option        = $question.find('select.option-select').val(),
                question_code = $question.attr('data-question-code'),
                question_name = $question.attr('data-question-name'),
                option_num    = parseInt($question.find('td.choose-num[data-option=' + option + ']').text()) ;

            // 根据目标选项是否有选择数据决定处理方式
            if(option_num > 0 || option == 0){
                // 按照属性筛选数据
                data$ = $.vkData('data_select_sum', {
                    data$ : models$.question$[question_code], 
                    key   : 'count', 
                    group : [user_prop, 'option_name']}
                ) ;
                
                // 转换数据并生成图表
                $highchart.vkHighChart(models$.data_format_hchart(data$, question_name, option)) ;

                $nochart.hide() ;
                $highchart.show() ;
            }else{
                $highchart.hide() ;
                $nochart.show() ;
            }
        },

        // 调查题目选择变更
        "{$qtSelect} change" : function(el){
            var $target ;

            // 先关闭所有主管题的参与内容显示
            this.options.$question.find('.qt-text').removeClass('active') ;

            // 再进一步判断处理
            if(el.val() == 0){
                this.element.removeClass('single') ;
                this.options.$question.show() ;
            }else{
                $target = this.options.$question.filter('[data-question-code=' + el.val() + ']') ;

                this.element.addClass('single') ;
                this.options.$question.hide() ;
                $target.show() ;

                // 若切换的是主观题，显示其参与内容
                if($target.attr('data-question-type') == 'textarea'){
                    // 目标题目显示参与的内容
                    $target.find('.qt-text').addClass('active') ;
                }
            }

            // 滚动页面到头
            window.scrollTo(0, 0) ;
        },

        // 用户属性筛选条件变更
        "{$propSelect} change" : function(el){
            var $question = el.parents('div.item-stats') ;
            this.prop_stats($question) ;
        }
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
            var $question,
                $this        = this,
                viewQuestion = __JMVC_VIEW__ + 'survey.action.question.ejs',  // 调查题目模板路径
                survey$      = $this.options.models$.survey$ ;                // 取模型题目数据

            // 调查题目内容生成
            for(var q = 0; q < survey$.question.length; q++){
                $this.element.find('div.sv-item').append(
                    viewQuestion,
                    {data: survey$.question[q]},
                    function(){
                        // 定位最新生成的题目
                        $question = this.find('.question-item').last() ;

                        //  表单元素使用iCheck样式
                        $question.find('.vf-elem-option input').iCheck({
                            checkboxClass : 'icheckbox_minimal-grey',
                               radioClass : 'iradio_minimal-grey'
                        }) ;

                        $question.find('.icheckbox_minimal-grey').addClass('icheck') ;
                        $question.find('.iradio_minimal-grey').addClass('icheck') ;
                    }
                ) ;
            }
        }
    }) ;


    /*
     * 页面总控制器
     *
     **/
    $.Controller('Survey.Analyse.Ctrl.Sv.Setting', {
        defaults : {
            models$ : {}                     // 页面总模型
        },
        listensTo : ["hint"]
    }, {
        init : function(){
            var $this = this ;
        },

        item_fix : function(){

        },
    }) ;


    /*
     * 页面总控制器
     *
     **/
    $.Controller('Survey.Analyse.Ctrl.Sv.Comment', {
        defaults : {
            models$ : {}                     // 页面总模型
        },
        listensTo : ["hint"]
    }, {
        init : function(){
            var $question,
                $this = this ;
        }
    }) ;

    /*
     * 页面总控制器
     *
     **/
    $.Controller('Survey.Analyse.Ctrl.Main', {
        defaults : {
            models$        : {}                   ,// 页面总模型
            $navBar        : $('#navBar')         ,// 页面副栏模块
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
                user_code   : user_code ,
                survey_code : survey_code
            }) ;

            // 页面副栏模块控制器
            $('#navBar').survey_analyse_ctrl_nav({
                models$ : this.options.models$
            }) ;

            // // 整体分析模块控制器
            // this.options.$surveyStats.survey_analyse_ctrl_sv_stats({
            //     models$ : this.options.models$
            // }) ;

            // 题目分析模块控制器
            this.options.$questionStats.survey_analyse_ctrl_qt_stats({
                models$ : this.options.models$
            }) ;

            // 调查内容模块控制器
            this.options.$surveyContent.survey_analyse_ctrl_sv_content({
                models$ : this.options.models$
            }) ;

            // 调查设置模块控制器
            this.options.$surveySetting.survey_analyse_ctrl_sv_setting({
                models$ : this.options.models$
            }) ;

            // 网友评论模块控制器
            this.options.$surveyComment.survey_analyse_ctrl_sv_comment({
                models$ : this.options.models$
            }) ;

            // 需要模型trigger的最后初始化
            this.options.models$.survey_list(user_code) ;
        },

        "li.all-content click" : function(){
            this.element.find('div.tab-pane').addClass('active') ;
        }
    }) ;

    $('#Main').survey_analyse_ctrl_main() ;

}) ;


