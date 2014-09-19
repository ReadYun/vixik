/**
 * Name        : mainsearch.js
 * Description : js for Public/mainsearch.html
 *
 * Create-time : 2012-8-14 18:14:09
 * Author      : ReadYun
 * Copyright   : VixiK
 * Version     : 1.0.00
 */

steal('init.js')
.then('script/public.header.js')
.then(function($){
    console.log('bootstrap') ;

    /*
     * 用户登录框控制器
     *
     */
    $.Controller('Public.Topbar.Login.Modal',{
        defaults : {
            $input      :  $('input')       ,//INPUT总对象
            $nickInput  :  $('#nick')       ,//用户昵称输入对象
            $pwdInput   :  $('#password')   ,//用户密码输入对象
            $loginModal   :  $('#loginModal1')   ,//用户密码输入对象
            $mInput   :  $('#loginModal1 input')   ,//用户密码输入对象
            $test   :  $('#test3')   ,//用户密码输入对象
            $loginBtn   :  $('#loginBtn')    //登录按钮
        }
    }, {
        init : function(){
            console.log('aaaa') ;
        },

        "{$loginModal} hide" : function(el){
            console.log('hide') ;
//            jQuery.delay(5000).noop() ;
//            window.setTimeout("1+1", 5000) ;
//            jQuery.delay(5000).noop() ;
//            setTimeout("var aa = el.css('display')", 3000) ;

            this.fun(el) ;
        },

        fun : function($aa){
            var d1 = new Date()  ;
            var t1 = d1.getTime()  ;
            for (;;){
                var d2 = new Date();
                var t2 = d2.getTime();
                if (t2-t1 > 2000){
                    break;
                }
            }
            var aa = $aa.delay(2000).css("display") ;
            console.log(aa) ;
        },

        "{$mInput} focus" : function(el){
            var modal
        },

        "{$test} click" : function(){
            this.options.$loginModal.modal({
                show : true,
                remote : "/vixik/app/Tpl/Survey/recommself.html"
            }) ;
        },

        "{$nickInput} blur" : function(el){
            var nick = this.options.$nickInput.val() ;
            var url = __URL_USER__ + "/loginVerify" ;
            var data$ = {
                type : 1,
                nick : nick
            } ;

            if(nick){
                $.post(url, data$, function(flag){
                    if(flag === '1'){   //用户名不存在
                        el.tooltip('destroy') ;
                    }else{
                        el.attr('title','此用户不存在，请重新输入').tooltip('show') ;
                    } ;
                }) ;
            }else{
                el.attr('title','请输入用户名').tooltip('show') ;
            } ;
        },

        "{$loginBtn} click" : function(){
            var $nickInput = this.options.$nickInput ;
            var $pwdInput = this.options.$pwdInput ;
            var user_nick = $nickInput.val() ;
            var user_pwd = $pwdInput.val() ;

            var url = __URL_USER__ + "/loginVerify" ;
            var data$ = {
                    type     : 2,
                    nick     : user_nick,
                    password : user_pwd
                } ;

            if(user_nick){
                if(user_pwd){
                    $.post(url, data$, function(user_code){
                        if(user_code >= 10000000){
                            $('#loginModal').modal('hide') ;
                            window.location.reload() ;
                        }
                        else{
                            $('div.warning').show() ;
                        } ;
                    }) ;
                }else{
                    $pwdInput.attr('title','请输入密码').tooltip('show') ;
                }
            }
            else{
                $nickInput.attr('title','请输入用户名').tooltip('show') ;
            }
        }
    });

    $('#loginModal1').public_topbar_login_modal() ;


}) ;
