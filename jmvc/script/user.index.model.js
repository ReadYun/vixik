
/**
 * Name        : user.index.model.js
 * Description : js for user/index.html
 *
 * Create-time : 2013-6-13, 4:18:17
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
    $.Model('User.Index.Model', {
        defaults : {
            user_code    : 0   ,// 用户编码
            user_nick    : ''  ,// 用户昵称
            user$        : {}  ,// 用户基本信息汇总
            crtSurvey$   : {}  ,// 用户创建的调查
            aswSurvey$   : {}  ,// 用户参与的调查
            scoreAction$ : {}  ,// 用户积分行为
            coinsAction$ : {}  ,// 用户金币行为
            survey$      : {}  ,// 用户金币行为
            follow$      : {}  ,// 用户金币行为
        }
    }, {
        init : function(){

        },

        // 手动触发模型更新事件
        trigger : function(prop){
            eval("this.attr('" + prop + "', Math.random())") ;
        },

        // 用户基本信息汇总
        user_info_find : function(){
            console.log('info') ;
            var $this = this ;

            if($this.user_code >= 10000000){
                // $this.user_follow_svtype($this.user_code) ;
                // $this.user_list_select($this.user_code) ;    // 取各种类型用户清单
                $this.survey_list_select() ;                 // 取各种类型调查清单

                $.ajax({
                    type    : 'post',
                    url     : __API__,
                    data    : {api:'user_info_find', user_code:$this.user_code, user_md5:$.cookie('user_md5')},
                    async   : false,   
                    success : function(data$){
                        if(data$.status){
                            $this.user$ = data$.data ;                   // 取到的数据
                            $this.trigger('user_info') ;                 // 取到用户数据后的操作触发
                            $this.base_info_complete($this.userInfo$) ;  // 用户资料完整性计算
                        }
                    }
                });

                $.ajax({
                    type    : 'post',
                    url     : __API__,
                    data    : {api:'user_follow_svtype_query', user_code:$this.user_code},
                    async   : false,   
                    success : function(data$){
                        if(data$.status){
                            $this.svtype$ = data$.data ;
                            $this.trigger('follow_svtype') ;
                        }
                    }
                });

                // 访问调查参与信息查询接口
                $.ajax({
                    type    : 'post',
                    url     : __API__,
                    data    : {api:'user_list_select', user_code:$this.user_code},
                    async   : false,   
                    success : function(data$){
                        if(data$.status){
                            $this.fuser$ = data$.data.follow ;
                            $this.trigger('user_follow') ;
                        }
                    }
                });
                
                $.ajax({
                    type    : 'post',
                    url     : __API__,
                    data    : {api:'user_action_log_select', user_code:$this.user_code},
                    async   : false,   
                    success : function(data$){
                        if(data$.status){
                            console.log(data$.data) ;
                            $this.log$ = data$.data ;

                            if($this.log$.coins){
                                $this.trigger('log_coins') ;
                            }
                            if($this.log$.score){
                                $this.trigger('log_score') ;
                            }
                        }
                    }
                });
            }
        },

        // 用户积分行为日志
        user_action_log_select : function(){
            var $this = this ;
            console.log('user_action_log_select') ;

            $.ajax({
                type    : 'post',
                url     : __API__,
                data    : {api:'user_action_log_select', user_code:$this.user_code},
                async   : false,   
                success : function(data$){
                    if(data$.status){
                        console.log(data$.data) ;
                        $this.log$ = data$.data ;

                        if($this.log$.coins){
                            $this.trigger('log_coins') ;
                        }
                        if($this.log$.score){
                            $this.trigger('log_score') ;
                        }
                    }
                }
            });
        },

        // 各种类型用户清单查询
        // user_list_select : function(user_code){
        //     var $this = this ;
            
        //     // 访问调查参与信息查询接口
        //     $.ajax({
        //         type    : 'post',
        //         url     : __API__,
        //         data    : {api:'user_list_select', user_code:user_code},
        //         async   : false,   
        //         success : function(data$){
        //             if(data$.status){
        //                 $this.fuser$ = data$.data.follow ;
        //                 $this.trigger('user_follow') ;
        //             }
        //         }
        //     });
        // },

        // user_follow_svtype : function(user_code){
        //     var $this = this ;

        //     $.ajax({
        //         type    : 'post',
        //         url     : __API__,
        //         data    : {api:'user_follow_svtype_query', user_code:user_code},
        //         async   : false,   
        //         success : function(data$){
        //             if(data$.status){
        //                 $this.svtype$ = data$.data ;
        //                 $this.trigger('follow_svtype') ;
        //             }
        //         }
        //     });
        // },

        // 各种类型调查清单查询
        survey_list_select : function(type){
            var $this = this ;

            console.log('survey') ;

            // 访问调查参与信息查询接口
            $.ajax({
                type    : 'post',
                url     : __API__,
                data    : {api:'survey_action_list_select', user_code:$this.user_code, type:type},
                async   : false,   
                success : function(data$){
                    if(data$.status){
                        console.log(data$.data) ;
                        $.each(data$.data, function(key, value){
                            $this.survey$[key] = value ;

                            // 单独提出收藏调查数据的编码汇总为数据
                            if(key == 'follow'){
                                $this.follow$.survey = [] ;
                                for(var i = 0; i < value.length; i++){
                                    $this.follow$.survey.push(value[i].survey_code) ;
                                }
                            }

                            // 对用户参与的调查进行梳理
                            if($this.survey$.answer && $this.survey$.follow && $this.follow$.survey){
                                for(var s = 0; s < $this.survey$.answer.length; s++){
                                    if($.inArray($this.survey$.answer[s].survey_code, $this.follow$.survey) >= 0){
                                        $this.survey$.answer[s].follow = 'follow' ;
                                    }else{
                                        $this.survey$.answer[s].follow = '' ;
                                    }
                                }
                                $this.trigger('survey_answer') ;
                            }

                            if(key != 'answer'){
                                $this.trigger('survey_' + key) ;
                            }
                        }) ;
                    }
                }
            });
        },

        // 用户资料完整度数据获取
        base_info_complete : function(data$){
            this.complete$ = {},
                total$  = ['user_nick', 'user_email', 'user_photo', 'area_province', 'area_city', 'user_birthday', 'user_sex',
                           'user_career', 'industry_class', 'industry_sub', 'income_class', 'income_section', 'user_edu',
                           'user_character', 'user_affection', 'user_stature', 'user_hobby', 'user_desc'],
                base$   = ['user_nick', 'user_email', 'area_province', 'area_city', 'user_birthday', 'user_sex',
                           'user_career', 'industry_class', 'industry_sub', 'income_class', 'income_section', 'user_edu'],
                extend$ = ['user_character', 'user_affection', 'user_stature', 'user_hobby', 'user_desc'] ;
                photo$  = ['user_photo'] ;

            this.complete$.total  = $.vkData('data_complete_judge', {data$: this.user$, key$: total$}) ;
            this.complete$.base   = $.vkData('data_complete_judge', {data$: this.user$, key$: base$}) ;
            this.complete$.extend = $.vkData('data_complete_judge', {data$: this.user$, key$: extend$}) ;
            this.complete$.photo  = $.vkData('data_complete_judge', {data$: this.user$, key$: photo$}) ;
            this.trigger('info_complete') ;
        },
    }) ;
}) ;