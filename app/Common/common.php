<?php

/**
 * @Name        : common.php
 * @Type        : Function
 * @Desc        : 项目公共函数库
 *
 * @Create-time : 2012-8-14 16:26:15
 * @Author      : ReadYun
 * @Copyright   : VixiK
 * @Version     : 1.0.00
 */
header("Content-@Type:text/html;charset=utf-8");

/**************************************** 自定义函数 ****************************************/

/*
 * @Name   : arrayImplode
 * @Desc   : 关联数组转换为【键名+连接符+值】形式的一维数组
 * @Param  : array   $assoc_array  关联数组
 * @Param  : string  $symbol       连接符
 * @Param  : string  $key_sign     键名修饰符
 * @Param  : string  $val_sign     值修饰符
 * @Return : array   $array        转换后的一维数组
 */
function arrayImplode($assoc_array, $symbol, $key_sign, $val_sign){
    $array = array() ;

    foreach($assoc_array as $k=>$v){
        if($v){
            $array[] = $key_sign . $k . $key_sign . $symbol . $val_sign . $v . $val_sign ;   
        }
    }

    return $array ;
}

/*
 * @Name   : arrayExtract
 * @Desc   : 抽取目标一维关联数组中指定键名的数据组成新一维关联数组
 * @Param  : array   $assoc_array  目标关联数组（一维关联数组）
 * @Param  : array   $key_array    指定键名组成的数组
 * @Return : array   $new_array    抽取后的新关联数组
 */
function arrayExtract($assoc_array, $key_array){
    for($n = 0; $n < sizeof($key_array); $n++){
        $new_array[$key_array[$n]] = $assoc_array[$key_array[$n]] ;
    }

    return $new_array ;
}

/*
 * @Name   : arrayExtractDes
 * @Desc   : 抽取目标二维关联数组中指定键名的数据组成新二维关联数组
 * @Param  : array   $assoc_array  目标关联数组（二维关联数组）
 * @Param  : array   $key_array    指定键名组成的数组
 * @Return : array   $new_array    输出新关联数组
 */
function arrayExtractDes($assoc_array, $key_array){
    $new_array = array() ;

    for($i = 0; $i < sizeof($assoc_array); $i++){
        for($n = 0; $n < sizeof($key_array); $n++){
            $new_array[$i][$key_array[$n]] = $assoc_array[$i][$key_array[$n]] ;
        }
    }

    return $new_array ;
}

/*
 * @Name   : arrayReset
 * @Desc   : 一维数组整理（去重/更新索引）
 * @Param  : array   $array_src  需要处理的数组
 * @Return : array   $array_new  处理后的数组
 */
function arrayReset($array_src){ 
    $array_new = array_flip(array_flip($array_src)) ;    // 数组去重
    array_splice($array_new, 0, 0);     // 更新一维数组索引

    return $array_new ;
} 

/*
 * @Name   : arrayCompare
 * @Desc   : 比较两个一维数组的值
 * @Param  : array   $array_src  被比较的源数组
 * @Param  : array   $array_tar  去比较的目标数组
 * @Return : number  0(不相同)/1(完全相同)/-1(tar包含于tar)
 */
function arrayCompare($array_src, $array_tar){
    // 先重整下两个一维数组
    $array_src = arrayReset($array_src) ;
    $array_tar = arrayReset($array_tar) ;

    // 取数组长度
    $length_arr_src = count($array_src) ;
    $length_arr_tar = count($array_tar) ;
    $i = 0 ; 
    $b = true ;

    if($length_arr_src < $length_arr_tar){    // 如果去比较数组长度大于被比较数组长度
        return 0 ;  // 说明两数组完全不等
    }else{
        while($i < $length_arr_tar){    // 遍历每个目标数组值判断是否在源数组中
            if(in_array($array_tar[$i], $array_src)){
                $i ++ ;
            }else{    // 如果目标数组有值不在源数组中
                // 更新标志位为false并直接跳出判断
                $b = false ;
                break ;
            } 
        }     
        if($b){
            if($length_arr_tar == $length_arr_src){
                return 1 ;    // 目标数组和源数组完全相同
            }else{
                return -1 ;    // 目标数组包含于源数组
            }
        }else{
            return 0 ;
        }
    }
}

/**************************************** 数据库操作函数 ****************************************/

/*
 * @Name   : selectTable
 * @Desc   : 轻量级查询表数据
 * @Param  : string  $tabName    目标表名(使用设置好的常量)
 * @Param  : array   $options    查询字段
 * @Param  : array   $condition  查询条件
 * @Return : array   $data       查询结果  
 */
function selectTable($tabName, $options, $condition){
    $Table = M($table) ;

    $data = $Table -> where($condition) -> select() ;   // 查询结果包含所有字段
    $data = arrayExtractDes($data, $options) ;    // 抽取需要的字段数据

    if($data){
        return $data ;
    }else{
        return false ;
    }
}

/*
 * @Name   : countTable
 * @Desc   : 轻量级查询表数据
 * @Param  : string  $tabName    目标表名(使用设置好的常量)
 * @Param  : array   $condition  查询条件
 * @Return : array   $data       查询结果  
 */
function countTable($tabName, $condition){
    $Table = M($tabName) ;
    $count = M($Table) -> where($condition) -> select() ;   // 查询结果包含所有字段

    if($count){
        return $count ;
    }else{
        return false ;
    }
}

/*
 * @Name   : insertTable
 * @Desc   : 轻量级新增表数据
 * @Param  : string   $tabName    目标表名(使用设置好的常量)
 * @Param  : array    $data       字段名+对应数据：[键->值]对应[字段名->数据]
 * @Return : boolean  true/false  更新成功与否标志
 */
function insertTable($tabName, $data){
    $table = M($tabName) -> getTableName() ;

    $sql1 = "insert into " . $table . "(" ;
    $sql2 = implode(',', array_keys($data)) ;             // 取关联数组的所有键名拼成字符串
    $sql3 = implode("','", array_values($data)) ;         // 取关联数组的所有值拼成字符串
    $sql  = $sql1 . $sql2 . ")values('" . $sql3 . "')" ;  // 合并上面三条成完整插表语句

    $res = M() -> execute($sql) ;
    if($res){
        return true ;
    }else{
        return false ;
    }
}

/*
 * @Name   : updateTable
 * @Desc   : 轻量级更新表数据
 * @Param  : string   $tabName    目标表名(使用设置好的常量)
 * @Param  : array    $data       字段名+对应数据：[键 -> 值]对应[字段名 -> 数据]
 * @Param  : array    $condition  更新条件：[键 -> 值]对应[字段名 -> 数据]
 * @Param  : string   $type       更新方式：(覆盖更新|追加更新)
 * @Return : boolean  true/false  更新成功与否标志
 */
function updateTable($tabName, $data, $condition, $type){
    $table = M($tabName) -> getTableName() ;
    $sql1  = "update " . $table . " set " ;
    $sql2  = "" ;
    $cond  = array_merge($data, $condition) ;  // 合并更新条件和更新目标数据

    // 先查询参数条件的表数据，如果查不到直接退出，能查到再进一步操作
    if(M($tabName)->where($condition)->select()){
        // 如果能查到合并后的条件数据，说明要更新的值已经合适直接返回true
        if(M($tabName)->where($cond)->select() && !$type == 'add'){
            return true ;
        }else{    // 如果查不到数据，再执行正常的更新任务
            foreach($data as $k=>$v){
                switch($type){
                    case 'cover' :  // 覆盖更新（所有数据类型）
                        $sql2 = $sql2 . $k . "='" . $v . "'," ;
                        break ;
                    case 'add' :  // 追加更新（只对数值类型）
                        $sql2 = $sql2 . $k . "=ifnull(" . $k . ", 0)+" . $v . "," ;
                        break ;
                }
            }
            $sql3 = implode(' and ', arrayImplode($condition, '=', "", "'")) ;
            $sql  = $sql1 . substr($sql2, 0, -1) . " where " . $sql3 ;

            $res = M() -> execute($sql) ;

            if($res === false){
                return false ;
            }else{
                return true ;
            }
        }
    }else{
        return false ;
    }
}

/*
 * @Name   : deleteTable
 * @Desc   : 轻量级删除表数据
 * @Param  : string   $tabName    目标表名(使用设置好的常量)
 * @Param  : array    $condition  删除条件：[键 -> 值]对应[字段名 -> 数据]
 * @Return : boolean  true/false  更新成功与否标志
 */
function deleteTable($tabName, $condition){
    $table = M($tabName) -> getTableName() ;
    
    $sql1 = "delete from " . $table . " where "  ;
    $sql2 = implode(' and ', arrayImplode($condition, '=', "", "'")) ;
    $sql  = $sql1 . $sql2 ;

    $res = M() -> execute($sql) ;

    if($res === false){
        return false ;
    }else{
        return true ;
    }
}

/*
 * @Name   : isTableField
 * @Desc   : 表字段归属判断
 * @Param  : string  $tabName  目标表名(使用设置好的常量)
 * @Param  : array   $field    要判断表字段的一维数组
 * @Return : number  $result   0(不相同)/1(完全相同)/-1(tar包含于tar)
 */
function isTableField($tabName, $field){
    $Table  = M($tabName) ;
    $fields = $Table -> getDbFields() ;    // 获取表字段

    // 字段归属判断
    $result = arrayCompare($fields, $field) ;

    return $result ;
}

/*
 * @Name   : dataValComplete
 * @Desc   : 查询字段值完整性判断
 * @Param  : array   $data    查询数据
 * @Param  : array   $list    字段列表
 * @Param  : number  $num     结果小数位数
 * @Return : array   $result  判断后的结果
 */
function dataValComplete($data, $list, $num){

    $n = 0 ;
    for($i = 0; $i < count($list); $i++){
        if($data[$list[$i]]){
            $n ++ ;
        }else{
            $result[column] = $list[$i] ;
        }
    }

    $result[value] = (sprintf("%.".$num."f", $n / count($list))) ;

    return $result ;
}

/**************************************** 项目功能函数 ****************************************/

/*
 * @Name   : vkSearch
 * @Desc   : 项目搜索函数
 * @Param  : string  $type   搜索类型
 * @Param  : string  $words  搜索关键字
 * @Return : array   $data   搜索结果
 */
function vkSearch($type, $words){
    if(!$type){
        $type = 'survey' ;
    }

    if($words){
        $words = $words ;
    }else{
        $words = cookie('search_words') ;   
    }

    $url_us_visit   = U('user/visit') ;
    $url_sv_visit   = U('survey/survey/visit') ;
    $url_sv_analyse = U('survey/survey/analyse') ;

    $table = M(constant('TB_BAS_' . strtoupper($type) . '_INFO')) -> getTableName() ;
    $tbDetSurveyState    = M(TB_DET_SURVEY_STATE)     -> getTableName() ;
    $tbBasUserAccout     = M(TB_BAS_USER_ACCOUT)      -> getTableName() ;
    $tbBasUserExtendInfo = M(TB_BAS_USER_EXTEND_INFO) -> getTableName() ;
    $tbBasSurveyInfo     = M(TB_BAS_SURVEY_INFO)      -> getTableName() ;
    $tbDetUserLevel      = M(TB_DET_USER_LEVEL)       -> getTableName() ;
    $tbDetQuestionType   = M(TB_DET_QUESTION_TYPE)    -> getTableName() ;
    $tbDetSurveyState    = M(TB_DET_SURVEY_STATE)     -> getTableName() ;

    // 按照不同的搜索类型查询数据
    switch($type){
        case 'survey' :
            $condition = "survey_name like '%". $words . "%'" ;
            $sql =  "select a.survey_name, a.user_nick, a.question_num, date(a.start_time) start_date, ".
                    "       concat('$url_sv_visit/s/', a.survey_code) url_survey_visit, b.state_desc_sketch survey_state, ".
                    "       concat('$url_us_visit/u/', a.user_code) url_user_visit, a.survey_desc ".
                    "from $table a, $tbDetSurveyState b ".
                    "where a.survey_state = b.survey_state_code and a.survey_state > 2 and $condition ".
                    "order by start_date desc " ;
            break ;
        case 'question' :
            $condition = "question_name like '%". $words . "%'" ;
            $sql =  "select a.question_name, a.question_option, date(a.create_time) create_date, ".
                    "       b.survey_name, c.state_desc_sketch survey_state, d.question_type_desc question_desc, ".
                    "       concat('$url_sv_analyse/s/', b.survey_code) url_survey_analyse, ".
                    "       concat('$url_sv_visit/s/', b.survey_code) url_survey_visit ".
                    "from $table a, $tbBasSurveyInfo b, $tbDetSurveyState c, $tbDetQuestionType d ".
                    "where a.survey_code = b.survey_code and b.survey_state = c.survey_state_code ".
                    "and a.question_type = d.question_type_code and b.survey_state > 3 and $condition ".
                    "order by create_date desc " ; 
            break ;
        case 'user' :
            $condition = "user_nick like '%". $words . "%'" ;
            $sql =  "select a.user_nick, b.user_desc, c.publish_times, c.answer_times, d.user_level_desc user_level, ".
                    "       concat('$url_us_visit/u/', a.user_code) url_user_visit ".
                    "from $table a, $tbBasUserExtendInfo b, $tbBasUserAccout c, $tbDetUserLevel d ".
                    "where a.user_code = b.user_code and a.user_code = c.user_code ".
                    "and c.user_level = d.user_level_value and $condition ".
                    "order by c.user_level desc " ;
            break ;
    }
    $data = M() -> query($sql) ;

    if(count($data) > 0){
        return $data ;
    }else{
        return false ;
    }
}

/*
 * @Name   : vkPath
 * @Desc   : 项目路径
 * @Param  : string  $type   搜索类型
 * @Param  : string  $words  搜索关键字
 * @Return : array   $data   搜索结果
 */
function vkPath($page, $target){
    $path = array() ;

    if($code = M(TB_SYS_PAGE_PATH_CONFIG) -> where("path_name = '$page'") -> getField('path_code')){
        do{
            $data = M(TB_SYS_PAGE_PATH_CONFIG) -> where("path_code = $code") -> find() ;

            if($target){
                // 目标页面URL全写
                $data['url_param'] ? 
                    $data['url'] = U($data['path_value']) . '?' . $data['url_param'] . '=' . $target : $data['url'] = U($data['path_value']) ;
                    
                if($data['table_name']){
                    $cond           = $data['key_input'] . '=' . $target ;
                    $data['target'] = M(constant($data['table_name'])) -> where($cond) -> getField($data['key_output']) ;

                    // 替换换行符和占位符为空格字符串
                    $data['target'] = str_replace(array('<br>', '&nbsp;'), ' ', $data['target']) ;
                }else{
                    $data['target'] = $target ;
                }
            }

            // 删除不需要的字段
            unset($data['path_code']) ;
            unset($data['path_value']) ;
            unset($data['url_param']) ;
            unset($data['table_name']) ;
            unset($data['key_input']) ;
            unset($data['key_output']) ;

            array_unshift($path, $data) ;
        }while($code = $data['path_parent']) ;
    }else{
        return false ;
    }

    $path[count($path) - 1]['active'] = true ;

    return $path ;

}

?>