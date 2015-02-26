
/**
 * Name        : survey.analyse.svstats.js
 * Description : js for survey/analyse.html
 *
 * Create-time : 2012-8-14 18:14:09
 * Author      : ReadYun
 * Copyright   : VixiK
 * Version     : 1.0.00
 */

steal('init.js')
.then(function($){  
    loadPlugin('vkHighChart', 'vkData', /*'vkEChart',*/ 'vkForm') ;  // 加载所需插件
})
.then(function($){

    /*
     * 整体分析模块控制器
     *
     */
    $.Controller('Survey.Analyse.Ctrl.Sv.Stats', {
        defaults : {
            models$     : {}                ,// 页面总模型
            $itemStats  : $('#itemStats')   ,// 调查题目数量统计模块DOM
            $trendStats : $('#trendStats')  ,// 参与趋势概览统计模块DOM
            $areaStats  : $('#areaStats')   ,// 用户地域分布统计模块DOM
            $userStats  : $('#userStats')   ,// 用户属性分布统计模块DOM
        }
    }, {
        init : function(){
            this.stats_item() ;

            // 取调查整体分析数据
            this.options.models$.survey_stats() ;

            this.element.find('#userStats .ssb-side>div').first().addClass('active') ;
            this.element.find('#userStats .stats-graphs>div').first().addClass('active') ;
        },

        // 调查趋势统计模型更新触发
        "{models$} svs_trend" : function(){
            var $this     = this,
                date$     = [],
                data$     = [],
                svsTrend$ = $this.options.models$.svsTrend$ ;

            if(svsTrend$){
                // 汇总结果展示
                $this.options.$trendStats.find('.day>.stats-value').text(svsTrend$.stats.cnt_count) ;
                $this.options.$trendStats.find('.sum>.stats-value').text(svsTrend$.stats.cnt_sum) ;
                $this.options.$trendStats.find('.avg>.stats-value').text(svsTrend$.stats.cnt_avg) ;

                // 整理数据
                if(svsTrend$.data.length){
                    for(var i = 0; i < svsTrend$.data.length; i++){
                        date$.push(svsTrend$.data[i].end_date.substr(6)) ;
                        data$.push(parseInt(svsTrend$.data[i].cnt)) ;
                    }

                    // 生成图表
                    this.options.$trendStats.find('.stats-graphs').vkHighChart({
                        chart: {
                            type         : 'area'  ,// 图表类型
                            width        : 680     ,// 图表长度
                            height       : 350     ,// 图表宽度
                            marginRight  : 10      ,// 右边距
                        },
                        title: {
                            text: '',
                            stype:{margin:'0'},
                        },
                        subtitle: {
                            text  : svsTrend$.data[0].end_date + ' 至 ' + svsTrend$.data[svsTrend$.data.length-1].end_date,
                            style : {fontSize:'19px', color:'#666', margin:'0'},
                        },
                        xAxis: {
                            categories : date$,
                        },
                        yAxis: {
                            title: {
                                text: ''
                            },
                            labels: {
                                formatter: function() {
                                    return this.value ;
                                }
                            }
                        },
                        tooltip: {
                            pointFormat: '<b style="color:#333;font-weight:900">{point.y:,.0f}</b> 人参与调查'
                        },
                        plotOptions: {
                            area: {
                                marker: {
                                    enabled: true,
                                    symbol: 'circle',
                                    radius: 2,
                                    states: {
                                        hover: {
                                            enabled: true
                                        }
                                    }
                                }
                            }
                        },
                        series: [{
                            name: '参与调查人数',
                            data: data$
                            }]
                    }) ;
                }
            }
        },

        // 用户属性统计模型更新触发
        "{models$} svs_group" : function(){
            this.stats_user() ;
            // this.stats_area() ;  // 需要Echart插件
        },

        // 用户属性分布分析
        ".ssb-side>div.user-prop-elem mouseover" : function(el){
            var prop = el.addClass('active').attr('data-prop') ;

            // 侧边导航刷新
            this.element.find('.ssb-side>div').removeClass('active') ;
            this.element.find('.stats-graphs>div').removeClass('active') ;
            this.element.find('.stats-graphs>.sg-' + prop).addClass('active') ;
        },

        // 调查题目统计
        stats_item : function(){
            var elem_cnt, ratio, title,
                $itemGraphs  = this.options.$itemStats.find('.stats-graphs'),
                $line        = $itemGraphs.find('.graphs-line'),
                question_cnt = parseInt($itemGraphs.attr('data-question-cnt')) ;

            $.each($line, function(){
                elem_cnt = parseInt($(this).attr('data-elem-cnt')) ;

                if(elem_cnt > 0){
                    ratio = Math.round((elem_cnt * 1000 / question_cnt)) / 10 + '%';
                    $(this).css('width', ratio) ;
                }else{
                    ratio = '0%' ;
                    $(this).css('width', '3px') ;
                }

                title = $(this).attr('title') + ' ' + ratio ;
                $(this).attr('title', title) ;
            }) ;

            $itemGraphs.css('background','#FFD700') ;
        },

        // 用户地域分布分析
        stats_area : function(srcData$){
            var sum        = 0,
                series$    = [],
                $this      = this,
                $areaStats = $this.options.$areaStats,
                svsUser$   = $this.options.models$.svsUser$ ;

            if(svsUser$){
                // 最多最少统计展示
                $areaStats.find('.stats-value.most-province').text(svsUser$.area.province[0].province_name) ;
                $areaStats.find('.stats-value.most-city').text(svsUser$.area.city[0].city_name) ;
                $areaStats.find('.stats-value.least-province').text(svsUser$.area.province[svsUser$.area.province.length-1].province_name) ;
                $areaStats.find('.stats-value.least-city').text(svsUser$.area.city[svsUser$.area.city.length-1].city_name) ;

                // 按EChart图表格式整理数据
                if(svsUser$.area.province.length){
                    for(var i = 0; i < svsUser$.area.province.length; i++){
                        if(svsUser$.area.province[i].cnt == null){
                            svsUser$.area.province[i].cnt = 0
                        }else{
                            sum += parseInt(svsUser$.area.province[i].cnt) ;
                        }

                        series$.push({name:svsUser$.area.province[i].province_name, value:parseInt(svsUser$.area.province[i].cnt)}) ;
                    }

                    // 图表生成
                    $.vkEChart($areaStats.find('.stats-graphs'), {
                        title : {
                            text: '',
                            subtext: '',
                        },
                        tooltip : {
                            trigger: 'item'
                        },
                        dataRange: {
                            min: 0,
                            max: sum,
                            x: 'right',
                            y: 'bottom',
                            text:['高','低'],           // 文本，默认为数值文本
                            calculable : true
                        },
                        toolbox: {
                            show: false,
                            orient : 'vertical',
                            x: 'right',
                            y: 'center',
                            feature : {
                                mark : {show: true},
                                dataView : {show: true, readOnly: false},
                                restore : {show: true},
                                saveAsImage : {show: true}
                            }
                        },
                        series : [
                            {
                                name: '参与调查人数',
                                type: 'map',
                                mapType: 'china',
                                roam: false,
                                itemStyle:{
                                    normal:{label:{show:true}},
                                    emphasis:{label:{show:true}}
                                },
                                data:series$
                            },
                        ]
                    }) ;                    
                }
            }
        },

        // 用户属性分布分析
        stats_user : function(){
            var $target, series$, sum, 
                $this    = this,
                svsUser$ = $this.options.models$.svsUser$ ;

            if(svsUser$){
                $.each(svsUser$, function(key, value){

                    if(key != 'area'){
                        sum = $.vkData('data_select_sum', {
                            data$ : value.cnt, 
                            key   : 'cnt', 
                        }) ;

                        $target = $this.options.$userStats.find('.sg-' + key) ;
                        series$ = [] ;

                        for(var i = 0; i < value.cnt.length; i++){
                            series$.push([value.cnt[i]['user_' + key + '_desc'], parseInt(value.cnt[i]['cnt'])]) ;
                        }

                        $target.vkHighChart({
                            chart : {
                                plotBackgroundColor : null,
                                plotBorderWidth     : null,
                                plotShadow          : false,
                                width               : 680     ,// 图表长度
                                height              : 350     ,// 图表宽度
                            },
                            title : {
                                text : ''
                            },
                            tooltip : {
                                pointFormat : '{series.name}: <b>{point.percentage:.1f}%</b>'
                            },
                            plotOptions : {
                                pie : {
                                    allowPointSelect : true,
                                    cursor           : 'pointer',
                                    dataLabels       : {
                                        enabled        : true,
                                        color          : '#666',
                                        connectorColor : '#666',
                                        format         : '<b>{point.name}</b>: {point.percentage:.1f} %',
                                        style : {
                                            fontSize   : 14          ,// 字体大小
                                            fontFamily : '微软雅黑'  ,// 字体样式
                                        }

                                    }
                                }
                            },
                            series : [{
                                type : 'pie',
                                name : '属性占比',
                                data : series$,
                            }]
                        }) ;
                    }

                }) ;
            }
        },
    }) ;

    /*
     * 题目分析模块控制器
     *
     */
    $.Controller('Survey.Analyse.Ctrl.Qt.Stats', {
        defaults : {
            models$   : {}              ,// 页面总模型
            $question : $('.question')  ,// 调查所有题目DOM
        },
        // listensTo : ["question_stats"]
    }, {
        init : function(){
            var $this = this ;

            this.element.vkForm('reset') ;  // 分析相关功能表单初始化

            // 对每个题目进行选项整体分析
            $.each($this.options.$question, function(){
                $.each($(this).find('.stats-line'), function(){
                    $(this).progressbar({value:parseFloat($(this).attr('data-value'))}) ;
                }) ;
            }) ;
        },

        // 取到调查题目参与数据触发题目分析报表
        "{models$} stats_tx" : function(){
            var $this = this ;

            $.each(this.options.models$.stats$.prop$, function(question_code, data$){
                $this.stats_tx($this.options.$question.filter('[data-question-code=' + question_code + ']')) ;
            }) ;
        },

        // 取到调查题目参与数据触发题目分析报表
        "{models$} stats_sx" : function(){
            var $this = this ;

            $.each(this.options.models$.stats$.prop$, function(question_code, data$){
                $this.stats_sx($this.options.$question.filter('[data-question-code=' + question_code + ']')) ;
            }) ;
        },

        // 取到调查题目参与数据触发题目分析报表
        "{models$} stats_jx" : function(){
            var $this = this ;

            $.each(this.options.models$.stats$.item$, function(question_code, data$){
                $this.stats_jx($this.options.$question.filter('[data-question-code=' + question_code + ']')) ;
            }) ;
        },

        // 取到主观题目参与数据触发主观题数据匹配
        "{models$} textarea" : function(){
            var $this = this ;

            // 主观题数据列表初始化第一次
            $.each($this.options.models$.textarea$, function(k, v){
                $this.textarea_list(k, 0) ;
            }) ;
        },

        // 调查题目选择变更
        "select.qt-select change" : function(el){
            var $target ;

            // 先关闭所有主观题的参与内容显示
            this.options.$question.find('.qt-text').removeClass('active') ;

            // 再进一步判断处理
            if(el.val() == 0){
                this.element.removeClass('single') ;
                this.options.$question.show() ;
            }else{
                $target = this.options.$question.filter('[data-question-code=' + el.val() + ']') ;

                this.element.addClass('single') ;
                this.options.$question.hide() ;
                $target.show() ;

                // 若切换的是主观题，显示其参与内容
                if($target.attr('data-question-type') == 'textarea' && $target.find('.qt-text').hasClass('data')){
                    // 目标题目显示参与的内容
                    $target.find('.qt-text').addClass('active') ;
                }
            }

            // 滚动页面到头
            window.scrollTo(0, 0) ;
            el.blur() ;
        },

        // 点击查看主观题详情
        ".text-init click" : function(el){
            var question_code = el.parents('.question').attr('data-question-code') ;

            this.element.find('select.qt-select').attr('value', question_code).trigger('change') ;
        },

        // 分析类型切换
        ".item-graphs-header>.tab click" : function(el){
            el.parents('.item-graphs').find('.graphs-sub>div').removeClass('active') ;
            el.parents('.item-graphs').find('.graphs-sub>.gs-' + el.attr('data-type')).addClass('active') ;
        },

        // 分析目标和维度置换
        ".exchange click" : function(el){
            $prev = el.prev().removeClass('graphs-x').addClass('graphs-y') ;
            $next = el.next().removeClass('graphs-y').addClass('graphs-x') ;

            $prev.insertAfter(el) ;
            $next.insertBefore(el) ;
        },

        // 目标选项变更（废弃）
        "li.option-select>select change" : function(el){
            this.stats_sx(el.parents('.question.qt-stats')) ;
            this.stats_jx(el.parents('.question.qt-stats')) ;
        },

        // 用户属性筛选条件变更
        ".item-graphs-sx>select change" : function(el){
            this.stats_sx(el.parents('.question.qt-stats')) ;
        },

        // 用户属性筛选条件变更
        ".item-graphs-jx>select change" : function(el){
            console.log('item-graphs-jx') ;
            this.stats_jx(el.parents('.question.qt-stats')) ;
        },

        // 加载更多主观题参与内容
        ".tf-button>button click" : function(el){
            var idx           = parseInt(el.parents('.qt-text').attr('data-idx')) + 1,
                question_code = el.parents('.question').attr('data-question-code') ;

            this.textarea_list(question_code, idx) ;
        },

        // 分析类型菜单点击切换
        ".item-graphs-header>li click" : function(el){
            el.prevAll().removeClass('stats') ;
            el.addClass('stats').parents('.question').attr('data-stats', el.attr('data-type')) ;
        },

        // 题目选项分析切换用户属性
        ".user-prop-main.tx>select change" : function(el){
            var option_txt, 
                prop    = el.val(),
                $target = el.parent().siblings('.user-prop-sub.tx').show().find('select'),
                $tpl    = $target.find('option.tpl'),
                prop$   = this.options.models$.prop$[prop],
                data$   = $.vkData('data_select_sum', {
                    data$ : this.options.models$.stats$.prop$[el.parents('.question').attr('data-question-code')],
                    key   : 'stats', 
                    group : prop,
                }) ;

            el.children('.init').remove() ;
            $target.find('option').not('.tpl').remove() ;

            for(var i = 0; i < prop$.length; i++){
                if(data$[prop$[i][prop + '_desc']]){
                    option_txt = prop$[i][prop + '_desc'] + '(' + data$[prop$[i][prop + '_desc']] + ')' ;
                }else{
                    option_txt = prop$[i][prop + '_desc'] + '(0)' ;
                }
                $target.append($tpl.clone().removeClass('tpl').show().attr('value', prop$[i][prop + '_desc']).text(option_txt)) ;
            }

            $target.attr('value', $target.find('option').not('.tpl').first().val()) ;
            this.stats_main(el.parents('.question')) ;
        },

        // 题目选项分析切换用户属性值
        ".user-prop-sub.tx>select change" : function(el){
            this.stats_main(el.parents('.question')) ;
        },

        // 题目选项分析切换用户属性值
        ".item-opt.sx>select change" : function(el){
            this.stats_main(el.parents('.question')) ;
        },

        // 用户属性分析切换用户属性
        ".user-prop.sx>select change" : function(el){
            this.stats_main(el.parents('.question')) ;
        },

        ".item-opt.jx>select change" : function(el){
            this.stats_main(el.parents('.question')) ;
        },

        ".item-list.jx>select change" : function(el){
            this.stats_main(el.parents('.question')) ;
        },

        // 题目分析总控制
        stats_main : function($question){
            eval("this.stats_" + $question.find('.item-graphs-header>li.active').attr('data-type') + "($question)") ;
        },

        // 题目选项分析
        stats_tx : function($question){
            var chart$, where$, title
                $this         = this,
                question_code = $question.attr('data-question-code'),
                $graphs       = $question.find('.graphs-tx'),
                $highchart    = $graphs.find('.highchart'),
                $nochart      = $graphs.find('.nochart'),

                param$ = {
                    data$ : $this.options.models$.stats$.prop$[question_code],
                    key   : 'stats', 
                    group : 'option_name'
                } ;

            if($graphs.find("select.user-prop").val() != 0){
                where$ = {} ;
                where$[$graphs.find("select.user-prop").val()] = $graphs.find("select.user-prop-value").val() ;
                param$.where$ = [where$] ;

                title = $this.options.models$.question$[question_code].question_name + '(' + $graphs.find("select.user-prop-value").val() + ')' ;
            }else{
                title = $this.options.models$.question$[question_code].question_name ;
            }

            chart$ = $.vkData('data_select_sum', param$) ;

            if(!isEmptyObject(chart$)){
                $highchart.show().vkHighChart($this.options.models$.data_format_hchart(chart$, title)) ;
                $nochart.hide() ;
            }else{
                $nochart.show() ;
                $highchart.hide() ;
            }
        },

        // 用户属性分析
        stats_sx : function($question){
            var $this         = this,
                question_code = $question.attr('data-question-code'),
                $graphs       = $question.find('.graphs-sx'),
                $highchart    = $graphs.find('.highchart'),
                $nochart      = $graphs.find('.nochart'),
                title         = $graphs.find(".item-opt.sx>select").val(),

                chart$ = $.vkData('data_select_sum', {
                    data$  : $this.options.models$.stats$.prop$[question_code],
                    key    : 'stats', 
                    where$ : [{option_name: $graphs.find(".item-opt.sx>select").val()}],
                    group  : $graphs.find(".user-prop.sx>select").val(),
                }) ;

            if(!isEmptyObject(chart$)){
                $highchart.show().vkHighChart($this.options.models$.data_format_hchart(chart$, title)) ;
                $nochart.hide() ;
            }else{
                $nochart.show() ;
                $highchart.hide() ;
            }
        },

        // 交叉题目分析
        stats_jx : function($question){
            var $this         = this,
                $graphs       = $question.find('.graphs-jx'),
                $highchart    = $graphs.find('.highchart'),
                $nochart      = $graphs.find('.nochart'),
                question_code = $question.attr('data-question-code'),

                chart$ = $.vkData('data_select_sum', {
                    data$  : $this.options.models$.stats$.item$[question_code],
                    key    : 'stats', 
                    where$ : [{tgt_opt_code:$graphs.find(".item-opt.jx>select").val(), grp_qt_code:$graphs.find(".item-list.jx>select").val()}],
                    group  : 'grp_opt_name',
                }) ;

            if(!isEmptyObject(chart$)){
                $highchart.show().vkHighChart($this.options.models$.data_format_hchart(
                    chart$, 
                    $graphs.find(".item-opt.jx>select>option[value="+$graphs.find(".item-opt.jx>select").val()+"]").attr('data-name')
                )) ;
                $nochart.hide() ;
            }else{
                $nochart.show() ;
                $highchart.hide() ;
            }
        },

        // 主观题内容列表加载
        textarea_list : function(question_code, idx){
            var data$     = [],
                num       = 10,   // 每次加载的数据量
                textarea$ = this.options.models$.textarea$[question_code],
                $textarea = this.options.$question.filter('[data-question-code=' + question_code + ']').find('.qt-text').addClass('data') ;

            // 处理目标数据
            for(var i = 0; i < num; i++, idx++){
                $textarea.find('.tf-desc span').text(parseInt(idx + 1) + '/' + textarea$.length) ;
                data$.push(textarea$[idx]) ;

                // 判断性别确定性别头像（1:男/2:女）
                if(data$[i].sex == 2){
                    data$[i].photo =  __JMVC_IMG__ + 'user/woman.png' ;
                }else{
                    data$[i].photo =  __JMVC_IMG__ + 'user/man.png' ;
                }

                if(idx == textarea$.length - 1){
                    $textarea.find('.tf-desc>button').text('已显示全部' + textarea$.length + '条记录') ;
                    $textarea.find('.tf-button>button').hide() ;
                    break ;
                }
            }

            // 列表生成
            $textarea.attr('data-idx', idx - 1).find('.text-list').append(
                __JMVC_VIEW__ + 'survey.analyse.textarea.list.ejs',
                {data:data$}
            ) ;
        },

        // 按用户属性分析选项
        // prop_stats : function($question){
        //     var data$,
        //         models$       = this.options.models$,
        //         $highchart    = $question.find('div.highchart'),
        //         $nochart      = $question.find('div.nochart'),
        //         user_prop     = $question.find('select.prop-select').val(),
        //         option        = $question.find('select.option-select').val(),
        //         question_code = $question.attr('data-question-code'),
        //         question_name = $question.attr('data-question-name'),
        //         option_num    = parseInt($question.find('td.choose-num[data-option=' + option + ']').text()) ;

        //     // 根据目标选项是否有选择数据决定处理方式
        //     if(option_num > 0 || option == 0){
        //         // 按照属性筛选数据
        //         data$ = $.vkData('data_select_sum', {
        //             data$ : models$.question$[question_code], 
        //             key   : 'count', 
        //             group : [user_prop, 'option_name']}
        //         ) ;
                
        //         // 转换数据并生成图表
        //         $highchart.vkHighChart(models$.data_format_hchart(data$, question_name, option)) ;

        //         $nochart.hide() ;
        //         $highchart.show() ;
        //     }else{
        //         $highchart.hide() ;
        //         $nochart.show() ;
        //     }
        // },
    }) ;
}) ;


