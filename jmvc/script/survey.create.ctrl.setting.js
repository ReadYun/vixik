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
            models$         : {}                     ,// 页面总模型
            $Main           : {}                     ,// 页面总对象
            $surveyClass    : $('.survey-class')     ,// 开始时间选择对象
            $surveyType     : $('.survey-type')      ,// 开始时间选择对象
            $surveyTypeSub  : $('.survey-type-sub')  ,// 开始时间选择对象
            $surveyTrade    : $('.survey-trade')     ,// 开始时间选择对象
            $surveyRange    : $('.survey-range')     ,// 开始时间选择对象
            $surveyEnd      : $('.survey-end')       ,// 开始时间选择对象
        },
        listensTo : ["data_collect"]
    }, {
        init : function(){
            var start, end, now, length,
                $this = this ;
            
            // 如果已经有调查基本信息数据存在。。匹配数据
            if(!$.isEmptyObject(this.options.models$.info$)){
                this.setting_fix() ;
            }
        },

        // 总模型调查信息数据更新触发
        "{models$} sv_info" : function(){
            this.setting_fix() ;
        },

        // 调查大类选择切换
        "a.sv-type click" : function(el){
            this.sv_type_change(el.attr('data-code')) ;
        },

        // 调查小类选择
        "a.sv-type-sub click" : function(el){
            el.parents('.se-body').addClass('ok').children('.dropdown-toggle').text(el.text()) ;

            if(el.parents('.cs-item').attr('data-sv-type-sub') != el.attr('data-code')){
                el.parents('.cs-item').attr('data-sv-type-sub', el.attr('data-code')) ;
            }
        },

        // 调查行业选择
        "a.sv-trade click" : function(el){
            el.parents('.se-body').addClass('ok').children('.dropdown-toggle').text(el.text()) ;

            if(el.parents('.cs-item').attr('data-sv-trade') != el.attr('data-code')){
                el.parents('.cs-item').attr('data-sv-trade', el.attr('data-code')) ;
            }
        },

        // 活动结束方式设置
        ".sv-et click" : function(el){
            var $surveyEnd = this.options.$surveyEnd ;
            
            // 选择内容显示
            el.parents('.se-body').addClass('ok').children('.dropdown-toggle').text(el.text()) ;

            if($surveyEnd.attr('data-sv-end') != el.attr('data-code')){
                $surveyEnd.attr('data-sv-end', el.attr('data-code')) ;
                this.sv_end_refresh() ;
            }
        },

        // 活动结束时间设置
        ".ev-day click" : function(el){
            el.parents('.se-body').addClass('ok').attr('data-val', el.attr('data-code')).
            children('.dropdown-toggle').text(el.text()) ;

            if(el.parents('.cs-item').attr('data-sv-end-value') != el.attr('data-code')){
                el.parents('.cs-item').attr('data-sv-end-value', el.attr('data-code')) ;
                this.sv_end_refresh() ;
            }
        },

        // 活动结束时间设置
        "input.ev-elem keyup" : function(el){
            if(el.val() == ''){
                el.attr('data-val', 0) ;
            }else{
                el.attr('data-val', el.val()) ;
            }

            this.sv_end_refresh() ;
        },

        // 结束方式描述更新
        sv_end_refresh : function(type, value){
            var end_value,
                $surveyEnd = this.options.$surveyEnd,
                $end_value = this.options.$surveyEnd.find('.end-value'),
                end_type   = parseInt($surveyEnd.attr('data-sv-end')),
                end_val    = parseInt($end_value.find('.end-val-' + end_type).attr('data-val')),
                end_name   = $surveyEnd.find('.sv-et[data-code=' + end_type + ']').text() ;

            value ? end_value = value : end_value = end_val ;
            $surveyEnd.attr('data-sv-end-value', end_value) ;

            // 结束方式与状态刷新
            $end_value.find('.se-desc').text($end_value.attr('data-title') + end_name) ;

            if(end_type != 0 && end_value != 0){
                $end_value.find('.end-val-' + end_type).addClass('ok') ;

                switch(end_type){
                    case 1 :  // 参与人数方式结束
                        if(!end_value == end_val){
                            $end_value.find('.end-val-' + end_type).attr('data-val', end_value).attr('value', end_value) ;
                        }

                        $surveyEnd.find('.end-desc').show().text('参与人数达到' + end_value + '人时活动结束') ;
                        break ;

                    case 2 :  // 开展时长方式结束
                        if(!end_value == end_val){
                            $end_value.find('.end-val-' + end_type).attr('data-val', end_value).text(end_value + '天') ;
                        }

                        $surveyEnd.find('.end-desc').show().text('活动开展' + end_value + '天后结束') ;
                        break ;
                }
            }else{
                $end_value.find('.se-body').removeClass('ok') ;
                $surveyEnd.find('.end-desc').hide() ;
            }
        },

        // 调查属性数据匹配
        setting_fix : function(){
            var $this = this,
                info$ = this.options.models$.info$,
                $survey_end = this.element.find('.survey-end') ;

            // 调查类型
            if(info$.survey_type){
                this.sv_type_change(info$.survey_type, info$.survey_type_sub) ;
            }

            // 调查行业
            if(parseInt(info$.survey_trade)){
                $this.options.$surveyTrade.find('.se-body').addClass('ok').children('.dropdown-toggle').text(
                    $this.options.$surveyTrade.find('a.sv-trade[data-code=' + info$.survey_trade + ']').text()) ;

                this.element.find('.cs-item').attr('data-sv-trade', info$.survey_trade) ;
            }

            // 参与用户范围
            this.element.find('.survey-range select').attr('value', info$.target_range) ;

            if(parseInt(info$.end_type)){
                $this.options.$surveyEnd.attr('data-sv-end', info$.end_type).attr('data-sv-end-value', info$.end_value)
                    .find('.end-type .se-body').addClass('ok').children('.dropdown-toggle')
                    .text($this.options.$surveyEnd.find('a.sv-et[data-code=' + info$.end_type + ']').text()) ;

                if(parseInt(info$.end_value)){
                    this.element.find('.end-value').show() ;
                    this.sv_end_refresh(parseInt(info$.end_type), parseInt(info$.end_value)) ;
                }
            }
        },

        // 调查类型刷新
        sv_type_change : function(sv_type, sv_type_sub){
            var $this = this,
                name  = this.options.$surveyType.find('a.sv-type[data-code=' + sv_type + ']').text(),
                $stpl = $this.element.find('a.sts-tpl') ;

            if(sv_type){
                // 调查大类选择结果显示
                $this.options.$surveyType.find('.se-body').addClass('ok').children('.dropdown-toggle').text(name) ;

                // 判断是否需要重新初始化调查小类
                if($this.options.$surveyClass.attr('data-sv-type') != sv_type){
                    $this.options.$surveyClass.attr('data-sv-type', sv_type) ;

                    $this.options.$surveyTypeSub.find('a.sv-type-sub').remove() ;

                    $this.options.$surveyTypeSub.find('.se-body').removeClass('ok')
                    .find('.dropdown-toggle').html("点击选择<i class='icon-angle-down'></i>") ;

                    $.ajax({
                        type    : 'post',
                        url     : __API__,                                                  
                        data    : {api:'det_data_select', table:'survey_type_sub', condition:'survey_type_code=' + sv_type},
                        asynce  : false,
                        success : function(data$){
                            for(var i = data$.data.length - 1; i >= 0; i--){
                                $stpl.clone().show().removeClass('sts-tpl').addClass('sv-type-sub')
                                .attr('data-code', data$.data[i].survey_type_sub_code)
                                .text(data$.data[i].survey_type_sub_name).insertAfter($stpl) ;
                            }

                            if(sv_type_sub && $this.options.$surveyClass.attr('data-sv-type-sub') != sv_type_sub){
                                $this.options.$surveyTypeSub.find('.se-body').addClass('ok').children('.dropdown-toggle')
                                .text($this.options.$surveyTypeSub.find('a.sv-type-sub[data-code=' + sv_type_sub + ']').text()) ;

                                $this.options.$surveyClass.attr('data-sv-type-sub', sv_type_sub) ;
                            }
                        }
                    });
                }
            }
        },

        // 收集调查设置信息
        data_collect : function(){
            var $this    = this,
                setting$ = {} ;

            // 调查分类
            setting$.survey_type     = $this.options.$surveyClass.attr('data-sv-type') ;
            setting$.survey_type_sub = $this.options.$surveyClass.attr('data-sv-type-sub') ;
            setting$.survey_trade    = $this.options.$surveyClass.attr('data-sv-trade') ;

            // 参与用户范围
            setting$.target_range = $this.options.$surveyRange.find('select').val() ;

            // 活动周期
            setting$.end_type  = $this.options.$surveyEnd.attr('data-sv-end') ;
            setting$.end_value = $this.options.$surveyEnd.attr('data-sv-end-value') ;

            // 数据校验
            if($this.options.models$.collect$.flag && $this.options.models$.collect$.state != 'draft'){
                $.each(setting$, function(sk, sv){
                    if($this.options.models$.collect$.flag){
                        if(sv == '' || sv == 0){
                            switch(sk){
                                case 'survey_type' :
                                    $this.options.models$.collect$.flag = false ;
                                    alert('请选择一个调查归属大类') ;
                                    break ;

                                case 'survey_type_sub' :
                                    $this.options.models$.collect$.flag = false ;
                                    alert('请选择一个调查归属小类') ;
                                    break ;

                                case 'survey_trade' :
                                    // 商业调查和满意度调查必须设置行业类型
                                    if(setting$.survey_type == '1002' || setting$.survey_type == '1003'){
                                        $this.options.models$.collect$.flag = false ;
                                        alert('请选择一个行业类型') ;
                                    }
                                    break ;

                                case 'end_type' :
                                    $this.options.models$.collect$.flag = false ;
                                    alert('请选择活动结束方式') ;
                                    break ;

                                case 'end_value' :
                                    switch(setting$.end_type){
                                        case '1' : 
                                            $this.options.models$.collect$.flag = false ;
                                            alert('请输入活动计划参与人数') ;
                                            break ;

                                        case '2' : 
                                            $this.options.models$.collect$.flag = false ;
                                            alert('请选择活动活动开展时长') ;
                                            break ;

                                    }
                                    break ;
                            }
                        }
                    }else{
                        $this.options.models$.elem_refresh($this.element) ;
                        return false ;
                    }
                }) ;
            }

            // 传入数据给总模型
            $.extend(this.options.models$.info$, setting$) ;
            return true ;
        },
    }) ;
}) ;


