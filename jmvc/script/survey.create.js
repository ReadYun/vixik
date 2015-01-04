/**
 * Name        : survey.create.js
 * Description : js for survey/create.html
 *
 * Create-time : 2012-8-14 18:14:09
 * Author      : ReadYun
 * Copyright   : VixiK
 * Version     : 1.0.00
 */

steal('init.js')
.then('script/public.header.js')
.then(function($){
    loadPlugin('vkForm', 'vkData', 'iCheck', 'countdown') ;
})
.then('script/survey.create.model.js')
.then('script/survey.create.ctrl.content.js')
.then('script/survey.create.ctrl.setting.js')
.then('script/survey.create.ctrl.recomm.js')
.then(function($){

    /*
     * 调查创建模块总控制器
     *
     **/
    $.Controller('Survey.Create.Ctrl.Survey', {
        defaults : {
            models$          : {}                     ,// 页面总模型
            $Main            : {}                     ,// 页面总对象
            $surveyElement   : $('div.sv-elem')       ,// 调查元素集合
            $surveyContent   : $('#surveyContent')    ,// 调查内容模块对象
            $surveySetting   : $('#surveySetting')    ,// 调查设置模块对象
            $surveyRecommend : $('#surveyRecommend')  ,// 调查发布设置模块
            $successModal    : $('#successModal')     ,// 创建调查成功弹出框对象
        },
        listensTo : ["save_draft"]
    }, {
        init : function(){
            $('button').attr("disabled", false) ;

            // 调查题目模块对象控制器
            this.options.$surveyContent.survey_create_ctrl_content({
                models$ : this.options.models$,
                $survey : this.element,
            }) ;

            // 调查设置对象总控制器
            this.options.$surveySetting.survey_create_ctrl_setting({
                models$ : this.options.models$
            }) ;

            // 调查推荐设置对象控制器
            this.options.$surveyRecommend.survey_create_ctrl_recommend({
                models$ : this.options.models$ ,
                $Main   : this.options.$Main
            }) ;
        },

        "{$surveyElement} click" : function(el){
            this.options.models$.step$.action = el.attr('data-step') ;
            this.options.models$.trigger('flag_step') ;
        },

        // 主按钮点击事件
        "#surveyButton>button click" : function(el){
            var $this = this ;

            if(vixik$.user_verify({trigger$:{false:['login']}})){
                // 先失效被点击的按钮防止二次点击提交
                el.attr('disabled', true).text('数据提交中...') ;

                // 确定数据校验标志位
                $this.options.models$.collect$.state = 'submit' ;
                $this.options.models$.collect$.flag  = true ;

                // 数据收集
                $this.options.$surveyElement.each(function(){
                    if($this.options.models$.collect$.flag){
                        $(this).trigger('data_collect') ;
                    }else{
                        return false ;
                    }
                }) ;

                // 如收集校验数据顺利完成，提交数据
                if($this.options.models$.collect$.flag){
                    if(this.submit_data(2)){
                        if(this.options.models$.info$.survey_state == 2){
                            alert('调查发布成功！') ;
                            $this.options.models$.draft$.flag = false ;  // 停止保存草稿
                            $this.options.$Main.trigger('success') ;     // 转入成功模块
                        }else{
                            alert('草稿已保存..') ;
                        }
                    }else{
                        alert('调查发布失败！') ;
                    }
                }

                // 生效按钮
                el.attr('disabled', false).text(el.attr('title')) ;
            }
        },

        // 保存草稿
        save_draft : function(){
            var $this   = this,
                models$ = $this.options.models$ ;

            // 保存草稿相关参数配置
            models$.collect$.state = 'draft' ;
            models$.collect$.check = false ;
            models$.collect$.flag  = true ;
            models$.draft$.flag    = true ;

            // 遍历各模块收集数据
            $this.options.$surveyElement.each(function(){
                if(models$.collect$.flag){
                    $(this).trigger('data_collect') ;
                }else{
                    return false ;
                }
            }) ;

            // 如果能顺利收集数据，提交数据
            if(models$.collect$.flag && $this.submit_data(1)){
                // 草稿更新成功，重置草稿倒计时
                models$.draft$.last = moment() ;
                models$.draft$.next = moment(models$.draft$.last).add('m', models$.draft$.length) ;
                $('#syncBox').attr('data-state', 1) ;
            }else{
                // 草稿更新失败，重置草稿倒计时对象的next值（+length）
                models$.draft$.next = moment().add('m', models$.draft$.length) ;
                $('#syncBox').attr('data-state', 1) ;
            }

            return true ;
        },

        // 提交数据
        submit_data : function(survey_state){
            var $this   = this,
                flag    = true,
                models$ = this.options.models$ ;

            // 更新汇总数据中的调查状态值
            models$.info$.survey_state = survey_state ;

            console.dir(models$.info$) ;
            console.dir(models$.question$) ;

            // 发布调查需要先进行账户金币判定
            if(survey_state == 2 && 1==2){
                // 访问用信息查询接口取出用户当前金币数
                $.ajax({
                    type    : 'post',
                    url     : __API__,    
                    data    : {api:'user_info_find', user_code:models$.user_code},
                    async   : false,
                    success : function(data$){
                        if(data$.status){
                            user_coins   = data$.data.user_coins ;
                            create_coins = $this.options.models$.coins$.coins_publish ;

                            // 用户账户金币余额大于创建调查所需金币才能发布调查，否则只能先保存为草稿
                            if(user_coins < create_coins){
                                alert('您的帐号金币数量不够创建本次调查，先为您保存为草稿') ;
                                models$.info$.survey_state = 1 ;
                            }
                        }else{
                            console.log(data$.info) ;
                            alert('核实用户信息失败，请重新点击提交') ;
                        }
                    }
                }); 
            }

            // 先提交调查基本信息信息和题目信息（访问调查创建接口）
            // $.ajax({
            //     type    : 'post',
            //     url     : __API__,
            //     data    : { api         : 'survey_create'              ,// 调查创建接口
            //                 user_code   : models$.user_code            ,// 用户编码
            //                 survey_code : models$.survey_code          ,// 调查编码
            //                 info        : $.toJSON(models$.info$)      ,// 调查基本信息
            //                 question    : $.toJSON(models$.question$)  ,// 调查题目信息
            //               },
            //     async   : false,
            //     success : function(data$){
            //         if(data$.status){
            //             // 新调查创建成功更新调查编码到模型中
            //             models$.survey_code = data$.data ;

            //             // 如果选择主动推荐并且自定义推荐规则，取设置的推荐规则
            //             if(models$.info$.recomm_type == 2 && models$.recommend$){
            //                 $.ajax({
            //                     type    : 'post',
            //                     url     : __API__,
            //                     data    : {api:'survey_recomm_create', survey_code:models$.survey_code, rule:$.toJSON(models$.recommend$)},
            //                     async   : false,
            //                     success : function(data$){
            //                         if(data$.status){
            //                             flag = true ;
            //                         }else{
            //                             flag = false ;
            //                             if(models$.collect$.check){
            //                                 alert('推荐规则设置不成功，请检查设置') ;
            //                             }
            //                         }
            //                     }
            //                 });
            //             }
            //         }else{
            //             console.log(data$.info) ;
            //             if(models$.collect$.check){
            //                 alert('调查发布不成功！') ;
            //             }
            //             flag = false ;
            //         }
            //     }
            // });

            return flag ;
        }
    }) ;

    /*
     * 调查统计信息显示控制器
     *
     **/
    $.Controller('Survey.Create.Ctrl.Sider', {
        defaults : {
            models$   : {}                ,// 页面总模型
            $Main     : {}                ,// 页面总对象
            $stepBox  : $('#stepBox')     ,// 创建步骤模块对象
            $coinsBox : $('#coinsBox')    ,// 金币模块对象
            $stepOpt  : $('#stepBox li')  ,// 步骤选项对象
            $syncBox  : $('#syncBox')     ,// 调查同步提示模块对象
        },
        listensTo : ["elem_active", "save_countdown"]
    }, {
        init : function(){
            this.coins_show() ;

            // 页面步骤显示初始化
            this.element.find('#stepBox li').first().addClass('active') ;
        },

        // 总对象用户数据更新时触发
        "{vixik$} user" : function(){
            if($('[name=survey_name]').html()){
                this.save_countdown() ;
            }
        },

        // 模型金币数据更新触发
        "{models$} user_coins" : function(){
            this.coins_show() ;
        },

        // 点击步骤选项
        "{$stepOpt} click" : function(el){
            this.element.find('li').removeClass('active') ;
            el.addClass('active') ;

            this.options.models$.elem_refresh($('#' + el.attr('data-section')), 'location') ;
        },

        // 页面元素步骤提示刷新
        "{models$} active" : function(){
            if(this.options.models$.$active.attr('data-step')){
                var step = this.options.models$.$active.attr('data-step') ;
            }else{
                var step = this.options.models$.$active.parents('.sv-elem').attr('data-step') ;
            }

            if(step){
                this.options.$stepOpt.removeClass('active') ;
                this.options.$stepOpt.filter('.' + step).addClass('active') ;
            }
        },

        // 页面元素定位刷新
        "{models$} location" : function(){
            // 滚动页面定位到目标对象
            window.scrollTo(0, this.options.models$.$location.offset().top - 60) ;
        },

        // 立即保存草稿
        "div.sync-manu click" : function(){
            this.options.models$.draft$.flag = true ;

            this.options.$syncBox.attr('data-state', 1) ;
            this.options.$survey.trigger('save_draft') ;
        },

        // 金币显示功能
        coins_show : function(){
            this.options.$coinsBox.find('div.remain-coins>div.coins-value').text(this.options.models$.coins$.coins_surplus) ;
            this.options.$coinsBox.find('div.used-coins>div.coins-value').text(this.options.models$.coins$.coins_publish) ;
        },

        // 保存草稿倒计时（默认间隔3分钟）
        save_countdown : function(){
            var now, state, length,
                $this = this ;

            if($this.options.$syncBox.attr('data-state') == '-1'){
                // 保存草稿前确认用户已登录
                if(vixik$.user_verify()){
                    // 倒计时处理（间隔0.5秒处理一次）
                    var cd$ = setInterval(function(){
                        now    = moment() ;
                        state  = $this.options.$syncBox.show().attr('data-state') ;
                        length = $this.options.models$.draft$.length ;

                        // 加一个倒计时标志位以便随时停止
                        if($this.options.models$.draft$.flag && $this.options.models$.survey_state != 2){
                            if(!$this.options.models$.draft$.last || !$this.options.models$.draft$.next){
                                // 倒计时初始化
                                $this.options.models$.draft$.last = moment() ;
                                $this.options.models$.draft$.next = moment($this.options.models$.draft$.last).add('m', length) ;
                                $this.options.$syncBox.attr('data-state', 0) ;

                                cd_last$ = countdown(now, moment($this.options.models$.draft$.last)) ;   // 上次保存时间倒计时
                                cd_next$ = countdown(moment($this.options.models$.draft$.next), now) ;   // 下次保存时间倒计时

                                if(cd_last$.seconds % 5 == 0){
                                    $this.options.$syncBox.find('.last .time').text(cd_last$.minutes + ':' + cd_last$.seconds + '前') ;
                                    $this.options.$syncBox.find('.next .time').text(cd_next$.minutes + ':' + cd_next$.seconds + '后') ;
                                }
                            }else if(now.diff($this.options.models$.draft$.next) >= 0){
                                if(state != 2){
                                    // 已到保存时间，保存调查（now > next）
                                    if(vixik$.user_verify()){
                                        $this.options.$syncBox.attr('data-state', 2) ;
                                        $this.options.$survey.trigger('save_draft') ;
                                    }else{
                                        clearInterval(cd$) ;    // 用户校验都不通过，当然要停止倒计时咯
                                    }
                                }
                            }else{
                                // 如果还没到下次保存时间（now < next）
                                cd_last$ = countdown(now, moment($this.options.models$.draft$.last)) ;   // 上次保存时间倒计时
                                cd_next$ = countdown(moment($this.options.models$.draft$.next), now) ;   // 下次保存时间倒计时

                                if(cd_last$.seconds % 5 == 0){
                                    $this.options.$syncBox.find('.last .time').text(cd_last$.minutes + ':' + cd_last$.seconds + '前') ;
                                    $this.options.$syncBox.find('.next .time').text(cd_next$.minutes + ':' + cd_next$.seconds + '后') ;
                                }
                            }
                        }else{
                            clearInterval(cd$) ;
                        }

                    }, 500) ;
                }
                else{
                    if(cd$){
                        clearInterval(cd$) ;    // 停止倒计时
                    }
                    $this.options.$syncBox.attr('data-state', '-1').hide() ;
                }
            }
        },
    }) ;

    /*
     * 页面总控制器
     *
     **/
    $.Controller('Survey.Create.Ctrl.Main', {
        defaults : {
            models$ : {}               ,// 页面总模型
            $Header : $('#Header')     ,// #Header
            $survey : $('#surveyBox')  ,// 调查主体模块对象
            $mainSd : $('#mainSider')  ,// 调查信息模块对象
            $mainSv : $('#mainBody') ,// 调查信息模块对象
            $mainSc : $('#successBox') ,// 调查主体模块对象
        },
        listensTo : ['data_refresh', 'success']
    }, {
        init : function(){
            var $this = this ;

            // 新建模型实例并初始化
            this.options.models$ = new Survey.Create.Model({
                survey_code     : this.element.attr('data-sv-code')     ,// 调查编码
                survey_type     : this.element.attr('data-sv-type')     ,// 调查大类
                survey_type_sub : this.element.attr('data-sv-type-sub') ,// 调查小类
            }) ;

            // 调查信息对象控制器
            this.options.$mainSd.survey_create_ctrl_sider({
                models$ : this.options.models$ ,
                $Main   : this.element         ,
                $survey : this.options.$survey ,
            }) ;

            // 创建调查主题对象控制器
            this.options.$survey.survey_create_ctrl_survey({    
                models$    : this.options.models$ ,
                $Header    : this.options.$Header ,
                $Main      : this.element         ,
                $mainSider : this.options.$mainSider  ,
            }) ;

            // 初始先刷新一次数据
            this.data_refresh() ;
            this.element.find('input[type=text]').attr('value', '') ;

            window.scrollTo(0, 0) ;
            $('body').show() ;
        },

        // 总模型用户信息更新
        "{vixik$} user" : function(){
            this.data_refresh() ;
        },

        // 各模块元素点击事件刷新侧边栏状态
        "div.sv-elem click" : function(el){
            this.options.models$.elem_refresh(el, 'active') ;
        },

        // 数据刷新
        data_refresh : function(){
            if(vixik$.user$){
                this.options.models$.user$     = vixik$.user$ ;            // 更新用户模型
                this.options.models$.user_code = vixik$.user$.user_code ;  // 用户编码
            }else{
                this.options.models$.user$.user_coins = 0 ;
            }

            // 重新计算金币
            this.options.models$.coins_cnt() ;
        },

        // 调查创建成功
        success : function(){
            var survey_code  = this.options.models$.survey_code,
                survey_type  = this.options.models$.info$.survey_type,
                survey_trade = this.options.models$.info$.survey_trade,
                $next        = this.options.$mainSc.show().find('.next-act') ;

            // 几个选项初始化href
            $next.filter('.sv-analy').attr('href', $next.filter('.sv-analy').attr('href') + '?code=' + survey_code) ;
            $next.filter('.sv-type').attr('href', $next.filter('.sv-type').attr('href') + '?code=' + survey_type) ;

            if(survey_trade){
                $next.filter('.sv-trade').show().attr('href', $next.filter('.sv-trade').attr('href') + '?code=' + survey_trade) ;
            }

            this.options.$mainSd.hide() ;
            this.options.$mainSv.hide() ;

            // 顶部重新初始化
            $('#Header').trigger('scroll_init') ;
        },
    }) ;

    $('#Main').survey_create_ctrl_main() ;
}) ;


