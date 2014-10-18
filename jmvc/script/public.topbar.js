/*
 * @Document    : public.topbar.js
 * @Description : js for Public/topbar.html
 *
 * @Created on  : 2012-20-20
 * @Author      : ReadYun
 * @Copyright   : VixiK
 */

steal('init.js')
.then(function($){
    loadPlugin('vkForm') ;
}) 
.then(function($){
    
    /*
     * VIXIK总模型
     *
     **/
    $.Model('Vixik.Model', {
        defaults : {
            user$   : {}   ,// 用户信息
        }
    }, {
        init : function(){
            this.user_verify({func$:{true:['user_info']}}) ;
        },

        // 手动触发模型更新事件
        trigger : function(flag){
            eval("this.attr('" + flag + "', Math.random())") ;
        },

        // 用户验证
        user_verify : function(params$){
            var $this = this ;

            /*
             * trigger$ = {'true':[t1,t2,..], 'false':[t1,t2,..]} ;  // 要触发的事件
             * func$    = {'true':[f1,f2,..], 'false':[f1,f2,..]} ;  // 要执行的函数
             */
            if($.cookie('user_code') && $.cookie('user_md5') && $.cookie('user$')){
                // 通过验证
                if(params$ && params$.trigger$ && params$.trigger$.true){
                    // 触发事件
                    for(var i = 0; i < params$.trigger$.true.length; i++){
                        this.trigger(params$.trigger$.true[i]) ;
                    }
                }

                if(params$ && params$.func$ && params$.func$.true){
                    // 执行函数
                    for(var i = 0; i < params$.func$.true.length; i++){
                        this[params$.func$.true[i]]() ;
                    }
                }
                return $.cookie('user_code') ;
            }else{
                // 未通过验证
                if(params$ && params$.trigger$ && params$.trigger$.false){
                    // 触发事件
                    for(var i = 0; i < params$.trigger$.false.length; i++){
                        this.trigger(params$.trigger$.false[i]) ;
                    }
                }

                if(params$ && params$.func$ && params$.func$.false){
                    // 执行函数
                    for(var i = 0; i < params$.func$.false.length; i++){
                        this[params$.func$.false[i]]() ;
                    }
                }
                return false ;
            }
        },

        // 获取用户基本信息汇总
        user_info : function(){
            var $this = this ;

            if($.cookie('user_code') && $.cookie('user_md5')){
                // 访问用户信息查询接口取用户基本信息汇总
                $.ajax({
                    type    : 'post',
                    url     : __API__,
                    data    : {api:'user_info_find', user_code:$.cookie('user_code'), user_md5:$.cookie('user_md5')},
                    async   : false,   
                    success : function(data$){
                        if(data$.status){
                            $this.user$ = data$.data ;
                            $this.trigger('user') ;
                        }else{
                            $this.user$ = {} ;
                            $this.trigger('user') ;
                        }
                    }
                });
            }else{
                $this.user$ = {} ;
                $this.trigger('user') ;
            }

        },
    }) ;

    // 全局模型实例化vixik$
    vixik$ = new Vixik.Model() ;

    /*
     * 用户登录框控制器
     *
     */
    $.Controller('Public.Header.Ctrl.Login',{
        defaults : {
            $input       : $('#loginModal input')     ,// INPUT总对象
            $loginUser   : $('input.login-user')      ,// 用户名称输入对象
            $loginPswd   : $('input.login-pswd')      ,// 用户密码输入对象
            $warning     : $('#loginModal .warning')  ,// 警告框DOM对象
            $loginSubmit : $('#loginModal button')    ,// 登录按钮
        }
    }, {
        init : function(){
            this.warning('hide') ;

            // 表单初始化处理
            if($.cookie('user_name')){
                this.options.$loginUser.val($.cookie('user_name')) ;
                this.options.$loginPswd.focus() ;
            }
            else{
                this.options.$loginUser.val('') ;
                this.options.$loginPswd.val('') ;
                this.options.$loginUser.focus() ;
            } ;
        },

        // 警告框操作
        warning : function(event, msg){
            switch(event){
                case 'show' :
                    this.options.$warning.text(msg).show() ;
                    break ;
                case 'hide' :
                    this.options.$warning.text(msg).hide() ;
                    break ;
            }            
        },

        // 单击输入框隐藏告警提示
        "input click" : function(el){
            this.warning('hide') ;
        },

        // 用户输入框焦点离开
        "{$loginUser} blur" : function(el){
            var $this     = this,
                user_name = el.val() ;

            $this.warning('hide') ;
            
            if(user_name){
                // 访问用户数统计查询接口
                $.post(__API__, {api:'user_count', condition_key:$.toJSON({user_name:user_name})}, function(data$){
                    if(data$.status){
                        if(parseInt(data$.data) === 1){
                            $this.options.$loginUser.addClass('success') ;
                        }else{
                            $this.warning('show', '此用户不存在，请重新输入用户名') ;
                        }
                    }
                }) ;
            }
        },

        // 登录提交
        "{$loginSubmit} click" : function(){
            var $this      = this,
                $loginUser = this.options.$loginUser,
                $loginPswd = this.options.$loginPswd,
                user_name  = $loginUser.val(),
                user_pwd   = $loginPswd.val() ;

            if(user_name){
                if(user_pwd){
                    // 访问用户信息查询接口（加密码参数）
                    $.post(__API_USER_VERIFY__, {user_name:user_name, user_pwd:user_pwd}, function(data$){
                        if(data$.status){
                            $('#loginModal').modal('hide') ;
                            vixik$.user_verify({func$:{true:['user_info']}}) ;
                        }
                        else{
                            $this.warning('show', '用户名或密码不正确请重新输入') ;
                        } ;
                    }) ;
                }else{
                    $this.warning('show', '请输入密码') ;
                }
            }
            else{
                $this.warning('show', '请输入用户名') ;
            }
        }
    });

    /*
     * 用户模块控制器
     *
     */
    $.Controller('Public.Header.Ctrl.User',{
        defaults : {
            $Header : {}   ,// topBar主对象 
            user$   : {}   ,// 用户信息汇总
            $umenu  : $('.user-menu')   ,// 用户信息汇总
        },
        listensTo : ['user_refresh']
    }, {
        init : function(){
            if(!this.element.hasClass('logged')){
                this.user_refresh() ;
            }
        },

        // 总模型用户信息获取后触发
        "{vixik$} user" : function(){
            this.user_refresh() ;
        },

        // 用户信息刷新
        user_refresh : function(){
            var $this    = this,
                user$    = $.evalJSON($.cookie('user$')),
                href     = this.element.attr('data-href'),
                $menu    = this.element.find('.user-menu'),
                $visit   = $menu.find('.visit'),
                $setting = $menu.find('.setting'),
                $photo   = this.element.find('.user-photo') ;

            // 判断cookie中是否有用户信息
            if(user$){
                this.element.addClass('logged') ;

                if(user$.user_photo){
                    $photo.find('i.icon-user').hide() ;
                    $photo.find('img').attr('src', __JMVC_IMG__ + 'user/' + user$.user_code + '_60.jpg').show() ;
                }

                // 用户菜单选项内容初始化
                $menu.find('.nick').text(user$.user_nick) ;
                $visit.attr('href', $visit.attr('href') + '/visit?code=' + user$.user_code) ;
                $setting.attr('href', $setting.attr('href') + '/index') ;

                $menu.find('div.accout-level>div.value').text(user$.user_level_desc) ;
                $menu.find('div.accout-coins>div.value').text(user$.user_coins) ;

                $menu.find('div.sv-public>div.value').text(user$.publish_times) ;
                $menu.find('div.sv-answer>div.value').text(user$.answer_times) ;
            }
        },

        // 鼠标进入用户头像打开用户信息菜单
        "{$umenu} mouseover" : function(el){
            this.element.find('.user-photo').addClass('open') ;
        },

        // 退出登录
        ".action>div click" : function(el, ev){
            ev.stopPropagation() ;

            if(el.hasClass('exit')){
                $.cookie('user_code', null, {path:'/'}) ;
                $.cookie('user_md5',  null, {path:'/'}) ;
                $.cookie('user$',     null, {path:'/'}) ;

                this.element.removeClass('logged') ;

                vixik$.user_verify({func$:{false:['user_info']}}) ;
                // this.options.$Main.trigger('data_refresh') ;
            }else{
                window.open(el.attr('href')) ;
            }
        },
    });

    /*
     * Header总控制器
     *
     */
    $.Controller('Public.Header.Ctrl.Init', {
        defaults : {
            $Main       : $('#Main')         ,// 页面主内容模块
            $start      : $('a.start')       ,// 快速开始菜单
            $navUser    : $('div.nav-user')  ,// 用户区域
            $minSearch  : $('#minSearch')    ,// 迷你搜索输入框
            $loginModal : $('#loginModal')   ,// 登录对话框
        },
        listensTo : ['']
    }, {
        init : function(){
            // 对象属性绑定控制器
            this.options.$navUser.public_header_ctrl_user({
                $Header : this.element,
                $Main   : this.options.$Main,
            }) ;

            // 搜索框初始化
            this.options.$minSearch.val('') ;

            // 初始用户验证，验证失败需要登录
            if(this.element.attr('data-verify')){
                vixik$.user_verify({trigger$:{false:['login']}}) ;
            }

            // 显示topNav
            this.element.find('#topNav').show() ;
        },

        // 由总模型触发登录功能
        "{vixik$} login" : function(){
            this.login_modal() ;
        },

        // 用户登录框触发
        login_modal : function(){
            this.options.$loginModal.public_header_ctrl_login({$Main:this.options.$Main,$navUser:this.options.$navUser}).modal({
                show     : true,
                keyboard : false
            }) ;
        },

        // 监控搜索输入框输入并且回车提交搜索请求
        "{$minSearch} keydown" : function(el, ev){
            if(ev.keyCode == 13 && el.val()){
                this.search_go(el.val()) ;
            }
        },

        // 搜索请求
        search_go : function(words){
            if(words){
                $.post(__API__, {
                        api   : 'search_go'  ,// 搜索接口
                        type  : 'survey'     ,// 搜索类型（默认为调查）
                        words : words        ,// 搜索关键词
                    }, 
                    function(data$){
                        if(data$.status){
                            window.location.href = data$.data ;
                        }
                    }
                ) ;
            }
        },

        // 点击登录按钮
        "li.login click" : function(){
            this.login_modal() ;
        }
    }) ;

    $('#Header').public_header_ctrl_init() ;
}) ;
