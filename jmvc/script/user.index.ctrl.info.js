
/**
 * Name        : user.index.ctrl.info.js
 * Description : js for user/index.html
 *
 * Create-time : 2013-6-13, 4:18:17
 * Author      : ReadYun
 * Copyright   : VixiK
 * Version     : 1.0.00
 */

steal('init.js')
.then(function($){
    loadPlugin('jqueryform', 'uploadify', 'Jcrop', 'vkData') ;
}) 
.then(function($){

    /*
     * 我的资料模块控制器
     *
     **/
    $.Controller('User.Index.Ctrl.Info', {
        defaults : {
            models$      : {}                  ,// 页面总模型
            $baseInfo    : $('#base-info')     ,// 基本资料模块DOM对象
            $extendInfo  : $('#extend-info')   ,// 个性资料模块DOM对象
            $userPhoto   : $('#user-photo')    ,// 修改头像模块DOM对象
            $userContact : $('#user-contact')  ,// 联系方式模块DOM对象
            $safeSetting : $('#safe-setting')  ,// 安全设置模块DOM对象
            $accoutBind  : $('#accout-bind')   ,// 帐号绑定模块DOM对象
        },
        listensTo : ["data_collect", "info_progress"]
    }, {
        init : function(){
            // 基本资料模块控制器
            this.options.$baseInfo.user_index_ctrl_info_base({    
                models$ : this.options.models$
            }) ;

            // 个性资料模块控制器
            this.options.$extendInfo.user_index_ctrl_info_extend({    
                models$ : this.options.models$
            }) ;

            // 修改头像模块控制器
            this.options.$userPhoto.user_index_ctrl_info_photo({
                models$ : this.options.models$ ,
                $main   : this.element
            }) ;

            // 联系方式模块控制器
            this.options.$userContact.user_index_ctrl_info_contact({
                models$ : this.options.models$ ,
                $main   : this.element
            }) ;

            // 安全设置模块控制器
            this.options.$safeSetting.user_index_ctrl_info_safe({    
                models$ : this.options.models$
            }) ;
        },

        // 监听模型的资料完整度数据变化
        "{models$} info_complete" : function(){
            var value, value$,
                data$ = this.options.models$.complete$,
                $complete = this.element.find('.info-complete') ;


            // 总资料完整度
            if(data$.total.num != data$.total.key$.length){
                value = parseInt(((data$.total.tote - data$.total.key$.length) / data$.total.tote) * 100) ;
            }else{
                value = 0 ;
            }

            $complete.find('div.complete-progress').progressbar({value:value}) ;
            $complete.find('div.progress-value').text(value + '%') ;

            // 分类资料完整度
            $complete.find('.cpl-elem').each(function(){
                value$ = data$[$(this).attr('data-key')] ;
                $(this).find('.cpl-elem-value').text((value$.tote - value$.key$.length) + "/" + value$.tote) ;

                if(value$.key$.length == 0){
                    $(this).attr('data-prefect', 1) ;
                }else{
                    $(this).attr('data-prefect', 0) ;
                }
            }) ;
        },

        ".cpl-elem-action>a click" : function(el){
            $('#mainMenu').find('a[href=' + el.attr('data-target') + ']').trigger('click') ;
        },
    }) ;

    /*
     * 基本资料模块控制器
     *
     **/
    $.Controller('User.Index.Ctrl.Info.Base', {
        defaults : {
            models$ : {}  ,// 页面总模型
        }
    }, {
        init : function(){
            var $this = this ;

            this.element.vkForm('init', {
                reset : true,     // 顺便重置表单

                // 样式定义
                style : function($target){
                    // 题目选项美化处理（要排除模板选项）
                    if($target){
                        $target.find('.vf-elem-option').find('input').iCheck({
                            checkboxClass: 'icheckbox_minimal-grey',
                               radioClass: 'iradio_minimal-grey',
                        }) ;

                        // 为统一样式加入icheck标记
                        $('.icheckbox_minimal-grey').addClass('icheck') ;
                        $('.iradio_minimal-grey').addClass('icheck') ;
                    }else{
                        $('.vf-elem-option').find('input').iCheck({
                            checkboxClass: 'icheckbox_minimal-grey',
                               radioClass: 'iradio_minimal-grey',
                        }) ;

                        // 为统一样式加入icheck标记
                        $('.icheckbox_minimal-grey').addClass('icheck') ;
                        $('.iradio_minimal-grey').addClass('icheck') ;
                    }
                },

                // 事件定义
                event : {
                    // 选中事件
                    check : function(el){
                        // 调用iCheck插件的check方法
                        el.iCheck('check') ;
                    },

                    // 取消选中事件
                    uncheck : function(el){
                        // 调用iCheck插件的uncheck方法
                        el.iCheck('uncheck') ;
                    },
                },

                // 表单元素重置方法定义
                replace : {
                    common : function(){
                        console.log('area_province.replace.func.common()') ;
                    },
                    birth_day : $this.birthday_replace,  // 传入出生日期选项刷新函数
                }
            }) ;

            // 需要Ajax功能的表单元素URL属性初始化
            $this.element.find('.vf-elem[data-vf-name=area_city]'     ).attr('data-rep-url',__API__).attr('data-rep-api','det_data_select') ;
            $this.element.find('.vf-elem[data-vf-name=industry_sub]'  ).attr('data-rep-url',__API__).attr('data-rep-api','det_data_select') ;
            $this.element.find('.vf-elem[data-vf-name=income_section]').attr('data-rep-url',__API__).attr('data-rep-api','det_data_select') ;
        },

        // 取到用户数据后匹配表单
        "{models$} user_info" : function(){
            var $this = this ;

            this.element.find('.vf-elem').each(function(){
                $(this).vkForm('fix', {
                    data$:$this.options.models$.user$}
                ) ;
            }) ;            
        },

        // 出生日期选项刷新
        birthday_replace : function($day){
            var data$, $day, days, str_ym, i,
                year  = $('input[name=birth_year]').val(),
                month = $('select[name=birth_month]').val(),
                data$ = [] ;

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

        // 出生年份输入框焦点离开事件
        "input[name=birth_year] blur" : function(el){
            var year_val, year_dif,
                value    = el.val(),
                year_now = moment().year() ;

            if(value !== ''){
                year_val = parseInt(value) ;
                year_dif = year_now - year_val ;

                if(year_dif <= 0 || year_dif >= 100){
                    alert('出生年份输入有误，请重新输入') ;
                    el.attr('value', '') ;
                }
            }
        },

        // 出生日期点击事件
        "select[name=birth_day] click" : function(el){
            var year  = this.element.find('input[name=birth_year]').val(),
                month = this.element.find('select[name=birth_month]').val() ;

            if(year == ''){
                alert('请输入正确的出生年份') ;
            }
            if(month == 0){
                alert('请选择正确的出生月份') ;
            }
        },

        // 完成提交按钮单机
        "button.submit click" : function(){
            var name, $elem, label,
                $this = this,
                data$ = this.data_submit(2) ;

            if(data$ && !data$.status){
                // 如果有未完善的信息后续处理
                name  = data$.info ;
                $elem = $this.element.find('[name=' + name + ']').parents('.pane-elem') ;
                label = $elem.children('label').text() ;

                // 判断未完善的元素是必选还是可选
                if($this.element.find('[name=' + name + ']').parents('.vf-elem').attr('data-elem-type') === 'required'){
                    alert('必选项：' + label + ' 信息不能为空，请完善信息后提交') ;

                    //定位到要完善的必选项位置（用offset函数取值有问题暂时定位不了）
                    window.scrollTo(0, $elem.offset().top-65) ;
                }else{
                    if(window.confirm('可选项：' + label + ' 信息不完整，您确定现在提交吗？')){
                        this.data_submit(0) ;
                    }else{
                        //定位到要完善的可选项位置（用offset函数取值有问题暂时定位不了）
                        window.scrollTo(0, $elem.offset().top-65) ;
                    }
                }
            }
        }, 

        data_submit : function(check_null){
            var info$, birthday,
                $this = this,
                data$ = this.element.vkForm('get_value', {
                check_null : 1,   // 是否校验空值（0:不校验；1:只校验必选项；2:校验全部选项包括可选项）
            }) ;

            if(data$.status){
                info$ = data$.data ;

                // 单独处理部分数据
                if(info$.birth_year && info$.birth_month && info$.birth_day){
                    // 用户生日数据生成
                    birthday = parseInt(info$.birth_year) + '-' + info$.birth_month + '-' + info$.birth_day ;
                }else{
                    // 删除临时的属性
                    delete info$.birth_year ;
                    delete info$.birth_month ;
                    delete info$.birth_day ;
                }

                // 先判断是否修改过数据
                if($.vkData('array_include', {data1$:$this.options.models$.user$, data2$:info$})){
                    alert('没有修改任何信息') ;
                }else{
                    // 确实有修改数据则提交更新数据到服务器
                    info$.user_birthday = birthday ;
                    info$.user_age      = moment().diff(moment(birthday, 'YYYY-MM-DD'), 'year') ;    // 用户年龄数据生成

                    $.post(__API__, {
                        api       : 'user_info_update', 
                        user_code : $.cookie('user_code'), 
                        user_md5  : $.cookie('user_md5'), 
                        data      : $.toJSON(info$)}, 
                        function(data$){
                            if(data$.status){
                                alert('您的基本资料已更新！') ;
                                $this.options.models$.user_info_get() ;
                            }else{
                                alert('抱歉您的基本资料未更新成功，请您重新提交资料') ;
                            }
                        }
                    ) ;
                }
            }else{
                return data$ ;
            }
        },
    }) ;    

    /*
     * 个性资料模块控制器
     *
     **/
    $.Controller('User.Index.Ctrl.Info.Extend', {
        defaults : {
            models$ : {}  ,// 页面总模型
        }
    }, {
        init : function(){
            var $this = this ;

            this.element.vkForm('init', {
                reset : true,     // 顺便重置表单

                // 样式定义
                style : function(){
                    // 题目选项美化处理（要排除模板选项）
                    $('.vf-elem-option').find('input').iCheck({
                        checkboxClass: 'icheckbox_minimal-grey',
                           radioClass: 'iradio_minimal-grey'
                    }) ;

                    // 为统一样式加入icheck标记（加点延迟）
                    setTimeout(function(){
                        $('.icheckbox_minimal-grey').addClass('icheck') ;
                        $('.iradio_minimal-grey').addClass('icheck') ;
                    }, 10) ;
                },

                // 事件定义
                event : {
                    // 选中事件
                    check : function(el){
                        // 调用iCheck插件的check方法
                        el.iCheck('check') ;
                    },

                    // 取消选中事件
                    uncheck : function(el){
                        // 调用iCheck插件的uncheck方法
                        el.iCheck('uncheck') ;
                    },
                },

                // 表单元素重置方法定义
                replace : {
                    common : function(){
                        console.log('area_province.replace.func.common()') ;
                    },
                }
            }) ;
        },

        // 取到用户数据后匹配表单
        "{models$} user_info" : function(){
            var $this = this ;

            this.element.find('.vf-elem').each(function(){
                $(this).vkForm('fix', {
                    data$:$this.options.models$.user$}
                ) ;
            }) ;            
        },

        // 完成提交按钮单机
        "button.submit click" : function(){
            var $this = this,
                data$ = this.element.vkForm('get_value') ;

                console.log(data$) ;

            if(data$.status){
                data$ = {
                    user_code   : $.cookie('user_code') ,
                    user_extend : $.toJSON(data$.data )
                } ;   

                //提交更新数据到服务器
                $.post(__API_USER_INFO_UPDATE__, data$, function(data$){
                    if(data$){
                        alert('您的个性资料已更新！') ;
                        $this.options.models$.infoCompleteGet() ;
                    }else{
                        alert('抱歉您的个性资料未更新成功，请您重新提交资料') ;
                    }
                }) ;
            }else{
                return data$ ;
            }
        }
    }) ;

    /*
     * 修改头像模块控制器
     *
     **/
    $.Controller('User.Index.Ctrl.Info.Photo', {
        defaults : {
            models$    : {}                 ,// 页面总模型
            $picUpload : $('#pic-upload')   ,// 帐号绑定DOM对象
            $cropBox   : $('div.crop-box')  ,// 裁剪图片容器对象
            $uploadBtn : $('.btn-upload')   ,// 上传按钮
        },
        listensTo : ["data_collect"]
    }, {
        init : function(){
            var image,
                $this      = this,
                $upLoad    = this.element.find('div.upload-area'),
                $userPhoto = $this.element.find('.photo-box') ;

            // 上传图片对象绑定Ajax提交控件
            this.element.find('#pic').ajaxForm(function(data$){
                if(data$.status){
                    // 更新三个头像
                    // image = __JMVC_IMG__ + 'user/' + $.cookie('user_code') + '_120.jpg?random=' + Math.random() ;

                    $userPhoto.find('i').hide() ;
                    $userPhoto.find('img').attr('src', image).show() ;
                    $('#topNav div.user-photo img').attr('src', image) ;

                    // 头像更新成功返回初始状态
                    $this.return_init() ;    
                    alert("新头像已更新") ;
                }
            }); 

            // 上传插件upLoadify绑定
            this.uploadify(this.options.$picUpload) ;
        },

        "{models$} user_info" : function(){
            // 用户头像初始化
            if(this.options.models$.user$.user_photo){
                this.element.find('.photo-box').find('i').hide() ;
                this.element.find('.photo-box').find('img').show() ;
            }       
        },

        // 前台文件上传
        uploadify : function($upLoad){
            var $this = this ;

            $upLoad.uploadify({
            'queueSizeLimit'  : 1,    // 上传队列中所允许的文件数量
            'removeTimeout'   : 0.5,
            'preventCaching'  : true,
            'multi'           : false,    // 设置为true将允许多文件上传
            'swf'             : __PLUGIN_UPLOADIFY__ + 'uploadify.swf',  // 特效文件
            'uploader'        : __API_UPLOAD_IMG__,    // 上传提交的路径
            'buttonText'      : '点击修改头像',        // 默认在按钮上显示的文本
            'width'           : '130',                 // 浏览按钮的宽度
            'height'          : '30',                  // 浏览按钮的高度
            'fileTypeExts'    : '*.jpg; *.png; *.gif;',
            'onUploadSuccess' : function(file, data, response){
                    var flag , image , $img ;
                    var data$    = $.parseJSON(data) ;
                    var $preview = $this.element.find('.crop-preview div.preview-body') ;    // 两个预览窗口容器对象
                    var $cropBox = $this.element.find('.crop-box div.crop-img') ;

                    if(data['status'] == 0){
                        alert(data['info']) ;
                    }else{
                        
                        flag  = $this.element.filter('.crop').length ;
                        image = __JMVC_IMG__ + 'tmp/' + data$.data ;

                        // 切换为上传模式
                        $this.element.addClass('crop') ;

                        // 两个预览窗口赋值
                        $preview.find('img').attr('src', image) ;

                        // 隐藏表单赋值
                        $('#img_src').val(data$['data']) ;
                        $('#img_code').val($this.options.models$.user_code) ;

                        // 重新创建用来裁剪的图片
                        $img = $("<img id='crop-img'/>") ;
                        $img.attr('src', image + '?random=' + Math.random()) ;
                        $cropBox.children().remove() ;  // 先清除原裁剪对象内容
                        $cropBox.append($img) ;         // 再插入新建的图片图片

                        // 裁剪插件加载
                        $('#crop-img').Jcrop({
                            bgColor     : '#333',            // 选区背景色
                            bgFade      : true,              // 选区背景渐显
                            fadeTime    : 1000,              // 背景渐显时间
                            allowSelect : false,             // 是否可以选区，
                            allowResize : true,              // 是否可以调整选区大小
                            aspectRatio : 1,                 // 约束比例
                            minSize     : [100,100],         // 可选最小大小
                            boxWidth    : 250,               // 画布宽度
                            boxHeight   : 250,               // 画布高度
                            onChange    : $this.preview,     // 改变时重置预览图
                            onSelect    : $this.preview,     // 选择时重置预览图
                            setSelect   : [ 0, 0, 100, 100], // 初始化时位置
                            onSelect    : function (c$){     // 选择时动态赋值，该值是最终传给程序的参数！
                                $('#crop-x').val(c$.x);  // 需裁剪的左上角X轴坐标
                                $('#crop-y').val(c$.y);  // 需裁剪的左上角Y轴坐标
                                $('#crop-w').val(c$.w);  // 需裁剪的宽度
                                $('#crop-h').val(c$.h);  // 需裁剪的高度
                            }
                        });

                        // 首次上传友好提示
                        if(!flag){
                            $this.element.find('div.uploadify-button').text('重新选择图片') ;
                            alert('请裁剪选择的图片为合适的尺寸') ;
                        } ;
                    }
                }
            }) ;
        }, 

        // 预览图生成
        preview : function(coords){
            var wh, rx, ry,
                $this      = this,
                $preview   = $('.crop-preview div.preview-img'),    // 两个预览窗口容器对象
                img_width  = $('#crop-img').width(),
                img_height = $('#crop-img').height() ;

            $.each($preview, function(){
                // 根据包裹的容器宽高,设置被除数
                wh = parseInt($(this).attr('data-wh')) ;
                rx = wh / coords.w ;
                ry = wh / coords.h ;

                // 计算预览图的新宽高和位移
                $(this).children('img').css({
                    width      : Math.round(rx * img_width) + 'px',
                    height     : Math.round(ry * img_height) + 'px',
                    marginLeft : '-' + Math.round(rx * coords.x) + 'px',
                    marginTop  : '-' + Math.round(ry * coords.y) + 'px'
                });
            }) ;
        },

        // 保存头像提交按钮
        ".save-box>button click" : function(){
            $('#pic').submit();
        },

        // 取消按钮
        ".btn-cancel click" : function(){
            this.return_init() ;
        },

        // 恢复初始状态
        return_init : function(){
            this.element.removeClass('crop') ;
            this.element.find('div.uploadify-button').text('点击修改头像') ;
        }
    }) ;

    /*
     * 联系方式模块控制器
     *
     **/
    $.Controller('User.Index.Ctrl.Info.Contact', {
        defaults : {
            models$ : {}  ,// 页面总模型
        }
    }, {
        init : function(){
        },

        // 取到用户数据后匹配表单
        "{models$} user_info" : function(){
            var $this = this ;

            this.element.find('.vf-elem').each(function(){
                $(this).vkForm('fix', {
                    data$:$this.options.models$.user$}
                ) ;
            }) ;            
        },

        // 完成提交按钮单机
        "button.submit click" : function(){
            var data$,
                $this = this ;

            // 调用vkFrom插件取表单数据
            data$ = this.element.vkForm('get_value') ;

            // 处理表单数据
            if(data$.status){
                data$ = {
                    user_code : this.options.models$.user_code ,
                    user_info : $.toJSON(data$.data)
                } ;

                $.post(__API_USER_INFO_UPDATE__, data$, function(data$){
                    if(data$){
                        alert('您的联系方式已更新！') ;
                    }else{
                        alert('抱歉您的联系方式未更新成功，请您重新提交') ;
                    }
                }) ;
            }else{
                alert('输入信息异常，请检查输入') ;
            }
        }
    }) ;

    /*
     *  安全设置模块控制器
     *
     **/
    $.Controller('User.Index.Ctrl.Info.Safe', {
        defaults : {
            models$     : {}                      ,// 页面总模型
            $oldPwd     : $('input.old-pwd')      ,// 老密码输入
            $newPwdFst  : $('input.new-pwd-fst')  ,// 新密码第一次输入
            $newPwdSnd  : $('input.new-pwd-snd')  ,// 新密码第二次输入
            $accoutBind : $('#accout-bind')       ,// 帐号绑定DOM对象
        },
        listensTo : ["data_collect"]
    }, {
        init : function(){
            var data$ = this.options.models$.scoreAction$ ;
        },
        
        display_toggle : function($button){
            $button.parents('div.pane-elem-form').toggleClass('active') ;
        },

        // 友情提示
        elem_hint : function($elem, hint){
            var $target ;

            // 定位目标对象
            if($elem.attr('type') === 'button'){
                $target = $elem.parent().find('.alter-form') ;
            }else{
                $target = $elem.parent('.alter-form') ;
            }

            // 先清除之前的各种提示类型
            $target.removeClass('focus warn success') ;

            // 再根据不同的类型执行不同的操作
            if(hint){
                setTimeout(function(){
                    $target.addClass(hint) ;
                }, 300) ;
            }
        },

        // 单击修改按钮激活修改模式
        "button.btn-link click" : function(el){
            this.display_toggle(el) ;
        },

        // 输入框聚焦
        "input focus" : function(el){
            this.elem_hint(el, 'focus') ;
        },

        // 输入框焦点离开
        "input blur" : function(el){
            this.elem_hint(el) ;
        },

        // 焦点离开老密码输入框自动去验证老密码
        "input.old-pwd blur" : function(el){
            if(el.val()){
                if(this.password_verify(el.val())){
                    this.elem_hint(el, 'success') ;
                }else{
                    this.elem_hint(el, 'warn') ;
                } ;
            }
        }, 

        // 老密码验证
        password_verify : function(pwd){
            var flag      = false,
                user_code = this.options.models$.user_code ;

            if(pwd !== ''){
                // 访问接口验证老密码
                $.ajax({
                    type    : 'post',
                    url     : __API_USER_VERIFY__,
                    data    : {user_code:user_code,user_pwd:pwd},   
                    async   : false,   
                    success : function(data$){
                        if(data$.status){
                            flag = true ;
                        }
                    }
                });
            } ;

            return flag ;
        },

        // 修改密码提交
        "#pwdSubmit click" : function(el){
            var $this    = this,
                $oldPwd  = this.element.find('input.old-pwd'),
                $newPwd  = this.element.find('input.new-pwd'),
                $newPwdd = this.element.find('input.new-pwdd'),

                old_pwd  = $oldPwd.val(),
                new_pwd  = $newPwd.val(),
                new_pwdd = $newPwdd.val() ;

            if(this.password_verify(old_pwd)){    // 先校验老密码是否正确
                if(new_pwd.length >= 6){
                    if(new_pwd === new_pwdd){    // 再校验密码两次输入是否一致
                        // 所有校验都通过向接口提交修改密码
                        var data$ = {
                            user_code : $this.options.models$.user_code,
                            user_info : $.toJSON({user_pwd:new_pwd})
                        } ;

                        $.post(__API_USER_INFO_UPDATE__, data$, function(data$){
                            if(data$.status){
                                alert('新密码修改成功！') ;
                                $this.display_toggle(el) ;
                            }else{
                                alert('新密码修改不成功！') ;
                            }  ;
                        }) ;
                    }else{
                        $this.elem_hint($newPwdd, 'warn') ;
                        // alert('新密码两次输入不一致，请重新输入') ;
                    }
                }else{
                    $this.elem_hint($newPwd, 'warn') ;
                }
            }else{
                $this.elem_hint($oldPwd, 'warn') ;
                // alert('旧密码错误，请重新输入') ;
            }
        },

        // 修改电子邮箱提交
        "#emailSubmit click" : function(el){
            var $this      = this,
                search_str = /^[\w\-\.]+@[\w\-\.]+(\.\w+)+$/,
                $email     = el.parents('div.elem-form').find('input'),
                user_email = $email.val() ;

            if(search_str.test(user_email)){
                var data$ = {
                    user_code : this.options.models$.user_code ,
                    user_info : $.toJSON({user_email:user_email})
                } ;

                $.post(__API_USER_INFO_UPDATE__, data$, function(data$){    
                    if(data$.status){
                        alert('新邮箱更新成功！') ;
                        el.parents('div.elem-form').find('div.user-email').text(user_email) ;
                        $this.display_toggle(el) ;
                    }else{
                        alert('新邮箱更新不成功！') ;
                    }  ;
                }) ;
            }
            else{
                setTimeout(function(){
                        el.parent().find('.alter-form').addClass('warn') ;
                }, 300) ;
            }
        }
    }) ;


}) ;