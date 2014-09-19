/**
 * Name        : test.vkform.js
 * Description : js for test/vkform.html
 *
 * Create-time : 2012-8-14 18:14:09
 * Author      : ReadYun
 * Copyright   : VixiK
 * Version     : 1.0.00
 */

steal('init.js')
.then(function($){
    loadPlugin('iCheck', 'vkForm') ;
}) 
.then(function($){

    $.Controller('Lab.Vkform.Main', {
        defaults : {
            models$        : {}                   ,//页面总模型
            $Main          : {}                   ,//页面总对象
        }
    }, {
        init : function(){
            var $this = this ;
            var survey$ ;

            //表单插件vkForm初始化
            this.element.vkForm('init', {
                // reset : true,     // 是否顺便重置表单
                // 样式定义
                style : function(){
                    // 题目选项美化处理（要排除模板选项）
                    $('.vf-elem-option').find('input').iCheck({
                        checkboxClass: 'icheckbox_minimal-grey',
                           radioClass: 'iradio_minimal-grey'
                    }) ;

                    // 为统一样式加入icheck标记
                    $('.icheckbox_minimal-grey').addClass('icheck') ;
                    $('.iradio_minimal-grey').addClass('icheck') ;
                },

                // 事件定义
                event : {
                    // 选中事件
                    check : function(el){
                        //调用iCheck插件的check方法
                        el.iCheck('check') ;
                    },

                    // 取消选中事件
                    uncheck : function(el){
                        //调用iCheck插件的uncheck方法
                        el.iCheck('uncheck') ;
                    },
                },

                // 表单元素重置方法定义
                replace : {
                    common : function(){
                        console.log('area_province.replace.func.common()') ;
                    },
                    birth_day : $this.birthday_replace,  //传入出生日期选项刷新函数
                }
            }) ;

            // 需要Ajax功能的表单元素URL属性初始化
            $this.element.find('.vf-elem[data-vf-name=survey_type_sub]').attr('data-rep-url',__API__).attr('data-rep-api','det_data_select') ;
            $this.element.find('.vf-elem[data-vf-name=area_province]').attr('data-rep-url',__API__).attr('data-rep-api','det_data_select') ;
            $this.element.find('.vf-elem[data-vf-name=area_city]').attr('data-rep-url',__API__).attr('data-rep-api','det_data_select') ;

            // // 访问用户信息查询接口取用户基本信息汇总
            // $.ajax({
            //     type    : 'post',
            //     url     : __API_USER_INFO_FIND__,    //用户信息查询接口
            //     data    : {user_code:10000000},
            //     async   : false,   
            //     success : function(data$){
            //         if(data$.status){
            //             $this.options.data$ = data$.data ;

            //             // 表单元素初始fix
            //             $('.vf-elem').each(function(){
            //                 $(this).vkForm('fix', {data$:data$.data}) ;
            //             }) ;
            //         }
            //     }
            // });


            $.ajax({
                type    : 'post',
                url     : __API__,
                data    : {api:'survey_info_find', survey_code:10000288},
                async   : false,
                success : function(data$){
                    // 取调查相关信息成功，更新模型并匹配页面数据
                    if(data$.status){
                        survey$ = data$.data ;
                    }else{
                        alert('查询调查相关信息失败，请刷新页面') ;
                    }
                }
            });

            //fix to #surveyType

            var fix$ = {survey_type:1004, survey_type_sub:10017} ;

            console.log(fix$) ;
            console.log(survey$.info) ;
            $('#surveyType').vkForm('fix',{data$:fix$}) ;


        },

        //出生日期选项刷新
        birthday_replace : function($day){
            var data$, $day, days, str_ym, i ;
            var year  = $('input[name=birth_year]').val() ;
            var month = $('select[name=birth_month]').val() ;
            var data$ = [] ;

            if(year !== '' && month > 0){   
                str_ym = parseInt(year) + '-' + parseInt(month) ;
                days   = moment(str_ym, "YYYY-MM").daysInMonth() ;

                for(var i = 1; i <= days; i++){
                    day$     = {} ;
                    day$.val = i ;
                    day$.tag = i + '日' ;

                    data$.push(day$) ;
                }
                $day.vkForm('replace', {data$:data$}) ;
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

        // 简单测试
        "#test click" : function(){
            $('#vkForm').vkForm('test') ;
        },

        // 重置表单
        "#reset click" : function(){
            $('#vkForm').vkForm('reset') ;
        },

        // 表单数据匹配
        "#fix click" : function(){
            console.log('xxxx') ;
            $('.vf-elem[data-vf-name=character]').vkForm('fix', {value:[1,4], cover:false}) ;
        },

        // 简单测试
        "#replace click" : function(){
            $('.vf-elem[data-vf-name=character]').vkForm('replace', {data$:[{val:1,tag:'你好'}, {val:3,tag:'阿的江阿凡达'}, {val:7,tag:'哈哈'}]}) ;
        },

        // replaceAjax
        "#replaceAjax click" : function(){
            console.log('Ajax刷新省级地域（华北地区）') ;
            $('.vf-elem[data-vf-name=area_province]').vkForm('replace_ajax', {
                url  : __API_DET_DATA_SELECT__,
                para : 1002
            }) ;
        },

        // 获取数据·默认
        "#get_value1 click" : function(){
            console.log('获取数据·默认') ;
            var data$ = $('#vkForm').vkForm('get_value') ;
            console.log(data$) ;
        },

        // 获取数据·方式1
        "#get_value2 click" : function(){
            console.log('获取数据·方式1') ;
            var data$ = $('#vkForm').vkForm('get_value', {
                get_type   : 2,
                // check_null : 2,  //需要校验空值
            }) ;
            console.log(data$) ;
        },

        // 获取数据·方式2
        "#get_value3 click" : function(){
            console.log('获取数据·方式2') ;
            var data$ = $('#vkForm').vkForm('get_value', {
                get_type   : 3,
                // check_null : 2,  //需要校验空值
            }) ;
            console.log(data$) ;
        },
    }) ;

    $('#Main').lab_vkform_main() ;

}) ;
