<?php

/**
 * @Name        : SurveyAction.class.php
 * @Type        : Class
 * @Description : 调查模块：所有调查相关功能实现
 *
 * @Create-time : 2012-7-13
 * @Author      : ReadYun
 * @Copyright   : VixiK
 * @Version     : 1.0.00
 */

header("Content-type:text/html;charset=utf-8");

class surveyAction extends Action{
    /* 前置方法
     * ---------------------------------------- */
    public function _initialize(){
        // 用户权限校验
        R('Api/user_verify') ;
    }

    /* 调查模块首页
     * ---------------------------------------- */
    public function index(){
        $survey_type     = M(TB_DET_SURVEY_TYPE)     -> select() ;
        $survey_type_sub = M(TB_DET_SURVEY_TYPE_SUB) -> select() ;

        for($i = 0; $i < count($survey_type); $i++){
            $sv_type_code = $survey_type[$i]['survey_type_code'] ;

            $survey_type[$i]['survey_type_sub'] = M(TB_DET_SURVEY_TYPE_SUB) -> where("survey_type_code = $sv_type_code") -> select() ;
        }

        // 页面变量
        $this -> assign('survey_type',       $survey_type) ;
        $this -> assign('survey_type_sub',   $survey_type_sub) ;

        // dump($survey_type) ;
        $this -> display() ;
    }

    /* 调查类型页面
     * ---------------------------------------- */
    public function type(){
        // 入参值初始化
        $_GET['type'] ? $type = $_GET['type'] : $type = 1001  ;// 调查类型
        $_GET['mode'] ? $mode = $_GET['mode'] : $mode = 'new' ;// 调查模式（new/hot/rec）
        
        $user_visit      = U('user/visit') ;
        $survey_type     = M(TB_DET_SURVEY_TYPE)     -> select() ;
        $survey_type_sub = M(TB_DET_SURVEY_TYPE_SUB) -> select() ;
        $tbBasSurveyInfo = M(TB_BAS_SURVEY_INFO)     -> getTableName() ;
        $tbBasUserInfo   = M(TB_BAS_USER_INFO)       -> getTableName() ;

        // 判断调查类型设计调查类型条件
        switch(strlen($type)){
            case 4 :  
                // 调查大类
                if($type_code = M(TB_DET_SURVEY_TYPE) -> where("survey_type_code = $type") -> getField('survey_type_code')){
                    $stype  = M(TB_DET_SURVEY_TYPE_SUB) -> where("survey_type_code = $type_code") -> select() ;
                    $target = $stype[0]['survey_type_name'] ;
                }else{
                    $stype  = M(TB_DET_SURVEY_TYPE_SUB) -> where("survey_type_code = 1001") -> select() ;
                    $target = M(TB_DET_SURVEY_TYPE)     -> where("survey_type_code = 1001") -> getField('survey_type_name') ;
                }
                break ;

            case 5 :
                // 调查小类
                if($type_code = M(TB_DET_SURVEY_TYPE_SUB) -> where("survey_type_sub_code = $type") -> getField('survey_type_code')){
                    $stype  = M(TB_DET_SURVEY_TYPE_SUB) -> where("survey_type_code = $type_code") -> select() ;
                    $target = M(TB_DET_SURVEY_TYPE_SUB) -> where("survey_type_sub_code = $type") -> getField('survey_type_sub_name') ;
                }else{
                    $stype  = M(TB_DET_SURVEY_TYPE_SUB) -> where("survey_type_code = 1001") -> select() ;
                    $target = M(TB_DET_SURVEY_TYPE)     -> where("survey_type_code = 1001") -> getField('survey_type_name') ;
                }
                break ;

            default :
                // 默认为第一调查大类
                $stype = M(TB_DET_SURVEY_TYPE_SUB) -> where("survey_type_code = 1001") -> select() ;
                $target = M(TB_DET_SURVEY_TYPE) -> where("survey_type_code = 1001") -> getField('survey_type_name') ;
                break ;
        }

        // // 调查大类描述（暂时不需要咯）
        // $name = $stype[0]['survey_type_name'] ;
        // $desc = M(TB_DET_SURVEY_TYPE) -> where("survey_type_code = $type_code") -> getField('survey_type_desc') ;

        // 活跃用户统计
        $sql =  "select b.user_code, b.user_nick, concat('$user_visit?code=', b.user_code) user_visit, b.user_photo, b.user_sex, count(1) cnt ".
                "from $tbBasSurveyInfo a, $tbBasUserInfo b ".
                "where a.user_code = b.user_code ".
                "group by user_code having count(1) order by cnt desc limit 5" ;
        $user = M() -> query($sql) ;

        // 页面变量
        $this -> assign('type_code',       $type_code) ;
        $this -> assign('survey_type',     $survey_type) ;
        $this -> assign('survey_type_sub', $survey_type_sub) ;
        $this -> assign('type',            $type) ;
        $this -> assign('mode',            $mode) ;
        $this -> assign('name',            $stype[0]['survey_type_name']) ;
        $this -> assign('user',            $user) ;
        $this -> assign('stype',           $stype) ;
        $this -> assign('target',          $target) ;

        $this -> display() ;
    }

    /* 调查创建页面
     * ---------------------------------------- */
    public function create(){
        $survey_code = $_GET['code'] ;
        $user_code   = cookie('user_code') ;

        $_GET['type']    ? $sv_type     = $_GET['type']    : $sv_type     = 0  ;// 调查大类
        $_GET['typesub'] ? $sv_type_sub = $_GET['typesub'] : $sv_type_sub = 0  ;// 调查小类

        // 先判断是否有调查编码参数
        if($survey_code){
            // 有调查编码转入修改模式
            $survey = surveyInfoFind($survey_code) ;  // 查询调查基本信息

            if($survey){
                if($survey[survey_state] > 1){
                    // 已发布调查直接转到调查分析页面
                    $url = U('survey/analyse') . '?code=' . $survey_code . '#svContent' ;
                    redirect($url) ;
                }else{
                    // 用户权限判断
                    if($user_code == $survey['user_code']){
                        // 取调查问题相关信息
                        $question = questionInfoSelect($survey_code) ;
                        $option   = optionInfoSelect($survey_code) ;

                        cookie('survey_code', $survey_code, 3600) ;

                        $this -> assign('survey',   $survey) ;
                        $this -> assign('question', $question) ;
                        $this -> assign('option',   $option) ;
                    }else{
                        $this -> error('您不是该调查创建者没有权限修改该调查','__ROOT__') ;            
                    }            
                }
            }else{  // 查不到调查编码对应的信息重新转入到新建调查页面
                redirect(U()) ;
            }
        }else{  // 无调查编码转入创建模式
            cookie('survey_code', null) ;
        }

        $survey_type  = M(TB_DET_SURVEY_TYPE)   -> select() ;
        $survey_class = M(TB_DET_SURVEY_CLASS)  -> select() ;
        $province     = M(TB_DET_AREA_PROVINCE) -> select() ;
        $career       = M(TB_DET_USER_CAREER)   -> select() ;
        $edu          = M(TB_DET_USER_EDU)      -> select() ;
        $level        = M(TB_DET_USER_LEVEL)    -> select() ;

        $this -> assign('survey_code',  $survey_code) ;
        $this -> assign('sv_type',      $sv_type) ;
        $this -> assign('sv_type_sub',  $sv_type_sub) ;
        $this -> assign('survey_type',  $survey_type) ;
        $this -> assign('survey_class', $survey_class) ;
        $this -> assign('province',     $province) ;
        $this -> assign('career',       $career) ;
        $this -> assign('edu',          $edu) ;
        $this -> assign('level',        $level) ;

        $this -> display() ;
    }
    
    /* 调查参与页面
     * ---------------------------------------- */
    public function answer(){
        $user_code   = cookie('user_code') ;
        $survey_code = $_GET['code'] ;

        if(!$survey_code){   
            // 如果URL没有传入调查编码，随机生成一个推荐调查页面并跳转
            $survey_code = userRecommendSurvey($user_code, 1, 1) ;
            redirect(U() . '?code=' . $survey_code) ;
        }else{   
            // 取获得的调查编码生成调查相关信息
            if($survey_code == 'preview'){
                $page   = '创建调查·预览题目' ;
                $survey = json_decode(cookie('survey_preview'), true) ;   // 取cookie的调查信息
                $info   = $survey['info'] ;
            }else{
                $page   = '参与调查' ;
                $survey = surveyInfoSelect($survey_code) ;
                $info   = $survey['info'] ;

                
                if(!$info){
                    $this->error('要参与的调查活动不存在，返回调查中心！', U('index')) ;
                    return false ;
                }else{
                    // 判断访问用户角色（发布者/参与者）
                    if($user_code == $info['user_code']){
                        // 调查发布者
                        switch($info['survey_state']){
                            case 0 :
                                // 活动无效，不能打开
                                $this->error('此调查活动不存在或已删除，返回调查中心！', U('index')) ;
                                return false ;
                                break ;
                            case 1 :
                                // 活动未发布，转入编辑页面
                                $this->redirect('survey/create', array('s' => $survey_code), 5, '调查未发布，5秒后转入编辑页面') ;
                                return false ;
                                break ;
                            default :
                                // 其他情况说明活动已发布
                                // $this->redirect('survey/analyse', array('s' => $survey_code), 5, '您不能参与自己创建的调查，5秒后转入调查分析页面') ;
                                // return false ;
                                break ;                            
                        }
                    }else{
                        // 调查访问者
                        if($info['survey_state'] < 2){
                            $this->error('要参与的调查活动不存在，返回调查中心！', U('index')) ;
                            return false ;
                        }else{
                            switch($info['survey_state']){
                                case 2 :    // 活动已发布未开始
                                    $this->redirect('survey/visit', array('s' => $survey_code), 5, '调查活动还未开始，5秒后转入调查访问页面') ;
                                    return false ;
                                    break ;

                                case 4 :
                                    // 活动已结束
                                    $this->redirect('survey/analyse', array('s' => $survey_code), 5, '本次调查活动已结束，5秒后转入调查分析页面') ;
                                    return false ;
                                    break ;
                            }
                        }
                    }
                }
            }

            $this -> assign('page',            $page) ;
            $this -> assign('survey_code',     $survey_code) ;
            $this -> assign('survey',          $survey) ;
            $this -> display() ;
        }
    }

    /* 调查访问页面
     * ---------------------------------------- */
    public function visit(){
        $survey_code = $_GET['code'] ;

        if(!$survey_code){
            // 如果URL没有传入调查编码，随机生成一个推荐调查页面并跳转
            $user_code   = cookie('user_code') ;
            $survey_code = userRecommendSurvey($user_code, 1, 1) ;
            redirect(U() . '?code=' . $survey_code) ;
        }else{
            if($survey_code == 'preview'){
                // 预览调查模式
                $page   = '预览调查' ;
                $survey = json_decode(cookie('survey_preview'), true) ;   // 取cookie的调查信息
            }else{
                // 取获得的调查编码生成调查相关信息
                $page   = '访问调查' ;
                $data   = surveyInfoSelect($survey_code) ;
                $survey = array_merge($data['info'], $data['stats']) ;
            }

            cookie('survey', json_encode($survey)) ;
            $this -> assign('page',   $page) ;
            $this -> assign('survey', $survey) ;

            $this -> display() ;
        }
    }

    /* 调查分析页面
     * ---------------------------------------- */
    public function analyse(){
        $survey_code = $_GET['code'] ;
        $survey      = surveyInfoSelect($survey_code) ;      // 调查基本信息

        $tbBasQuestionAction = M(TB_BAS_QUESTION_ACTION) -> getTableName() ;
        $tbBasQuestionOption = M(TB_BAS_QUESTION_OPTION) -> getTableName() ;
        $tbBasQuestionInfo   = M(TB_BAS_QUESTION_INFO)   -> getTableName() ;

        // 问题选项选择数量汇总
        $sql =  "select x1.*, x2.question_cnt, round(x1.option_cnt/x2.question_cnt*100, 1) option_ratio ".
                "from ( ".
                "    select t1.*, count(user_code) option_cnt ".
                "    from ( ".
                "        select a.question_code, a.question_name, a.question_type, a.question_seq, b.option_name, b.option_seq ".
                "        from $tbBasQuestionInfo a , $tbBasQuestionOption b ".
                "        where a.question_code = b.question_code and a.survey_code = $survey_code) t1 ".
                "    left join ( " .
                "         select * from $tbBasQuestionAction where survey_code = $survey_code) t2 ".
                "    on t1.question_code = t2.question_code and t1.option_name = t2.option_name ".
                "    group by t1.question_code, t1.option_name ) x1 , ".
                "( " .
                "    select question_code, count(user_code) question_cnt ".
                "    from $tbBasQuestionAction ".
                "    where survey_code = $survey_code ".
                "    group by question_code ) x2 ".
                "where x1.question_code = x2.question_code ".
                "order by x1.question_code, x1.option_seq" ;
        $option = M() -> query($sql) ;

        // 列出要查询的属性名称
        $prop = array('survey_type', 'survey_type_sub', 'survey_class',
            array(
                'elem'  => 'survey_state',
                'table' => TB_DET_SURVEY_STATE,
                'key'   => 'survey_state_code',
                'desc'  => 'state_desc_sketch',
            ),
            array(
                'elem'  => 'target_range',
                'table' => TB_DET_USER_LEVEL_RIGHT,
                'key'   => 'user_level_right_value',
                'desc'  => 'user_level_right_desc',
            ),
        ) ;

        // 更新调查属性的编码描述
        for($i = 0; $i < count($prop); $i++){
            if(is_array($prop[$i])){
                $condition = $prop[$i]['key'] . "=" . $survey['info'][$prop[$i]['elem']] ;
                $desc      = M($prop[$i]['table']) -> where($condition) -> getField($prop[$i]['desc']) ;
                $survey['info'][$prop[$i]['elem']] = $desc ;
            }else{
                $code     = $survey['info'][$prop[$i]] ;
                $key_code = $prop[$i] . '_code' ;
                $key_desc = $prop[$i] . '_desc' ;
                $table    = constant('TB_DET_'.strtoupper($prop[$i])) ;   // 取参数：目标维表名称
                $desc     = M($table) -> where("$key_code = $code") -> getField($key_desc) ;
                $survey['info'][$prop[$i]] = $desc ;
            }
        }

        // 自定义推荐规则设置处理
        $recommend = array() ;
        if($survey['info']['recomm_type'] == 2 && count($survey['recommend']) > 0){
            for($i = 0; $i < count($survey['recommend']); $i++){
                $recomm = array() ;

                // 查询属性相关信息
                $condition      = "user_prop_name='" . $survey['recommend'][$i]['rule_key'] . "'" ;
                $prop           = M(TB_DET_USER_PROP) -> where($condition) -> find() ;
                $recomm['prop'] = $prop['user_prop_desc'] ;

                switch($survey['recommend'][$i]['rule_logic']){
                    case 'in' :
                        // 查询属性对应维表取其下值对应的所有属性值描述
                        $condition = $prop['prop_det_code'] . ' in(' . $survey['recommend'][$i]['rule_value'] . ')' ;
                        $value     = M($prop['prop_det_table']) -> where($condition) -> select() ;

                        // 汇总属性值描述
                        for($r = 0; $r < count($value); $r++){
                            if($recomm['desc']){
                                $recomm['desc'] = $recomm['desc'] . '、' . $value[$r][$prop['prop_det_desc']] ;
                            }else{
                                $recomm['desc'] = $value[$r][$prop['prop_det_desc']] ;
                            }
                        }
                        break ;

                    case 'between' :
                        $recomm['desc'] = implode(explode(',', $survey['recommend'][$i]['rule_value']), '至') . '之间' ;
                        break ;
                }

                // 汇总后的结果push进总变量
                array_push($recommend, $recomm) ;
            }
        }

        // 输出
        $this -> assign('survey',    $survey) ;
        $this -> assign('option',    $option) ;
        $this -> assign('question',  $survey['question']) ;
        $this -> assign('recommend', $recommend) ;

        $this -> display() ;    
    }

    /* 调查参与页面
     * ---------------------------------------- */
    public function subjective(){
        $page = '创建调查·主观题' ;

        $this -> assign('page', $page) ;
        $this -> display() ;
    }

    /* 调查参与页面
     * ---------------------------------------- */
    // public function action(){
    //     $user_code   = cookie('user_code') ;
    //     $survey_code = $_GET['code'] ;

    //     if(!$survey_code){
    //         // 如果URL没有传入调查编码，随机生成一个推荐调查页面并跳转
    //         $survey_code = userRecommendSurvey($user_code, 1, 1) ;
    //         redirect(U() . '?code=' . $survey_code) ;
    //     }else{
    //         // 取获得的调查编码生成调查相关信息
    //         if($survey_code == 'preview'){
    //             $page   = '创建调查·预览题目' ;
    //             $survey = json_decode(cookie('survey_preview'), true) ;   // 取cookie的调查信息
    //             // $info   = $survey['info'] ;
    //         }else{
    //             $page   = '参与调查' ;
    //             $survey = surveyInfoSelect($survey_code) ;
    //             // $info   = $survey['info'] ;
                
    //             // if(!$info){
    //             //     $this->error('要参与的调查活动不存在，返回调查中心！', U('index')) ;
    //             //     return false ;
    //             // }else{
    //             //     // 判断访问用户角色（发布者/参与者）
    //             //     if($user_code === $info['user_code']){  // 调查发布者
    //             //         if($info['survey_state'] == 0){
    //             //             $this->error('要参与的调查活动不存在，返回调查中心！', U('index')) ;
    //             //             return false ;
    //             //         }else{
    //             //             if($info['survey_state'] == 1){
    //             //                 $this->redirect('survey/create', array('s' => $survey_code), 5, '调查未发布，5秒后转入草稿编辑页面') ;
    //             //                 return false ;
    //             //             }else{
    //             //                 $this->redirect('survey/analyse', array('s' => $survey_code), 5, '您不能参与自己创建的调查，5秒后转入调查分析页面') ;
    //             //                 return false ;
    //             //             }
    //             //         }
    //             //         return false ;
    //             //     }else{  // 调查访问者
    //             //         if($info['survey_state'] == 0 || $info['survey_state'] == 1){   // 活动无效/草稿
    //             //             $this->error('要参与的调查活动不存在，返回调查中心！', U('index')) ;
    //             //             return false ;
    //             //         }else{
    //             //             switch($info['survey_state']){
    //             //                 case 3 :    // 活动已发布未开始
    //             //                     $this->redirect('survey/action', array('s' => $survey_code), 5, '调查活动还未开始，5秒后转入调查访问页面') ;
    //             //                     return false ;
    //             //                     break ;
    //             //                 case 5 :   // 活动已结束
    //             //                     $this->redirect('survey/analyse', array('s' => $survey_code), 5, '本次调查活动已结束，5秒后转入调查分析页面') ;
    //             //                     return false ;
    //             //                     break ;
    //             //             }
    //             //         }
    //             //     }
    //             // }
    //         }

    //         // 调查说明输出前换行符转换
    //         $survey['info']['survey_desc'] = str_replace("\n", "<br/>", $survey['info']['survey_desc']) ;

    //         $this -> assign('page',        $page) ;
    //         $this -> assign('survey',      $survey) ;
    //         $this -> assign('survey_code', $survey_code) ;
    //         // $this -> assign('survey_desc', $info['survey_desc']) ;
    //         // $this -> assign('question',    $survey['question$']) ;
    //         $this -> display() ;
    //     }
    // }

    /* TEST
     * ---------------------------------------- */
    public function test(){
        $survey_code = 10000150 ;

        $this -> display() ;

    }
}
?>
