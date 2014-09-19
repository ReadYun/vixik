
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
     * 我的关注模块控制器
     *
     **/
    $.Controller('User.Index.Ctrl.Follow', {
        defaults : {
            models$       : {}                   ,// 页面总模型
            $followUser   : $('#follow-user')    ,// 关注的用户DOM对象
            $followSurvey : $('#follow-survey')  ,// 关注的调查DOM对象
            $followSvtype : $('#follow-svtype')  ,// 关注的分类DOM对象
            $svtype       : $('.ss-elem input')  ,// 关注的分类DOM对象


        }
    }, {
        init : function(){
            this.element.find('.svtype-sub').find('input').iCheck({
                checkboxClass: 'icheckbox_minimal-grey',
                   radioClass: 'iradio_minimal-grey'
            }).iCheck('uncheck') ;
        },

        "{models$} survey_follow" : function(){
            this.element.find('.pane-side .follow-survey').text(this.options.models$.survey$.follow.length) ;
            this.paging(this.options.$followSurvey, this.options.models$.survey$.follow, __JMVC_VIEW__ + 'user.index.survey.follow.ejs') ;
        },

        "{models$} user_follow" : function(){
            this.element.find('.pane-side .follow-user').text(this.options.models$.fuser$.length) ;
            this.paging(this.options.$followUser, this.options.models$.fuser$, __JMVC_VIEW__ + 'user.index.user.follow.ejs') ;
        },
        "{models$} follow_svtype" : function(){
            var svtype$ = this.options.models$.svtype$ ;

            for(var i = 0; i < svtype$.length; i++){
                if(svtype$[i].svtype_main != null){
                    this.options.$followSvtype.find('.svtype-main[data-code=' + svtype$[i].svtype_main + ']').click() ;

                }else if(svtype$[i].svtype_sub != null){
                    this.options.$followSvtype.find('input[value=' + svtype$[i].svtype_sub + ']').iCheck('check') ;
                }
            }
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
                    num_list  : 5            ,// 每页数据量
                    num_nav   : 10           ,// 导航分页数
                }) ;
            }else{
                $vkpaging.removeClass('active') ;
            }
        },

        // 点击调查大类其和对应小类的选中状态
        ".svtype-main click" : function(el){
            if(el.find('i').toggleClass('icon-ok').hasClass('icon-ok')){
                el.parent().find('.ss-elem input').iCheck('check') ;
            }else{
                el.parent().find('.ss-elem input').iCheck('uncheck') ;
            }
        },

        // 取消选中调查小类触发判断
        "{$svtype} ifUnchecked" : function(el){
            el.parents('.svtype-elem').find('.sm-check i').removeClass('icon-ok') ;
        },

        // 选中调查小类触发判断
        "{$svtype} ifChecked" : function(el){
            var $stypeMain = el.parents('.svtype-elem').find('.svtype-main'),
                $stypeSub  = el.parents('.svtype-sub').find('.ss-elem'),
                len        = $stypeSub.size() ;

            for(var i = 0; i < len; i++){
                if($stypeSub.eq(i).find('input').attr('checked') !== 'checked'){
                    i = len ;
                }

                if(i == len - 1){
                    $stypeMain.find('i').addClass('icon-ok') ;
                }
            }
        },

        // 关注调查分类设置提交
        "button.svtype click" : function(el){
            var user_code = this.options.models$.user_code,
                svtype$   = el.parents('.pane-content').vkForm('get_value').data.sv_type_sub ;

            // 先验证用户登录
            if(vixik$.user_verify({trigger$:{false:['login']}})){
                if(svtype$.length == 0){
                    alert('未关注任何调查类型') ;
                }else{
                    $.post(__API__, {api:'user_follow_svtype_update', update_type:'cover', user_code:user_code, svtype:svtype$},
                        function(data$){
                            if(data$.status){
                                alert('关注分类设置已更新') ;
                            }
                        }
                    ) ;
                }
            }
        },

        // 取消关注按钮点击事件
        "a.cancel click" : function(el){
            var $this  = this,
                type   = el.parent().attr('data-type'),
                target = el.parent().attr('data-code') ;

            // 访问关注关注更新接口删除目标数据
            $.ajax({
                type    : 'post',
                url     : __API__,
                data    : { api         : 'user_follow_update', 
                            user_code   : $.cookie('user_code'),
                            follow_type : type,
                            follow_code : target,
                            update_type : 'del',
                          },
                async   : true,   
                success : function(data$){
                    if(data$.status){
                        // 动态更新对应的模型
                        eval("$this.options.models$." + type + "_list_select('follow')") ;
                    }
                }
            });
        },
    }) ;
}) ;