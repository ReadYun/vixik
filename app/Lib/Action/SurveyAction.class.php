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
        $page            = '调查中心' ;
        $url_sv_visit    = U('survey/survey/visit') ;
        $survey_type     = M(TB_DET_SURVEY_TYPE)     -> select() ;
        $survey_type_sub = M(TB_DET_SURVEY_TYPE_SUB) -> select() ;
        $survey_trade    = M(TB_DET_SURVEY_TRADE)    -> select() ;
        $tbBasSurveyInfo = M(TB_BAS_SURVEY_INFO)     -> getTableName() ;
        $tbBasUserInfo   = M(TB_BAS_USER_INFO)       -> getTableName() ;

        $sv_recomm = M(TB_BAS_SURVEY_INFO) -> where("recomm_grade = 2") -> select() ;

        for($i = 0; $i < count($survey_type); $i++){
            $sv_type_code = $survey_type[$i]['survey_type_code'] ;

            $survey_type[$i]['survey_type_sub'] = M(TB_DET_SURVEY_TYPE_SUB) -> where("survey_type_code = $sv_type_code") -> select() ;
        }

        $sql = "select survey_name, ifnull(answer_num, 0) answer_num, concat('$url_sv_visit?code=', survey_code) url_sv_visit
                from $tbBasSurveyInfo where survey_state = 3 order by answer_num desc, start_time limit 10" ;
        $survey_hot = M() -> query($sql) ;


        // 活跃用户统计
        $sql =  "select b.user_code, b.user_nick, concat('$user_visit?code=', b.user_code) user_visit, b.user_photo, b.user_sex, count(1) cnt ".
                "from $tbBasSurveyInfo a, $tbBasUserInfo b ".
                "where a.user_code = b.user_code ".
                "group by user_code having count(1) order by cnt desc limit 5" ;
        $user = M() -> query($sql) ;

        // 页面变量
        $this -> assign('page',            $page) ;
        $this -> assign('user',            $user) ;
        $this -> assign('survey_trade',    $survey_trade) ;
        $this -> assign('survey_type',     $survey_type) ;
        $this -> assign('survey_type_sub', $survey_type_sub) ;
        $this -> assign('survey_hot',      $survey_hot) ;
        $this -> assign('sv_recomm',       $sv_recomm) ;

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
        $tbBasTagInfo    = M(TB_BAS_TAG_INFO)        -> getTableName() ;

        // 判断调查类型设计调查类型条件
        switch(strlen($type)){
            case 4 :  
                // 调查大类
                if($type_code = M(TB_DET_SURVEY_TYPE) -> where("survey_type_code = $type") -> getField('survey_type_code')){
                    $stype               = M(TB_DET_SURVEY_TYPE) -> where("survey_type_code = $type_code") -> find() ;
                    $target['type_code'] = $stype['survey_type_code']  ;
                    $target['type_name'] = $stype['survey_type_name']  ;
                }else{
                    $stype               = M(TB_DET_SURVEY_TYPE) -> where("survey_type_code = 1001") -> find() ;
                    $target['type_code'] = $type = $stype['survey_type_code']  ;
                    $target['type_name'] = $stype['survey_type_name']  ;
                }

                $cond = "survey_state in(3,4) and survey_type = ". $target['type_code'] ;
                break ;

            case 5 :
                // 调查小类
                if($type_code = M(TB_DET_SURVEY_TYPE_SUB) -> where("survey_type_sub_code = $type") -> getField('survey_type_sub_code')){
                    $stype               = M(TB_DET_SURVEY_TYPE_SUB) -> where("survey_type_sub_code = $type_code") -> find() ;
                    $target['type_code'] = $stype['survey_type_sub_code']  ;
                    $target['type_name'] = $stype['survey_type_sub_desc']  ;
                }else{
                    $stype               = M(TB_DET_SURVEY_TYPE_SUB) -> where("survey_type_sub_code = $type_code") -> find() ;
                    $target['type_code'] = $type = $stype['survey_type_sub_code']  ;
                    $target['type_name'] = $stype['survey_type_sub_desc']  ;
                }

                $cond = "survey_state in(3,4) and survey_type_sub = ". $target['type_code'] ;
                break ;

            default :
                // 默认为第一调查大类
                $stype               = M(TB_DET_SURVEY_TYPE) -> where("survey_type_code = 1001") -> find() ;
                $target['type_code'] = $stype['survey_type_code']  ;
                $target['type_name'] = $stype['survey_type_name']  ;

                $cond = "survey_state in(3,4) and survey_type = ". $target['type_code'] ;
                break ;
        }

        // 热门行业
        $stats = surveyPropStats(array('cond' => $cond, 'prop' => 'sv_trade', 'order' => 'cnt', 'limit' => 'limit 5')) ;

        // 活跃用户统计
        $sql =  "select b.user_code, b.user_nick, concat('$user_visit?code=', b.user_code) user_visit, b.user_photo, b.user_sex, count(1) cnt ".
                "from $tbBasSurveyInfo a, $tbBasUserInfo b ".
                "where a.user_code = b.user_code ".
                "group by user_code having count(1) order by cnt desc limit 5" ;
        $user = M() -> query($sql) ;

        // 判断调查类型设计关注类型条件，统计关注数量
        switch(strlen($target['type_code'])){
            case 4 :  
                $cond = "svprop_type = 'survey_type' and svprop_value = ". $target['type_code'] ;
                break ;
            case 5 :  
                $cond = "svprop_type = 'survey_type_sub' and svprop_value = ". $target['type_code'] ;
                break ;
        }

        $follow = M(TB_BAS_USER_FOLLOW_SVPROP) -> where($cond) -> count() ;

        // 页面变量
        $this -> assign('svtype',          $target['type_code']) ;
        $this -> assign('mode',            $mode) ;
        $this -> assign('type_code',       $type_code) ;
        $this -> assign('survey_type',     $survey_type) ;
        $this -> assign('survey_type_sub', $survey_type_sub) ;
        $this -> assign('stats_trade',     $stats['sv_trade']) ;
        $this -> assign('user',            $user) ;
        $this -> assign('target',          $target) ;
        $this -> assign('follow',          $follow) ;

        $this -> display() ;
    }

    /* 调查行业页面
     * ---------------------------------------- */
    public function trade(){
        // 入参值初始化
        $_GET['trade'] ? $trade = $_GET['trade'] : $trade = 1001  ;// 调查行业编码
        $_GET['mode']  ? $mode  = $_GET['mode']  : $mode = 'new'  ;// 调查模式（new/hot/rec）
        
        $user_visit      = U('user/visit') ;
        $survey_trade    = M(TB_DET_SURVEY_TRADE)    -> select() ;
        $tbBasSurveyInfo = M(TB_BAS_SURVEY_INFO)     -> getTableName() ;
        $tbBasUserInfo   = M(TB_BAS_USER_INFO)       -> getTableName() ;

        $trade  = M(TB_DET_SURVEY_TRADE) -> where("survey_trade_code = $trade") -> find() ;

        // 热门行业
        $cond  = "survey_state in(3,4) and survey_trade = ". $trade['survey_trade_code'] ;
        $stats = surveyPropStats(array('cond' => $cond, 'prop' => 'sv_type_sub', 'order' => 'cnt', 'limit' => 'limit 5')) ;

        // 活跃用户统计
        $sql =  "select b.user_code, b.user_nick, concat('$user_visit?code=', b.user_code) user_visit, b.user_photo, b.user_sex, count(1) cnt ".
                "from $tbBasSurveyInfo a, $tbBasUserInfo b ".
                "where a.user_code = b.user_code ".
                "group by user_code having count(1) order by cnt desc limit 5" ;
        $user = M() -> query($sql) ;

        // 统计行业关注数量
        $cond   = "svprop_type = 'survey_trade' and svprop_value = ". $trade['survey_trade_code'] ;
        $follow = M(TB_BAS_USER_FOLLOW_SVPROP) -> where($cond) -> count() ;

        // 页面变量
        $this -> assign('survey_trade', $survey_trade) ;
        $this -> assign('trade_code',   $trade['survey_trade_code']) ;
        $this -> assign('trade_name',   $trade['survey_trade_name']) ;
        $this -> assign('stats_type',   $stats['sv_type_sub']) ;
        $this -> assign('follow',       $follow) ;
        $this -> assign('mode',         $mode) ;
        $this -> assign('user',         $user) ;

        $this -> display() ;
    }

    /* 调查创建页面
     * ---------------------------------------- */
    public function create(){
        $page        = '调查创建' ;
        $survey_code = $_GET['code'] ;
        $user_code   = cookie('user_code') ;

        $_GET['type']    ? $sv_type     = $_GET['type']    : $sv_type     = 0  ;// 调查大类
        $_GET['typesub'] ? $sv_type_sub = $_GET['typesub'] : $sv_type_sub = 0  ;// 调查小类

        // 先判断是否有调查编码参数
        if($survey_code){
            // 查询调查基本信息
            if($survey = surveyInfoFind($survey_code)){
                switch($survey['survey_state']){
                    case 2 :  // 活动已发布
                        if($user_code == $survey['user_code']){
                            // 调查发布者
                            $this -> error('已发布的活动不能修改，帮您转入调查分析页面', U('survey/analyse?code='. $survey_code)) ;
                        }else{
                            $this -> error('不能修改别人发布的调查，帮您转入调查访问页面', U('survey/visit?code='. $survey_code)) ;
                        }
                        break ;

                    case 3 :  // 活动进行中
                        if($user_code == $survey['user_code']){
                            // 调查发布者
                            $this -> error('进行中的活动不能修改，帮您转入调查分析页面', U('survey/analyse?code='. $survey_code)) ;
                        }else{
                            $this -> error('不能修改别人发布的调查，帮您转入调查访问页面', U('survey/visit?code='. $survey_code)) ;
                        }
                        break ;
                        
                    case 4 :  // 活动已结束
                        $this -> error('本次调查已结束，帮您转入调查分析页面', U('survey/analyse?code='. $survey_code)) ;
                        break ;
                        
                    default :
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
                            $this -> error('此调查不存在，返回前一页') ;
                        }       
                        break ;
                }
            }else{  // 查不到调查编码对应的信息重新转入到新建调查页面
                $this -> error('此调查不存在，现在创建一个调查吧', U()) ;
            }
        }else{  // 无调查编码转入创建模式
            cookie('survey_code', null) ;
        }

        $survey_type  = M(TB_DET_SURVEY_TYPE)   -> select() ;
        $survey_trade = M(TB_DET_SURVEY_TRADE)  -> select() ;
        $province     = M(TB_DET_AREA_PROVINCE) -> select() ;
        $career       = M(TB_DET_USER_CAREER)   -> select() ;
        $edu          = M(TB_DET_USER_EDU)      -> select() ;
        $level        = M(TB_DET_USER_LEVEL)    -> select() ;
        $tag          = M(TB_BAS_TAG_INFO)      -> where("survey_code = $survey_code") -> select() ;

        $this -> assign('survey_code',  $survey_code) ;
        $this -> assign('sv_type',      $sv_type) ;
        $this -> assign('sv_type_sub',  $sv_type_sub) ; 
        $this -> assign('survey_type',  $survey_type) ;
        $this -> assign('survey_trade', $survey_trade) ;
        $this -> assign('province',     $province) ;
        $this -> assign('career',       $career) ;
        $this -> assign('edu',          $edu) ;
        $this -> assign('level',        $level) ;
        $this -> assign('tag',          $tag) ;
        $this -> assign('page',         $page) ;
        $this -> assign('path',         vkPath($page)) ;

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
                $page        = '调查预览' ;
                $survey_code = cookie('sv_preview') ;   // 取cookie的调查信息
                $survey      = surveyInfoSelect($survey_code) ;
                $info        = $survey['info'] ;
            }else{
                $page   = '调查参与' ;
                $survey = surveyInfoSelect($survey_code) ;
                $info   = $survey['info'] ;
                
                if(!$info){
                    $this -> error('要参与的调查活动不存在，返回调查中心！', U('index')) ;
                    return false ;
                }else{
                    // 判断访问用户角色（发布者/参与者）
                    if($user_code == $info['user_code']){
                        // 调查发布者
                        switch($info['survey_state']){
                            case 0 :
                                // 活动无效，不能打开
                                $this -> error('此调查活动不存在或已删除，返回调查中心！', U('index')) ;
                                return false ;
                                break ;
                            case 1 :
                                // 活动未发布，转入编辑页面
                                $this -> error('调查未发布，帮您转入调查编辑页面', U('survey/create?code='. $survey_code)) ;
                                return false ;
                                break ;
                            default :
                                // 其他情况说明活动已发布
                                // $this->redirect('survey/analyse', array('s' => $survey_code), 5, '您不能参与自己创建的调查，5秒后转入调查分析页面') ;
                                // return false ;
                                break ;                            
                        }
                    }else{
                        // 调查参与者、游客
                        if($info['survey_state'] < 2){
                            $this -> error('要参与的调查活动不存在，返回调查中心！', U('index')) ;
                            return false ;
                        }else{
                            switch($info['survey_state']){
                                case 2 :    // 活动已发布未开始
                                    $this -> error('调查活动还未开始，帮您转入调查访问页面', U('survey/visit?code='. $survey_code)) ;
                                    return false ;
                                    break ;

                                case 4 :
                                    // 活动已结束
                                    $this -> error('本次调查活动已结束，帮您转入调查分析页面', U('survey/analyse?code='. $survey_code)) ;
                                    return false ;
                                    break ;
                            }
                        }
                    }
                }
            }

            $this -> assign('code',        $_GET['code']) ;
            $this -> assign('survey_code', $survey_code) ;
            $this -> assign('survey',      $survey) ;
            $this -> assign('page',        $page) ;
            $this -> assign('path',        vkPath($page, $survey_code)) ;

            $this -> display() ;
        }
    }

    /* 调查行业页面
     * ---------------------------------------- */
    public function tag(){
        $this -> display() ;
    }

    /* 调查访问页面
     * ---------------------------------------- */
    public function visit(){
        $survey_code = $_GET['code'] ;

        $tbBasSurveyInfo   = M(TB_BAS_SURVEY_INFO)   -> getTableName() ;
        $tbBasSurveyAction = M(TB_BAS_SURVEY_ACTION) -> getTableName() ;

        if(!$survey_code){
            // 如果URL没有传入调查编码，随机生成一个推荐调查页面并跳转
            $user_code   = cookie('user_code') ;
            $survey_code = userRecommendSurvey($user_code, 1, 1) ;
            redirect(U() . '?code=' . $survey_code) ;
        }else{
            // 取获得的调查编码生成调查相关信息
            $page     = '调查访问' ;
            $survey   = surveyInfoSelect($survey_code) ;
            $sv_user  = $survey['info']['user_code'] ;
            $sv_type  = $survey['info']['survey_type'] ;
            $sv_trade = $survey['info']['survey_trade'] ;
            $sv_visit = U('survey/visit') ;

            $question = $survey['question'] ;
            for($i = 0; $i < count($question); $i++){
                $question[$i]['question_name'] = str_replace("&nbsp;", " ", $question[$i]['question_name']) ;
                $question[$i]['question_name'] = str_replace("<br>",   " ", $question[$i]['question_name']) ;

                switch($question[$i]['question_type']){
                    case 'radio' :
                        $question[$i]['question_type'] = '单选题' ;
                        break ;

                    case 'checkbox' :
                        $question[$i]['question_type'] = '多选题' ;
                        break ;

                    case 'textarea' :
                        $question[$i]['question_type'] = '主观题' ;
                        break ;
                }
            }

            // Ta的其他调查
            $sql = "select survey_code, replace(replace(replace(survey_name, '&nbsp;', ' '), '<br>' ,' '), '  ', ' ')  survey_name,
                    concat('$sv_visit?code=', survey_code) survey_visit 
                    from $tbBasSurveyInfo where user_code = $sv_user and survey_code <> $survey_code and survey_state = 3 
                    order by start_time desc limit 10 " ;
            $survey['list']['user'] = M() -> query($sql) ;

            // 同类型调查
            $sql = "select a.survey_code, replace(replace(replace(a.survey_name, '&nbsp;', ' '), '<br>' ,' '), '  ', ' ')  survey_name,
                    concat('$sv_visit?code=', a.survey_code) survey_visit 
                    from $tbBasSurveyInfo a where a.survey_code <> $survey_code and a.survey_state = 3 and a.survey_type = $sv_type
                    and not exists (select survey_code from tb_bas_survey_action b where a.survey_code = b.survey_code and b.user_code = $sv_user) 
                    order by start_time desc limit 10 " ;
            $survey['list']['type'] = M() -> query($sql) ;

            // 同类型调查
            $sql = "select a.survey_code, replace(replace(replace(a.survey_name, '&nbsp;', ' '), '<br>' ,' '), '  ', ' ')  survey_name,
                    concat('$sv_visit?code=', a.survey_code) survey_visit 
                    from $tbBasSurveyInfo a where a.survey_code <> $survey_code and a.survey_state = 3 and a.survey_trade = $sv_trade
                    and not exists (select survey_code from tb_bas_survey_action b where a.survey_code = b.survey_code and b.user_code = $sv_user) 
                    order by start_time desc limit 10 " ;
            $survey['list']['trade'] = M() -> query($sql) ;

            cookie('survey', json_encode($survey)) ;
            $this -> assign('page',     $page) ;
            $this -> assign('survey',   $survey) ;
            $this -> assign('question', $question) ;
            $this -> assign('path',     vkPath($page, $survey_code)) ;

            $this -> display() ;
        }
    }

    /* 调查分析页面
     * ---------------------------------------- */
    public function analyse(){
        $survey_code = $_GET['code'] ;
        $survey      = surveyInfoSelect($survey_code) ;      // 调查基本信息

        if($survey['stats']['answer_cnt'] == 0){
            $this -> error('无人参与过本次调查，无法查看分析报告，帮你转入调查访问页面', U('survey/visit?code='. $survey_code)) ;
            return false ;
        }

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
        $this -> assign('path',      vkPath('调查分析', $survey_code)) ;

        // dump($survey) ;
        // dump($option) ;
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
    //             //     $this -> error('要参与的调查活动不存在，返回调查中心！', U('index')) ;
    //             //     return false ;
    //             // }else{
    //             //     // 判断访问用户角色（发布者/参与者）
    //             //     if($user_code === $info['user_code']){  // 调查发布者
    //             //         if($info['survey_state'] == 0){
    //             //             $this -> error('要参与的调查活动不存在，返回调查中心！', U('index')) ;
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
    //             //             $this -> error('要参与的调查活动不存在，返回调查中心！', U('index')) ;
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
