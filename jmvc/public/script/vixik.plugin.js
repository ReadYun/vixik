
/**
 * @Name         : vixik.plugin.js
 * @Description : VixiK自定义插件
 *
 * @Author      : ReadYun
 * @Copyright   : VixiK
 * @Version     : 1.0.00
 */

steal('init.js')
.then(function($){

/* ================================================= *
 *
 * Function    : 分页插件
 * Description : 导航模板使用Bootstrap框架的分页组件
 * Create date : 2013-6-24
 * Version     : 1.0.0
 *
 * ================================================= */

    $.Controller('Vplugin.Paging', {
        defaults : {
            srcData$   : {}   ,//要分页的源数据
            pagData$   : {}   ,//按要求处理后的分页数据
            navData$   : {}   ,//按要求处理后的分页导航数据
            $pagCont   : {}   ,//分页内容的容器对象
            $pagNav    : {}   ,//分页导航的容器对象
            view_list  : ''   ,//列表模板VIEW
            view_nav   : ''   ,//导航模板VIEW
            lst_limit  : 0    ,//每页数据量
            nav_limit  : 0    ,//导航分页数
            nav_num    : 1     //导航当前数值
        },

        listensTo : ["nav_prev","nav_next","nav_fresh"]
    }, {
        init : function(){    //数据初始化
            this.options.$pagCont = this.element.find('div.pag-content') ;
            this.options.$pagNav = this.element.find('div.pag-nav') ;

            var srcData$ = $.parseJSON($.toJSON(this.options.srcData$)) ;
            this.options.pagData$ = pagingData(srcData$, this.options.lst_limit) ;    //对数据进行分页处理

            var pag_num = this.options.pagData$.length ;
            var navSeq$ = seqArray(1, pag_num) ;  //调用快速序列生成函数生成导航页码数据
            this.options.navData$ = pagingData(navSeq$, this.options.nav_limit) ;    //对数据进行分页处理
            this.pagNav(this.options.nav_num) ;
        },

        pagNav : function(num){
            this.options.$pagNav.children().remove() ;    //先清除之前已生成的导航元素

            var i = num - 1 ;
            var data$ = this.options.navData$[i] ;

            this.options.$pagNav.append(
                this.options.view_nav,
                {li: data$}
            ) ;

            var $prevNav = this.options.$pagNav.find('li.prev') ;
            var $nextNav = this.options.$pagNav.find('li.next') ;

            if(i == 0){
                $prevNav.addClass('disabled') ;
            }else{
                $prevNav.removeClass('disabled') ;
            } ;

            if(i == this.options.navData$.length-1 ){
                $nextNav.addClass('disabled') ;
            }else{
                $nextNav.removeClass('disabled') ;
            } ;

            this.options.$pagNav.find('li').vplugin_paging_nav_opt({
                pagData$   : this.options.pagData$     ,//按要求处理后的分页数据
                $parent    : this.element              ,//分页插件总对象
                $pagCont   : this.options.$pagCont     ,//分页内容的容器对象
                view_list  : this.options.view_list     //列表模板VIEW
            }) ;
        },

        nav_prev : function(){
            this.options.nav_num -- ;
            this.pagNav(this.options.nav_num) ;
        },

        nav_next : function(){
            this.options.nav_num ++ ;
            this.pagNav(this.options.nav_num) ;
        },

        nav_fresh : function(){
            this.options.$pagNav.find('li').removeClass('active') ;
        }
    }) ;

    $.Controller('Vplugin.Paging.Nav.Opt', {
        defaults : {
            pagData$  : {}   ,//按要求处理后的分页数据
            $parent   : {}   ,//分页插件总对象
            $pagCont  : {}   ,//分页内容的容器对象
            view_list : {}    //列表模板VIEW
        }
    }, {
        init : function(){    //数据初始化
            this.paging(1) ;
        },

        "click" : function(el){
            if(el.hasClass('disabled')){
                console.log('disabled') ;
            }else{
                var action = el.attr('data-action') ;
                switch(action){
                    case 'prev' :
                        this.options.$parent.trigger('nav_prev') ;
                        break ;
                    case 'next' :
                        this.options.$parent.trigger('nav_next') ;
                        break ;
                    case 'paging' :
                        this.options.$parent.trigger('nav_fresh') ;
                        var paging_num = el.find('a').text() ;
                        this.paging(paging_num) ;
                        el.toggleClass('active') ;
                        break ;
                }
            }
        },

        paging : function(num){
            this.options.$pagCont.children().remove() ;    //先清除之前已生成的列表元素
            var i = num - 1 ;
            var data$ = this.options.pagData$[i] ;

            //实现分页数据展现
            this.options.$pagCont.append(
                this.options.view_list,
                {survey: data$}
            ) ;
        }
    }) ;

/* ================================================= *
 *
 * Function    : 函数名称
 * Description : 函数说明描述
 * Create date : 2012-8-24
 * Version     : 1.0.0
 *
 * ================================================= */

}) ;





