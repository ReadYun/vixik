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
            var end_time, diff,
                models$     = this,
                survey_code = models$.survey_code ;

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

            // 取用户参与调查行为相关配置信息（访问用户行为配置规则查询接口）
            $.ajax({
                type    : 'post',
                url     : __API__,
                data    : {api:'user_action_cfg_select', action:$.toJSON([{code:1001, value:survey_code}])},
                async   : false,
                success : function(data$){
                    if(data$.status){
                        models$.action$ = data$.data[1001] ;
                    }
                }
            });
        }
    }) ;

    /*
     * 调查参与模块控制器
     *
     **/
    $.Controller('Survey.Action.Ctrl.Answer', {
        defaults : {
            models$      : {}                 ,// 页面总模型
            $question    : $('#question')     ,// 调查问题DOM
            $hintBar     : $('#hintBar')      ,// 调查提示栏DOM
            $itemFlag    : $('#itemFlag')     ,// 题目状态栏DOM对象
            $svHeader    : $('#svHeader')     ,// 调查头部DOM对象
            $aswProgress : $('#aswProgress')  ,// 答题进度提示DOM对象
        },
        listensTo : ["progress_hint", "data_collect"]
    }, {
        init : function(){
            var $this = this ;

            // 问题清单生成
            this.question_list(0) ;

            // 题目状态列表栏生成
            this.options.$itemFlag.append(
                __JMVC_VIEW__ + 'survey.answer.flag.ejs'                           ,// 题目状态列表模板路径
                {seq: seqArray(1, this.options.models$.survey$.question$.length)}   // 调用快速序列生成满足题目数量序列
            ) ;

            if($this.options.models$.survey$.info.survey_desc == null || $this.options.models$.survey$.info.survey_desc == ''){
                $this.options.$svHeader.find('i').remove() ;
            }
        },

        // 点击状态栏题目序号快速定位到对应题目
        ".item-flag click" : function(el){
            var $item = this.options.$question.find('.question[data-question_seq=' + el.text() + ']') ;

            window.scrollTo(0, $item.offset().top - 130) ;
        },

        "i.icon-double-angle-down click" : function(el){
            this.options.$svHeader.addClass('desc') ;
        },
        "i.icon-double-angle-up click" : function(el){
            this.options.$svHeader.removeClass('desc') ;
        },

        // 主观题失去焦点事件
        "textarea blur" : function(el){
            this.progress_hint() ;
        },

        // 点击包含有自定义选项的radio，消除对应的自定义选项
        "input ifClicked" : function(el){
            if(el.parents('.question').attr('data-question_type') == 'radio'){
                this.element.find('.question').not(el.parent('.question')).find('.custom-option').each(function(){
                    if($(this).attr('data-state') == 1){
                        $(this).attr('data-state', -1) ;
                        $(this).find('input.custom-opt').iCheck('uncheck') ;
                    }
                }) ;

                el.iCheck('check') ;
            }
        },

        // 调查数据提交
        "#submit>button click" : function(el){
            var $this   = this,
                models$ = $this.options.models$ ;

            if(this.options.$main.attr('data-survey') === 'preview'){
                alert('预览调查模拟提交') ;
            }else{
                // 提交前先校验用户是否已登录
                if(vixik$.user_verify({trigger$:{false:['login']}})){
                    // 收集数据（需交验）
                    if(this.data_collect(1)){
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
                                            user_code     : $.cookie('user_code'),     // 用户编码
                                            survey_code   : models$.survey_code,       // 调查编码
                                            custom_option : $.toJSON(models$.custom$)  // 自定义选项信息
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
                            var survey$ = {} ;

                            // 调查参与其他信息汇总
                            survey$.user_code   = models$.user_code ;
                            survey$.survey_code = models$.survey_code ;
                            survey$.get_score   = models$.action$.user_score ;
                            survey$.get_coins   = models$.action$.user_coins ;
                            survey$.start_time  = moment(models$.start_time).format("YYYY-MM-DD HH:mm:ss") ;
                            survey$.end_time    = moment().format("YYYY-MM-DD HH:mm:ss") ;
                            survey$.use_times   = 
                                moment(survey$.end_time, "YYYY-MM-DD HH:mm:ss").diff(moment(models$.start_time, "YYYY-MM-DD HH:mm:ss")) / 1000 ;

                            // 访问接口提交数据
                            $.post(__API__, 
                                {
                                    api      : 'survey_answer_submit'       ,// 调查参与提交接口
                                    survey   : $.toJSON(survey$)            ,// 参与调查信息
                                    question : $.toJSON(models$.question$)  ,// 参与题目信息
                                },
                                function(data$){
                                    if(data$.status){  // 提交成功更新页面
                                        $this.options.$main.trigger('answer_judage') ;
                                    }else{
                                        alert(data$.data) ;
                                    }
                                }
                            ) ;
                        }
                    }
                }
            }
        },

        // 问题列表展示
        question_list : function(num){
            var $question,
                $this     = this,
                question$ = $this.options.models$.survey$.question$ ;  // 取题目数据

            // 调查题目内容生成
            if(question$[num]){
                $this.options.$question.append(
                    __JMVC_VIEW__ + 'survey.answer.question.ejs',  // 调查题目模板路径
                    {data: question$[num]},
                    function(item){
                        // 定位最新生成的题目
                        $question = this.find('.question').last() ;

                        // 包含空格和换行符在用模板无法显示。。暂时先单独再匹配一下
                        $question.find('.qt-title').html(question$[parseInt($question.attr('data-question_seq'))-1].question_name) ;

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

            var progress,
                $flagElem = this.element.find('div.item-flag'),
                question$ = this.options.models$.question$ ;

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

        // 答题信息数据收集与校验
        data_collect : function(check){
            var flag, $item,

            // 数据收集
            data$ = this.options.$question.vkForm('get_value', {
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
                $item  = this.element.find('div.question[data-question_code=' + data$.info + ']') ;

                alert('题目【 ' + $item.find('div.qt-name').text() + '】 是必选项') ;
                window.scrollTo(0, $item.offset().top - 130) ;
                return false ;
            }
        },
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
            var seq     = this.options.$question.find('.qt-seq').text(),
                option  = this.options.models$.survey$.question$[seq-1].option,
                $select = this.options.$question.find('.custom-opt-spare select') ;

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
            var question_code = this.element.parents('.question').attr('data-question_code'),
                value = this.element.find('.custom-opt-name>input').val(),
                spare = this.element.find('.custom-opt-spare>select').val(),
                $elem = this.element.find('.custom-opt-result>.cor-option') ;

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
                    question_code : this.element.parents('.question').attr('data-question_code'),  // 对应问题编码
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
            eval('this.' + el.attr('data-func') + '()') ;
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
            models$    : {}                   ,// 页面总模型
            $answerBox : $('#answerBox')      ,// 调查参与模块DOM
            $afterBox  : $('#afterBox')       ,// 后续操作模块DOM
            $submit    : $('#submit>button')  ,// 提交按钮
        },
        listensTo : ["answer_judage"]
    }, {
        init : function(){
            var survey_code ;

            // 根据不同的类型获取调查相关数据
            if(this.element.attr('data-survey') === 'preview'){
                survey_code = $.cookie('sv_preview') ;
            }else{
                survey_code = this.element.attr('data-survey') ;
            }

            // 新建模型实例并初始化
            this.options.models$ = new Survey.Action.Model({    
                user$       : vixik$.user$                            ,// 用户总模型
                user_code   : $.cookie('user_code')                   ,// 用户编码
                survey_code : survey_code                             ,// 调查编码
                start_time  : moment().format("YYYY-MM-DD HH:mm:ss")  ,// 开始时间
            }) ;

            // 调查参与模块控制器
            this.options.$answerBox.survey_action_ctrl_answer({
                $main   : this.element         ,// 页面总对象
                models$ : this.options.models$ ,// 页面总模型
            }) ;

            // 后续操作模块控制器
            this.options.$afterBox.survey_action_ctrl_after({
                $main   : this.element         ,// 页面总对象
                models$ : this.options.models$ ,// 页面总模型
            }) ;

            this.answer_judage() ;
        },

        // VixiK总对象更新后操作
        "{vixik$} user" : function(){
            this.options.models$.user$ = vixik$.user$ ;
            this.options.models$.user_code = $.cookie('user_code') ;
            this.answer_judage() ;
        },

        // 用户是否参与过调查判断（调查参与信息查询接口）
        answer_judage : function(){
            var $this       = this,
                user_code   = this.options.models$.user_code,
                survey_code = this.options.models$.survey_code ;

            if(survey_code > 10000000){
                if(user_code >= 10000000){
                    // 已登录用户重置提交按钮信息
                    $this.options.$submit.text('提交结果') ;

                    $.ajax({
                        type    : 'post',
                        url     : __API__,
                        data    : {api:'user_action_verify', user_code:user_code, target:survey_code, action:'answer_survey'},
                        async   : false,
                        success : function(data$){
                            if(data$.status){
                                // 已参与此调查
                                alert('您已经参与完成本次调查') ;
                                $this.options.$answerBox.hide() ;
                                $this.options.$afterBox.show() ;
                            }else{
                                // 未参与此调查
                                $this.options.$submit.text('提交结果') ;
                            }
                        }
                    });
                }else{
                    // 游客用户
                    $this.options.$submit.text('登录后提交结果') ;
                }
            }else{
                // 调查预览
                $this.options.$submit.text('预览调查 · 模拟提交结果') ;
            }

        }
    }) ;

    $('#Main').survey_action_ctrl_main() ;
}) ;