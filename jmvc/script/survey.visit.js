/**
 * Name        : survey.visit.js
 * Description : js for survey/survey.visit.html
 *
 * Create-time : 2012-8-14 18:14:09
 * Author      : ReadYun
 * Copyright   : VixiK
 * Version     : 1.0.00
 */

steal('init.js')
.then('script/public.header.js')
.then(function($){
    loadPlugin('countdown', 'vkForm', 'vkButton') ;
}) 
.then(function($){

    /*
     *  页面总控制器
     *
     **/
    $.Controller('Ctrl.Survey.Visit.Main', {
        defaults : {
            $Comment   : $('#svComment')    ,// 调查评论模块
            $commenTpl : $('.sc-elem.tpl')  ,// 评论列表模板
        }
    }, {
        init : function(){
            var $this       = this,
                user_code   = this.options.user_code   = $.cookie('user_code'),             // 从cookie中取用户编码
                survey_code = this.options.survey_code = this.element.attr('data-survey') ; // 取当前访问的问卷编码

            if(parseInt(survey_code) > 10000000){
                // 取调查基本数据
                $.ajax({
                    type    : 'post',
                    url     : __API__,   // 调查基本信息查询接口
                    data    : {api:'survey_info_find', survey_code:survey_code},
                    async   : false,
                    success : function(data$){
                        if(data$.status){
                            $this.options.survey$ = data$.data ;

                            $this.survey_tag($this.options.survey$) ;
                            $this.survey_state($this.options.survey$) ;
                            $this.comment_list() ;
                        }
                    }
                });
            }

            if(parseInt(user_code) >= 10000000){
                $this.user_info(vixik$.user$) ;
                $this.user_action_verify(user_code) ;
            }
            
            $this.element.addClass('active') ;
        },

        // 总对象用户数据更新时触发
        "{vixik$} user" : function(){
            if($.cookie('user_code')){
                this.options.user_code = $.cookie('user_code') ;

                this.user_info(vixik$.user$) ;
                this.user_action_verify(this.options.user_code) ;
            }
        },

        // 调查说明详情切换
        ".sl-ext>a click" : function(el){
            if(el.hasClass('more')){
                el.parents('#svDesc').addClass('all') ;
            }else{
                el.parents('#svDesc').removeClass('all') ;
            }
        },

        // 评论登录
        ".need-login>button click" : function(){
            vixik$.user_verify({trigger$:{false:['login_open']}}) ;
        },

        // 提交评论
        ".cm-submit>button click" : function(){
            var $this = this,
                txt   = this.element.find('.cm-input').html() ;

            if(txt != ''){
                // 提交评论
                $.ajax({
                    type    : 'post',
                    url     : __API__,   // 调查基本信息查询接口
                    data    : {api:'survey_comment_submit', user_code:this.options.user_code,survey_code:this.options.survey_code,comment_txt:txt},
                    success : function(data$){
                        if(data$.status){
                            alert('评论成功') ;
                            $this.comment_list() ;
                            $this.element.find('.cm-input').text('') ;
                        }
                    }
                });
            }
        },

        // 用户信息匹配
        user_info : function(user$){
            var user_photo ;

            vixik$.user$.user_photo == 1 ?
                user_photo = __JMVC_IMG__ + 'user/' + vixik$.user$.user_code + '_60.jpg' :
                user_photo = __JMVC_IMG__ + 'user/user.jpg' ;

            this.element.find('.comment-my .sc-sub>img').attr('src', user_photo) ;
        },

        // 用户参与判断
        user_action_verify : function(user_code){
            var $this       = this,
                survey_code = this.options.survey_code,
                action$     = $.toJSON(['create_survey', 'answer_survey', 'follow_survey']) ;

            // 用户行为校验
            $.ajax({
                type    : 'post',
                url     : __API__,   // 调查基本信息查询接口
                data    : {api:'user_action_verify', user_code:user_code, target: survey_code, action: action$},
                async   : false,
                success : function(data$){
                    if(data$.status){
                        if(parseInt(data$.data.answer_survey)){
                            $this.element.find('.sv-button>button.answer').addClass('disabled').text('您已参与过本次调查') ;
                        }
                    }
                }
            });
        },

        // 调查标签
        survey_tag : function(survey$){
            var tags$,
                $Tag = this.element.find('.sv-tags') ;
                $tpl = $Tag.find('.tpl') ;

            if(survey$.info.survey_tag){
                tags$ = survey$.info.survey_tag.split(",") ;

                for(var i = 0; i < tags$.length; i++){
                    $tpl.clone().removeClass('tpl').text(tags$[i]).appendTo($Tag) ;
                }
            }else{
                $Tag.hide() ;
            }
        },

        // 调查评论列表
        comment_list : function(){
            var $elem,
                $this = this ;

            // 取调查基本数据
            $.ajax({
                type    : 'post',
                url     : __API__,   // 调查基本信息查询接口
                data    : {api:'survey_comment_list_select', survey_code: this.options.survey_code},
                async   : false,
                success : function(data$){
                    if(data$.status){
                        $this.options.$Comment.addClass('list').find('.comment-list').children().not('.tpl').remove() ;

                        for(var i = 0; i < data$.data.length; i++){
                            data$.data[i].user_photo == 1 ?
                                data$.data[i].user_photo = __JMVC_IMG__ + 'user/' + data$.data[i].user_code + '_60.jpg' :
                                data$.data[i].user_photo = __JMVC_IMG__ + 'user/user.jpg' ;

                            $elem = $this.options.$commenTpl.clone().removeClass('tpl').show() ;
                            $elem.find('.sc-sub img').attr('src', data$.data[i].user_photo) ;
                            $elem.find('.nick a').attr('href', data$.data[i].url_user).text(data$.data[i].user_nick) ;
                            $elem.find('.time').text(data$.data[i].comment_time) ;
                            $elem.find('.sc-body').html(data$.data[i].comment_txt) ;

                            $elem.appendTo($this.options.$Comment.find('.comment-list')) ;
                        }
                    }else{
                        $this.options.$Comment.removeClass('list') ;
                    }
                }
            });
        },

        // 调查结束方式
        survey_state : function(survey$){
            var $tagert, cd_time,
                $this  = this,
                $svEnd = this.element.find('.sv-end'),
                value  = parseInt(survey$.info.end_value) ;

            switch(parseInt(survey$.info.survey_state)){
                case 4 :  // 活动已结束
                    $target = $svEnd.find('.se-over').addClass('active') ;
                    $this.element.find('.sv-button>button.answer').hide() ;
                    break ;

                case 3 :  // 活动进行中
                    switch(parseInt(survey$.info.end_type)){
                        case 1 :
                            $target = $svEnd.find('.se-cd-1').addClass('active') ;
                            $target.find('span').text(parseInt(value) - parseInt(survey$.stats.answer_count)) ;

                            break ;

                        case 2 :
                            $target = $svEnd.find('.se-cd-2').addClass('active') ;
                            cd_time = moment(survey$.info.start_time).add(value, 'day').format('YYYY-MM-DD hh:mm:ss') ;
                            $this.count_down($target, cd_time) ;

                            break ;
                    }
                    break ;

                case 2 :  // 活动已发布未开始
                    $target = $svEnd.find('.se-soon').addClass('active') ;
                    break ;

                default :  // 活动未发布
                    alert('活动未发布，返回调查中心') ;
                    break ;
            }
        },

        // 活动倒计时
        count_down : function($target, date){
            var cd$, count$, time,
                $this = this ;

            cd$ = setInterval(function(){
                time   = '' ;
                count$ = countdown(new Date(), moment(date)) ;

                if(count$.value <= 0){
                    // 倒计时结束
                    window.clearInterval(cd$) ;
                    $this.element.find('.sv-button>button.answer').hide() ;
                }else{
                    // 倒计进行中
                    if(parseInt(count$.days)){   time = time + count$.days + '天'}
                    if(parseInt(count$.hours)){  time = time + count$.hours + '小时'}
                    if(parseInt(count$.minutes)){time = time + count$.minutes + '分'}
                    if(parseInt(count$.seconds)){time = time + count$.seconds + '秒'}

                    if(time != ''){
                        $target.find('span').text(time) ;
                    }
                }
            }, 500) ;
        },
    }) ;

    $('#Main').ctrl_survey_visit_main() ;

}) ;