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
    loadPlugin('vkData', 'vkForm', 'tagit') ;
}) 
.then(function($){

    /*
     * 调查内容总控制器
     * 
     */
    $.Controller('Survey.Create.Ctrl.Content', {
        defaults : {
            models$   : {}                ,// 模型实例
            $itemBody : $('#itemBody')    ,// 题目内容DOM
            $itemBtn  : $('#itemButton')  ,// 题目按钮DOM
        },
        listensTo : ["item_refresh", "data_collect"]
    }, {
        init : function(){
            // 调查内容初始化
            this.element.find('.vk-form').vkForm('init', {reset:true}) ;

            if(this.options.models$.survey_code){
                this.info_fix() ;

                this.options.models$.draft$.flag = true ;

                // this.options.$syncBox.attr('data-state', 1) ;
                // this.options.$survey.trigger('save_draft') ;
                // $('#mainSider').trigger('save_countdown') ;
                this.item_init() ;
            }else{
                this.tag_init() ;
                this.item_add({question_type: 'radio', question_name: '', custom_option: 999,}) ;
            }


            // 修改调查状态处理。。
            // if(this.options.models$.survey_code){
            //     // 匹配调查数据
            //     this.element.find('.vk-form').vkForm('fix', {data$:this.options.models$.info$}) ;

            //     // 启动自动保存草稿
            //     if($('#syncBox').attr('data-state') == '-1'){
            //         $('#mainSider').trigger('save_countdown') ;
            //     }
            // }
        },

        // 总模型调查信息数据更新触发
        "{models$} sv_info" : function(){
            this.info_fix() ;

            // 启动保存草稿
            $('#syncBox').trigger('save_countdown') ;
        },

        // 总模型调查题目数据更新触发
        "{models$} sv_question" : function(){
            this.item_init() ;
        },

        // 有输入调查标题启动自动保存草稿
        "[name=survey_name] blur" : function(el){
            if(el.val()){
                this.options.models$.draft$.flag = true ;
                $('#syncBox').trigger('save_countdown') ;
            }
        },

        // 预览题目
        ".preview-item>button click" : function(el, ev){
            if(this.options.$survey.trigger('save_draft') && this.options.models$.survey_code){
                console.log(this.options.models$.survey_code) ;
                $.cookie('sv_preview', this.options.models$.survey_code, {path:'/'}) ;
                console.log($.cookie('sv_preview')) ;

                $.vixik('get_url', {name:'survey/answer', tail:'?code=preview', open:'new'}) ;
            }
        },

        // 预览题目
        ".preview-item>button1 click" : function(el, ev){
            var survey$ = {} ;

            this.options.models$.collect$.flag  = true ;
            this.options.models$.collect$.state = 'preview' ;

            if(this.data_collect()){
                survey$.info      = this.options.models$.info$ ;
                survey$.question$ = this.options.models$.question$ ;

                // 校验调查问题数据
                if(this.options.models$.collect$.flag){
                    console.log(survey$) ;
                    console.log('----------------------------------------') ;
                    // 调查内容信息进cookie
                    // $.cookie('preview', null, {path:'/'}) ;
                    console.log($.toJSON(survey$)) ;
                    $.cookie('sv_prev', null) ;
                    $.cookie('sv_prev', $.toJSON(survey$.question$)) ;
                    console.log($.cookie('sv_prev')) ;


                    // $.vixik('get_url', {name:'survey/answer', tail:'?code=preview', open:'new'}) ;
                }
            }
        },

        // 点击增加题目按钮
        ".add-item click" : function(el, ev){
            var type, $item ;

            // 判断要创建的题目类型
            if(ev){
                type = $(ev.target).attr('data-type') ;
            }
            else{  // 默认选项为单选radio
                type = 'radio' ;
            }

            $item = this.item_add({
                question_type : type  ,// 题目类型
                question_name : ''    ,// 题目名称
            }) ;

            // 定位页面位置到新建的题目处
            if($item){
                window.scrollTo(0, $item.offset().top - 200) ;
            }
        },

        // 基本信息匹配
        info_fix : function(){
            var $this = this,
                info$ = this.options.models$.info$ ;

            if(info$.survey_name){
                this.element.find('#surveyTitle input').val(info$.survey_name) ; 
            }

            if(info$.survey_desc){
                this.element.find('#surveyDesc .vk-input').html(info$.survey_desc) ; 
            }

            if(info$.survey_tag){
                $this.tag_init(info$.survey_tag.split(',')) ;
            }
        },

        // 调查标签初始化
        tag_init : function(data$){
            $svTag = this.element.find('.survey-tag') ;

            if(data$){
                $svTag.children().remove() ;

                for(var i = 0; i < data$.length; i++){
                    $svTag.append('<li>' + data$[i] + '</li>') ;
                }
            }

            $svTag.tagit({
                placeholderText : '用关键字描述调查，最多可设置三个标签',
                tagLimit : 3,
                onTagLimitExceeded : function(){
                    alert('免费调查只能创建三个标签') ;
                },
                afterTagAdded : function(){
                    if($(this).find('.tagit-choice').size() == 3){
                        $(this).find('.tagit-new').hide() ;
                    }
                },
                afterTagRemoved  : function(){
                    $(this).find('.tagit-new').show() ;
                },
            }) ;
        },

        // 题目初始化
        item_init : function(){
            var $this     = this,
                question$ = this.options.models$.question$ ;

            if(this.options.models$.survey_code){
                if(!this.element.find('.item').size() && question$ && question$.length){
                    // 如果能取到survey_code说明为修改草稿状态
                    // 读取题目数据进行匹配
                    for(var i = 0; i < question$.length; i++){
                        this.item_add(question$[i]) ;
                    }
                }
            }else{
                // 默认新建一道题目
                this.item_add({question_type: 'radio', question_name: '', custom_option: 999,}) ;
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
                        $itemBody : $this.options.$itemBody,  // 题目容器总对象
                        question$ : data$,                    // 题目相关数据集合
                    }).trigger('type_change').find('.item-title .vk-input').html(data$.question_name) ;

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
                $(this).attr('data-item-seq', seq) ;
                $(this).find('.item-seq>span').text(seq) ;
            }) ;
        },

        // 题目信息收集
        data_collect : function(){
            var question$, $warn, $error,
                $this      = this,
                header$    = {},
                questions$ = [] ;
            
            // 首先保证校验标志有效
            if($this.options.models$.collect$.flag){
                // 基本信息汇总
                header$.survey_name  = this.element.find('[name=survey_name]').val() ;
                header$.survey_desc  = this.element.find('[name=survey_desc]').html() ;
                header$.survey_tag   = $this.element.find('.survey-tag').tagit("assignedTags") ;

                if(header$.survey_name == '' && $this.options.models$.collect$ != 'draft'){
                    $this.options.models$.collect$.flag = false ;
                    $this.options.models$.elem_refresh($this.element.find('[name=survey_name]').parents('.cs-item')) ;

                    alert('请填写完善调查标题') ;
                }else{
                    header$.survey_name == '未命名' ;

                    // 题目信息汇总
                    $this.options.$itemBody.children('.item').each(function(){
                        question$               = {} ;
                        question$.question_seq  = question$.question_code = $(this).attr('data-item-seq') ;
                        question$.question_type = $(this).attr('data-item-type') ;
                        question$.custom_option = $(this).attr('data-custom-option') ;
                        question$.question_name = $(this).find('.item-title>.vk-input').html() ;
                        question$.option        = [] ;

                        // 取目标选项对象集合
                        $options = $(this).find('.item-option>.option') ;

                        // 汇总当前题目下各选项信息
                        if(question$.question_type === 'textarea'){
                            option$             = {} ;
                            option$.option_seq  = 1 ;
                            option$.option_name = '主观题选项' ;

                            question$.option.push(option$) ;

                            // 汇总问题选项用于问题选项描述
                            question$.question_option = option$.option_seq + '.' + option$.option_name ;
                        }else{
                            $options.each(function(){    
                                option$             = {} ;
                                option$.option_type = 1  ;
                                option$.option_seq  = question$.option.length + 1 ;
                                option$.option_name = $(this).find('input.option-name').val() ;

                                question$.option.push(option$) ;

                                // 汇总问题选项用于问题选项描述
                                if(question$.question_option == undefined){
                                    question$.question_option = option$.option_seq + '.' + option$.option_name + ' ' ;
                                }else{
                                    question$.question_option = question$.question_option+'/'+option$.option_seq+'.'+option$.option_name+' ' ;
                                }
                            }) ;
                        }

                        questions$.push(question$) ;
                    }) ;
                }


                // 头部数据校验   目前只有调查标题是必填，其他选填，保留给以后万一内容多时可用
                // $.each(header$, function(key, value){
                //     if($this.options.models$.collect$.flag && value == '' ){
                //         switch($this.options.models$.collect$.state){
                //             case 'draft' :
                //                 if(key == 'survey_name'){
                //                     $warn = $this.element.find('[name=survey_name]').parents('.cs-item') ;
                //                     $this.options.models$.elem_refresh($warn) ;
                //                     $this.options.models$.collect$.flag = false ;

                //                     alert('请填写完善' + $warn.find('.cs-label').text() + '信息') ;
                //                     return false ;
                //                 }
                //                 break ;

                //             default :
                //                 $warn = $this.element.find('[name=' + key + ']').parents('.cs-item') ;

                //                 switch(key){
                //                     // 必填：调查名称
                //                     case 'survey_name' :
                //                         $this.options.models$.collect$.flag = false ;

                //                         alert('请填写完善' + $warn.find('.cs-label').text() + '信息') ;
                //                         $this.options.models$.elem_refresh($warn) ;
                //                         return false ;
                //                         break ;

                //                     // 选填：调查说明/调查标签
                //                     default :
                //                         // 计划做成仅提示
                //                         break ;
                //                 }
                //                 break ;
                //         }
                //     }
                // }) ;

                // 题目数据校验
                if($this.options.models$.collect$.state != 'draft'){
                    for(var i = 0; i < questions$.length; i++){
                        if($this.options.models$.collect$.flag && questions$[i].question_name == ''){
                            $warn = $this.options.$itemBody.children('.item:eq(' + i + ')') ;
                            $this.options.models$.elem_refresh($warn) ;
                            $this.options.models$.collect$.flag = false ;

                            alert('第' + parseInt(i+1) + '道题目的问题标题未设置，请完善信息') ;
                            return false ;
                        }else{
                            if(questions$[i].question_type != 'textarea'){
                                for(var p = 0; p < questions$[i].option.length; p++){
                                    if($this.options.models$.collect$.flag && questions$[i].option[p].option_name == ''){
                                        $warn = $this.options.$itemBody.children('.item:eq(' + i + ')').find('.option:eq(' + p + ')') ;
                                        $this.options.models$.elem_refresh($warn) ;
                                        $this.options.models$.collect$.flag = false ;

                                        alert('第' + parseInt(i+1) + '道题目的第' + parseInt(p+1) + '个选项内容未设置，请完善信息') ;
                                        return false ;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // 传入数据给总模型
            $.extend($this.options.models$.info$, header$) ;
            this.options.models$.question$ = questions$ ;

            return true ;
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
        listensTo : ['option_reset',"type_change"]
    }, {
        init : function(){
            var $custom_opt, custom_name,
                $custom_btn = this.element.find('button.custom-option'),
                custom_type = this.options.question$.custom_option ;

            // 因为用的是popover方式展示题目设置功能
            // 提前把题目设置存储到控制器中
            this.options.$itemSetting = $('#tpl>.item-setting').clone() ;

            // 选项控制器绑定
            if(this.options.question$.option){
                this.element.find('.item-option').survey_create_ctrl_option({  
                    $models$ : this.options.models$,
                    $item    : this.element,
                    data$    : this.options.question$.option,
                }) ;
            }else{
                this.element.find('.item-option').survey_create_ctrl_option({  
                    $models$ : this.options.models$,
                    $item    : this.element
                }) ;
            }

            // 题目设置功能绑定
            if(this.element.attr('data-item-type') != 'textarea'){
                // 题目设置功能绑定
                this.element.find('.item-cog').popover({
                    title     : '题目设置',
                    placement : 'left',
                    html      : true,
                    content   : this.options.$itemSetting,
                }) ;

                // 自定义选项初始化
                // this.element.find('.custom-option').popover({
                //     title     : '自定义选项权限设定',
                //     html      : true,
                //     placement : 'left',
                //     content   : this.options.$customOption,
                // }) ;

                // if(custom_type != 999){
                //     this.element.find('.auth-elem[data-type=]' + custom_type).addClass('active') ;
                //     this.element.attr('data-custom-option', custom_type) ;

                //     if(custom_type == -1){
                //         $custom_btn.text('允许所有用户自定义选项') ;
                //     }else{
                //         custom_name = $('select.auths-setting>option[value=' + custom_type + ']').text() ;

                //         $custom_btn.text('允许等级' + custom_name + '以上用户自定义选项') ;   
                //     }
                // }
            }else{
                this.element.find('.item-cog').addClass('disable') ;
            }
        },

        // 题目设置按钮单击事件
        ".item-cog click" : function(el){
            // 关闭本题目所有选项的的popover
            el.parents('.item').find('.option-alter>.add').popover('hide') ;
        },

        // 保证在dropdown-menu里正常操作，阻止click事件
        ".dropdown-menu click" : function(el, ev){
            ev.stopPropagation() ;
        },

        // 自定义选项方式选择
        ".oc-elem>a click" : function(el){
            if(el.parent().attr('data-user') != ''){
                this.options.$itemSetting.find('.oc-elem').removeClass('active') ;

                el.parent().addClass('active').parents('.opt-custom').children('.dropdown-toggle').text(el.text()) ;
                this.element.attr('data-custom-option', el.parent().attr('data-user')) ;
            }
        },

        // 自定义选项用户等级选择
        ".custom-user-lvl>select change" : function(el){
            // 所有自定义选择按钮初始化
            this.options.$itemSetting.find('.oc-elem').removeClass('active') ;

            // 目标按钮生效
            el.parents('.oc-elem').addClass('active').attr('data-user', el.val())
            .find('a>span').text(el.children('[value=' + el.val() + ']').text()) ;

            // 向上传递参数
            el.parents('.opt-custom').children('.dropdown-toggle')
            .text(el.parents('.oc-elem').find('a').text()) ;

            this.element.attr('data-custom-option', el.val()) ;
        },

        // 题目类型切换
        ".type-change click" : function(el){
            this.element.attr('data-item-type', el.attr('data-toggle')) ;
            this.type_change() ;
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

        // 选项类型刷新
        type_change : function(){
            switch(this.element.attr('data-item-type')){
                case 'textarea' :
                    this.element.find('.item-type').text('[主]') ;

                    this.element.find('.option').hide() ;
                    this.element.find('.textarea').show() ;
                    break ;

                case 'radio' :
                    this.element.find('.item-type').text('[单]') ;

                    this.options.$itemSetting.find('.type-change').attr('data-toggle', 'checkbox')
                    .children().text('切换为多选题') ;
                    break ;

                case 'checkbox' :
                    this.element.find('.item-type').text('[多]') ;

                    this.options.$itemSetting.find('.type-change').attr('data-toggle', 'radio')
                    .children().text('切换为单选题') ;
                    break ;
            }
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
                // 如果有传入的选项数据，直接根据数据生成选项
                var option$ = $.vkData('data_filter_key', {sData$:this.options.data$, key$:['option_name']}).option_name ;
            }else{
                if(this.options.$item.attr('data-item-type') != 'textarea'){
                    // 没有选项数据，默认生成2个选项
                    var option$ = ['', ''] ;
                }
            }

            this.option_add(option$) ;
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

        // 增加选项按钮单击事件
        ".option-alter>.add click" : function(el){
            // 关闭其他增加选项popover
            this.element.find('.option-alter>.add').not(el).popover('hide') ;

            // 关闭目标题目的设置popover
            el.parents('.item').find('.item-cog').popover('hide') ;
        },

        // 批量增加选项提交
        ".add-option-button>button click" : function(el){
            var data$,
                $input  = el.parents('.add-option').find('.vk-input'),
                $option = el.parents('.option') ;

            switch(el.attr('data-type')){
                case 'cancel' :
                    this.element.find('.option-alter>.add').popover('hide') ;
                    break ;

                case 'submit' :
                    // 转换输入框能信息为数组
                    data$ = $input.html().split('<br>') ;

                    // 各行数据处理
                    for(var i = 0; i < data$.length; i++){
                        data$[i] = data$[i].replace(new RegExp('&nbsp;', 'gm'), " ") ;  // 空格字符串转换
                    }

                    this.option_add(data$, $option) ;
                    this.element.find('.option-alter>.add').popover('hide') ;

                    // 清空输入框
                    $input.text('') ;
                    break ;
            }
        },

        // 选项增加
        option_add : function(data$, $option){
            var $this = this ;

            if(data$){
                // 生成题目选项清单   
                if($option){
                    // 插入到某一个选项最后
                    for(var i = data$.length - 1; i >= 0; i--){
                        if(data$[i] != ''){
                            $this.element.append(
                                __JMVC_VIEW__ + 'survey.create.option.ejs', {data:[data$[i]]},
                                function(){
                                    // 新建选项定位
                                    $(this).find('.option').last().insertAfter($option) ;

                                    // 选项重置
                                    $this.option_reset() ;

                                    // 批量增加选项功能绑定
                                    $(this).find('.option-alter>.add').popover({
                                        title     : '请填入多个选项名称，用换行分隔',
                                        placement : 'left',
                                        html      : true,
                                        content   : $('#tpl').find('.add-option').clone(),
                                    }) ;
                                }
                            ) ;
                        }
                    }
                }else{
                    // 直接插入到最后选项
                    $this.element.append(
                        __JMVC_VIEW__ + 'survey.create.option.ejs', {data:data$},
                        function(){
                            // 选项重置
                            $this.option_reset() ;

                            // 批量增加选项功能绑定
                            $(this).find('.option-alter>.add').popover({
                                title     : '请填入选项名称，多个选项用换行分隔',
                                placement : 'left',
                                html      : true,
                                content   : $('#tpl').find('.add-option').clone(),
                            }) ;
                        }
                    ) ;
                }
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

            $options.each(function(){
                seq ++ ;
                $(this).attr('data-option-seq',seq) ;
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


