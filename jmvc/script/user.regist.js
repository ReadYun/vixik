/**
 * Name        : regist.js
 * Description : File_desc
 *
 * Create-time : 2012-8-17 1:21:23
 * Author      : ReadYun
 * Copyright   : VixiK
 * Version     : 1.0.00
 */
steal('init.js')
.then(function($){
    loadPlugin('vkForm') ;
}) 
.then(function($){

    /*
     *  页面总模型
     *
     **/
    $.Model('User.Regist.Model', {
        defaults : {
            step        : 0   ,// 注册步骤
            user_code   : 0   ,// 用户编码
            user_nick   : ''  ,// 用户昵称
            baseInfo$   : {}  ,// 基本信息
            extendInfo$ : {}  ,// 扩展信息
            itemcnt$    : {}  ,// 问卷题目数量统计
        }
    }, {
        init : function(){
            this.baseInfo$.create_ip = $.cookie('client_ip') ;    // 注册IP
        },

        updateFlag : function(prop){    // 手动触发模型更新事件
            var str_eval = "this.attr('" + prop + "', Math.random())" ;
            eval(str_eval) ;
        },

        stepChange : function(data){    // 问卷整体信息刷新
            this.attr('step', data) ;
        },

        nextStep : function(){    // 问卷整体信息刷新
            this.attr('step', this.step + 1) ;
        },

        itemRefresh : function(){    // 模型题目部分单独刷新
            this.itemCnt() ;
            this.updateFlag() ;
        }
    }) ;

    /*
     * 注册表单控制器
     *
     **/
    $.Controller('User.Regist.Ctrl.Form', {
        defaults : {
            models$  : {}             ,// 页面总模型
            $formBox : $('#formBox')  ,// 表单模块
        },
        listensTo : ["data_collect"]
    }, {
        init : function(){
            var $this = this ;
            var $self = this.element ;
            
            $self.find('input, button').attr('disabled', false).attr('value', '') ;
        },

        // 输入框单击时初始化
        "input focus" : function(el){
            el.parents('div.item-elem').removeClass("error warn ok").addClass('focus') ;

        },

        // 表单输入框焦点离开时检查数据
        "input blur" : function(el){
            var pwd_fst, val_snd, search_str ;
            var $this = this ;
            var $elem = el.parents('div.item-elem').removeClass("error focus warn ok") ;
            var value = el.val() ;
            var name  = el.attr('name') ;

            if(value !== ''){
                switch(name){
                    // 用户名校验
                    case 'user_name' :
                        $.post(__API__, {api:'user_count', condition_key:$.toJSON({user_name:value})}, function(data$){
                            if(data$.status){
                                if(parseInt(data$.data) === 0){
                                    $elem.addClass("ok") ;
                                }else{
                                    $elem.addClass("warn") ;
                                }
                            }else{
                                console.log('error') ;
                                $elem.addClass("error") ;
                            }
                        }) ;
                        break ;

                    // 密码一次输入校验
                    case 'user_pwd' :
                        if(value.length >= 6){
                            $elem.addClass("ok") ;
                        }
                        else{
                            $elem.addClass("warn") ;
                        }

                        pwd_snd = $this.element.find('input[name=user_pwdd]').val() ;
                        if(value === val_snd){
                            $this.element.find('input[name=user_pwdd]').parents('div.item-elem').addClass("ok") ;
                        }else{
                            $this.element.find('input[name=user_pwdd]').parents('div.item-elem').addClass("warn") ;
                        }
                        break ;

                    // 密码二次输入校验
                    case 'user_pwdd' :
                        pwd_fst = $this.element.find('input[name=user_pwd]').val() ;

                        if(value === pwd_fst){
                            $elem.addClass("ok") ;
                        }
                        else{
                            $elem.addClass("warn") ;
                        }
                        break ;

                    // 电子邮箱校验
                    case 'user_email' :
                        search_str=/^[\w\-\.]+@[\w\-\.]+(\.\w+)+$/ ;

                        if(search_str.test(value)){
                            $elem.addClass("ok") ;
                        }
                        else{
                            $elem.addClass("warn") ;
                        }
                        break ;
                }
            }
        },

        // 提交数据
        "button click" : function(el){
            var user$, $warn, $elem, title ;
            var $actitle = $('#nextAction>div.action-title>a') ;
            var user$    = this.options.$formBox.vkForm('get_value', {check_null:2}) ;

            el.attr('disabled', true) ;
            if(user$.status){
                $warn = this.element.find('.item-elem.warn') ;

                if($warn.length){  // 有输入错误选项提示并定位
                    $elem = $($warn[0]) ;
                    title = $elem.find('.hint-warn').text() ;
                    alert(title) ;
                }else{  // 全部选项都ok则整理数据并提交接口创建用户

                    // 访问接口提交数据创建用户
                    $.post(__API__, {
                            api : 'user_create', 
                            user_name  : user$.data.user_name   ,// 用户名称 
                            user_pwd   : user$.data.user_pwd    ,// 用户密码
                            user_email : user$.data.user_email  ,// 用户邮箱 
                            create_ip  : $.cookie('client_ip')  ,// 注册IP
                        }, 
                        function(data$){
                            if(data$.status){
                                // 提交成功更新信息转入注册后操作模块
                                $actitle.text(user$.data.user_name) ;
                                $actitle.attr('href', $actitle.attr('href') + '/u/' + data$.data) ;

                                $('#loginBox').hide() ;
                                $('#Main').addClass('ok') ;
                            }else{
                                alert('创建用户未成功，请检查输入！') ;
                            }
                            el.attr('disabled', false) ;
                    }) ;
                }
            }else{
                $elem = this.element.find('[name = ' + user$.info +']').parents('.item-elem') ;
                title = $elem.find('label').attr('title') ;
                alert(title + '不能为空！，请完善输入') ;
                el.attr('disabled', false) ;
            }
        }
    }) ;

    /*
     * 步骤完成后行为模块控制器
     *
     **/
    $.Controller('User.Regist.Ctrl.Action', {
        defaults : {
            models$ : {}  // 页面总模型
        }
    }, {
        init : function(){
        },

        ".next-action click" : function(el){
            window.location.href = el.attr('data-href') ;
        }
    }) ;

    /*
     *  页面总控制器
     *
     **/
    $.Controller('User.Regist.Ctrl.Main', {
        defaults : {
            models$     : new User.Regist.Model()  ,// 页面总模型
            $registForm : $()         ,// 注册表单区域
        }
    }, {
        init : function(){
            $.cookie('user_code',null,{path:'/'}) ;
            $.cookie('user_name',null,{path:'/'}) ;

            this.element.find('#registForm').user_regist_ctrl_form({
                models$ : this.options.models$
            }) ;

            this.element.find('#nextAction').user_regist_ctrl_action({
                models$ : this.options.models$
            }) ;
        }
    }) ;

    $('#Main').user_regist_ctrl_main() ;

}) ;
