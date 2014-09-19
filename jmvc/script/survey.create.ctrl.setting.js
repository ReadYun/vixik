/**
 * Name        : creat.ctrl.setting.js
 * Description : js for survey/create.html
 *
 * Create-time : 2012-8-14 18:14:09
 * Author      : ReadYun
 * Copyright   : VixiK
 * Version     : 1.0.00
 */

steal('init.js')
.then(function($){

    /*
     * 问卷设置模块控制器
     *
     **/
    $.Controller('Survey.Create.Ctrl.Setting', {
        defaults : {
            models$     : {}                          ,// 页面总模型
            $Main       : {}                          ,// 页面总对象
            $startTime  : $('div.start-time button')  ,// 开始时间选择对象
            $endTimes   : $('div.end-times button')   ,// 结束时间对象
            $svRecomm   : $('#surveyRecomm button')   ,// 问卷推荐选项按钮
            $btnPublish : $('#btnPublish')            ,// 问卷发布提交按钮
        },
        listensTo : ["data_collect"]
    }, {
        init : function(){
            var start, end, now, length,
                $this = this ; 

            this.element.find('.vk-form').vkForm('init', {
                reset : true,     // 顺便重置表单

                // 样式定义
                style : function($target){
                    // 题目选项美化处理（要排除模板选项）
                    if($target){
                        $target.find('.vf-elem-option').find('input').iCheck({
                            checkboxClass: 'icheckbox_minimal-grey',
                               radioClass: 'iradio_minimal-grey',
                        }) ;

                        // 为统一样式加入icheck标记
                        $('.icheckbox_minimal-grey').addClass('icheck') ;
                        $('.iradio_minimal-grey').addClass('icheck') ;
                    }else{
                        $('.vf-elem-option').find('input').iCheck({
                            checkboxClass: 'icheckbox_minimal-grey',
                               radioClass: 'iradio_minimal-grey',
                        }) ;

                        // 为统一样式加入icheck标记
                        $('.icheckbox_minimal-grey').addClass('icheck') ;
                        $('.iradio_minimal-grey').addClass('icheck') ;
                    }
                },

                // 事件定义
                event : {
                    // 选中事件
                    check : function(el){
                        el.iCheck('check') ;  // 调用iCheck插件的check方法
                    },

                    // 取消选中事件
                    uncheck : function(el){
                        el.iCheck('uncheck') ;  // 调用iCheck插件的uncheck方法
                    },
                },

                // 表单元素重置方法定义
                replace : {
                    common : function(){
                    },

                    survey_type_sub : $this.sv_type_sub_replace,    // 传入调查属性刷新函数
                }
            }) ;

            // 调查小类部分属性初始化
            $this.element.find('.vf-elem[data-vf-name=survey_type_sub]').attr('data-rep-url',__API__).attr('data-rep-api','det_data_select') ;
            
            // 如果已经有调查基本信息数据存在。。匹配数据
            if(!$.isEmptyObject(this.options.models$.info$)){
                this.element.find('.vk-form').vkForm('fix', {data$:this.options.models$.info$}) ;

                // start = moment(this.options.models$.info$.start_time).format('YYYY-MM-DD') ;
                // end   = moment(this.options.models$.info$.end_time).format('YYYY-MM-DD') ;
                // now   = moment().format('YYYY-MM-DD') ;

                // // 匹配开始时间设置
                // if(start){
                //     if(moment(start).diff(now) == 0){
                //         // 当天修改调查，直接匹配到开始时间为立即开始
                //         $this.element.find('[data-start-type=now]').addClass('ok') ;
                //         $this.element.find('.start-time>label').addClass('ok').attr('data-value', moment().format('YYYY-MM-DD HH:mm:ss')) ;
                //     }else if(moment(start).diff(now) > 0){
                //         // 几天后开始的调查，直接匹配到稍后开始活动
                //         $this.element.find('[data-start-type=later]').addClass('ok').text(start + ' 开始活动') ;
                //         $this.element.find('.start-time>label').addClass('ok').attr('data-value', moment(start).format('YYYY-MM-DD HH:mm:ss')) ;
                //     }

                //     // 匹配结束时间设置
                //     if(end){
                //         // 计算草稿保存的开始时间和结束时间的天数差后匹配结束时间
                //         length = moment(end).diff(start, 'day') ;

                //         $this.element.find('[data-length-day=' + length + ']').addClass('ok') ;
                //         $this.element.find('.end-times>label').addClass('ok').attr('data-value', length) ;
                //     }
                // }
            }
        },

        // 选择调查大类实时刷新调查小类
        "input ifClicked" : function(el){
            var sub = el.parents('.vf-elem').attr('data-vf-sub') ;

            if(sub){
                setTimeout(function(){
                    $('.vf-elem[data-vf-name=' + sub +']').attr('data-rep-para', el.val()).vkForm('replace') ; ;
                }, 10) ;
            }
        },

        // 活动开展时长设置
        "button.sv-date click" : function(el, ev){
            $('button.sv-date').removeClass('active') ;
            $(ev.target).addClass('active') ;
            // el.parent('.').attr('data-value', parseInt($(ev.target).attr('data-length-day'))) ;
        },

        // 活动开始时间设置
        "div.start-time click" : function(el, ev){
            var $this   = this,
                models$ = this.options.models$,
                $target = $(ev.target),
                type    = $target.attr('data-start-type') ;

            el.find('label').removeClass('ok') ;
            el.find('a.button').removeClass('ok') ;

            // 不同的开始类型不同的处理方式
            switch(type){
                case 'now' :    // 立即开始
                    el.find('label').addClass('ok').attr('data-value', moment().format("YYYY-MM-DD HH:mm:ss")) ;
                    $target.addClass('ok') ;
                    break ;

                case 'later' :    // 稍后开始
                    $this.element.find('.date-picker').show().datepicker({
                        onSelect : function(date){
                            $(this).hide() ;

                            // 判断选择的日期是否符合要求
                            if(moment(date, "YYYY-MM-DD").diff(moment(moment().format("YYYY-MM-DD")), 'day') > 0){
                                $target.text(date + ' 开始活动') ;

                                el.find('label').addClass('ok').attr('data-value', moment(date, "YYYY-MM-DD").format("YYYY-MM-DD HH:mm:ss")) ;
                                $target.addClass('ok') ;
                            }else{
                                alert('活动必须在今天之后开始!') ;
                            }
                        }
                    }) ;
                    break ;
            }
        },

        // 活动结束时间设置
        "div.end-times click" : function(el, ev){
            el.find('a.button').removeClass('ok') ;
            $(ev.target).addClass('ok') ;
            el.find('label').addClass('ok').attr('data-value', parseInt($(ev.target).attr('data-length-day'))) ;
        },

        // 收集调查设置信息
        data_collect : function(){
            var data$, setting$, $elem,
                length_day = this.element.find('button.sv-date.active').attr('data-length-day') ;

            // 先校验基本设置信息
            if(this.options.models$.collect$.check){
                data$ = this.element.find('.vk-form').vkForm('get_value', {check_null:2}) ;

                if(!data$.status){
                    $elem = this.element.find('[name=' + data$.info + ']').parents('.cs-item') ;

                    alert('请设置' + $elem.find('.cs-label').text() + '信息') ;  // 弹出错误提示
                    this.options.models$.location($elem) ;
                    $this.options.models$.collect$.flag = false ;
                    return false ;
                }else{
                    setting$ = data$.data ;
                }

                // 活动开展时长
                if(length_day){
                    setting$.length_day = length_day ;
                }else{
                    alert('请设置活动开展时长') ;
                    this.options.models$.location($('#surveyDate')) ;
                    this.options.models$.collect$.flag = false ;
                }
            }else{
                setting$ = this.element.find('.vk-form').vkForm('get_value').data ;

                // 活动开展时长
                if(length_day){
                    setting$.length_day = length_day ;
                }
            }

            // 传入数据给总模型
            $.extend(this.options.models$.info$, setting$) ;
        }
    }) ;
}) ;


