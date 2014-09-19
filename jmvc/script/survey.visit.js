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
    loadPlugin('countdown') ;
}) 
.then(function($){

    /*
     *  页面总控制器
     *
     **/
    $.Controller('Ctrl.Survey.Visit.Main', {
        defaults : {
            $state  : $('.st-state')             ,// 调查状态提示
            $button : $('#surveyButton>button')  ,// 参与按钮
        }
    }, {
        init : function(){
            var $this        = this,
                user_code    = this.options.user_code   = $.cookie('user_code'),             // 从cookie中取用户编码
                survey_code  = this.options.survey_code = this.element.attr('data-survey') ; // 取当前访问的问卷编码

            if(parseInt(survey_code) > 10000000){
                // 取调查基本数据
                $.ajax({
                    type    : 'post',
                    url     : __API__,   // 调查基本信息查询接口
                    data    : {api:'survey_info_find', survey_code:survey_code},
                    async   : false,
                    success : function(data$){
                        if(data$.status){
                            $this.options.survey$ = data$.data.info ;

                            // 针对当前的调查状态做处理
                            $this.survey_state($this.options.survey$.survey_state) ;
                        }
                    }
                });

            }else{
                
            }

        },

        // 调查状态处理
        survey_state : function(state){
            var $this = this ;

            // 判断当前调查状态做相应处理
            switch(parseInt(state)){
                case 0 :
                    this.options.$state.addClass('st-other').find('.st-other').text('活动未发布') ;
                    break ;

                case 1 :
                    this.options.$state.addClass('st-other').find('.st-other').text('活动未开始') ;
                    break ;

                case 2 :
                    // 活动开始倒计时
                    this.count_down('start') ;
                    this.options.$state.addClass('st-count') ;
                    break ;

                case 3 :
                    // 活动结束倒计时
                    this.count_down('end') ;
                    this.options.$state.addClass('st-count') ;
                    this.options.$button.show() ;

                    // 调查参与信息查询接口
                    $.post(__API__, 
                        {
                            api         : 'survey_action_select',
                            type        : 'simple',
                            user_code   : $this.options.user_code, 
                            survey_code : $this.options.survey_code, 
                        }, function(data$){
                        if(data$.status){
                            if(data$.data > 0){
                                // 如果数据非空，说明该用户已经参与过该问卷
                                $this.options.$button.filter('.answer').hide() ;
                                $this.options.$button.filter('.analyse').text('您已参与此调查，去查看调查分析').show() ;
                            }
                        }
                    }) ;
                    break ;

                case 4 :
                    this.options.$state.removeClass('st-count').addClass('st-other').find('.st-other').text('活动已结束') ;
                    this.options.$button.filter('.answer').hide() ;
                    this.options.$button.filter('.analyse').show() ;
                    break ;
            }
        },

        // 活动倒计时
        count_down : function(type){
            var count$, start, end, time,
                $this = this ;

            var int$ = setInterval(function(){
                time   = '' ;
                count$ = countdown(new Date(), moment($this.options.survey$[type + '_time'])) ;

                if(count$.value <= 0){
                    // 倒计时结束
                    window.clearInterval(int$) ;
                    
                    switch(type){
                        case 'start' :
                            $this.options.survey$.survey_state = 3 ;
                            $this.survey_state(3) ;
                            break ;
                        case 'end' :
                            $this.options.survey$.survey_state = 4 ;
                            $this.survey_state(4) ;
                            break ;
                    }
                }else{
                    // 倒计进行中
                    if(parseInt(count$.days)){   time = time + count$.days + '天'}
                    if(parseInt(count$.hours)){  time = time + count$.hours + '小时'}
                    if(parseInt(count$.minutes)){time = time + count$.minutes + '分'}
                    if(parseInt(count$.seconds)){time = time + count$.seconds + '秒'}

                    if(time != ''){
                        $this.options.$state.find('.cd-action').text(time + '后') ;
                    }

                    switch(type){
                        case 'start' :
                            $this.options.$state.find('.cd-desc').text('活动开始') ;
                            break ;
                        case 'end' :
                            $this.options.$state.find('.cd-desc').text('活动结束') ;
                            break ;
                    }
                }
            }, 500) ;
        },

        "{$button} click" : function(el){
            window.location.href = el.attr('href') ;
        }
    }) ;

    $('#Main').ctrl_survey_visit_main() ;

}) ;