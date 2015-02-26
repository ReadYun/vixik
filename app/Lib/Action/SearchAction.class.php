<?php

/**
 * @Name        : SearchAction.class.php
 * @Type        : Class
 * @Description : 搜索模块：所有搜索相关功能实现
 *
 * @Create-time : 2013-9-1
 * @Author      : ReadYun
 * @Copyright   : VixiK
 * @Version     : 1.0.00
 */

header("Content-type:text/html;charset=utf-8");

class searchAction extends Action{

    /* 问卷模块首页
     * ---------------------------------------- */
    public function index(){
        $this -> assign('page', 'index') ;

        $this -> display() ; 
    }

    /* 问卷模块首页
     * ---------------------------------------- */
    public function main(){
        $type['en'] = $_GET['type'] ;
        $words      = $_GET['words'] ;

        if(!$words){
            $this -> error('请输入您要搜索的关键词', U('search/index')) ;
        }

        $tbBasUserInfo   = M(TB_BAS_USER_INFO)   -> getTableName() ;
        $tbBasUserAccout = M(TB_BAS_USER_ACCOUT) -> getTableName() ;
        $tbDetUserLevel  = M(TB_DET_USER_LEVEL)  -> getTableName() ;

        switch($_GET['type']){
            case 'survey' :
                $type['cn'] = '调查' ;
                break ;

            case 'question' :
                $type['cn'] = '问题' ;
                break ;

            case 'tag' :
                $type['cn'] = '标签' ;
                break ;

            case 'user' :
                $type['cn'] = '用户' ;
                break ;

            default :
                $type['cn'] = '调查' ;
                $type['en'] = 'survey' ;
                break ;
        }

        $_GET['words'] ? $cond = $_GET['type'] . "_name like '%".str_replace(' ', '%', $_GET['words'])."%' " : $cond = "1 = 1" ;

        if($_GET['type'] == 'user'){
            $sql = "select count(1) cnt from $tbBasUserInfo a, $tbBasUserAccout b
                    where a.user_code = b.user_code and $cond " ;
            $stats = M() -> query($sql)[0] ;

            $sql = "select c.user_level_value, c.user_level_desc, count(1) cnt
                    from $tbBasUserInfo a, $tbBasUserAccout b, $tbDetUserLevel c
                    where a.user_code = b.user_code and b.user_level = c.user_level_value and $cond 
                    group by c.user_level_value, c.user_level_desc " ;
            $stats['user_level'] = M() -> query($sql) ;
        }else{
            $cond  = $cond . " and survey_state in(3,4)" ;
            $stats = surveyPropStats(array('cond' => $cond, 'type' => $_GET['type'])) ;
            // dump($stats) ;
        }

        $this -> assign('type',  $type) ;
        $this -> assign('page',  'main') ;
        $this -> assign('words', $words) ;
        $this -> assign('stats', $stats) ;

        $this -> display() ;
    }
}

?>
