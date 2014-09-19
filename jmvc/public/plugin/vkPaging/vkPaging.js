

/**
 * @Name        : vkPaging.js
 * @Description : VixiK分页插件
 *
 * @Author      : ReadYun
 * @Copyright   : VixiK
 * @Version     : 2.0.00
 */

steal('init.js')
.then(function($){
    loadPlugin('vkData') ;
}) 
.then(function($){
    // 分页总模型（命名空间）定义
    var vkPaging$ = {} ;

    // 分页导航点击事件绑定
    $('html').on('click.vkPaging', 'ul.pag-nav-main>li', function(ev){
        var $vkpaging = $(this).parents('.vkpaging'),      // 当前分页模块总对象
            id        = $vkpaging.attr('data-vkpaging'),   // 模块分页插件ID
            action    = $(this).attr('data-action'),       // 点击行为类型
            page      = $(this).find('a').text(),          // 点击元素对应页码
            $nav      = $(this).parents('.pag-nav-main'),  // 点击元素对应的导航条对象
            group     = vkPaging$[id].group ;              // 当前导航条所在分组
        
        // 阻止事件冒泡
        ev.stopPropagation() ;    
        ev.preventDefault() ;

        switch(action){
            case 'list' : 
                $nav.find('li').removeClass('active') ;
                $(this).addClass('active') ;

                // 刷新对应的分页列表
                $vkpaging.vkPaging(action, page) ;
                break ;

            case 'prev' : 
                if(group != 1){
                    // 刷新导航列表
                    $vkpaging.vkPaging('nav', group-1) ;
                }else{
                    alert('这是第一组，不能再往前翻页') ;
                }
                break ;

            case 'next' : 
                if(group != Math.ceil(vkPaging$[id].data$.length / vkPaging$[id].num_list / vkPaging$[id].num_nav)){
                    // 刷新导航列表
                    $vkpaging.vkPaging('nav', group+1) ;
                }else{
                    alert('这是最后一组，不能再往后翻页') ;
                }
                break ;
        }
        ev.stopPropagation() ;    //   阻止事件冒泡
    }) ;

    // 插件方法清单
    var methods = {

        /*
         * @Name   : init
         * @Desc   : 分页插件初始化
         * @Param  : mix  data$      要分页的源数据
         * @Param  : dom  $pagBody   分页内容的容器对象
         * @Param  : dom  $pagNav    分页导航的容器对象
         * @Param  : str  view_list  列表模板路径
         * @Param  : str  view_nav   导航模板路径
         * @Param  : num  num_list   每页数据量
         * @Param  : num  num_nav    导航分页数
         * @Return : mix  vkPaging$  返回值
         */
        init : function(param$){
            var id, $pagBody, $pagNav ;

            // ID生成
            if(this.attr('data-vkpaging')){
                id = this.attr('data-vkpaging') ;
            }else{
                id            = parseInt(9999 * Math.random()) ;
                vkPaging$[id] = {} ;

                this.attr('data-vkpaging', id) ;
            }

            // 分页内容初始化
            if(!vkPaging$[id].$pagBody && !param$.$pagBody){
                param$.$pagBody = $("<div></div>").addClass('pag-body').appendTo(this) ;
            }else if(param$.$pagBody){
                param$.$pagBody = param$.$pagBody.addClass('pag-body') ;
            }

            // 分页导航对象初始化
            if(!vkPaging$[id].$pagNav && !param$.$pagNav){
                param$.$pagNav = $("<div></div>").addClass('pag-nav').insertAfter($pagBody) ;
            }else if(param$.$pagNav){
                param$.$pagNav = param$.$pagNav.addClass('pag-nav') ;
            }

            if(this.vkPaging('data', id, param$)){
                // 显示初始化
                this.vkPaging('nav') ;
            }else{
                console.log('vkpaging failed') ;
                return false ;          
            }
        },

        /*
         * @Name   : data
         * @Desc   : 数据存储
         * @Param  : string  id    分页模块id（'data-vkpaging'）
         * @Param  : number  page  制定页码
         * @Return : NULL
         */
        data : function(id, param$){
            if(id && param$){
                if(!vkPaging$[id]){
                    vkPaging$[id] = {} ;
                }
                
                $.extend(vkPaging$[id], param$) ;
                return true ;
            }else{
                return false ;
            }
        },

        /*
         * @Name   : list
         * @Desc   : 分页列表展示
         * @Param  : number  page    制定页码
         * @Param  : array   param$  输入参数
         * @Return : NULL
         */
        list : function(page, param$){
            // 主对象判断
            if($(this).attr('data-vkpaging')){
                var id = $(this).attr('data-vkpaging') ;
            }else{
                return false ;
            }

            // 页码初始化
            if(page){
                vkPaging$[id].page = page ;
            }else{
                if(vkPaging$[id].page){
                    var page = vkPaging$[id].page ;
                }else{
                    var page = vkPaging$[id].page = 1 ;
                }
            }

            // 是否需要更新数据
            if(param$){
                this.vkPaging('data', id, param$) ;
            }

            // 先清除之前已生成的列表元素
            vkPaging$[id].$pagBody.children().remove() ;

            // 实现分页数据展现
            vkPaging$[id].$pagBody.append(
                vkPaging$[id].view_list,
                {data:vkPaging$[id].data$.slice((page - 1) * vkPaging$[id].num_list, page * vkPaging$[id].num_list)}  // 数据处理
            ) ;
        },

        /*
         * @Name   : nav
         * @Desc   : 分页导航刷新
         * @Param  : string  id     分页模块id（'data-vkpaging'）
         * @Param  : number  group  要刷新的导航分组值
         * @Return : NULL
         */
        nav : function(group){
            var id, group, group_list, group_nav, nav$, $navMain, $navPrev, $navNext, $navElem,
                $this = this ;
            
            // 主对象判断
            if($(this).attr('data-vkpaging')){
                id = $(this).attr('data-vkpaging')
            }else{
                return false ;
            }

            // 导航当前分组判断计算
            if(!group){
                if(vkPaging$[id].page && vkPaging$[id].num_nav){
                    // 如果在目标分页对象中已经储存有当前页码直接计算当前页码对应的导航分组
                    vkPaging$[id].group = group = Math.floor(vkPaging$[id].page / (vkPaging$[id].num_nav + 1)) + 1 ;
                }else{
                    vkPaging$[id].group = group = 1 ;
                }
            }

            // 分页列表分组数量
            group_list = Math.ceil(vkPaging$[id].data$.length / vkPaging$[id].num_list) ;

            // 导航列表分组数量
            group_nav = Math.ceil(vkPaging$[id].data$.length / vkPaging$[id].num_list / vkPaging$[id].num_nav) ;

            // 分页导航当前分组
            nav$ = $.vkData('array_create_seq', {start:vkPaging$[id].num_nav*(group-1)+1, length:vkPaging$[id].num_nav, max:group_list}) ;  


            // 先清除之前已生成的列表元素
            vkPaging$[id].$pagNav.children().remove() ;

            // 生成分页导航
            if(vkPaging$.view_nav){
                // 使用模板创建分页导航
                vkPaging$[id].$pagNav.append(
                    vkPaging$[id].view_nav,
                    {data:nav$}
                ) ;
            }else{
                // 创建分页导航各DOM元素
                $navMain = $("<ul class='pag-nav-main'></ul>").appendTo(vkPaging$[id].$pagNav) ;              // 分页主体
                $navPrev = $("<li class='prev' data-action='prev'><a>&laquo;</a></li>").appendTo($navMain) ;  // 前一页
                $navNext = $("<li class='next' data-action='next'><a>&raquo;</a></li>").appendTo($navMain) ;  // 后一页
                $navElem = $("<li class='elem' data-action='list'><a></a></li>") ;                            // 分页元素

                for(var i = 0; i < nav$.length; i++){
                    $nav_elem = $navElem.clone().insertBefore($navNext) ;
                    $nav_elem.find('a').text(nav$[i]) ;
                }

                // 引入默认样式文件
                // steal('vkPaging.nav.css') ;  
            }

            // 默认定位到当前组第一个页码
            vkPaging$[id].page = $navMain.find('li.elem').first().addClass('active').find('a').text() ;

            // 前进后退按钮有效性处理
            if(group == 1){
                $navMain.find('li.prev').addClass('disabled') ;
            }
            if(group == group_nav){
                $navMain.find('li.next').addClass('disabled') ;
            }

            $this.vkPaging('list') ;
        },
    } ;

    // 定义命名空间vkPaging直接调用方法
    $.fn.vkPaging = function(method, data){
        if (methods[method]) {  
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1)) ;

            }else if(typeof method === 'object' || !method) {  
                return methods.init.apply(this, arguments) ;  
            }else {  
                $.error('方法 ' +  method + ' 不存在！') ;  
        }  
    }
}) ;
