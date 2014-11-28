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
            // user$   : {}   ,// 用户信息
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
            }else if($.cookie('user_code') && $.cookie('user_md5')){
                this.user_info() ;
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
                $this.user$ = null ;
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
            $Login        : $('.login-box')               ,// 登录模块
            $Signup       : $('.signup-box')              ,// 注册模块
            $Logininput   : $('.login-box input')         ,// INPUT总对象
            $loginUser    : $('.login-box .login-user')   ,// 用户名称输入对象
            $loginPswd    : $('.login-box .login-pswd')   ,// 用户密码输入对象
            $loginWarning : $('.login-box .warning')      ,// 警告框DOM对象
            $loginSubmit  : $('.login-box button')        ,// 登录按钮
            $signupInput  : $('.signup-box input')        ,// 登录按钮
            $signupItem   : $('.signup-box .item-elem')   ,// 登录按钮
            $signupSubmit : $('.signup-box .si-submit')   ,// 登录按钮


        },
        listensTo : ['user_refresh']
    }, {
        init : function(){
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

        // 由总模型触发登录功能
        "{vixik$} login" : function(){
            alert('享受服务请先登录！') ;
            this.login_open() ;
        },

        // 保证在dropdown-menu里正常操作，阻止click事件
        ".dropdown-menu click" : function(el, ev){
            ev.stopPropagation() ;
        },

        // 登录界面点击【注册新用户】
        ".lg-regist click" : function(){
            this.signup_open() ;
        },

        // 单击输入框隐藏告警提示
        "{$Logininput} click" : function(){
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
                            // 登录成功
                            $this.options.$Login.removeClass('open') ;
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
        },

        // 注册输入框单击时初始化
        "{$signupInput} focus" : function(el){
            this.options.$signupItem.removeClass("guide") ;
            el.parents('div.item-elem').removeClass("guide warn ok").addClass('guide') ;
        },

        // 表单输入框焦点离开时检查数据
        "{$signupInput} blur" : function(el){
            var pwd_fst, pwd_snd, search_str,
                $this = this,
                $elem = el.parents('.item-elem').removeClass("guide warn ok"),
                value = el.val() ;

            if(value !== ''){
                switch(el.attr('name')){
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
                                $elem.addClass("warn") ;
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

                        pwd_snd = $this.options.$Signup.find('[name=user_pwd]').val() ;

                        if(pwd_snd !== ''){
                            if(value === pwd_snd){
                                $this.options.$Signup.find('[name=user_pwdd]').parents('div.item-elem').addClass("ok") ;
                            }else{
                                $this.options.$Signup.find('[name=user_pwdd]').parents('div.item-elem').addClass("warn") ;
                            }
                        }
                        break ;

                    // 密码二次输入校验
                    case 'user_pwdd' :
                        pwd_fst = $this.options.$Signup.find('[name=user_pwd]').val() ;

                        if(value === pwd_fst){
                            $elem.addClass("ok") ;
                        }
                        else{
                            $elem.addClass("warn") ;
                        }
                        break ;

                    // 电子邮箱校验
                    case 'user_email' :
                        search_str = /^[\w\-\.]+@[\w\-\.]+(\.\w+)+$/ ;

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

        // 注册数据提交
        "{$signupSubmit} click" : function(el){
            var user$, $warn, $elem, title,
                $this  = this,
                user$  = $this.options.$Signup.find('.vk-form').vkForm('get_value', {check_null:2}) ;

            if(user$.status){
                $warn = this.options.$Signup.find('.item-elem.warn') ;

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
                                $this.options.$Signup.find('.signuped>div>span').text(user$.data.user_name) ;
                                $this.element.addClass('ed') ;
                            }else{
                                alert('创建用户未成功，请检查输入！') ;
                            }
                    }) ;
                }
            }else{
                $elem = $this.options.$Signup.find('[name = ' + user$.info +']').parents('.item-elem') ;
                title = $elem.find('label').attr('title') ;
                alert(title + '不能为空！，请完善输入') ;
            }
        },

        // 注册成功后选择推荐活动
        ".dm-stepbtn>button click" : function(el){
            window.location.href = el.attr('href') ;
        },

        // 知道了，但我想留在本页
        ".dm-close click" : function(){
            this.options.$Signup.removeClass('open') ;
        },

        // 鼠标进入初始用户头像打开用户信息菜单
        ".signuped mouseover" : function(){
            this.options.$Signup.addClass('open') ;
        },

        // 打开登录界面
        login_open : function(){
            this.element.children().removeClass('open').filter('.login-box').addClass('open') ;
        },

        // 打开注册界面
        signup_open : function(){
            this.element.children().removeClass('open').filter('.signup-box').addClass('open') ;
        },

        // 警告框操作
        warning : function(event, msg){
            switch(event){
                case 'show' :
                    this.options.$loginWarning.text(msg).show() ;
                    break ;
                case 'hide' :
                    this.options.$loginWarning.text(msg).hide() ;
                    break ;
            }
        },
    });

    /*
     * 用户模块控制器
     *
     */
    $.Controller('Public.Header.Ctrl.User',{
        defaults : {
            $Header : {}   ,// topBar主对象 
            user$   : {}   ,// 用户信息汇总
        },
        listensTo : ['user_refresh']
    }, {
        init : function(){
            this.element.find('.login-signup').public_header_ctrl_login({
                $Main : this.options.$Main, 
                $User : this.options.$userBox,
            }) ;

            this.user_refresh() ;
        },

        // 总模型用户信息获取后触发
        "{vixik$} user" : function(){
            this.user_refresh() ;
        },

        // 鼠标进入用户头像打开用户信息菜单
        ".user-info mouseover" : function(el){
            this.element.find('.user-info').addClass('open') ;
            this.element.parent().addClass('user-info-tmp') ;
        },

        ".user-info mouseout" : function(el){
            this.element.find('.user-info').removeClass('open') ;
            this.element.parent().removeClass('user-info-tmp') ;
        },

        // 退出登录
        ".action>div click" : function(el, ev){
            ev.stopPropagation() ;

            if(el.hasClass('exit')){
                $.cookie('user_code', null, {path:'/'}) ;
                $.cookie('user_md5',  null, {path:'/'}) ;
                $.cookie('user$',     null, {path:'/'}) ;

                this.element.removeClass('logined') ;

                vixik$.user_verify({func$:{false:['user_info']}}) ;
            }else{
                window.open(el.attr('href')) ;
            }
        },

        // 用户信息刷新
        user_refresh : function(){
            var $this    = this,
                user$    = $.evalJSON($.cookie('user$')),
                href     = this.element.attr('data-href'),
                $menu    = this.element.find('.user-info-menu'),
                $visit   = $menu.find('.visit'),
                $setting = $menu.find('.setting'),
                $photo   = this.element.find('.user-photo>img') ;

            // 判断cookie中是否有用户信息
            if(user$){
                this.element.addClass('logined') ;
                this.element.find('.user-nick>a').text(user$.user_nick).attr('href', $setting.attr('href') + '/index') ;

                if(user$.user_photo){
                    $photo.attr('src', __JMVC_IMG__ + 'user/' + user$.user_code + '_60.jpg').show() ;
                }else{
                    $photo.addClass('init') ;
                }

                // 用户菜单选项内容初始化
                $visit.attr('href', $visit.attr('href') + '/visit?code=' + user$.user_code) ;
                $setting.attr('href', $setting.attr('href') + '/index') ;

                $menu.find('.accout-level>.value').text(user$.user_level_desc) ;
                $menu.find('.accout-coins>.value').text(user$.user_coins) ;

                $menu.find('.sv-public>.value').text(user$.publish_times) ;
                $menu.find('.sv-answer>.value').text(user$.answer_times) ;
            }

            this.options.$Main.trigger('data_refresh') ;
        },
    });

    /*
     * Header总控制器
     *
     */
    $.Controller('Public.Header.Ctrl.Main', {
        defaults : {
            $Body       : $('body')          ,// 页面主内容模块
            $Main       : $('#Main')         ,// 页面主内容模块
            $topBar     : $('#topBar')       ,// 页面主内容模块
            $start      : $('a.start')       ,// 快速开始菜单
            $userBox    : $('div.user-box')  ,// 用户区域
            $minSearch  : $('#minSearch')    ,// 迷你搜索输入框
            $loginModal : $('#loginModal')   ,// 登录对话框
        },
        listensTo : ['scroll_init']
    }, {
        init : function(){
            var $this = this ;

            this.scroll_init() ;

            // 对象属性绑定控制器
            this.options.$userBox.public_header_ctrl_user({
                $Header : this.element,
                $Main   : this.options.$Main,
            }) ;

            // 搜索框初始化
            this.options.$minSearch.val('') ;

            // 初始用户验证，验证失败需要登录
            if(this.element.attr('data-verify')){
                vixik$.user_verify({trigger$:{false:['login']}}) ;
            }

            // 显示topBar
            this.options.$topBar.show() ;

            // 导航栏目标定位
            this.options.$topBar.find('.nav-box>.' + this.options.$topBar.attr('data-nav')).addClass('active') ;
        },

        // 打开开始菜单
        ".action-box mouseover" : function(el){
            this.element.find('.action-box').addClass('open') ;
        },

        // 关闭开始菜单
        ".action-box mouseout" : function(el){
            this.element.find('.action-box').removeClass('open') ;
        },

        // 监控搜索输入框输入并且回车提交搜索请求
        "{$minSearch} keydown" : function(el, ev){
            if(ev.keyCode == 13 && el.val()){
                this.search_go(el.val()) ;
            }
        },

        // topbar滚动初始化
        scroll_init : function(){
            console.log('scro') ;
            var $this    = this,
                scroll_h = parseInt($this.element.find('.topbar-main').css('height')),
                scroll_w = $(window).scrollTop() ;

            // topbar悬浮初始化
            window.scrollTo(0, 0) ;
            $this.element.find('.topbar-main').show() ;
            $this.options.$Body.removeClass('topbar-open') ;
            $this.options.$Body.removeClass('topbar-main') ;

            // Topbar滚动实时隐藏显示
            $(window).scroll(function(event) {
                if($(window).scrollTop() > scroll_h){

                    if(Math.abs(scroll_w - $(window).scrollTop()) > 5){
                        if($(window).scrollTop() - scroll_w > 0){
                            // 下拉隐藏
                            $this.options.$Body.removeClass('topbar-open') ;
                            $this.element.find('.topbar-main').slideUp() ;
                        }else{
                            // 上拉显示
                            $this.options.$Body.addClass('topbar-open') ;
                            $this.element.find('.topbar-main').slideDown() ;
                        }
                        scroll_w = $(window).scrollTop() ;
                    }

                    if($(window).scrollTop() > scroll_h * 2){
                        $this.options.$Body.addClass('topbar-hover') ;
                    }
                }else{
                    if($(window).scrollTop() == 0){
                        $this.options.$Body.removeClass('topbar-hover topbar-open') ;
                    }
                }
            });
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
    }) ;

    $('#Header').public_header_ctrl_main() ;
}) ;
