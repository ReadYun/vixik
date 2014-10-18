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
            question$   : {}  ,// 调查题目信息
            recommend$  : {}  ,// 自定义推荐设置信息
            draft$      : {}  ,// 数据收集标志位
            collect$    : {}  ,// 数据收集标志位
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
                async   : false,
                success : function(data$){
                    if(data$.status){
                        $this.coins$.sv_create = parseInt(data$.data['1003'].user_coins.value) ;  // 创建调查
                        $this.coins$.qt_add    = parseInt(data$.data['1004'].user_coins.value) ;  // 增加题目
                        $this.coins$.sv_recomm = parseInt(data$.data['1005'].user_coins.value) ;  // 调查推荐
                    }
                }
            });

            // 如果是修改调查页面，初始化调查相关信息
            if(this.survey_code){
                $.ajax({
                    type    : 'post',
                    url     : __API__,
                    data    : {api:'survey_info_find', survey_code:$this.survey_code},
                    async   : false,
                    success : function(data$){
                        // 取调查相关信息成功，更新模型并匹配页面数据
                        if(data$.status){
                            $this.info$      = data$.data.info ;
                            $this.question$  = data$.data.question ;
                            $this.recommend$ = data$.data.recommend ;

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
        location : function($target){
            if($target){
                this.$active = $target ;
                this.trigger('active') ;
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
                    async   : false,                  // 异步加载
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
                async   : true,
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
        }
    }) ;
}) ;
