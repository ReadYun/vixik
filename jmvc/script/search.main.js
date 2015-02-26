/**
 * Name        : search.index.js
 * Description : js for search/index.html
 *
 * Create-time : 2013-9-4 18:14:09
 * Author      : ReadYun
 * Copyright   : VixiK
 * Version     : 1.0.00
 */

steal('init.js')
.then('script/public.header.js')
.then(function($){
    loadPlugin('iCheck', 'vkForm', 'textSearch') ;
}) 
.then(function($){

    /*
     * 页面总模型
     *
     **/
    $.Model('Search.Main.Model', {
        defaults : {
            search_type  : ''  ,// 搜索类型
            search_words : ''  ,// 搜索关键字
            search$      : {}  ,// 用户搜索数据
            dataArea$    : {}   // 用户来源统计数据
        }
    }, {
        init : function(){
        },

        // 手动触发模型更新事件
        trigger : function(prop){    
            eval("this.attr('" + prop + "', Math.random())") ;
        },

        get_data : function(data$, type){
            var trigger, 
                $this = this,
                api$  = $.extend({api:'search_' + $this.search$.type}, data$ || {}) ;

            switch(type){
                case 'more' :
                    trigger = 'list_add' ;
                    break ;

                case 'filter' :
                    trigger = 'list_all' ;
                    break ;

                case 'order' :
                    trigger = 'list_all' ;
                    break ;
            }

            // 访问问卷参与情况统计接口
            $.ajax({
                type    : 'post',
                url     : __API__, 
                data    : api$,
                success : function(data$){
                    if(data$.status){
                        $this.data$ = data$.data ;    // 搜索数据
                        $this.trigger(trigger) ;
                    }else{
                        console.log('没有符合条件的数据。。') ;
                        $this.trigger('list_no') ;
                    }
                }
            });
        }
    }) ;

    /*
     * 搜索结果列表展示控制器
     *
     **/
    $.Controller('Search.Survey.Ctrl.Body', {
        defaults : {
            models$   : {}              ,// 页面总模型
            $noSearch : $('#noSearch')   // 没有搜索内容
        }
    }, {
        init : function(){
            if(this.options.models$.search$){
                this.options.models$.get_data(this.options.models$.search$, 'more') ;
            }
        },

        "{models$} list_all" : function(){
            this.options.$Main.addClass('list-ok') ;
            this.search_list(this.options.models$.data$, 'all') ;
        },

        "{models$} list_add" : function(){
            this.options.$Main.addClass('list-ok') ;
            this.search_list(this.options.models$.data$, 'add') ;
        },

        "{models$} list_no" : function(){
            this.options.$Main.addClass('list-no') ;
        },

        // 加载更毒列表内容
        ".more-list>button click" : function(el){
            if(!el.hasClass('disabled')){
                delete this.options.models$.search$.pages ;
                this.options.models$.search$.page = parseInt(this.element.find('.search-list').attr('data-page')) + 1 ;

                this.options.models$.get_data(this.options.models$.search$, 'more') ;
            }
        },

        // 问卷列表显示
        search_list : function(data$, type){
            var $this = this,
                list$ = data$.list,
                next$ = data$.next,
                page  = data$.page ;

            for(var i = 0; i < list$.length; i++){
                if(parseInt(list$[i].user_photo)){
                    list$[i].user_photo = __JMVC_IMG__ + 'user/' + list$[i].user_code + '_60.jpg' ;
                }else{
                    list$[i].user_photo = __JMVC_IMG__ + 'user/user.jpg' ;
                }
            }

            if(type == 'all'){
                this.element.find('.search-list').children().remove() ;
            }

            // 题目状态列表栏生成
            this.element.find('.search-list').attr('data-page', page).addClass(this.options.models$.search$.type).append(
                __JMVC_VIEW__ + 'search.list.' + this.options.models$.search$.type + '.ejs',  // 题目状态列表模板路径
                {data: list$}                                                                 // 调用快速序列生成满足题目数量序列
            ) ;

            if(!next$.length){
                $this.element.find('.more-list>button').addClass('disabled').text('搜索结果已全部显示') ;
            }

            // 搜索结果高亮
            if(list$.length){
                setTimeout(function(){
                    $this.element.find(".search-text").textSearch($this.options.models$.search$.words, {markColor: "red"}) ;
                    // $this.element.find(".search-list").textSearch($this.options.models$.search$.words, {markColor: "red"}) ;
                }, 100) ;
            }
        },
    }) ;

    /*
     *  页面总控制器
     *
     **/
    $.Controller('Search.Index.Ctrl.Main', {
        defaults : {
            models$       : {}                ,// 页面总模型
            $searchBtn    : $('.search-btn')  ,// 搜索按钮
            $searchBody   : $('.search-body') ,// 搜索内容模块
        }
    }, {
        init : function(){
            if(window.location.search){
                var search$  = url_search_to_array(window.location.search) ;

                // 取搜索数据
                this.element.find('input[name=search-main]').attr('value', search$.words) ;
            }

            // 新建模型实例并初始化
            this.options.models$ = new Search.Main.Model({
                search$ : search$,
            }) ;

            // 搜索结果清单展示模块控制器
            this.options.$searchBody.search_survey_ctrl_body({
                models$ : this.options.models$,
                $Main   : this.element,
            }) ;

            //  表单元素使用iCheck样式
            this.element.find('input').iCheck({
                checkboxClass: 'icheckbox_minimal-grey',
                   radioClass: 'iradio_minimal-grey'
            }).addClass('icheck').iCheck('uncheck') ;

            // 搜索首页搜索框聚焦
            if(this.element.attr('data-page') == 'index'){
                this.element.find('.search-input').focus().attr('value', '') ;
            }
            
            this.element.addClass('active') ;
        },

        // 搜索请求
        ".sv-type.fr-txt click" : function(el){
            el.parents('.vf-elem-option').toggleClass('open') ;
        },

        // 选中筛选选项
        "input.filter ifClicked" : function(el){
            var val = el.val(),
                txt = el.parent().next().text(),
                key = el.parent().next().attr('data-key') ;

            this.element.find('.filter-res').show().find('.fr-desc span').text(txt) ;

            delete this.options.models$.search$.page ;
            this.options.models$.search$.pages = this.element.find('.search-list').attr('data-page') ;
            this.options.models$.search$.filter = ' ' + key + '=' + val + ' ' ;

            this.options.models$.get_data(this.options.models$.search$, 'filter') ;
        },

        // 删除筛选条件
        ".filter-res>.icon-remove click" : function(el){
            el.parent('.filter-res').hide() ;
            this.element.find('.search-filter input').iCheck('uncheck') ;

            delete this.options.models$.search$.filter ;
            delete this.options.models$.search$.page ;
            this.options.models$.search$.pages = this.element.find('.search-list').attr('data-page') ;

            this.options.models$.get_data(this.options.models$.search$, 'filter') ;
        },

        // 搜索结果排序选项打开
        ".order-res mouseover" : function(el){
            el.addClass('open') ;
        },

        // 搜索结果排序选项关闭
        ".order-res mouseout" : function(el){
            el.removeClass('open') ;
        },

        // 排序方式选择切换
        ".order-menu>li click" : function(el){
            this.element.find('.order-res button>span').text(el.text()) ;
            
            delete this.options.models$.search$.page ;
            this.options.models$.search$.pages = this.element.find('.search-list').attr('data-page') ;
            this.options.models$.search$.order = el.attr('data-order') ;

            this.options.models$.get_data(this.options.models$.search$, 'order') ;
        },

        // 搜索请求
        ".search-submit click" : function(){
            var type,
                val = this.element.find('.search-input').val() ;

            this.options.models$.search$.type ? type = this.options.models$.search$.type : type = 'survey' ;

            if(val){
                $.post(
                    __API__, 
                    {api:'get_server_url', name:'search/main'}, function(data$){
                        if(data$.status){
                            window.location.href = encodeURI(data$.data + '?type=' + type + '&words=' + val ) ;
                        }
                    }
                ) ;
            }
        },

        // 监控搜索输入框输入并且回车提交搜索请求
        ".search-input keydown" : function(el, ev){
            var type,
                val = this.element.find('.search-input').val() ;

            this.options.models$.search$.type ? type = this.options.models$.search$.type : type = 'survey' ;

            if(ev.keyCode == 13 && val){
                $.post(
                    __API__, 
                    {api:'get_server_url', name:'search/main'}, function(data$){
                        if(data$.status){
                            window.location.href = encodeURI(data$.data + '?type=' + type + '&words=' + val ) ;
                        }
                    }
                ) ;
            }
        },
    }) ;

    $('#Main').search_index_ctrl_main() ;
}) ;


