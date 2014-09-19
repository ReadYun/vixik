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
    loadPlugin('vkData', 'vkForm') ;
}) 
.then(function($){

    /*
     * 题目总控制器
     * 
     **/
    $.Controller('Survey.Create.Ctrl.Content', {
        defaults : {
            models$   : {}                ,// 模型实例
            $itemBody : $('#itemBody')    ,// 题目内容DOM
            $itemBtn  : $('#itemButton')  ,// 题目按钮DOM
        },
        listensTo : ["refresh", "data_collect"]
    }, {
        init : function(){
            // 调查内容初始化
            this.element.find('.vk-form').vkForm('init', {reset:true}) ;
            
            // 题目创建按钮功能绑定    
            this.options.$itemBtn.find('div.add-item').survey_create_ctrl_item_add({    
                models$   : this.options.models$ ,
                $itemBody : this.options.$itemBody
            }) ;

            // 修改调查状态处理。。
            if(this.options.models$.survey_code){
                // 匹配调查数据
                this.element.find('.vk-form').vkForm('fix', {data$:this.options.models$.info$}) ;

                // 启动自动保存草稿
                if($('#syncBox').attr('data-state') == '-1'){
                    $('#mainSider').trigger('save_countdown') ;
                }

                // 绑定题目私有控制器
                this.options.$itemBody.children('.item').survey_create_ctrl_item_priv({
                    models$   : this.options.models$ ,
                    $itemBody : this.options.$itemBody
                }) ;
                this.refresh() ;
            }
        },

        // 题目刷新功能汇总
        refresh : function(){    
            var $items = this.options.$itemBody.children('.item') ;    // 所有题目集合对象

            this.btn_disable($items) ;   // 题目按钮处理
            this.seq_reset($items) ;     // 题目序号重置

            this.options.models$.qt_num = $items.size() ;
            this.options.models$.coins_cnt() ;   // 创建题目消耗金币计算
        },

        // 题目按钮失效判定
        btn_disable : function($items){  
            var $first_item = $items.first(),   // 题目集合中第一个对象
                $last_item  = $items.last(),    // 题目集合中最后一个对象
                item_cnt    = $items.size() ;   // 题目集合数量

            // 按钮样式初始化
            $items.find('div.item-alter i').removeClass('disabled') ;

            // 先生效所有按钮，再重新进行按钮失效判定
            $items.find('div.item-alter>div').attr('data-disabled', false) ;

            if(item_cnt == 1){
                $items.find('div.item-alter>div.del').attr('data-disabled', true) ;
            }
            $first_item.find('div.item-alter>div.up').attr('data-disabled', true) ;
            $last_item.find('div.item-alter>div.down').attr('data-disabled', true) ;
        },

        // 题目序号重置
        seq_reset : function($items){    
            var seq = 0 ;

            $items.each(function(){
                seq = $(this).index() + 1 ;
                $(this).attr('data-item-seq', seq) ;
                $(this).find('div.item-seq').text(seq) ;
            }) ;
        },

        // 有输入调查标题启动自动保存草稿
        "input[name=survey_name] blur" : function(el){
            if(el.val()){
                $('#syncBox').trigger('save_countdown') ;
            }
        },

        // 预览题目
        ".preview-item>button click" : function(el){
            var survey$ = {} ;

            this.data_collect() ;
            survey$.info      = this.options.models$.info$ ;
            survey$.question$ = this.options.models$.question$ ;

            // 校验调查问题数据
            if($.vkData('data_check_null', survey$)){
                // 调查内容信息进cookie
                $.cookie('survey_preview', $.toJSON(survey$), {path:'/'}) ;
                $.vixik('get_url',{name:'survey/action', tail:'/s/preview', open:'new'}) ;
            }else{
                alert('题目信息设置不完整，请先完善题目和选项信息') ;
            }
        },

        // 题目信息收集
        data_collect : function(){
            var $this        = this,
                $survey_name = this.element.find('[name=survey_name]'),
                $survey_desc = this.element.find('[name=survey_desc]'),
                $items       = this.options.$itemBody.children('.item'),
                header$      = {},
                question$    = [],
                i_question   = 1,
                data$        = this.element.find('.vk-form').vkForm('get_value', {check_null:1}) ;

            // 调查头部信息数据校验
            if(!data$.status){
                var $elem = $this.element.find('[name=' + data$.info + ']').parents('.cs-item') ;  // 提出要定位的DOM对象

                alert('请填写完善' + $elem.find('.cs-label').text() + '信息') ;    // 弹出错误提示
                $this.options.models$.location($elem) ;
                $this.options.models$.collect$.flag = false ;

                return false ;
            }else{
                header$              = data$.data ;
                header$.create_coins = $this.options.models$.coins$.coins_publish ;
            }

            // 再汇总每个题目信息
            $items.each(function(){
                questionElem$               = {} ;
                questionElem$.question_seq  = questionElem$.question_code = $(this).attr('data-item-seq') ;  // 为了做题目预览把question_code也加上
                questionElem$.question_type = $(this).attr('data-item-type') ;
                questionElem$.question_name = $(this).find('div.item-title>input').val() ;
                questionElem$.custom_option = $(this).attr('data-custom-option') ;
                questionElem$.option        = [] ;

                // 题目空值校验
                if($this.options.models$.collect$.check && questionElem$.question_name == ''){
                    alert('第' + i_question + '道题目的问题标题未设置，请完善信息') ;
                    $this.options.models$.location($(this)) ;
                    $this.options.models$.collect$.flag = false ;
                    return false ;
                }

                // 取目标选项对象集合
                $options = $(this).find('div.item-option>div.option') ;

                // 汇总当前题目下各选项信息
                if(questionElem$.question_type === 'textarea'){
                    option$             = {} ;
                    option$.option_seq  = 1 ;
                    option$.option_name = '主观题选项' ;

                    questionElem$.option.push(option$) ;

                    // 汇总问题选项用于问题选项描述
                    questionElem$.question_option = option$.option_seq + '.' + option$.option_name ;
                }else{
                    i_option = 1 ;
                    $options.each(function(){    
                        option$             = {} ;
                        option$.option_type = 1  ;
                        option$.option_seq  = questionElem$.option.length + 1 ;
                        option$.option_name = $(this).find('input.option-name').val() ;

                        // 选项空值校验
                        if($this.options.models$.collect$.check && option$.option_name == ''){
                            alert('第' + i_question + '道题目的第' + i_option + '个选项内容未设置，请完善信息') ;
                            $this.options.models$.location($(this)) ;
                            $this.options.models$.collect$.flag = false ;
                            return false ;
                        }else{
                            questionElem$.option.push(option$) ;   
                        }

                        // 汇总问题选项用于问题选项描述
                        if(questionElem$.question_option == undefined){
                            questionElem$.question_option = option$.option_seq + '.' + option$.option_name + ' ';
                        }else{
                            questionElem$.question_option = questionElem$.question_option+'/'+option$.option_seq+'.'+option$.option_name+' ';
                        }

                        i_option ++ ;
                    }) ;
                }

                question$.push(questionElem$) ;
                i_question ++ ;
            }) ;

            // 传入数据给总模型
            $.extend(this.options.models$.info$, header$) ;
            this.options.models$.question$ = question$ ;

            return true ;
        }
    }) ;

    /*
     * 增加题目功能
     *
     **/
    $.Controller('Survey.Create.Ctrl.Item.Add', {
        defaults : {
            models$   : {}  ,// 模型实例
            $itemBody : {}  ,// 题目总对象DOM
        },
        listensTo : ['']
    }, {
        init : function(){
            var question$ = this.options.models$.question$ ;

            // 题目初始化处理，判断总模型里的survey_code
            if(this.options.models$.survey_code && this.options.models$.question$){
                // 如果能取到survey_code说明为修改草稿状态
                // 读取题目数据匹配先是到页面
                for(var i = 0; i < question$.length; i++){
                    if(question$[i]['quesion_type'] != 'textarea'){
                        this.item_add(question$[i]) ;
                    }
                }
            }else{
                // 如果不能取到survey_code说明为新建调查
                // 默认新建一道题目
                this.click() ;
            }
        },

        // 创建题目按钮点击事件
        click : function(el, ev){  
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
                window.scrollTo(0, $item.offset().top-200) ;
            }
        }, 

        // 增加题目功能
        item_add : function(data$){
            var $item, item_idx, idx,
                viewItem = __JMVC_VIEW__ + 'survey.create.item.ejs',    // 题目选项模板,
                $this    = this ;

            // 生成题目选项清单
            this.options.$itemBody.append(
                viewItem,{name:data$.question_name},
                function(){
                    $item = this.children().last() ;   // 去当前新增的题目对象
                    $item.attr('data-item-type', data$.question_type) ;

                    // 绑定题目控制器
                    $item.survey_create_ctrl_item_priv({
                        $itemBody : $this.options.$itemBody ,// 题目容器总对象
                        question$ : data$                   ,// 题目相关数据集合
                    }).trigger('type_change') ;

                    $this.options.$itemBody.trigger('refresh') ;    // 刷新题目信息
                }
            ) ;

            return $item ;
        }
    }) ;

    /*
     * 题目私有控制器
     *
     **/
    $.Controller('Survey.Create.Ctrl.Item.Priv', {
        defaults : {
            models$ : {}  // 模型实例
        },
        listensTo : ['option_reset',"type_change"]
    }, {
        init : function(){
            var $custom_opt, custom_name,
                $custom_btn = this.element.find('button.custom-option'),
                custom_type = this.options.question$.custom_option ;

            this.options.$itemSetting = $('#tpl>div.item-setting').clone() ;
            this.options.$ustomOption = $('#tpl>div.custom-option').clone() ;

            // 新增选项按钮绑定新增选项控制器
            this.element.find('.add-option').survey_create_ctrl_option_add({
                $item   : this.element                          ,// 当前题目对象
                $option : this.element.find('div.item-option')  ,// 题目选项主体
                option$ : this.options.question$.option         ,// 选项数据
            }) ;

            // 选项控制器绑定
            this.element.find('div.option').survey_create_ctrl_option_priv({  
                $models$ : this.options.models$ ,
                $item    : this.element
            }) ;

            // 题目设置功能绑定
            this.element.find('i.icon-cog').popover({
                title   : '题目设置',
                html    : true,
                content : this.options.$itemSetting,
            }) ;

            // 自定义选项功能绑定
            if(this.element.attr('data-item-type') != 'textarea'){
                this.element.find('.custom-option').popover({
                    title     : '自定义选项权限设定',
                    html      : true,
                    placement : 'left',
                    content   : this.options.$ustomOption,
                }) ;

                if(custom_type != 999){
                    this.element.find('.auth-elem[data-type=]' + custom_type).addClass('active') ;
                    this.element.attr('data-custom-option', custom_type) ;

                    if(custom_type == -1){
                        $custom_btn.text('允许所有用户自定义选项') ;
                    }else{
                        custom_name = $('select.auths-setting>option[value=' + custom_type + ']').text() ;

                        $custom_btn.text('允许等级' + custom_name + '以上用户自定义选项') ;   
                    }
                }
            }
        },

        // 题目选项重置
        option_reset : function(){
            var seq        = 0,
                $item      = this.element,
                $options   = $item.find('div.option'),
                $first_opt = $options.first(),   // 选项集合中第一个对象
                $last_opt  = $options.last(),    // 选项集合中最后一个对象
                opt_cnt    = $options.size() ;   // 选项集合数量

            $options.each(function(){
                seq ++ ;
                $(this).attr('data-option-seq',seq) ;
                $(this).find('div.option-seq').text(seq) ;
            }) ;

            // 先生效所有按钮，再重新进行按钮失效判定
            $options.find('div.option-alter>div').attr('data-disabled', false) ;

            // 题目选项按钮失效判定
            if(opt_cnt == 1){
                $options.find('div.option-alter>div.del').attr('data-disabled', true) ;
            }
            $first_opt.find('div.option-alter>div.up').attr('data-disabled', true) ;
            $last_opt.find('div.option-alter>div.down').attr('data-disabled', true) ;
        },

        // 自定义权限类型切换
        ".auth-elem click" : function(el){
            var type    = el.attr('data-type'),
                title   = el.attr('data-title'),
                $button = this.element.find('button.custom-option') ;

            el.parent().children().removeClass('active') ;
            el.addClass('active') ;

            if(title){
                $button.text(title).popover('hide') ;
                this.element.attr('data-custom-option', type) ;
            }

            // switch(type){
            //     case '0' :
            //         // 不允许任何用户自定义选项
            //         $button.text('不允许任何用户自定义选项').popover('hide') ;
            //         this.element.attr('data-custom-option', '999') ;
            //         break ;
            //     case '1' : 
            //         // 允许所有用户自定义选项
            //         $button.text('允许所有用户自定义选项').popover('hide') ;
            //         this.element.attr('data-custom-option', '-1') ;
            //         break ;
            //     case '2' : 
            //         // 允许部分用户自定义选项
            //         el.addClass('active') ;
            //         break ;
            // }

        },

        // 选择部分用户自定义选项权限级别
        "select.auths-setting change" : function(el){
            var $button = this.element.find('button.custom-option') ;
            var $auth   = el.parents('.auth-elem') ;
            var name    = el.find('option:selected').text() ;
            var value   = el.val() ;

            // this.element.find('.auth-elem').removeClass('ok') ;
            // $button.text('允许等级' + name + '以上用户自定义选项').addClass('ok').popover('hide') ;
            $button.text('允许等级' + name + '以上用户自定义选项').popover('hide') ;
            this.element.attr('data-custom-option', value) ;
        },

        // 题目类型切换
        ".type-change>a click" : function(el){
            var type = el.attr('data-toggle') ;

            if(type){
                this.element.attr('data-item-type', type) ;
                this.type_change() ;
            }

            this.element.find('i.icon-cog').popover('hide') ;
        },

        // 选项类型刷新
        type_change : function(){
            var type        = this.element.attr('data-item-type') ;
            var $type       = this.element.find('.item-type') ;
            var $option     = this.element.find('.item-option') ;
            var $options    = $option.find('.option') ;
            var $textarea   = $option.find('.textarea') ;
            var $typeChange = this.options.$itemSetting.find('.type-change>a') ;

            // 先隐藏所有选项，再根据题目类型进行选项显示判定
            $option.children().hide() ;

            switch(type){
                case 'textarea' :
                    $type.text('主观') ;
                    $textarea.show() ;
                    $typeChange.addClass('button-flat disabled').text('不可切换其他类型') ;
                    break ;

                case 'radio' :
                    $type.text('单选') ;
                    $options.show() ;
                    $typeChange.attr('data-toggle', 'checkbox').addClass('button-flat-highlight').text('切换为多选题') ;
                    break ;

                case 'checkbox' :
                    $type.text('多选') ;
                    $options.show() ;
                    $typeChange.attr('data-toggle', 'radio').addClass('button-flat-highlight').text('切换为单选题') ;
                    break ;
            }
        },

        // 题目调整功能
        "div.item-alter>div click" : function(el){
            var dis        = el.attr('data-disabled') ;
            var type       = el.attr('data-type') ;
            var $self_item = this.element ;
            var $prev_item = $self_item.prev() ;
            var $next_item = $self_item.next() ;

            if(dis === 'false'){
                switch(type){
                    case 'delete' :
                        $self_item.remove() ;
                        break ;
                    case 'up' :
                        $self_item.removeClass('active') ;
                        $self_item.insertBefore($prev_item) ;
                        break ;
                    case 'down' :
                        $self_item.removeClass('active') ;
                        $self_item.insertAfter($next_item) ;
                        break ;
                }
                this.options.$itemBody.trigger('refresh') ;    // 刷新题目信息
            }
        }
    }) ;

    /*
     * 增加选项功能
     *
     **/
    $.Controller('Survey.Create.Ctrl.Option.Add', {
        defaults : {
            models  : {}  ,// 模型实例
            $item   : {}  ,// 选项父元素对应题目对象DOM
            $option : {}  ,// 题目选项主体
        }
    }, {
        init : function(){
            var option$ ;
            var $TplAddMore = $('#tpl').find('.add-more-option').clone() ;

            // 题目选项初始化
            if(this.options.$item.attr('data-item-type') != 'textarea'){
                if(this.options.option$){  // 如果有传入的选项数据，直接根据数据生成选项
                    option$ = $.vkData('data_filter_key', {sData$:this.options.option$, key$:['option_name']}).option_name ;
                }else{  // 没有选项数据，默认生成N个选项
                    option$ = ['', ''] ;
                }

                this.option_add(option$) ;
            }

            // 批量增加选项功能绑定
            this.element.find('button.add-more').popover({
                title     : '请填入多个选项名称，用换行分隔',
                placement : 'top',
                html      : true,
                content   : $TplAddMore,
            }) ;
        },

        // 增加选项按钮点击事件
        "button.add-one click" : function(el){
            this.option_add(['']) ;
        },

        // 批量增加选项提交
        ".amo-submit click" : function(el){
            var $text = el.parents('.add-more-option').find('textarea') ;
            var value = $text.val() ;

            if(value){
                this.option_add(value.split('\n')) ;
                this.element.find('.add-more').popover('hide') ;
                $text.val('') ;
            }
        },

        // 批量增加选项提交
        ".amo-cancel click" : function(el){
            this.element.find('.add-more').popover('hide') ;
        },

        // 增加选项
        option_add : function(name){
            var $this      = this ;
            var viewOption = __JMVC_VIEW__ + 'survey.create.option.ejs';    // 题目选项模板路径

            // 生成题目选项清单
            this.options.$option.append(
                viewOption, {data:name},
                function(){
                    // 新增的选项对象绑定选项控制器
                    this.children().survey_create_ctrl_option_priv({
                        $models$ : $this.options.models$,
                        $item    : $this.options.$item
                    }) ;
                }
            ) ;
        }
    }) ;

    /*
     * 选项私有控制
     *
     **/
    $.Controller('Survey.Create.Ctrl.Option.Priv', {
        defaults : {
            models$ : {}  ,// 模型实例
            $item   : {}  ,// 选项父元素对应题目对象DOM
        }
    }, {
        init : function(){
            this.options.$item.trigger('option_reset') ;    // 选项按钮失效处理
        },

        // 选项调整按钮
        "div.option-alter>div click" : function(el){
            var dis          = el.attr('data-disabled') ;
            var type         = el.attr('data-type') ;
            var $self_option = this.element ;
            var $prev_option = $self_option.prev() ;
            var $next_option = $self_option.next() ;

            if(dis === 'false'){
                switch(type){
                    case 'delete' :
                        $self_option.remove() ;
                        break ;
                    case 'up' :
                        $self_option.insertBefore($prev_option) ;
                        break ;
                    case 'down' :
                        $self_option.insertAfter($next_option) ;
                        break ;
                }
                this.options.$item.trigger('option_reset') ;    // 重新刷新选项
            }
        }
    }) ;
}) ;


