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
    loadPlugin('vkPaging', 'vkForm') ;
}) 
.then(function($){

    /*
     * 页面总模型
     *
     **/
    $.Model('Search.Index.Model', {
        defaults : {
            search_type  : ''  ,//搜索类型
            search_words : ''  ,//搜索关键字
            search$      : {}  ,//用户搜索数据
            dataArea$    : {}   //用户来源统计数据
        }
    }, {
        init : function(){
        },

        //手动触发模型更新事件
        flagUpdate : function(prop){    
            var str_eval = "this.attr('" + prop + "', Math.random())" ;
            eval(str_eval) ;
        },

        get_data : function(search_type, search_words){
            var $this = this ;

            //访问问卷参与情况统计接口
            $.ajax({
                type    : 'post',
                url     : __API_SEARCH__, 
                data    : {type:search_type,words:search_words},   
                async   : false,   
                success : function(data$){
                    if(data$.status){
                        $this.search$ = data$.data ;    //搜索数据
                        $this.flagUpdate('flag_search') ;
                    }else{
                        console.log('没有符合条件的数据。。') ;
                    }
                }
            });
        }
    }) ;

    /*
     * 搜索结果列表展示控制器
     *
     **/
    $.Controller('Search.Index.Ctrl.List', {
        defaults : {
            models$   : {}              ,//页面总模型
            $noSearch : $('#noSearch')   //没有搜索内容
        }
    }, {
        init : function(){
        },

        "{models$} flag_search" : function(){
            var type      = this.options.models$.search_type ;
            var data$     = this.options.models$.search$ ;
            var view_list = __JMVC_VIEW__ + 'search.list.' + type + '.ejs'  ;

            if(data$){
                this.paging(this.element, this.options.models$.search$, view_list) ;
            }else{
                this.element.addClass('no') ;
            }

        },

        //问卷列表分页
        paging : function($pagBox, srcData$, view_list){
            var view_nav = __JMVC_VIEW__ + 'vpaging.nav.ejs' ;

            $pagBox.vplugin_paging({
                srcData$  : srcData$   ,//要分页的源数据
                view_list : view_list  ,//列表模板VIEW
                view_nav  : view_nav   ,//导航模板VIEW
                lst_limit : 18         ,//每页数据量
                nav_limit : 20         ,//导航分页数
            }) ;
        }
    }) ;

    /*
     *  页面总控制器
     *
     **/
    $.Controller('Search.Index.Ctrl.Main', {
        defaults : {
            models$     : {}                ,//页面总模型
            $searchBtn  : $('.search-btn')  ,//搜索按钮
            $searchBody : $('#searchBody')  ,//问卷发布设置模块
            $navBar     : $('div.nav-bar')   //问卷发布设置模块
        }
    }, {
        init : function(){
            var urlPara$ = url_search_to_array(window.location.search) ;

            //新建模型实例并初始化
            this.options.models$ = new Search.Index.Model({
                search_type  : urlPara$.type ,
                search_words : urlPara$.words
            }) ;

            //搜索结果清单展示模块控制器
            this.options.$searchBody.search_index_ctrl_list({
                models$ : this.options.models$
            }) ;

            //副搜索栏初始化
            this.options.$navBar.find('li.' + urlPara$.type).addClass('active') ;
            if(urlPara$.words){
                this.options.$navBar.find('li').each(function(){
                    $(this).find('a').attr('href', '?type=' + $(this).attr('data-type') + '&words=' + urlPara$.words) ;
                }) ;   
            }

            //通过总模型取搜索数据
            this.options.models$.get_data(urlPara$.type, urlPara$.words) ;
            $('body').addClass('active') ;
        },

        //搜索请求
        "{$searchBtn} click" : function(){
            var words = this.element.find('.search-input-main').val() ;
            var type  = this.options.$navBar.find('li.active').attr('data-type') ;

            //访问搜索入口接口
            if(words){
                $.post(
                    __API_SEARCH_GO__, 
                    {type:type,words:words},function(url){
                        window.location.href = url ;
                    }
                ) ;
            }
        }
    }) ;

    $('#Main').search_index_ctrl_main() ;
}) ;


