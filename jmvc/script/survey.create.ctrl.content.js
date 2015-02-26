/**
 * Name        : survey.creat.ctrl.content.js
 * Description : js for survey/create.html
 *
 * Create-time : 2012-8-14 18:14:09
 * Author      : ReadYun
 * Copyright   : VixiK
 * Version     : 1.0.00
 */

steal('init.js')
.then(function($){
    loadPlugin('vkData', 'vkForm', 'tagit', 'iCheck') ;
}) 
.then(function($){

    /*
     * 调查内容总控制器
     * 
     */
    $.Controller('Survey.Create.Ctrl.Content', {
        defaults : {
            models$    : {}                     ,// 模型实例
            $itemBody  : $('#itemBody')         ,// 题目内容DOM
            $itemBtn   : $('#itemButton')       ,// 题目按钮DOM
            $optionAdd : $('#tpl>.option-add')  ,// 题目按钮DOM
        },
        listensTo : ["item_refresh", "data_collect", "item_active"]
    }, {
        init : function(){
            var $this = this ;

            // 调查内容初始化
            // this.element.find('.vk-form').vkForm('init', {reset:true}) ;

            if(!this.options.models$.survey_code){
                this.item_add({question_class: 1, question_type: 11, answer_must: 1, question_name: '请输入题目名称', custom_option: 888}) ;
            }
        },

        // 总模型调查题目数据更新触发
        "{models$} sv_question" : function(){
            var i     = 0,
                $this = this ;

            $this.element.find('input.xz').iCheck({
                checkboxClass: 'icheckbox_minimal-grey',
                   radioClass: 'iradio_minimal-grey'
            }) ;

            this.options.$itemBody.find('.item').each(function(){
                $(this).survey_create_ctrl_item({
                    models$   : $this.options.models$,                 // 总模型
                    question$ : $this.options.models$.question$[i++],  // 题目相关数据集合
                    $itemBody : $this.options.$itemBody,               // 题目容器总对象
                    $setting  : $('#tpl>.item-setting').clone(),       // 提前把题目设置存储到控制器中
                    $optionAdd : $this.options.$optionAdd,
                }) ;

                $this.options.$itemBody.trigger('item_refresh') ;    // 刷新题目信息
            }) ;


            // 启动保存草稿
            // this.options.models$.draft$.flag = true ;
            // $('#syncBox').trigger('save_countdown') ;
        },

        // 有输入调查标题启动自动保存草稿
        "[name=survey_name] blur" : function(el){
            if(el.val()){
                this.options.models$.draft$.flag = true ;
                $('#syncBox').trigger('save_countdown') ;
            }
        },

        // 增加题目按钮hover
        ".add-item>.dropdown mouseover" : function(el){
            el.addClass('open') ;
        },

        // 增加题目按钮blur
        ".add-item>.dropdown mouseout" : function(el){
            el.removeClass('open') ;
        },

        // 题库触发按钮点击
        ".qt-bank click" : function(el){
            this.element.find('.question-bank').toggleClass('active') ;

            switch(el.attr('data-bank')){
                case 'open' :
                    el.attr('data-bank', 'close').text('关闭题库') ;
                    break ;

                case 'close' :
                    el.attr('data-bank', 'open').text('从题库选择题目') ;
                    break ;
            }
        },

        // 题目获得焦点增加活动状态
        ".item click" : function(el, ev){
            this.item_active(el) ;
        },

        // 整体对象点击事件响应交互
        "click" : function(el, ev){
            if(!$(ev.target).parents('#surveyItem').size()){
                this.item_active() ;
            }
        },

        // 点击增加题目按钮
        ".ai-btn click" : function(el, ev){
            var $item = this.item_add({  // 创建相关参数
                question_class : el.attr('data-class')  ,// 题目类型
                question_type  : el.attr('data-type')   ,// 题目类型
                answer_must    : el.attr('data-must')   ,// 可选必选
                question_name  : '请输入题目名称'       ,// 题目名称
                custom_option  : 888                    ,// 自定义类型
                pf_low_value   : 0                      ,// 评分最低值
                pf_high_value  : 5                      ,// 评分最高值
            }) ;

            // 定位页面位置到新建的题目处
            if($item){
                window.scrollTo(0, $item.offset().top - 150) ;
                $item.find('.item-title .vk-input').focus() ;
            }
        },

        // 题目活动状态判定
        item_active : function($item){
            this.element.find('.item').not($item).find('.item-cog').popover('hide') ;
            this.element.find('.item').not($item).removeClass('active').find('.option-add').hide() ;

            if($item){
                $item.addClass('active') ;
            }
        },

        // 增加题目功能
        item_add : function(data$){
            var $item, option$
                item$ = [],
                $this = this ;

            // 生成题目选项清单
            $this.options.$itemBody.append(
                __JMVC_VIEW__ + 'survey.create.item.ejs', {data:data$},
                function(){
                    // 绑定题目控制器
                    $item = this.children().last().survey_create_ctrl_item({
                        models$   : $this.options.models$,            // 总模型
                        question$ : data$,                            // 题目相关数据集合
                        $itemBody : $this.options.$itemBody,          // 题目容器总对象
                        $setting  : $('#tpl>.item-setting').clone(),  // 提前把题目设置存储到控制器中
                        $optionAdd : $this.options.$optionAdd,
                    }) ;

                    $this.item_active($item) ;
                    $this.options.$itemBody.trigger('item_refresh') ;    // 刷新题目信息
                }
            ) ;

            return $item ;
        },

        // 题目刷新功能汇总
        item_refresh : function(){    
            var $items = this.options.$itemBody.children('.item') ;    // 所有题目集合对象

            this.btn_disable($items) ;   // 题目按钮处理
            this.seq_reset($items) ;     // 题目序号重置

            this.options.models$.qt_num = $items.size() ;
            this.options.models$.coins_cnt() ;   // 创建题目消耗金币计算
        },

        // 题目按钮失效判定
        btn_disable : function($items){
            // 按钮样式初始化
            $items.find('div.item-alter>div').removeClass('disable') ;

            if($items.size() == 1){
                $items.find('div.item-alter>div.del').addClass('disable') ;
            }

            $items.first().find('div.item-alter>div.up').addClass('disable') ;
            $items.last().find('div.item-alter>div.down').addClass('disable') ;
        },

        // 题目序号重置
        seq_reset : function($items){    
            var seq = 0 ;

            $items.each(function(){
                seq = $(this).index() + 1 ;
                $(this).attr('data-seq', seq) ;
                $(this).find('.item-seq>span').text(seq) ;
            }) ;
        },

        // 题目信息收集
        data_collect : function(){
            var option$, question$, $options, pingfen$, optname$,
                $this      = this,
                header$    = {},
                questions$ = [] ;

            if($this.options.models$.collect$.flag){
                // 基本信息汇总
                header$.survey_name = this.element.find('[name=survey_name]').val() ;
                header$.survey_desc = this.element.find('[name=survey_desc]').html() ;

                // 基本信息校验
                if(header$.survey_name == ''){
                    if($this.options.models$.collect$.type != 'draft'){
                        $this.options.models$.data_collect('failed', 'content', '调查标题未设置') ;
                        $this.options.models$.elem_refresh($this.element.find('[name=survey_name]').parents('.cs-item')) ;

                        alert('请填写完善调查标题') ;
                    }else{
                        header$.survey_name == '未命名' ;
                    }
                }else{                    
                    // 题目数量分类统计
                    header$.qt_count_xz    = $this.options.$itemBody.children(".item[data-class='1']").size() ;
                    header$.qt_count_zg    = $this.options.$itemBody.children(".item[data-class='2']").size() ;
                    header$.qt_count_pf    = $this.options.$itemBody.children(".item[data-class='3']").size() ;
                    header$.question_count = header$.qt_count_xz + header$.qt_count_zg + header$.qt_count_pf ;

                    // 题目数据汇总
                    $this.options.$itemBody.children('.item').each(function(){
                        if($this.options.models$.collect$.flag){
                            question$                 = {} ;
                            question$.option          = [] ;
                            question$.question_option = '' ;
                            question$.question_seq    = question$.question_code = $(this).attr('data-seq') ;
                            question$.question_class  = $(this).attr('data-class') ;
                            question$.question_type   = $(this).attr('data-type') ;
                            question$.custom_option   = $(this).attr('data-custom-option') ;
                            question$.answer_must     = $(this).attr('data-answer-must') ;

                            if($(this).find('.item-title>.vk-input').html() != $(this).find('.item-title>.vk-input').attr('data-init')){
                                question$.question_name = $(this).find('.item-title>.vk-input').html() ;
                            }else{
                                question$.question_name = '' ;
                            }

                            // 题目标题校验
                            if($this.options.models$.collect$.type != 'draft' && question$.question_name == ''){
                                $this.options.models$.data_collect('failed', 'content', '有未设置的题目') ;
                                $this.options.models$.elem_refresh($(this)) ;

                                alert('第' + question$.question_seq + '道题目的问题标题未设置，请完善信息') ;
                                return false ;
                            }

                            // 题目选项数据汇总
                            if($(this).attr('data-class') == 1 || $(this).attr('data-type') == 32){
                                optname$ = [] ;  // 重置选项名称变量
                                $(this).find('.option').each(function(){    
                                    option$             = {} ;
                                    option$.option_type = 1  ;
                                    option$.option_seq  = question$.option.length + 1 ;
                                    option$.option_name = $(this).find('input.option-name').val() ;

                                    optname$.push(option$.option_name) ;
                                    question$.option.push(option$) ;

                                    if($this.options.models$.collect$.type != 'draft' && option$.option_name == ''){
                                        $this.options.models$.elem_refresh($(this)) ;
                                        $this.options.models$.data_collect('failed', 'content', '有未设置的选项') ;

                                        alert('第' + question$.question_seq + '道题目的第' + option$.option_seq + '个选项内容未设置，请完善信息') ;
                                        return false ;
                                    }else{
                                        // 汇总问题选项用于问题选项描述
                                        question$.question_option = question$.question_option+'/'+option$.option_seq+'.'+option$.option_name+' ' ;
                                    }
                                }) ;

                                // 判断是否有重复选项
                                if($this.options.models$.collect$.type != 'draft'){
                                    optname$ = optname$.sort() ;

                                    for(var i = 0; i < optname$.length; i++){
                                        if(optname$[i] == optname$[i+1]){
                                            $this.options.models$.elem_refresh($(this)) ;
                                            $this.options.models$.data_collect('failed', 'content', '有重复的问题选项') ;
                                            alert('有重复的问题选项') ;

                                            return false ;
                                        }
                                        
                                    }
                                }
                            }


                            // 评分题取相关数据
                            if($(this).attr('data-class') == 3){
                                pingfen$ = {} ;

                                // 数据收集
                                switch($(this).attr('data-type')){
                                    case '31' :
                                        pingfen$.pf_low_value  = $(this).attr('data-low-value')  ;
                                        pingfen$.pf_high_value = $(this).attr('data-high-value') ;
                                        pingfen$.pf_low_desc   = $(this).attr('data-low-desc')   ;
                                        pingfen$.pf_high_desc  = $(this).attr('data-high-desc')  ;
                                        break ;

                                    case '32' :
                                        pingfen$.pf_low_value  = $(this).attr('data-low-value')  ;
                                        pingfen$.pf_high_value = $(this).attr('data-high-value') ;
                                        break ;
                                }

                                // 数据校验
                                if($this.options.models$.collect$.type != 'draft' && !$.vkData('data_check_null', pingfen$).status){
                                    alert('第' + question$.question_seq + '道评分题设置不完整，请完善相关信息') ;
                                    $this.options.models$.elem_refresh($(this)) ;
                                    return false ;
                                }else{
                                    $.extend(question$, pingfen$) ;
                                }
                            }
                        }

                        questions$.push(question$) ;

                        // 自定义选项处理
                        // question$.custom_option  = $(this).attr('data-custom-option') ;  //要判断一下
                    }) ;
                }

                // 传入数据给总模型
                if($this.options.models$.collect$.flag){
                    $.extend($this.options.models$.info$, header$) ;
                    $this.options.models$.question$ = questions$ ;

                    $this.options.models$.data_collect('success', 'content') ;
                    return true ;
                }
            }else{
                $this.options.models$.data_collect('failed', 'content', '调查内容数据汇总初始判断标志位失效') ;
            }
        },
    }) ;

    /*
     * 题目控制器
     *
     */
    $.Controller('Survey.Create.Ctrl.Item', {
        defaults : {
            models$ : {}  // 模型实例
        },
        listensTo : ['option_reset', 'data_collect']
    }, {
        init : function(){
            var $custom_opt, custom_name,
                $custom_btn = this.element.find('button.custom-option'),
                custom_type = this.options.question$.custom_option ;

            // 选项控制器绑定
            if(this.element.attr('data-class') == '1'){
                this.element.find('.xz-option').survey_create_ctrl_option({  
                    models$ : this.options.models$,
                    $item   : this.element,
                    data$   : this.options.question$.option,
                    $optionAdd : this.options.$optionAdd,
                }) ;
            }else if(this.element.attr('data-class') == '3'){
                this.element.find('.pf-option .pf-body').survey_create_ctrl_option({  
                    $models$ : this.options.models$,
                    $item    : this.element,
                    data$    : this.options.question$.option,
                    $optionAdd : this.options.$optionAdd,
                }) ;
            }

            // 题目设置功能绑定 popover方式
            this.element.find('.item-cog').popover({
                title     : '题目设置',
                placement : 'left',
                html      : true,
                content   : this.options.$setting,
            }) ;

            if(this.options.question$.custom_option != 888){
                this.custom_option(this.options.question$.custom_option) ;
            }
        },

        // 判断定位目标题目
        "{models$} active" : function(){
            if(this.options.models$.$active.hasClass('item')){
                if(this.element.is(this.options.models$.$active)){
                    this.element.addClass('active') ;
                }else{
                    this.element.removeClass('active') ;
                }
            }else if(this.options.models$.$active.parents('.item').size()){
                if(this.element.is(this.options.models$.$active.parents('.item'))){
                    this.options.models$.$active.parents('.item').addClass('active') ;
                }else{
                    this.options.models$.$active.parents('.item').removeClass('active') ;
                }
            }
        },

        // 题目设置按钮单击事件
        ".oc-main>input blur" : function(el){
            var value = el.val() ;

            if(el.val() != ''){
                this.element.find('.oc-main>input').not(el).each(function(){
                    if($(this).val() == el.val()){
                        alert('有重复的选项名称') ;
                    }
                }) ;    
            }
        },

        // 关闭popover
        "i.icon-remove click" : function(){
            this.element.find('.item-cog').popover('hide') ;
        },

        // 保证在dropdown-menu里正常操作，阻止click事件
        ".dropdown-menu click" : function(el, ev){
            ev.stopPropagation() ;
        },

        // 自定义选项方式选择
        ".answer-must>a click" : function(el){
            this.element.attr('data-answer-must', el.attr('data-must')) ;
        },

        // 自定义选项方式选择
        ".type-change>a click" : function(el){
            this.element.attr('data-type', el.attr('data-type')) ;
        },

        // 自定义选项方式选择
        ".oc-elem>a click" : function(el){
            if(el.parent().attr('data-custom') != ''){
                this.custom_option(el.parent().attr('data-custom')) ;
            }
        },

        // 自定义选项用户等级选择
        ".custom-user-lvl>select change" : function(el){
            this.custom_option(el.val()) ;
        },

        // 题目类型切换
        ".type-change click" : function(el){
            this.element.attr('data-type', el.attr('data-toggle')) ;
        },

        // 题目调整功能
        ".item-alter>div click" : function(el){
            if(!el.hasClass('disable')){
                switch(el.attr('data-type')){
                    case 'delete' :
                        this.element.remove() ;
                        break ;
                    case 'up' :
                        this.element.insertBefore(this.element.prev()) ;
                        break ;
                    case 'down' :
                        this.element.insertAfter(this.element.next()) ;
                        break ;
                }

                // 刷新题目信息
                this.options.$itemBody.trigger('item_refresh') ;
            }
        },

        // 单项评分分值描述输入时同步更新
        ".ps-desc-input>input keyup" : function(el){
            var $target = this.element.find('.pr-' + el.attr('data-target') + '>span') ;

            if(el.val() == ''){
                $target.text(el.parents('.ps-elem-desc').children('label').text()) ;
            }else{
                $target.text(el.val()) ;
            }

            // 数据存储
            this.element.attr('data-' + el.attr('data-target') + '-desc', el.val()) ;
        },

        ".val-input>span click" : function(el){
            var $target = el.parent().children('input'),
                $low    = el.parents('.pf-setting').find('.ps-low-input input') ,
                $high   = el.parents('.pf-setting').find('.ps-high-input input') ;

            if(el.hasClass('val-add')){
                $target.attr('value', parseInt($target.val()) + 1) ;
            }else if(el.hasClass('val-cut')){
                $target.attr('value', parseInt($target.val()) - 1) ;
            }
            
            this.pf_refresh($low, $high) ;
        },

        ".val-input>input keyup" : function(el){
            var $low  = el.parents('.pf-setting').find('.ps-low-input input') ,
                $high = el.parents('.pf-setting').find('.ps-high-input input') ;

            this.pf_refresh($low, $high) ;
        },

        // 单项评分信息刷新
        pf_item_refresh : function(low, high){
            var $target = this.element.find('.pr-mid'),
                $tpl    = $target.children('.tpl') ;

            // 实时更新调整结果
            $target.children().not($tpl).remove() ;
            for(var i = parseInt(high); i >= parseInt(low); i--){
                $tpl.clone().removeClass('tpl').text(i).show().insertAfter($tpl) ;
            }

            this.element.find('.pf-item .pf-setting .ps-low-input input').attr('value', low) ;
            this.element.find('.pf-item .pf-setting .ps-high-input input').attr('value', high) ;
        },

        // 多项评分信息刷新
        pf_option_refresh : function(low, high){
            this.element.find('.option .val-select>.vs-txt').text(low) ;

            this.element.find('.pf-option .pf-setting .ps-low-input input').attr('value', low) ;
            this.element.find('.pf-option .pf-setting .ps-high-input input').attr('value', high) ;
        },

        // 评分设置更新
        pf_refresh : function($low, $high){
            var low  = $low.val(),
                high = $high.val() ;

            if(parseInt(high) - parseInt(low) < 1){
                high = parseInt(low) + 1 ;
                $high.attr('value', high) ;
            }

            this.pf_item_refresh(low, high) ;
            this.pf_option_refresh(low, high) ;

            // 数据存储
            this.element.attr('data-low-value', low).attr('data-high-value', high) ;
        },

        // 自定义选项更新
        custom_option : function(value){
            var $target, level ;

            this.options.$setting.find('.oc-elem').removeClass('active') ;
            if(parseInt(value) == -1 || parseInt(value) == 999){
                $target = this.options.$setting.find('.oc-elem[data-custom=' + value + ']').addClass('active') ;
                this.options.$setting.find('.opt-custom>a').text($target.attr('data-txt')) ;
            }else{
                $target = this.options.$setting.find('.oc-elem.some').attr('data-custom', value).addClass('active') ;
                level   = this.options.$setting.find('.custom-user-lvl select>option[value=' + value + ']').text() ;

                $target.children('a').text(level + '以上用户可自定义选项') ;
                this.options.$setting.find('.opt-custom>a').text(level + '以上用户可自定义选项') ;
                this.options.$setting.find('.custom-user-lvl select').attr('value', value) ;
            }

            this.element.attr('data-custom-option', value) ;
        },
    }) ;

    /*
     * 选项控制器
     *
     */
    $.Controller('Survey.Create.Ctrl.Option', {
        defaults : {
            models$ : {}  ,// 模型实例
            $item   : {}  ,// 选项父元素对应题目对象DOM
        }
    }, {
        init : function(){
            if(this.options.data$){
                // 选项重置
                this.option_reset() ;
            }else{
                // 没有选项数据，默认生成2个选项
                this.option_add(['', '']) ;
            }
        },

        // 选项调整按钮
        ".option-alter>div click" : function(el){
            var $option = el.parents('.option') ;

            if(!el.hasClass('disable')){
                switch(el.attr('data-type')){
                    case 'delete' :
                        $option.remove() ;
                        break ;
                    case 'up' :
                        $option.insertBefore($option.prev()) ;
                        break ;
                    case 'down' :
                        $option.insertAfter($option.next()) ;
                        break ;
                }

                this.option_reset() ;    // 重新刷新选项
            }
        },

        // 选项名称输入完毕回车直接在下面新增一个空选项
        ".option-name.vk-input keydown" : function(el, ev){
            if(ev.keyCode == 13 && el.val() != ''){
                this.option_add([''], el.parents('.option'), true) ;
            }
        },

        // 增加选项按钮单击事件
        ".option-alter>.add click" : function(el){
            el.parents('.option').append(this.options.$optionAdd.show()) ;  // 在目标选项下显示添加选项模块
            this.options.$optionAdd.find('.vk-input').html('').focus() ;    // 输入框清空聚焦
        },

        // 快捷键（提交/取消）
        ".option-add>.vk-input keydown" : function(el, ev){
            var data$,
                $input  = el.parents('.option-add').find('.vk-input'),
                $option = el.parents('.option') ;

            // 取消ESC
            if(ev.keyCode == 27){
                this.options.$optionAdd.hide() ;
            }

            // 提交ALT+ENTER
            if(ev.ctrlKey && ev.keyCode == 13 && $input.html() != ''){
                // 转换输入框能信息为数组
                data$ = $input.html().split('<br>') ;

                // 各行数据处理
                for(var i = 0; i < data$.length; i++){
                    data$[i] = data$[i].replace(new RegExp('&nbsp;', 'gm'), " ") ;  // 空格字符串转换
                }

                this.option_add(data$, $option) ;
                this.options.$optionAdd.hide() ;
            }
        },

        // 批量增加选项提交
        ".option-add-button>button click" : function(el){
            var data$,
                $input  = el.parents('.option-add').find('.vk-input'),
                $option = el.parents('.option') ;

            switch(el.attr('data-type')){
                case 'cancel' :
                    this.options.$optionAdd.hide() ;
                    break ;

                case 'submit' :
                    // 转换输入框能信息为数组
                    data$ = $input.html().split('<br>') ;

                    // 各行数据处理
                    for(var i = 0; i < data$.length; i++){
                        data$[i] = data$[i].replace(new RegExp('&nbsp;', 'gm'), " ") ;  // 空格字符串转换
                    }

                    this.option_add(data$, $option) ;
                    this.options.$optionAdd.hide() ;
                    break ;
            }
        },

        // 选项增加
        option_add : function(data$, $option, flag){
            var $this = this ;

            if(data$){
                // 生成题目选项清单   
                if($option){
                    // 插入到某一个选项最后
                    for(var i = data$.length - 1; i >= 0; i--){
                        if(data$[i] != '' || flag){
                            $this.element.append(
                                __JMVC_VIEW__ + 'survey.create.option.ejs', {data:data$[i]},
                                function(){
                                    // 新建选项定位
                                    $(this).find('.option').last().insertAfter($option).find('.oc-main>input').focusEnd() ;
                                }
                            ) ;
                        }
                    }
                }else{
                    for(var i = 0; i < data$.length; i++){
                        $this.element.append(
                            __JMVC_VIEW__ + 'survey.create.option.ejs', {data:data$[i]}
                        ) ;
                    }
                }

                setTimeout(function(){
                    // 选项重置
                    $this.option_reset() ;
                }, 200) ;
            }else{
                return false ;
            }

        },

        // 题目选项重置
        option_reset : function(){
            var seq        = 0,
                $options   = this.element.find('.option'),
                $first_opt = $options.first(),   // 选项集合中第一个对象
                $last_opt  = $options.last(),    // 选项集合中最后一个对象
                opt_cnt    = $options.size() ;   // 选项集合数量

            if(this.options.$item.attr('data-class') == '1'){
                this.element.find('input.xz').iCheck({
                    checkboxClass: 'icheckbox_minimal-grey',
                       radioClass: 'iradio_minimal-grey'
                }) ;
            }

            $options.each(function(){   
                seq ++ ;
                $(this).attr('data-option-seq', seq)  ;
                $(this).find('.option-seq').text(seq) ;
            }) ;

            // 先生效所有按钮，再重新进行按钮失效判定
            $options.find('.option-alter>div').removeClass('disable') ;

            // 题目选项按钮失效判定
            if(opt_cnt == 2){
                $options.find('.option-alter>div.del').addClass('disable') ;
            }

            $first_opt.find('.option-alter>div.up').addClass('disable') ;
            $last_opt.find('.option-alter>div.down').addClass('disable') ;
        },
    }) ;
}) ;


