/**
 * Name        : create.model.js
 * Description : js for survey/create.html
 *
 * Create-time : 2012-8-14 18:14:09
 * Author      : ReadYun
 * Copyright   : VixiK
 * Version     : 1.0.00
 */

steal('init.js')
.then(function($){

    /*
     * 页面总模型
     *
     **/
    $.Model('Survey.Create.Model', {
        defaults : {
            user_code   : 0   ,// 用户编码
            user_nick   : ''  ,// 用户昵称
            qt_num      : 0   ,// 调查题目数量
            survey_code : 0   ,// 调查编码
            step$       : {}  ,// 调查步骤对象
            coins$      : {}  ,// 金币计算对象
            user$       : {}  ,// 用户信息
            info$       : {}  ,// 调查基本信息
            draft$      : {}  ,// 数据收集标志位
            collect$    : {}  ,// 数据收集标志位
            submit$     : {}  ,// 数据收集标志位
        }
    }, {
        init : function(){
            var $this = this ;

            //初始化//保存草稿间隔时间（分钟）
            $this.draft$.length = 3 ;

            // 访问用户行为配置规则查询接口初始化各种操作对应积分配置
            $.ajax({
                type    : 'post',
                url     : __API__,                                                  
                data    : {api:'user_action_cfg_select', action:$.toJSON([{code:1003},{code:1004},{code:1005}])},
                success : function(data$){
                    if(data$.status){
                        $this.coins$.sv_create = parseInt(data$.data['1003'].user_coins.value) ;  // 创建调查
                        $this.coins$.qt_add    = parseInt(data$.data['1004'].user_coins.value) ;  // 增加题目
                        $this.coins$.sv_recomm = parseInt(data$.data['1005'].user_coins.value) ;  // 调查推荐
                        $this.coins_cnt() ;
                    }
                }
            });

            // 如果是修改调查页面，初始化调查相关信息
            if($this.survey_code){
                $.ajax({
                    type    : 'post',
                    url     : __API__,
                    data    : {api:'survey_info_find', survey_code:$this.survey_code, is_base: 1},
                    success : function(data$){
                        // 取调查相关信息成功，更新模型并匹配页面数据
                        if(data$.status){
                            if(data$.data.info){
                                // console.dir(data$.data.info) ;
                                $this.info$       = data$.data.info ;
                                $this.survey_code = $this.info$.survey_code ;

                                $this.trigger('sv_info') ;
                            }

                            if(data$.data.question){
                                $this.question$ = data$.data.question ;

                                $this.trigger('sv_question') ;
                            }

                            if(data$.data.recommend){
                                $this.recommend$ = data$.data.recommend ;

                                $this.trigger('sv_recommend') ;
                            }


                            // 初始化调查名称默认值
                            if($this.info$.survey_name == '未命名'){
                                $this.info$.survey_name = null ;
                            }
                        }else{
                            alert('查询调查相关信息失败，请刷新页面') ;
                        }
                    }
                });
            }else if(parseInt($this.survey_type) > 0 || parseInt($this.survey_type_sub) > 0){
                $this.info$ = {} ;

                if(parseInt(this.survey_type) > 0){
                    $this.info$.survey_type = $this.survey_type ;
                }
                if(parseInt(this.survey_type_sub) > 0){
                    $this.info$.survey_type_sub = $this.survey_type_sub ;
                }
            }

            // 用户账户信息更新
            setTimeout(function(){
                $this.user_info() ;
            }, 200) ;
        },

        // 手动触发模型更新事件
        trigger : function(prop){    
            eval("this.attr('" + prop + "', Math.random())") ;
        },

        // 页面元素定位与提示刷新
        elem_refresh : function($target, type){
            switch(type){
                case 'active' :
                    this.$active = $target ;
                    this.trigger('active') ;
                    break ;

                case 'location' :
                    this.$location = $target ;
                    this.trigger('location') ;
                    break ;

                default :
                    if($target){
                        this.$active = this.$location = $target ;

                        this.trigger('active') ;
                        this.trigger('location') ;
                    }
                    break ;
            }
        },

        // 金币信息初始化
        user_info : function(){
            var $this = this ;

            // 访问用户账户信息查询接口
            if($this.user_code){
                $.ajax({
                    type    : 'post',
                    url     : __API__,      
                    data    : {api:'user_info_find', user_code:$this.user_code},  // 用户编码
                    success : function(data$){
                        if(data$.status){
                            $this.coins$.user_coins = parseInt(data$.data.user_coins) ;    // 用户当前金币
                            $this.coins_cnt() ;  // 重新计算金币
                        }else{
                            $this.coins$.user_coins = 0 ;
                            $this.coins_cnt() ;  // 重新计算金币
                        }
                    }
                });
            }else{
                $this.coins$.user_coins = 0 ;
                $this.coins_cnt() ;  // 重新计算金币
            }
        },

        // 行为消耗金币查询
        action_coins_find : function(action_key, action_code){
            var $this = this ;

            // 访问用户行为配置规则查询接口
            $.ajax({
                type    : 'post',
                url     : __API__,                                                  
                data    : {api:'user_action_cfg_select', action_code:action_code},
                success : function(data$){
                    if(data$.status){
                        $this.coins$[action_key] = parseInt(data$.data.user_coins.value) ;
                    }
                }
            });
        },

        // 金币信息统计
        coins_cnt : function(){
            var sv_recomm,
                coins$ = this.coins$ ;

            // 用户金币初始化
            if(this.user$.user_coins){
                this.coins$.user_coins = parseInt(this.user$.user_coins) ;
            }else{
                this.coins$.user_coins = 0 ;
            }

            // 调查推荐类型判断
            if(this.info$.recomm_type > 0){
                sv_recomm = coins$.sv_recomm ;
            }else{
                sv_recomm = 0 ;
            }
            
            coins$.coins_publish = coins$.sv_create + coins$.qt_add * this.qt_num + sv_recomm ;  // 计算已使用金币（发布所需金币）
            coins$.coins_surplus = coins$.user_coins - coins$.coins_publish ;                    // 计算剩余金币

            if(coins$.coins_publish && coins$.coins_surplus){
                this.trigger('user_coins') ;
            }
        },

        // 数据收集前初始化
        data_collect : function(type, target, info){
            switch(type){
                case 'success' :
                    this.collect$[target] = true ;

                    if(this.collect$.content && this.collect$.setting && this.collect$.recomm){
                        this.data_submit() ;
                    }
                    break ;

                case 'failed' :
                    this.collect$[target] = false ;
                    this.collect$.flag    = false ;
                    this.trigger('collect_failed') ;
                    console.log(info) ;  // 跟踪定位问题
                    break ;

                default : 
                    this.collect$.flag    = true ;
                    this.collect$.type    = type ;
                    this.collect$.content = false ;
                    this.collect$.setting = false ;
                    this.collect$.recomm  = false ;
                    this.trigger('collect_start') ;
                    break ;
            }
        },

        // 数据提交
        data_submit : function(){
            var $this = this ;

            this.draft$.flag = false ;  // 先停止保存草稿

            // 发布调查需要先进行账户金币判定
            if($this.info$.survey_state == 2 && 1 == 2){
                // 访问用信息查询接口取出用户当前金币数
                $.ajax({
                    type    : 'post',
                    url     : __API__,
                    data    : {api:'user_info_find', user_code:models$.user_code},
                    async   : false,
                    success : function(data$){
                        if(data$.status){
                            user_coins   = data$.data.user_coins ;
                            create_coins = $this.options.models$.coins$.coins_publish ;

                            // 用户账户金币余额大于创建调查所需金币才能发布调查，否则只能先保存为草稿
                            if(user_coins < create_coins){
                                alert('您的帐号金币数量不够创建本次调查，先为您保存为草稿') ;
                                models$.info$.survey_state = 1 ;
                            }
                        }else{
                            console.log(data$.info) ;
                            alert('用户信息读取失败，请重新点击提交') ;
                        }
                    }
                }); 
            }

            // 先提交调查基本信息信息和题目信息（访问调查创建接口）
            $.ajax({
                type    : 'post',
                url     : __API__,
                data    : { api         : 'survey_create'            ,// 调查创建接口
                            user_code   : $this.user_code            ,// 用户编码
                            survey_code : $this.survey_code          ,// 调查编码
                            info        : $.toJSON($this.info$)      ,// 调查基本信息
                            question    : $.toJSON($this.question$)  ,// 调查题目信息
                          },
                async   : false,
                success : function(data$){
                    if(data$.status){
                        // 新调查创建成功更新调查编码到模型中
                        $this.survey_code = data$.data ;

                        // 如果选择主动推荐并且自定义推荐规则，取设置的推荐规则
                        // if($this.info$.recomm_type == 2 && models$.recommend$){
                        //     $.ajax({
                        //         type    : 'post',
                        //         url     : __API__,
                        //         data    : {api:'survey_recomm_create', survey_code:$this.survey_code, rule:$.toJSON($this.recommend$)},
                        //         async   : false,
                        //         success : function(data$){
                        //             if(data$.status){
                        //                 flag = true ;
                        //             }else{
                        //                 flag = false ;
                        //                 if(models$.collect$.check){
                        //                     alert('推荐规则设置不成功，请检查设置') ;
                        //                 }
                        //             }
                        //         }
                        //     });
                        // }

                        $this.trigger('submit_success') ;
                    }else{
                        $this.trigger('submit_failed') ;
                    }
                }
            });
        },
    }) ;
}) ;
