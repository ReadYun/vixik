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
     * 调查评论模块控制器
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

            if(parseInt($.cookie('user_code')) >= 10000000){
                $this.comment_init(vixik$.user$) ;
            }

            if(parseInt($this.options.models$.survey_code) >= 10000000){
                $this.comment_list($this.options.models$.survey_code) ;
            }
        },

        // 总对象用户数据更新时触发
        "{vixik$} user" : function(){
            this.options.models$.user_code = $.cookie('user_code') ;
            this.comment_init(vixik$.user$) ;
        },

        // 评论登录
        ".need-login>button click" : function(){
            vixik$.user_verify({trigger$:{false:['login_open']}}) ;
        },

        // 更多评论
        ".cl-elem-more>button click" : function(){
            this.comment_list(this.options.models$.survey_code, parseInt(this.element.find('.comment-list').attr('data-page')) + 1) ;
        },

        // 提交评论
        ".cm-submit>button click" : function(el){
            var $elem,
                $this       = this,
                user_code   = this.options.models$.user_code,
                survey_code = this.options.models$.survey_code,
                $comment    = el.parents('.comment-my'),
                txt         = $comment.find('.cm-input').html(),
                $tpl        = $this.element.find('.cl-elem.tpl') ;

            if(txt != ''){
                // 提交评论
                $.ajax({
                    type    : 'post',
                    url     : __API__,   // 调查基本信息查询接口
                    data    : {api: 'survey_comment_submit', user_code: user_code, survey_code: survey_code, comment_txt: txt},
                    success : function(data$){
                        if(data$.status){
                            alert('评论成功') ;
                            $comment.find('.cm-input').text('') ;

                            $elem = $tpl.clone().removeClass('tpl').show().insertAfter($tpl) ;

                            $elem.find('.sc-sub img').attr('src', $comment.find('img').attr('src')) ;
                            $elem.find('.time').text('刚刚') ;
                            $elem.find('.sc-body').html(txt) ;

                            $elem.find('.nick a').text(vixik$.user$.user_nick)
                            .attr('href', $elem.find('.nick a').attr('data-href') + '?code=' + vixik$.user$.user_code) ;
                        }
                    }
                });
            }
        },

        // 用户信息匹配
        comment_init : function(user$){
            var user_photo ;

            if(vixik$.user$ && vixik$.user$.user_photo == 1){
                user_photo = __JMVC_IMG__ + 'user/' + vixik$.user$.user_code + '_60.jpg' ;
            }else{
                user_photo = __JMVC_IMG__ + 'user/user.jpg' ;
            }

            this.element.find('.comment-my .sc-sub>img').attr('src', user_photo) ;
        },

        // 调查评论列表
        comment_list : function(survey_code, page, pnum){
            var $elem,
                $this    = this,
                $comment = $this.element.find('.comment-list'),
                $tpl     = $comment.find('.cl-elem.tpl'),
                $last    = $comment.find('.cl-elem').last() ;

            // 取调查基本数据
            if(this.options.models$.survey_code){
                $.ajax({
                    type    : 'post',
                    url     : __API__,   // 调查基本信息查询接口
                    data    : {api:'survey_comment_list_select', survey_code:survey_code, page:page, pnum:pnum},
                    async   : false,
                    success : function(data$){
                        if(data$.status){
                            $this.element.addClass('list') ;

                            for(var i = data$.data.length - 1; i >= 0; i--){
                                data$.data[i].user_photo == 1 ?
                                    data$.data[i].user_photo = __JMVC_IMG__ + 'user/' + data$.data[i].user_code + '_60.jpg' :
                                    data$.data[i].user_photo = __JMVC_IMG__ + 'user/user.jpg' ;

                                $elem = $tpl.clone().removeClass('tpl').show().insertAfter($last) ;
                                $elem.find('.sc-sub img').attr('src', data$.data[i].user_photo) ;
                                $elem.find('.nick a').attr('href', data$.data[i].url_user).text(data$.data[i].user_nick) ;
                                $elem.find('.time').text(data$.data[i].comment_time) ;
                                $elem.find('.sc-body').html(data$.data[i].comment_txt) ;
                            }

                            // 当评论列表超过20条是在底部加入我的评论
                            if($comment.find('.cl-elem').size() > 10){
                                $this.element.find('.comment-sub').show() ;
                            }

                            // 已加满评论条数，隐藏加载按钮
                            if(data$.data.length < 10){
                                $comment.find('.cl-elem-more').hide() ;
                            }

                            // 页码更新
                            page ? $comment.attr('data-page', page) : $comment.attr('data-page', 1) ;
                        }else if($comment.find('.cl-elem').size() == 1){
                            $this.element.removeClass('list') ;
                        }else{
                            $comment.find('.cl-elem-more').hide() ;
                        }
                    }
                });
            }
        },
    }) ;
}) ;


