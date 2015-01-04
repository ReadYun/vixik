/**
 * Name        : user.index.js
 * Description : js for user/index.html
 *
 * Create-time : 2013-6-13, 4:18:17
 * Author      : ReadYun
 * Copyright   : VixiK
 * Version     : 1.0.00
 */

steal('init.js')
.then(function($){
    loadPlugin('iCheck', 'vkForm') ;
}) 
.then('script/public.header.js')
.then('script/user.index.model.js')
.then('script/user.index.ctrl.info.js')
.then('script/user.index.ctrl.action.js')
.then('script/user.index.ctrl.accout.js')
.then('script/user.index.ctrl.follow.js')
.then(function($){

    /*
     * 左侧主菜单控制器
     *
     **/
    $.Controller('User.Index.Ctrl.Side', {
        defaults : {
            models$    : {}               ,// 页面总模型
            $navMain   : $('a.nav-main')  ,// 我的资料DOM对象
            $navSub    : $('li.nav-sub')  ,// 我的资料DOM对象
        }
    }, {
        init : function(){
            var href        = window.location.hash,
                $targetMenu = this.element.find('a[href=' + href +']'),
                $targetPane = $(href) ;

            // 解析URL判断菜单与内容显示方式
            if(href){
                // 显示定位目标菜单
                $targetMenu.parents('ul.nav-sub').children().removeClass('active') ;
                $targetMenu.parents('li.nav-main').addClass('active') ; 
                $targetMenu.parent().addClass('active') ;
                
                // 显示定位目标内容
                $targetPane.parent().children().removeClass('active') ;
                $targetPane.parents('div.pane-main').addClass('active') ;
                $targetPane.addClass('active') ;
            }else{
                this.element.find('li.nav-main>a').first().trigger('click') ;
            }

            // 菜单显示初始化
            this.element.find('li.nav-main.active li.nav-sub').show() ;
        },

        // 主菜单点击动作
        "{$navMain} click" : function(el){
            if(el.attr('href') !== this.element.find('li.nav-main.active>a').attr('href')){
                this.element.find('li.nav-sub').slideUp(200) ;
                el.parents('li.nav-main').find('li.nav-sub').slideDown(200) ;
            } ;
        },
    }) ;

    /*
     * 页面总控制器
     *
     **/
    $.Controller('User.Index.Ctrl.Main', {
        defaults : {
            models$    : {}               ,// 页面总模型
            $mainLeft  : $('#mainLeft')   ,// 左侧边栏DOM对象
            $myInfo    : $('#myInfo')     ,// 我的资料DOM对象
            $myAction  : $('#myAction')   ,// 我的活动DOM对象
            $myAccout  : $('#myAccout')   ,// 我的账户DOM对象
            $myCollect : $('#myCollect')  ,// 我的收藏DOM对象
            $myRight   : $('#myRight')    ,// 我的权限DOM对象
        },
        listensTo : ["user_refresh"]
    }, {
        init : function(){
            // 新建模型实例并初始化
            this.options.models$ = new User.Index.Model({
                user$     : vixik$.user$              ,// 用户总模型
                user_code : vixik$.user$.user_code    ,// 用户编码
            }) ;

            // 左侧边栏控制器
            this.options.$mainLeft.user_index_ctrl_side({    
            }) ;

            // 我的资料模块对象控制器
            this.options.$myInfo.user_index_ctrl_info({    
                models$ : this.options.models$
            }) ;

            // 我的活动模块对象控制器
            this.options.$myAction.user_index_ctrl_action({    
                models$ : this.options.models$
            }) ;

            // 我的账户模块对象控制器
            this.options.$myAction.user_index_ctrl_accout({    
                models$ : this.options.models$
            }) ;

            // 我的收藏模块对象控制器
            this.options.$myCollect.user_index_ctrl_follow({    
                models$ : this.options.models$
            }) ;

            // 初始刷新数据
            this.data_refresh() ;
            $('body').show() ;
        },

        "{vixik$} user" : function(){
            this.data_refresh() ;
        },

        // 数据刷新
        data_refresh : function(){
            if(vixik$.user$){
                this.options.models$.user$     = vixik$.user$ ;            // 更新用户模型
                this.options.models$.user_code = vixik$.user$.user_code ;  // 用户编码
                this.options.models$.user_info_find() ;                    // 刷新用户信息
            }
        },
    }) ;

    $('#Main').user_index_ctrl_main() ;
}) ;