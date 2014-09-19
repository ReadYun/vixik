/**
 * Name        : survey.create.ctrl.recomm.js
 * Description : js for survey/create.html
 *
 * Create-time : 2013-5-14 18:14:09
 * Author      : ReadYun
 * Copyright   : VixiK
 * Version     : 1.0.00
 */

steal('init.js')
.then(function($){

    /*
     * 问卷推荐模块控制器
     *
     **/
    $.Controller('Survey.Create.Ctrl.Recomm.Rule', {
        defaults : {
            models$ : {}                               ,// 页面总模型
            $recomm : {}                               ,// 推荐模块总对象
            $body   : $('.recomm-rule-body')           ,// 规则设置模块
            $item   : $('.rule-item')                  ,// 规则设置项目
            $side   : $('.recomm-rule-side')           ,// 规则菜单模块
            $stats  : $('.recomm-rule-stats')          ,// 统计模块
            $submit : $('.recomm-rule-submit>button')  ,// 提交按钮
        },
        listensTo : ["data_collect"]
    }, {
        init : function(){
            // 初始重置所有设置表单元素
            this.options.$body.vkForm('init', {
                reset : true,     // 顺便重置表单

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
            }) ;

            // 规则匹配
            this.rule_fix() ;
        },

        // 规则匹配
        rule_fix : function(){
            // 如果有自定义推荐规则，匹配到自定义规则表单元素中
            this.options.$body.vkForm('reset') ;

            if(this.options.models$.survey_code && this.options.models$.recommend$){
                for(var i = 0; i < this.options.models$.recommend$.length; i++){
                    var key   = this.options.models$.recommend$[i].rule_key ;
                    var logic = this.options.models$.recommend$[i].rule_logic ;
                    var value = this.options.models$.recommend$[i].rule_value.split(',') ;
                    var $item = this.element.find('[data-rule-key=' + key + ']') ;

                    // 不同的逻辑类型对应不同的匹配方式
                    switch(logic){
                        case 'in' :
                            for(var v = 0; v < value.length; v++){
                                $item.find('input[value=' + value[v] + ']').iCheck('check') ;    //iCheck样式
                            }
                            break ;

                        case 'between' :
                            for(var v = 0; v < value.length; v++){
                                $item.find('input[type=text]').eq(v).attr('value', value[v]) ;
                            }
                            break ;
                    }
                }

                // 匹配完数据还要刷新列表状态统计数量
                this.rule_stats(this.options.models$.recommend$) ;
            }
        },

        // 规则数据汇总
        rule_collect : function(){
            var flag, rule_key, rule_logic, rule_value, rule_sql, data$, value$,
                $this  = this,
                rules$ = [] ;

            // 遍历所有规则项收集数据
            setTimeout(function(){
                $this.options.$item.each(function(){
                    flag       = false ;
                    data$      = {} ;
                    value$     = [] ;
                    rule_key   = $(this).attr('data-rule-key') ;    // 推荐规则条件汇总
                    rule_logic = $(this).attr('data-rule-logic') ;  // 推荐规则逻辑关系

                    switch(rule_logic){
                        case 'in' :
                            $(this).find('input:checked').each(function(){
                                value$.push($(this).val()) ;
                            }) ;

                            if(value$.length){
                                rule_value = value$.join() ;
                                rule_sql   = '(' + rule_value + ')' ;
                                flag       = true ;
                            }
                            break ;

                        case 'between' :
                            $(this).find('input').each(function(){
                                if($(this).val()){
                                    value$.push($(this).val()) ;
                                }
                            }) ;

                            if(value$.length === 2){
                                rule_value = value$.join() ;
                                rule_sql   = value$.join(' and ') ;
                                flag       = true ;
                            }
                            break ;
                    }

                    if(flag){
                        data$.rule_key   = rule_key ;
                        data$.rule_value = rule_value ;
                        data$.rule_logic = rule_logic ;
                        data$.rule_sql   = rule_key + ' ' + rule_logic + ' ' + rule_sql ;

                        rules$.push(data$) ;
                    }
                }) ;

                if(rules$.length){
                    $this.rule_stats(rules$) ;
                }
            }, 10) ;
        },

        // 推荐规则相关统计处理
        rule_stats : function(rules$){
            var $this = this,
                cond$ = [] ;

            // 整理汇总推荐条件SQL
            for(var i = 0; i < rules$.length; i++){
                cond$.push(rules$[i].rule_sql) ;
            }

            // 访问用户数统计汇总接口查询可推荐的用户数
            $.ajax({
                type    : 'post',
                url     : __API__,
                data    : {api:'user_count', condition_sql:$.toJSON(cond$)},
                async   : false,
                success : function(data$){
                    $this.options.$side.find('li').removeClass('valid') ;

                    if(data$.status){
                        $this.options.$stats.find('.value').text(parseInt(data$.data)) ;
                        $this.options.models$.rules$ = rules$ ;

                        // 更新规则菜单提示
                        for(var i = 0; i < rules$.length; i++){
                            $this.options.$side.find('[data-rule-key=' + rules$[i].rule_key + ']').addClass('valid') ;
                        }

                        return data$.data ;
                    }else{
                        $this.options.models$.rules$ = undefined ;
                        return false ;
                    }
                }
            });

            return true ;
        },

        // 输入表单元素选择事件
        "input ifClicked" : function(el){
            this.rule_collect() ;
        },

        // 输入表单元素选择事件
        "input blur" : function(el){
            this.rule_collect() ;
        },

        // 取消当前的规则设置
        "button.rule-cancel click" : function(){
            if(confirm('您确认取消当前设置的推荐规则？')){
                this.rule_fix() ;
                this.element.modal('hide') ;
            }
        },

        // 所有规则设置完成提交
        "button.rule-finish click" : function(){
            // 确认设置规则
            if(this.options.models$.rules$){
                this.options.models$.recommend$ = this.options.models$.rules$ ;  // 更新模型推荐规则设置数据
                this.options.models$.info$.recomm_type = 2 ;                     // 更新模型推荐类型
                this.options.$recomm.trigger('recomm_reset') ;                   // 刷新推荐规则信息

                // 关闭规则设置窗口
                this.element.modal('hide') ;
            }else{
                alert("推荐规则不完整，请检查设置") ;
            }
        },

        // 单项规则清除功能
        "i.icon-remove click" : function(el){
            var key = el.parents('li').attr('data-rule-key') ;
            
            this.options.$body.find('[data-rule-key=' + key + ']').vkForm('reset') ;   // 目标选项清空初始化
            this.rule_collect() ;
        },
    }) ;

    /*
     * 问卷推荐模块控制器
     *
     **/
    $.Controller('Survey.Create.Ctrl.Recommend', {
        defaults : {
            models$     : {}                      ,// 页面总模型
            $recommBox  : $('#recommBox')         ,// 推荐设置总对象
            $recommType : $('#recommChoose>div')  ,// 推荐方式选择选项
            $recommRule : $('#recommendRule')     ,// 自定义推荐设置模块
        },
        listensTo : ["recomm_reset", "data_collect"]
    }, {
        init : function(){
            // 自定义推荐设置模块控制器
            this.options.$recommRule.survey_create_ctrl_recomm_rule({
                models$ : this.options.models$ ,
                $recomm : this.element
            }) ;

            if(this.options.models$.info$){
                var recomm_type = this.options.models$.info$.recomm_type ;

                // 推荐选择数据匹配
                if(recomm_type){
                    this.options.$recommBox.attr('data-recomm-type', recomm_type) ;    // 推荐类型确定
                    this.element.find('.choose-elem[data-recomm=' + recomm_type + ']').addClass('active') ;
                }
            }
        },

        // 选择不同的推荐方式
        "{$recommType} click" : function(el){
            var recomm_type = el.attr('data-recomm'),
                coins       = parseInt(el.find('.coins-value').text()) ;

            this.options.models$.info$.recomm_type = recomm_type ;

            if(coins > 0 && !el.hasClass('active')){
                alert('提示：选择此项需要消耗' + coins + '金币') ;
            }

            if(recomm_type == '2'){
                this.options.$recommRule.modal() ;
            }else{
                this.recomm_reset() ;
            }
        },

        // 推荐模块重置
        recomm_reset : function(){
            var recomm_type = this.options.models$.info$.recomm_type ;

            // 推荐方式选择选项当前状态更新
            this.options.$recommType.removeClass('active') ;
            this.options.$recommType.filter('[data-recomm=' + recomm_type + ']').addClass('active') ;

            // 数据模型更新
            this.options.models$.coins_cnt() ;
        },

        // 这里的实际上就是数据校验
        data_collect : function(){
            if(this.options.models$.info$.recomm_type == null){
                if(this.options.models$.collect$.check){
                    alert('请确定调查推荐方式') ;
                    this.options.models$.location(this.element) ;
                    this.options.models$.collect$.flag = false ;

                    return false ;
                }
            }else{
                if(this.options.models$.info$.recomm_type > 1){
                    if(!$.vkData('data_check_null', this.options.models$.recommend$).status){
                        alert('自定义推荐规则设置不完整，请检查完善信息') ;
                        this.options.models$.location(this.element) ;
                        this.options.models$.collect$.flag = false ;

                        return false ;
                    }
                }
            }
        }
    }) ;
}) ;
