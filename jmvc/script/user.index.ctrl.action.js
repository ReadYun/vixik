
/**
 * Name        : user.index.ctrl.action.js
 * Description : js for user/index.html
 *
 * Create-time : 2013-6-13, 4:18:17
 * Author      : ReadYun
 * Copyright   : VixiK
 * Version     : 1.0.00
 */

steal('init.js')
.then(function($){
    loadPlugin('vkPaging', 'vkData') ;
}) 
.then(function($){

    /*
     * 我的调查模块控制器
     *
     **/
    $.Controller('User.Index.Ctrl.Action', {
        defaults : {
            models$      : {}                       ,// 页面总模型
            $createSvBox : $('#created-sv')         ,// 创建的问卷DOM对象
            $answerSvBox : $('#answered-sv')        ,// 参与的问卷DOM对象
            $svFilter    : $('.sv-filter li.elem')  ,// 问卷筛选对象

        }
    }, {
        init : function(){
        },

        "{models$} survey_create" : function(){
            var sv_state$, sv_cnt,
                $this   = this,
                survey$ = $.vkData('data_select_count', {data$:$this.options.models$.survey$.create, group:'survey_state'}) ;

            if($this.options.models$.survey$.create.length){
                this.options.$createSvBox.find('.survey-null').hide() ;
                this.options.$createSvBox.find('.survey-box').show() ;

                $.each(this.options.$svFilter, function(){
                    sv_cnt    = 0 ;
                    sv_state$ = $(this).attr('sv-state').split(',') ;

                    for(var i = 0; i < sv_state$.length; i++){
                        if(survey$[sv_state$[i]]){
                            sv_cnt += survey$[sv_state$[i]] ;
                        }
                    }

                    $(this).find('i').text(sv_cnt) ;
                }) ;

                this.paging(this.options.$createSvBox, $this.options.models$.survey$.create, __JMVC_VIEW__ + 'user.index.survey.create.ejs', 10) ;
            }
        },

        "{models$} survey_answer" : function(){
            this.element.find('.answer-sv-num').text(this.options.models$.survey$.answer.length) ;
            this.paging(this.options.$answerSvBox, this.options.models$.survey$.answer, __JMVC_VIEW__ + 'user.index.survey.answer.ejs', 5) ;
        },

        // 问卷列表分页
        paging : function($box, data$, view, list){
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
                    num_list  : list         ,// 每页数据量
                    num_nav   : 10           ,// 导航分页数
                }) ;
            }else{
                $vkpaging.removeClass('active') ;
            }
        },

        // 问卷筛选
        "{$svFilter} click" : function(el){
            var state$, data$ ;

            if(!el.hasClass('active')){
                state$ = el.attr('sv-state').split(',') ;

                if(state$.length == 1){
                    data$ = $.vkData('data_select_filter', {data$:this.options.models$.survey$.create, where$:[{survey_state:state$}]}) ;
                }else{
                    data$ = this.options.models$.survey$.create ;
                }

                el.parent().find('li.elem').removeClass('active') ;
                el.addClass('active') ;
                this.paging(this.options.$createSvBox, data$, __JMVC_VIEW__ + 'user.index.survey.create.ejs', 10) ;
            }
        },

        // 问卷筛选
        "a.del click" : function(el){
            var $vkpaging, data$, state$, survey_code, survey_name, page, survey$, sv_cnt, sv_state$, filter$,
                $this = this ;

            if(confirm('删除的调查将无法恢复，确认删除吗？')){
                $vkpaging   = el.parents('.vkpaging') ;
                survey_code = el.parents('.survey-title').attr('data-survey') ;
                survey_name = el.parents('.survey-title a').text() ;
                state$      = el.parents('.survey-box').find('.sv-filter li.active').attr('sv-state').split(',') ;

                $.ajax({
                    type    : 'post',
                    url     : __API__,
                    data    : { api         : 'survey_info_update', 
                                user_code   : $.cookie('user_code'), 
                                survey_code : survey_code, 
                                sv_info     : $.toJSON({survey_state:0}),
                              },
                    async   : true,   
                    success : function(data$){
                        if(data$.status){
                            // 从已存模型中删除目标调查
                            $.vkData('data_delete', {data$:$this.options.models$.survey$.create,where$:[{k:'survey_code',v:survey_code}]}) ;

                            survey$ = $.vkData('data_select_count', {data$:$this.options.models$.survey$.create, group:'survey_state'}) ;
                            $.each($this.options.$svFilter, function(){
                                sv_cnt    = 0 ;
                                sv_state$ = $(this).attr('sv-state').split(',') ;

                                for(var i = 0; i < sv_state$.length; i++){
                                    if(survey$[sv_state$[i]]){
                                        sv_cnt += survey$[sv_state$[i]] ;
                                    }
                                }

                                $(this).find('i').text(sv_cnt) ;
                            }) ;

                            // 重新筛选数据（如果是显示所有状态调查不用筛选）
                            if(state$.length == 1){
                                filter$ = $.vkData('data_select_filter', {data$:$this.options.models$.survey$.create, where$:[{survey_state:state$}]}) ;
                            }else{
                                filter$ = $this.options.models$.survey$.create ;
                            }

                            // 刷新分页列表（同时刷新数据）
                            $vkpaging.vkPaging('list', '', {data$:filter$}) ;
                            alert('调查活动' + survey_name + '已删除！') ;
                        }
                    }
                });
            }
        },

        // 关注调查按钮点击
        "a.follow click" : function(el){
            var $this       = this,
                survey$     = el.parents('.sv-list-elem'),
                survey_code = survey$.attr('data-survey-code') ;

            // 访问接口加入新的关注调查
            $.ajax({
                type    : 'post',
                url     : __API__,
                data    : { api         : 'user_follow_update', 
                            user_code   : $.cookie('user_code'),
                            follow_type : 'survey',
                            follow_code : survey_code,
                            update_type : 'add',
                          },
                async   : true,   
                success : function(data$){
                    if(data$.status){
                        $this.options.models$.survey_list_select('follow') ;
                    }
                }
            });
        },
    }) ;
}) ;