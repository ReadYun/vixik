/**
 * Name        : survey.answer.js
 * Description : js for survey/answer.html
 *
 * Create-time : 2012-8-14 18:14:09
 * Author      : ReadYun
 * Copyright   : VixiK
 * Version     : 1.0.00
 */

steal('init.js')
.then('script/public.header.js')
.then(function($){
    loadPlugin('iCheck', 'vkData', 'vkForm', 'countdown') ;
}) 
.then(function($){

    /*
     * 页面总模型
     *
     **/
    $.Model('Survey.Action.Model', {
        defaults : {
            survey_code : 0   ,// 调查编码
            user_code   : 0   ,// 参与用户编码
            user_name   : ''  ,// 参与用户名称
            start_time  : ''  ,// 参与开始时间
            action      : 0   ,// 参与调查标志位
            user$       : {}  ,// 参与用户基本信息数据
            survey$     : {}  ,// 调查总信息
            question$   : {}  ,// 答题信息数据
            custom$     : []  ,// 自定义选项集合
        }
    }, {
        init : function(){
            var models$     = this,
                survey_code = models$.survey_code ;

            // 访问用户账户信息查询接口
            $.ajax({
                type    : 'post',
                url     : __API__,      
                data    : {api:'user_accout_find', user_code:models$.user_code},  // 用户编码
                async   : false,                  // 异步加载
                success : function(data$){
                    if(data$.status){
                        models$.user$ = data$.data ;
                        console.log(models$.user$) ;
                    }
                }
            });

            // 根据不同的类型获取调查相关数据
            if(models$.survey_code === 'preview'){
                // 创建调查预览题目类型
                models$.survey$ = $.parseJSON($.cookie('survey_preview')) ;

                console.log(models$.survey$) ;
            }else{
                // 正式参与调查类型
                // 取调查基本数据（访问调查信息查询接口）
                $.ajax({
                    type    : 'post',
                    url     : __API__,
                    data    : {api:'survey_info_find', survey_code:survey_code},
                    async   : false,
                    success : function(data$){
                        if(data$.status){
                            models$.survey$.info       = data$.data.info ;
                            models$.survey$.question$  = data$.data.question ;
                        }
                    }
                });

                $.ajax({
                    type    : 'post',
                    url     : __API__,
                    data    : {api:'survey_action_select', type:'simple', user_code:models$.user_code, survey_code:models$.survey_code},
                    async   : false,
                    success : function(data$){
                        if(data$.status){
                            models$.flag = data$.data ;
                        }
                    }
                });

                // 取用户参与调查行为相关配置信息（访问用户行为配置规则查询接口）
                $.ajax({
                    type    : 'post',
                    url     : __API__,
                    data    : {api:'user_action_cfg_select', action_code:1001, action_value:survey_code},   // 参与调查行为相关更新值
                    async   : false,
                    success : function(data$){
                        if(data$.status){
                            models$.action$ = data$.data ;
                        }
                    }
                });
            }
        }
    }) ;

    /*
     *  调查访问区域控制器
     *
     **/
    $.Controller('Survey.Action.Ctrl.Visit', {
        defaults : { 
            $surveyHeader : $('#surveyHeader')         ,// 活动提示区域
            $surveyDesc   : $('#surveyDesc')           ,// 活动提示区域
            $surveyCnt    : $('#surveyCnt')            ,// 活动提示区域
            $actionInfo   : $('#actionInfo')           ,// 活动提示区域
            $actionHint   : $('#actionHint')           ,// 活动提示区域
            $actionButton : $('#actionButton>button')  ,// 参与按钮
        }
    }, {
        init : function(){
            var count$, start, end, time ;
            var radio_num    = 0 ;
            var checkbox_num = 0 ;
            var textarea_num = 0 ;
            var answer_coins = 0 ;
            var $this        = this ;
            var user_code    = this.options.models$.user_code ;
            var user_nick    = this.options.models$.user_nick ;
            var survey_code  = this.options.models$.survey_code ;
            var question$    = this.options.models$.survey$.question$ ;

            if(survey_code == 'preview'){
                $this.element.find('#surveyHeader .header-sub>a').text(user_nick) ;
                $this.options.$actionHint.find('div.end').text('预览题目 >>') ;

                for(var i = 0; i < question$.length; i++){
                    switch(question$[i].question_type){
                        case 'radio' :
                            radio_num ++ ;
                            break ;
                        case 'checkbox' :
                            checkbox_num ++ ;
                            break ;
                        case 'textarea' :
                            textarea_num ++ ;
                            break ;
                    }
                }

                $this.options.$surveyCnt.find('.radio-num>div.value').text(radio_num) ;
                $this.options.$surveyCnt.find('.checkbox-num>div.value').text(checkbox_num) ;
                $this.options.$surveyCnt.find('.textarea-num>div.value').text(textarea_num) ;

                $this.element.find('#rewardScore>div.value').text($this.options.models$.survey$.info.create_coins/10) ;
                $this.element.find('#answerCnt>div.value').text(0) ;

                $this.options.$actionButton.attr('data-type', 'analyse').text('去预览题目 >>') ;
            }else{
                // 活动倒计时
                if(parseInt(survey_code) > 10000000){
                    var int$ = setInterval(function(){
                        count$ = countdown(new Date(), moment($this.options.models$.survey$.info.end_time)) ;
                        start  = moment(count$.start) ;
                        end    = moment(count$.end) ;

                        if(end.diff(start) <= 0){
                            $this.options.$actionHint.attr('data-survey-state', 4) ;
                            $this.options.$actionHint.find('div.end').text('活动已结束') ;
                            $this.options.$actionButton.attr('data-type', 'analyse').text('去查看调查分析 >>') ;

                            window.clearInterval(int$) ;
                        }else{
                            $this.options.$actionHint.attr('data-survey-state', 3) ;

                            time = count$.days + '天' + count$.hours + '小时' + count$.minutes + '分' + count$.seconds + '秒' ;
                            $this.options.$actionHint.find('div.count-down>div.time').text(time) ;
                        }
                    }, 500) ;
                }else{
                    $this.options.$actionHint.find('div.end').text('调查不存在') ;
                }
            }
        },

        "{$actionButton} click" : function(el){
            var $this = this ;
            var type  = el.attr('data-type') ;

            if(type === 'analyse'){
                // 取目标URL并转向目标页面
                $.post(__API__, {api:'get_server_url', name:'survey/' + type}, function(data$){
                    if(data$.status){
                        window.location.href = data$.data + '/s/' + $this.options.models$.survey_code ;
                    }
                }) ;
            }else{
                $this.element.fadeOut('normal', function(){
                    $this.options.$answer.fadeIn() ;
                    el.text('继续参与调查') ;
                }) ;
            }
        }
    }) ;

    /*
     * 调查参与模块控制器
     *
     **/
    $.Controller('Survey.Action.Ctrl.Answer', {
        defaults : {
            models$      : {}                   ,// 页面总模型
            $questionBox : $('#questionBox')    ,// 调查问题DOM
            $hintBar     : $('#hintBar')        ,// 调查提示栏DOM
            $itemFlag    : $('#itemFlag')       ,// 题目状态栏DOM对象
            $aswProgress : $('#aswProgress')    ,// 答题进度提示DOM对象
            $submit      : $('#submit>button')  ,// 提交按钮DOM
        },
        listensTo : ["progress_hint", "data_collect"]
    }, {
        init : function(){
            var viewFlag = __JMVC_VIEW__ + 'survey.action.flag.ejs' ;                    // 题目状态列表模板路径
            var itemSeq$ = seqArray(1, this.options.models$.survey$.question$.length) ;  // 调用快速序列生成满足题目数量序列

            // 问题清单生成
            this.question_list(0) ;

            // 题目状态列表栏生成
            this.options.$itemFlag.append(
                viewFlag,
                {seq: itemSeq$}
            ) ;
        },

        // 问题列表展示
        question_list : function(num){
            var $question ;
            var $this        = this ;
            var viewQuestion = __JMVC_VIEW__ + 'survey.action.question.ejs' ;  // 调查题目模板路径
            var question$    = $this.options.models$.survey$.question$ ;       // 取题目数据

            // 调查题目内容生成
            if(question$[num]){
                $this.options.$questionBox.append(
                    viewQuestion,
                    {data: question$[num]},
                    function(item){
                        // 定位最新生成的题目
                        $question = this.find('.question-item').last() ;

                        //  表单元素使用iCheck样式
                        $question.find('.vf-elem-option input').iCheck({
                            checkboxClass: 'icheckbox_minimal-grey',
                               radioClass: 'iradio_minimal-grey'
                        }) ;

                        $question.find('.icheckbox_minimal-grey').addClass('icheck') ;
                        $question.find('.iradio_minimal-grey').addClass('icheck') ;

                        // 点击事件绑定
                        $question.find('input').on('ifClicked', function(){
                            // 因为'ifClicked'事件有延迟，故用setTimeout方法延迟调用数据收集功能
                            setTimeout(function(){
                                $this.progress_hint() ;
                            }, 10) ;
                        }) ;
                        
                        // 参与用户等级高于发布者设定的自定义选项权限等级，显示自定义选项区域
                        if(parseFloat($this.options.models$.user$.user_level) >= parseFloat($question.attr('data-custom-option'))){
                            // 自定义选项控制器绑定
                            $question.find('.custom-option').show().survey_action_ctrl_custom_option({
                                models$   : $this.options.models$ ,// 总模型
                                $main     : $this.element         ,// 总DOM对象
                                $question : $question             ,// 传入当前题目DOM对象
                            }) ;
                        }

                        // 判断
                        if(num == question$.length+1){
                            return true ;
                        }else{
                            $this.question_list(++num) ;
                        }
                    }
                ) ;
            }
        },

        // 答题进度提示更新
        progress_hint : function(){
            this.data_collect() ;    // 先收集汇总数据（非校验）

            var progress ;
            var $flagElem = this.element.find('div.item-flag') ;
            var question$ = this.options.models$.question$ ;

            // 进度状态栏处理
            $flagElem.removeClass('ok') ;    // 先初始化所有状态栏
            for(var i = 0, v = 0; i < question$.length; i++){
                if(question$[i]['option'] && question$[i]['option'].length > 0){
                    $flagElem.eq(question$[i]['question_seq'] - 1).addClass('ok') ;
                    v ++ ;
                }
            }

            // 答题进度提示更新处理并显示
            this.options.$aswProgress.text(parseInt(question$.length * 100 / $flagElem.size()) + '%') ;
        },

        // 点击状态栏题目序号快速定位到对应题目
        "div.item-flag click" : function(el){
            var seq   = el.text() ;
            var $item = $('div.seq-' + seq) ;

            window.scrollTo(0, $item.offset().top - 130) ;
        },

        // 点击状态栏题目序号快速定位到对应题目
        ".sv-desc>i click" : function(el){
            var $this = this ;

            $this.element.fadeOut('normal', function(){
                $this.options.$visit.fadeIn() ;
            }) ;
        },

        // 主观题失去焦点事件
        "textarea blur" : function(el){
            this.progress_hint() ;
        },

        // 点击包含有自定义选项的radio，消除对应的自定义选项
        "input ifClicked" : function(el){
            if(el.parents('.question-item').attr('data-question_type') == 'radio'){
                this.element.find('.question-item').not(el.parent('.question-item')).find('.custom-option').each(function(){
                    if($(this).attr('data-state') == 1){
                        $(this).attr('data-state', -1) ;
                        $(this).find('input.custom-opt').iCheck('uncheck') ;
                    }
                }) ;

                el.iCheck('check') ;
            }
        },

        // 答题信息数据收集与校验
        data_collect : function(check){
            var flag, $item ;

            // 数据收集
            var data$ = this.options.$questionBox.vkForm('get_value', {
                get_type    : '3',
                get_null    : false,
                check_null  : check,
                key_list    : ['question_code', 'question_type', 'question_seq'],
                alias_name  : 'question_code',
                alias_value : 'option',
            }) ;

            // 数据校验
            if(data$.status){
                this.options.models$.question$ = data$.data ;  // 送数据进总模型
                return true ;
            }else{
                $item  = this.element.find('div.question-item[data-question_code=' + data$.info + ']') ;

                alert('题目【 ' + $item.find('div.qt-name').text() + '】 是必选项') ;
                window.scrollTo(0, $item.offset().top - 130) ;
                return false ;
            }
        },

        // 调查数据提交
        "{$submit} click" : function(el){
            var question_code ;
            var $this   = this ;
            var models$ = $this.options.models$ ;

            this.data_collect() ;

            if(parseInt(models$.survey_code) > 10000000){
                // 自定义选项信息处理
                models$.custom$ = [] ;
                this.element.find('.custom-option').each(function(){
                    $(this).trigger('data_collect') ;
                }) ;

                // 如果有自定义选项信息，访问自定义选项增加接口提交数据
                if(models$.custom$.length > 0){
                    $.ajax({
                        type    : 'post',
                        url     : __API__,
                        data    : { api           : 'survey_custom_option_add',
                                    user_code     : $.cookie('user_code'),                   // 用户编码
                                    survey_code   : models$.survey_code,                     // 调查编码
                                    custom_option : $.toJSON($this.options.models$.custom$)  // 自定义选项信息
                                  },
                        async   : false,
                        success : function(data$){
                            if(data$.status){
                                alert('您的自定义选项已创建成功') ;

                                // 自定义选项创建完成后更新自定义选项编码
                                for(var i = 0; i < data$.data.length; i++){
                                    $this.element.find('.custom-option [name=' + data$.data[i].question_code + ']')
                                    .attr('value', data$.data[i]['option_code']) ;
                                }
                            }else{
                                alert('您的自定义选项未创建成功，请检查设置') ;
                                return false ;
                            }
                        }
                    });
                }

                // 收集答题数据（需要做数据校验）成功后提交到服务器
                if($this.data_collect(1)){    
                    var survey$    = {} ;
                    var start_time = models$.start_time ;
                    var end_time   = moment().format("YYYY-MM-DD HH:mm:ss")
                    var use_times  = moment(end_time, "YYYY-MM-DD HH:mm:ss").diff(moment(start_time, "YYYY-MM-DD HH:mm:ss")) / 1000 ;

                    // 调查参与其他信息汇总
                    survey$.user_code   = models$.user_code ;
                    survey$.survey_code = models$.survey_code ;
                    survey$.get_score   = models$.action$.user_score.value ;
                    survey$.get_coins   = models$.action$.user_coins.value ;
                    survey$.start_time  = moment(start_time).format("YYYY-MM-DD HH:mm:ss") ;
                    survey$.end_time    = moment(end_time).format("YYYY-MM-DD HH:mm:ss") ;
                    survey$.use_times   = use_times ;

                    // 访问接口提交数据
                    $.post(__API__, 
                        {
                            api      : 'survey_answer_submit',
                            survey   : $.toJSON(survey$),            // 参与调查信息
                            question : $.toJSON(models$.question$),  // 参与题目信息
                        },
                        function(data$){
                            if(data$.status){  // 提交成功更新页面
                                $this.options.$main.trigger('answerJudage') ;
                            }else{
                                alert('调查提交未成功，请检查答题内容') ;
                            }
                        }
                    ) ;
                }
            }else{
                // alert('预览调查模拟提交') ;
            }
        }
    }) ;

    /*
     * 自定义选项控制器
     *
     **/
    $.Controller('Survey.Action.Ctrl.Custom.Option', {
        defaults : {
            models$ : {}   ,// 页面总模型
        },
        listensTo : ["data_collect"]
    }, {
        init : function(){
            var seq     = this.options.$question.find('.qt-seq').text() ;
            var option  = this.options.models$.survey$.question$[seq-1].option ;
            var $select = this.options.$question.find('.custom-opt-spare select') ;

            for(var i = 0; i < option.length; i++){
                // 需要判断选项类型决定是否加入备胎选项
                if(option[i].option_type == 1){
                    $('<option></option>').attr('value', option[i].option_code).text(option[i].option_name).appendTo($select) ;
                }
            }

            // 建立自定义选项副本备用
            this.options.$option = this.element.find('.custom-opt-result>.option-ele').children().clone() ;
        },

        // 初始按钮【加入我的选项】功能
        "button.co-init click" : function(){
            this.element.attr('data-state', 0) ;
        },

        // 设置完成提交按钮功能
        "button.co-submit click" : function(el){
            var question_code = this.element.parents('.question-item').attr('data-question_code') ;
            var value = this.element.find('.custom-opt-name>input').val() ;
            var spare = this.element.find('.custom-opt-spare>select').val() ;
            var $elem = this.element.find('.custom-opt-result>.cor-option') ;

            if(!value){
                alert('请填写完善自定义选项名称') ;
                return false ;
            }
            if(!spare){
                alert('请选择备用选项') ;
                return false ;
            }

            // 选项状态与样式处理
            $elem.find('.co-input-name').text(value) ;

            // 表单元素使用iCheck样式
            $elem.find('input.custom-opt').attr('name', question_code).attr('value', value).iCheck({
                checkboxClass: 'icheckbox_minimal-grey',
                   radioClass: 'iradio_minimal-grey'
            }).iCheck('check') ;

            $elem.find('.icheckbox_minimal-grey').addClass('icheck') ;
            $elem.find('.iradio_minimal-grey').addClass('icheck') ;

            this.element.attr('data-state', 1) ;
            $('#answerBox').trigger('progress_hint') ;
        },

        // 取消设置按钮功能
        "button.co-cancel click" : function(){
            this.element.attr('data-state', -1) ;
        },

        // 已设定选项重新编辑功能
        "i.icon-pencil click" : function(){
            this.element.find('input.custom-opt').iCheck('uncheck') ;
            $('#answerBox').trigger('progress_hint') ;
            this.element.attr('data-state', 0) ;
        },

        // 删除已设定选项
        "i.icon-remove click" : function(){
            this.element.find('input.custom-opt').iCheck('uncheck') ;
            $('#answerBox').trigger('progress_hint') ;
            this.element.attr('data-state', -1) ;
        },

        // 自定义选项失去check要提示确认
        "input.custom-opt ifUnchecked" : function(el){
            if(this.element.hasClass('effect')){
                if(confirm("自定义的选项必须要选中才有效，你确定要取消选中吗？这将关闭自定义选项")){
                    this.element.removeClass('effect').attr('data-effect', 0) ;
                    el.iCheck('uncheck') ;

                    setTimeout(function(){
                        $('#answerBox').trigger('progress_hint') ;
                    }, 10) ;
                }
            }
        },

        // 自定义选项数据收集
        data_collect : function(){
            if(this.element.attr('data-state') == 1){
                var data$ = {
                    option_name   : this.element.find('.custom-opt-name input').val(),                  // 自定义选项名称
                    custom_spare  : this.element.find('.custom-opt-spare select').val(),                // 自定义选项对应备用选项编码
                    question_code : this.element.parents('.question-item').attr('data-question_code'),  // 对应问题编码
                }

                this.options.models$.custom$.push(data$) ;
            }else{
                return false ;
            }
        },
    }) ;

    /*
     *  调查参与统计提示控制器
     *
     **/
    $.Controller('Survey.Action.Ctrl.After', {
        defaults : {
            models$      : {}                   ,// 页面总模型
            $flagElem    : $('div.item-flag')   ,// 题目状态栏子列表DOM对象
            $aswProgress : $('#aswProgress')     // 答题进度DOM对象
        }
    }, {
        init : function(){
        },

        // 点击下一步模块各种选项
        ".next-action click" : function(el){
            var func = el.attr('data-func') ;
            var eval_str = 'this.' + func + '()' ;
            eval(eval_str) ;
        },

        // 查看我的参与内容
        show_answer : function(){
            this.options.$main.find('#answerBox').find('input,select,textarea').attr('disabled', true) ;
            this.options.$main.attr('main-state', '1') ;
        },

        // 查看调查分析报告
        see_analyse : function(){
            var $this = this
            $.post(__API__, {api:'get_server_url', name:'survey/analyse'}, function(data$){
                if(data$.status){
                    window.location.href =  data$.data + '/s/' + $this.options.models$.survey_code ;
                }
            });
        },

        // 重新参与本次调查
        answer_again : function(){
            this.options.$main.find('#answerBox').find('input,select,textarea').attr('disabled', false) ;
            this.options.$main.attr('main-state', '0') ;
        },

        // 继续参与其他调查
        answer_other : function(){
            $.post(__API__, {api:'get_server_url', name:'survey/answer'}, function(data$){
                if(data$.status){
                    window.location.href =  data$.data ;
                }
                
            });
        },

        // 收藏本次调查
        collect_survey : function(){
            console.log('aaa') ;
        },

        // 关注调查发布者
        collect_survey : function(){
            console.log('aaa') ;
        },

        // 推荐给其他朋友
        recomm_survey : function(){
            console.log('aaa') ;
        },

        // 分享本次调查
        share_survey : function(){
            console.log('aaa') ;
        }
    }) ;

    /*
     *  页面总控制器
     *
     **/
    $.Controller('Survey.Action.Ctrl.Main', {
        defaults : {
            models$    : {}               ,// 页面总模型
            $visitBox  : $('#visitBox')   ,// 调查访问模块DOM
            $answerBox : $('#answerBox')  ,// 调查参与模块DOM
            $afterBox  : $('#afterBox')   ,// 后续操作模块DOM
        },
        listensTo : ["answerJudage"]
    }, {
        init : function(){
            var user_code   = $.cookie('user_code') ;                   // 从cookie中取用户编码
            var user_nick   = $.cookie('user_nick') ;                   // 从cookie中取用户昵称
            var survey_code = this.element.attr('data-survey') ;        // 调查编码
            var start_time  = moment().format("YYYY-MM-DD HH:mm:ss") ;  // 调查开始时间

            // 新建模型实例并初始化
            this.options.models$ = new Survey.Action.Model({    
                user_code   : user_code    ,// 用户编码
                user_nick   : user_nick    ,// 用户昵称
                survey_code : survey_code  ,// 调查编码
                start_time  : start_time   ,// 开始时间
            }) ;

            // 调查访问模块控制器
            this.options.$visitBox.survey_action_ctrl_visit({
                $main   : this.element ,
                models$ : this.options.models$ , 
                $answer : this.options.$answerBox ,
            }) ;

            // 调查参与模块控制器
            this.options.$answerBox.survey_action_ctrl_answer({
                $main   : this.element ,
                models$ : this.options.models$ , 
                $visit  : this.options.$visitBox ,
            }) ;

            if(user_code && survey_code != 'preview'){
                // 后续操作模块控制器
                this.options.$afterBox.survey_action_ctrl_after({
                    models$ : this.options.models$ , 
                    $main   : this.element
                }) ;

                // 根据用户参与初始化页面
                // this.answerJudage() ;

                // this.options.$visitBox.hide() ;
                // this.options.$answerBox.hide() ;
                // this.options.$afterBox.show() ;
            }
        },

        // 用户是否参与过调查判断（调查参与信息查询接口）
        answerJudage : function(){
            var $this       = this ;
            var user_code   = this.options.models$.user_code ;
            var survey_code = this.options.models$.survey_code ;

            $.ajax({
                type    : 'post',
                url     : __API__,
                data    : {api:'survey_action_select', type:'simple', survey_code:survey_code, user_code:user_code},
                async   : false,
                success : function(data$){
                    if(data$.status){
                        if(parseInt(data$.data)){
                            alert('您已经参与完成本次调查') ;
                            $this.options.$answerBox.hide() ;
                            $this.options.$afterBox.show() ;
                        }
                    }else{
                        alert('用户信息查询失败，请刷新页面') ;
                    }
                }
            });
        }
    }) ;

    $('#Main').survey_action_ctrl_main() ;
}) ;