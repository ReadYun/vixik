<?php

/**
 * Name        : ApiAction.class.php
 * Type        : Class
 * Description : 接口模块
 *
 * Create-time : 2012-6-14, 1:06:49
 * Author      : ReadYun
 * Copyright   : VixiK
 * Version     : 1.0.00
 */

header("Content-type:text/html;charset=utf-8");

class ApiAction extends Action{

    /*
    * @Name   : user_create
    * @Desc   : 新建用户接口
    * @Param  : json    user_info     用户信息(昵称、密码、邮件)
    * @Return : number  $survey_code  新用户编码
    */
    public function api(){
        $_POST['api'] = 'api_' . $_POST['api'] ;

        // 接口调用权限校验（待开发）
        $right = api_right_check($_POST) ;

        if($right['status']){
            // 接口名称存在校验
            if(function_exists($_POST['api'])){
                // 接口参数解析并校验
                $param = api_param_check($_POST) ;
            }else{
                $this -> ajaxReturn('-9000', "接口" . $_POST['api'] . "不存在", 0) ;
            }

            if($param['status']){
                // 权限和参数校验都通过，调用接口并返回数据
                $result = $_POST['api']($param['data']) ;
            }else{
                $this -> ajaxReturn($param['data'], $param['info'], $param['status']) ;
            }   
        }else{
            $this -> ajaxReturn($right['data'], $right['info'], $right['status']) ;
        }

        // 解析接口返回数据并输出
        $this -> ajaxReturn($result['data'], $result['info'], $result['status'], $result['type']) ;
    }

    /*
     * @Name   : user_verify
     * @Desc   : 用户权限
     * @Params : number  $user_code   用户编码
     * @Params : string  $user_name   用户名称
     * @Params : stirng  $user_email  用户电邮
     * @Params : string  $user_pwd    用户密码
     * @Return : array   $data        用户基本信息
     */
    public function user_verify(){
        if($_POST['user_name'] && MD5($_POST['user_pwd'])){
            // 直接调用接口模式
            $cond['user_name'] = $_POST['user_name'] ;
            $cond['user_pwd']  = MD5($_POST['user_pwd']) ;
            
            if($user = M(TB_BAS_USER_INFO) -> where($cond) -> find()){
                if($accout = M(TB_BAS_USER_ACCOUT) -> where("user_code = ".$user['user_code']) -> find()){
                    $user = array_merge($user, $accout) ;
                }

                // 查询用户等级值对应的等级描述
                $user['user_level_desc'] = M(TB_DET_USER_LEVEL) -> where("user_level_value=".$user['user_level']) -> getField('user_level_desc') ;

                // 用户编码和MD5码可长期保留在cookie中
                cookie('user_code', $user['user_code'],                        360000) ;
                cookie('user_md5',  MD5($user['user_code'].$user['user_pwd']), 360000) ;

                // 用户隐私属性列表
                $private = array('user_pwd','user_email','identity_card','sure_name','user_address','mobile_phone','fix_phone') ;

                for($i = 0; $i < count($private); $i++){
                    unset($user[$private[$i]]) ;        
                }

                // 再通过接口返回成功信息和用户资料数据
                cookie('user$', json_encode($user)) ;
                $this -> ajaxReturn($user, "success:api_user_verify", 1, 'json') ;
            }else{
                $this -> ajaxReturn(false, "failed:api_user_verify", 0) ;
            }
        }elseif(cookie('user_code') && cookie('user_md5')){
            // 读取cookie参数模式
            $user_code = cookie('user_code') ;
            $user_md5  = cookie('user_md5') ;
            if($user = M(TB_BAS_USER_INFO) -> where("user_code = $user_code") -> find()){
                /*
                 * 用户校验
                 * 用户密码本身经过MD5加密
                 * 再对用户编码+用户密码二次MD5加密生成user_md5用来做比对校验
                 * 通过校验后去除用户隐私信息以JSON格式存放到cookie中
                 *
                 */
                if($user_md5 === MD5("$user_code".$user['user_pwd'])){
                    if($accout = M(TB_BAS_USER_ACCOUT) -> where("user_code = $user_code") -> find()){
                        $user = array_merge($user, $accout) ;
                    }

                    // 查询用户等级值对应的等级描述
                    $user['user_level_desc'] = M(TB_DET_USER_LEVEL) -> where("user_level_value=".$user['user_level']) -> getField('user_level_desc') ;

                    // 用户隐私属性列表
                    $private = array('user_pwd','user_email','identity_card','sure_name','user_address','mobile_phone','fix_phone') ;

                    for($i = 0; $i < count($private); $i++){
                        unset($user[$private[$i]]) ;        
                    }
                    
                    cookie('user$', json_encode($user)) ;
                    return true ;
                }
            }else{
                // 未通过校验清除目标cookie
                cookie('user_code', null) ;
                cookie('user_md5',  null) ;
                cookie('user$',     null) ;
                return false ;            
            }
        }else{
            cookie('user_code', null) ;
            cookie('user_md5',  null) ;
            cookie('user$',     null) ;
            return false ;
        }
    }

   /*
    * @Name   : det_data_select
    * @Desc   : 维表数据查询接口
    * @Param  : string  $table      目标维表名称
    * @Param  : string  $condition  查询条件
    * @Return : json    $jsonData   结果数据
    */
    public function det_data_select(){
        $table     = constant('TB_DET_'.strtoupper($_POST['table'])) ;   // 目标维表名称
        $condition = $_POST['condition'] ;                               // 查询条件
        $data      = M($table) -> where($condition) -> select() ;

        if($data){
            $this -> ajaxReturn($data, 'success:api_det_data_select', 1, 'json') ;
        }else{
            $this -> ajaxReturn(0, 'failed:api_det_data_select', 0);
        }
    }

   /*
    * @Name   : upload_img
    * @Desc   : 头像上传接口
    * @Param  : string  $type      搜索类型
    * @Return : 上传成功标志
    */   
    public function upload_img(){
        import('ORG.Net.UploadFile');
        $upload = new UploadFile();                     //  实例化上传类
        
        $upload -> maxSize = 1*1024*1024;                 // 设置上传图片的大小
        $upload -> allowExts = array('jpg','png','gif');  // 设置上传图片的后缀
        $upload -> uploadReplace = true;                  // 同名则替换

        // 定义上传的得到的临时图片完整路径
        $path = VK_PUB_IMG.'tmp/';
        $upload -> savePath = $path;

        if(!$upload -> upload()) {                        //  上传错误提示错误信息
            $this -> ajaxReturn('', $upload -> getErrorMsg(), 0, 'json');
        }else{                                          //  上传成功 获取上传文件信息
            $info =  $upload -> getUploadFileInfo();
            $img_name = $info[0][savename] ;
            $temp_size = getimagesize($path.$img_name) ;

            // 判断宽和高是否符合头像要求
            if($temp_size[0] < 100 || $temp_size[1] < 100){
                $this -> ajaxReturn(0, '图片宽或高不得小于100px！', 0, 'json');
            }

            // 以上都没有问题返回Ajax数据（JSON）
            $this -> ajaxReturn($img_name, $info, 1, 'json');
        }
    }

   /*
    * @Name   : crop_img
    * @Desc   : 图片裁剪接口
    * @Param  : string  $type      搜索类型
    * @Return : 上传成功标志
    */   
    public function crop_img(){
        // 图片裁剪数据
        $params = $this -> _post() ;

        $user_code = $params['code'] ;                       // 要保存图片名称（用户编码）
        $tmp_img   = $params['src'] ;                        // 临时图片名称
        $tmp_path  = VK_PUB_IMG.'tmp/'.$tmp_img ;            // 临时图片完整路径
        $save_path = VK_PUB_IMG.'user/'.$user_code.'.jpg' ;  // 要保存图片完整路径

        // 引入扩展图片库
        import('ORG.Util.Image.ThinkImage') ;
        $ThinkImage = new ThinkImage(THINKIMAGE_GD) ; 

        // 裁剪原图
        $ThinkImage -> open($tmp_path) -> crop($params['w'], $params['h'], $params['x'], $params['y']) -> save($save_path) ;

        // 生成缩略图
        $ThinkImage -> open($save_path) -> thumb(120,120, 1) -> save(VK_PUB_IMG.'user/'.$user_code.'_120.jpg') ;
        $ThinkImage -> open($save_path) -> thumb(60,60, 1) -> save(VK_PUB_IMG.'user/'.$user_code.'_60.jpg') ;

        // 删除原文件
        @unlink($tmp_path) ;

        // 以上都没有问题返回成功状态和数据
        if(updateTable(TB_BAS_USER_INFO, array('user_photo'=>1), array('user_code'=>$user_code), 'cover')){
            $this -> ajaxReturn($save_path, "success:api_crop_img", 1) ;
        }else{
            $this -> ajaxReturn(0, "failed:api_crop_img", 0) ;
        }
    }





















// /**************************************** 用户模块接口 ****************************************/

//    /*
//     * @Name   : user_create
//     * @Desc   : 新建用户接口
//     * @Param  : json    user_info     用户信息(昵称、密码、邮件)
//     * @Return : number  $survey_code  新用户编码
//     */
//     public function user_create(){
//         $user             = json_decode($_POST['user'], true) ;   // 取用户相关信息
//         $user['user_pwd'] = MD5($user['user_pwd']) ;

//         // 新建用户
//         $user_code = userCreate($user) ;

//         if($user_code){
//             $this -> ajaxReturn($user_code, "success:api_user_create", 1) ;
//         }else{
//             $this -> ajaxReturn(0, "failed:api_user_create", 0) ;
//         }
//     }

//    /*
//     * @Name   : user_info_find
//     * @Desc   : 用户汇总信息查询接口：包含用户基本信息和账户信息
//     * @Param  : number  user_code  用户编码
//     * @Return : json    $user      用户汇总信息
//     */
//     public function user_info_find(){
//         $user_code = $_POST['user_code'] ;

//         $user = userInfoFind($user_code) ;

//         if($user){
//             $this -> ajaxReturn($user, "success:api_user_info_find", 1, 'json') ;
//         }else{
//             $this -> ajaxReturn(0, "failed:api_user_info_find", 0) ;
//         }
//     }

//    /*
//     * @Name   : user_count
//     * @Desc   : 用户数统计汇总（根据传入的查询条件SQL直接统计总用户数）
//     * @Param  : json    condition   查询条件
//     * @Return : number  user_count  查询到的用户数
//     */
//     public function user_count(){
//         $condition = json_decode($_POST['condition'], true) ;

//         // 分解规则数组只取其中的sql条件语句
//         for($i = 0; $i < sizeof($condition); $i++){
//             $condition_array[$i] = $condition[$i]['condition_sqlstr'] ;
//         }

//         // 连接所有条件合成查询语句的条件字符串
//         $condition = implode(' and ', $condition_array) ;

//         // 查询对应条件的推荐对象人数
//         $user_cnt = M(TB_BAS_USER_INFO) -> where($condition) -> count() ;

//         if($user_cnt){
//             $this -> ajaxReturn($user_cnt, "success:api_user_count", 1) ;
//         }
//     }

//    /*
//     * @Name   : user_info_update
//     * @Desc   : 用户信息更新接口
//     * @Param  : number   user_code      用户编码
//     * @Param  : json     user_info      用户基本信息
//     * @Param  : json     user_interest  用户兴趣信息
//     * @Return : boolean  true/false     更新成功或失败标志
//     */
//     public function user_info_update(){
//         $user_code = $_POST['user_code'] ; 
//         $res       = false ;

//         // 如果来源数据的用户就是调查创建用户才进行更新操作
//         if($user_code){   

//             // 用户基本信息
//             if($_POST['user_info']){
//                 $user_info = json_decode($_POST['user_info'], true) ;  

//                 // 用户密码做MD5加密处理
//                 if($user_info['user_pwd']){
//                     $user_info['user_pwd'] = MD5($user_info['user_pwd']) ;
//                 }

//                 $res = userInfoUpdate('info', $user_code, $user_info) ;   
//             }

//             // 用户个性资料
//             if($_POST['user_extend']){
//                 $user_extend_info = json_decode($_POST['user_extend'], true) ;
//                 $res = userInfoUpdate('extend_info', $user_code, $user_extend_info) ;
//             }

//             // 用户兴趣信息
//             if($_POST['user_interest']){
//                 $user_interest = json_decode($_POST['user_interest'], true) ;
//                 $res = userInfoUpdate('interest', $user_code, $user_interest) ;
//             }

//             if($res){
//                 $this -> ajaxReturn(1, "success:api_user_info_update", 1) ;
//             }else{
//                 $this -> ajaxReturn(0, "failed:api_user_info_update", 0) ;
//             }
//         }else{
//             $this -> ajaxReturn(0, "failed:api_user_info_update", 0) ;
//         }
//     }

//    /*
//     * @Name   : user_action_log_select
//     * @Desc   : 用户行为日志查询接口
//     * @Param  : number  user_code    用户编码
//     * @Param  : string  action_type  行为类型(score/coins)
//     * @Return : json    $jsonAction  用户行为信息
//     */
//     public function user_action_log_select(){
//         $user_code   = $_POST['user_code'] ;
//         $action_type = 'user_' . $_POST['action_type'] ;

//         $tbBasUserActionLog    = M(TB_BAS_USER_ACTION_LOG) -> getTableName() ;
//         $tbDetUserActionConfig = M(TB_DET_USER_ACTION_CONFIG) -> getTableName() ;

//         // 取用户行为日志信息
//         $sql =  "select a.* , b.action_desc ".
//                 "from $tbBasUserActionLog a , $tbDetUserActionConfig b ".
//                 "where a.action_code = b.action_code and a.action_type = '$action_type' and b.update_type = '$action_type' ".
//                 "order by a.action_time desc" ;
//                 //  echo $sql ;
//         $log = M() -> query($sql) ;

//         if($log){
//             $this -> ajaxReturn($log, "success:user_action_log_select", 1, 'json') ;
//         }else{
//             $this -> ajaxReturn(0, "failed:user_action_log_select", 0) ;
//         }
//     }

//     public function user_action_log_select_bk(){
//         $user_code   = $_POST['user_code'] ;
//         $select_type = $_POST['select_type'] ;

//         $BasActionLog = constant('TB_BAS_' . strtoupper($select_type) . '_ACTION_LOG') ;

//         $tbBasActionLog = M($BasActionLog) -> getTableName() ;
//         $tbDetUserActionConfig = M(TB_DET_USER_ACTION_CONFIG) -> getTableName() ;

//         // 取用户行为日志信息
//         $sql =  "select a.* , b.action_desc ".
//                 "from $tbBasActionLog a , $tbDetUserActionConfig b ".
//                 "where a.action_code = b.action_code ".
//                 "order by a.action_time desc" ;
//         $log = M() -> query($sql) ;

//         if($log){
//             $this -> ajaxReturn($log, "success:user_action_log_select", 1, 'json') ;
//         }else{
//             $this -> ajaxReturn(0, "failed:user_action_log_select", 0) ;
//         }
//     }

//    /*
//     * @Name   : user_action_cfg_select
//     * @Desc   : 用户行为配置规则查询接口
//     * @Param  : number   $_POST['action_code']   用户行为编码
//     * @Param  : number   $_POST['action_value']  用户行为对应值
//     * @Return : json     $data                   查询后的规则数据
//     */
//     public function user_action_cfg_select(){
//         $action_code  = $_POST['action_code'] ;
//         $action_value = $_POST['action_value'] ;
//         $config       = M(TB_DET_USER_ACTION_CONFIG) -> where("action_code = '$action_code'") -> select() ;

//         for($i = 0; $i < count($config); $i++){
//             $data[$config[$i]['update_type']]['logic'] = $config[$i]['update_logic'] ;
            
//             if(!$config[$i]['update_value']){    // 如果没有对应的值需要根据配置项计算出结果值
//                 $condition = $config[$i]['code_column'].' = '.$action_value ;
//                 $value     = M($config[$i]['table_name']) -> where("$condition") -> find() ;

//                 $data[$config[$i]['update_type']]['value'] = $value[$config[$i]['value_column']] ;
//             }else{
//                 $data[$config[$i]['update_type']]['value'] = $config[$i]['update_value'] ;
//             }
//         }

//         // 以上都没有问题返回成功状态和JSON数据
//         if($data){
//             $this -> ajaxReturn($data, 'success:api_user_action_cfg_select', 1, 'json') ;
//         }else{
//             $this -> ajaxReturn(0, 'failed:api_user_action_cfg_select', 0) ;
//         }
//     }

//    /*
//     * @Name   : user_accout_find
//     * @Desc   : 用户账户信息查询接口
//     * @Param  : number  user_code    用户编码
//     * @Return : json    $userAccout  用户账户信息
//     */
//     public function user_accout_find(){
//         $user_code  = $_POST['user_code'] ;
//         $userAccout = M(TB_BAS_USER_ACCOUT) -> where("user_code = '$user_code'") -> find() ;    // 取目标用户账户信息

//         // 以上都没有问题返回成功状态和JSON数据
//         $this -> ajaxReturn($userAccout, "success", 1) ;
//     }

//    /*
//     * @Name   : user_accout_update
//     * @Desc   : 用户积分等级更新接口（以后更新积分等级都在后台进行，此接口将废弃）
//     * @Param  : json     action_info  用户行为信息
//     * @Return : boolean  true/false   更新成功或失败标志
//     */
//     public function user_accout_update(){        
//         $times_type = $_POST['times_type'] ;
//         $action     = json_decode($_POST['action'], true) ;  // 用户行为信息
//         $action['action_time'] = date('Y-m-d H:i:s') ;    // 行为发生时间

//         $user_code   = $action['user_code'] ;
//         $action_code = $action['action_code'] ;

//         if($times_type){
//             $times_type = $times_type . '_times';   
//         }

//         // 取行为编码对应行为规则信息合并到用户行为信息数据中
//         $actionConfig = M(TB_DET_USER_ACTION_CONFIG) -> where("action_code = '$action_code'") -> find() ;    
//         $action = array_merge($actionConfig, $action) ;

//         // 生成行为名称$action['action_name']
//         $condition = $action['action_column'] . '=' . $action['action_value'] ;
//         $dtAction = M($action['action_table']) -> where("$condition") -> find();
//         $target = $action['action_target'] ;        
//         $action['action_name'] = $dtAction[$target] ;

//         // 取两个行为日志表表结构
//         $keyBasScoreActionLog = M(TB_BAS_SCORE_ACTION_LOG) -> getDbFields() ;
//         $keyBasCoinsActionLog = M(TB_BAS_COINS_ACTION_LOG) -> getDbFields() ;

//         // 生成两个行为日志表对应字段的数据
//         $action_score = arrayExtract($action, $keyBasScoreActionLog) ;
//         $action_coins = arrayExtract($action, $keyBasCoinsActionLog) ;

//         // 计算需要更新的用户积分值和金币值
//         $accout_add['user_score'] = $action['score_value'] * $action['score_logic'] ;  
//         $accout_add['user_coins'] = $action['coins_value'] * $action['coins_logic'] ;  

//         if($times_type){
//             $accout_add["$times_type"] = 1 ;            
//         }

//         // 更新用户账户信息表中的金币积分等级
//         if(userAccoutUpdate($user_code, $accout_add)){
//             if($action_score['score_value']){
//                 $res_sc = userActionAdd($action_score, 'score') ;    // 用户积分累计日志

//                 // 如果更新过用户积分，再判断是否需要更新用户等级
//                 $userAccout = M(TB_BAS_USER_ACCOUT) -> where("user_code = '$user_code'") -> find() ;    // 取当前用户账户信息
//                 $condition  = "score_lower_value <= ". $userAccout['user_score'] . " and score_upper_value >= ". $userAccout['user_score'] ;
//                 $userLvl    = M(TB_DET_USER_LEVEL) -> where($condition) -> find() ;    // 取需要的积分规则
                
//                 // 如果计算出的最新等级与之前等级不同，更新用户最新等级
//                 if($userLvl['user_level_value'] != $userAccout['user_level']){
//                     $userAc['user_level'] = $userLvl['user_level_value'] ;
//                     alterUserAccout($user_code, $userAc) ;
//                 }
//             }
//             if($action_coins['coins_value']){
//                 $res_co = userActionAdd($action_coins, 'coins') ;    // 用户金币使用日志
//             }
//         }

//         if($res_sc && $res_co){
//             $this -> ajaxReturn(1, "success", 1) ;
//         }else{
//             $this -> ajaxReturn(0, "failed", 0) ;
//         }
//     }

//    /*
//     * @Name   : user_info_verify
//     * @Desc   : 用户信息验证接口
//     * @Param  : array    $_POST       POST的所有数据
//     * @Return : boolean  true/false   验证结果
//     */
//     // public function user_verify(){
//     //     $condition = $_POST ;

//     //     // 用户密码做MD5加密处理(用户登录用)
//     //     if($_POST['user_pwd']){
//     //         $condition['user_pwd'] = MD5($_POST['user_pwd']) ;
//     //     }

//     //     $data = M(TB_BAS_USER_INFO) -> where($condition) -> find() ;

//     //     if($data){
//     //         $this -> ajaxReturn(1, "success:api_user_verify", 1) ;
//     //     }else{
//     //         $this -> ajaxReturn(0, "failed:api_user_verify", 0) ;
//     //     }
//     // }

//     public function user_info_verify(){
//         $condition = $_POST ;

//         // 用户密码做MD5加密处理  
//         if($condition['user_pwd']){
//             $condition['user_pwd'] = MD5($condition['user_pwd']) ;
//         }

//         $data = M(TB_BAS_USER_INFO) -> where($condition) -> find() ;

//         if($data){
//             $this -> ajaxReturn(1, "success:api_user_info_verify", 1) ;
//         }else{
//             $this -> ajaxReturn(0, "failed:api_user_info_verify", 0) ;
//         }
//     }

//    /*
//     * @Name   : user_login_verify
//     * @Desc   : 用户登录验证接口
//     * @Param  : string   type         验证方式
//     * @Param  : string   user_nick    用户昵称
//     * @Return : boolean  true/false   验证是否通过标志位
//     */
//     public function user_login_verify(){
//         $condition = $_POST ;

//         // 用户密码做MD5加密处理
//         if($condition['user_pwd']){
//             $condition['user_pwd'] = MD5($condition['user_pwd']) ;
//         }

//         $user = M(TB_BAS_USER_INFO) -> where($condition) -> find() ;

//         if($user){
//             cookie('user_code', $user['user_code'], 360000) ;
//             cookie('user_name', $user['user_name'], 360000) ;
//             cookie('user_nick', $user['user_nick'], 360000) ;
//             cookie('user_pwd',  $user['user_pwd'],  360000) ;

//             $this -> ajaxReturn(1, "success:user_login_verify", 1) ;
//         }else{
//             $this -> ajaxReturn(0, "failed:user_login_verify", 0) ;
//         }
//     }

//    /*
//     * @Name   : user_info_complete
//     * @Desc   : 用户资料完整新查询接口
//     * @Param  : number  $user_code  用户编码
//     * @Return : json    $result     统计结果
//     */
//     public function user_info_complete(){
//         $user_code = $_POST['user_code'] ;
//         $list      = $_POST['list'] ;

//         $dtBasUserInfo       = M(TB_BAS_USER_INFO)              -> where("user_code = '$user_code'") -> find() ;
//         $dtBasUserExtendInfo = M(TB_BAS_USER_EXTEND_INFO)       -> where("user_code = '$user_code'") -> find() ;
//         $cfg                 = M(TB_DET_USER_INFO_COMPLETE_CFG) -> select() ;

//         if($dtBasUserInfo && $dtBasUserExtendInfo){
//             $data = array_merge($dtBasUserInfo, $dtBasUserExtendInfo) ;
//         }

//         $list = array() ;

//         for($i = 0; $i < count($cfg); $i++){
//             array_push($list, $cfg[$i]['info_prop_col_name']) ;
//         }

//         $data = dataValComplete($data, $list, 2);

//         // 返回查询到的数据
//         if($data){
//             $this -> ajaxReturn($data, 'success:user_info_complete', 1, 'json') ;
//         }else{
//             $this -> ajaxReturn(0, 'failed:user_info_complete', 0) ;
//         }
//     }

//    /*
//     * @Name   : user_follow_query
//     * @Desc   : 用户关注与关注信息查询接口
//     * @Params : string  $follow_type  查询类型(user/survey)
//     * @Params : string  $query_type   查询方式类型(select/count)
//     * @Params : number  $user_code    用户编码
//     * @Params : number  $query_code   查询对象编码
//     * @Return : json    $data         查询到的目标统计数据
//     */
//     public function user_follow_query(){
//         $follow_type = $_POST['follow_type'] ;
//         $query_type  = $_POST['query_type'] ;
//         $user_code   = $_POST['user_code'] ;
//         $follow_code = $_POST['follow_code'] ;

//         $tbBasSurveyInfo   = M(TB_BAS_SURVEY_INFO)        -> getTableName() ;
//         $tbDetSurveyState  = M(TB_DET_SURVEY_STATE)       -> getTableName() ;
//         $tbBasSurveyFollow = M(TB_BAS_USER_FOLLOW_SURVEY) -> getTableName() ;

//         switch($query_type){
//             case 'select' :
//                 $sql =  "select ".
//                         "    a.survey_code, a.survey_name, a.state_time, a.survey_state, c.state_desc_sketch survey_state_desc, ".
//                         "    date(a.start_time) start_date, concat('$url_visit/s/', a.survey_code) url_visit ".
//                         "from $tbBasSurveyInfo a , $tbBasSurveyFollow b , $tbDetSurveyState c ".
//                         "where a.survey_code = b.follow_code ".
//                         "and a.survey_state = c.survey_state_code ".
//                         "and a.survey_state >= 3 ".
//                         "and b.user_code = $user_code ".
//                         "order by a.end_time desc" ;
//                 $data = M() -> query($sql) ;
//                 break ;

//             case 'count' :
//                 $data = userFollowQuery($follow_type, $query_type, array('user_code'=>$user_code,'follow_code'=>$follow_code)) ;
//                 break ;
//         }

//         // 返回查询到的数据
//         if($data){
//             $this -> ajaxReturn($data, 'success:api_user_follow_query', 1, 'json') ;
//         }else{
//             $this -> ajaxReturn(0, 'failed:api_user_follow_query', 0) ;
//         }
//     }

//    /*
//     * @Name   : user_follow_update
//     * @Desc   : 用户关注与关注信息更新接口
//     * @Params : number   $user_code    用户编码
//     * @Params : string   $follow_type  更新对象类型(user/survey)
//     * @Params : string   $follow_code  更新对象编码
//     * @Params : string   $update_type  更新方式类型(add/del)
//     * @Return : json     $data         更新后的目标统计信息
//     */
//     public function user_follow_update(){
//         $user_code   = $_POST['user_code'] ;
//         $follow_type = $_POST['follow_type'] ;
//         $follow_code = $_POST['follow_code'] ;
//         $update_type = $_POST['update_type'] ;

//         $data = userFollowUpdate($user_code, $follow_type, $follow_code, $update_type) ;

//         if($data){
//             $this -> ajaxReturn($data, 'success:api_user_follow_update', 1) ;
//         }else{
//             $this -> ajaxReturn($data, 'failed:api_user_follow_update', 0) ;
//         }
//     }

// /**************************************** 调查模块接口 ****************************************/

//    /*
//     * @Name   : survey_create
//     * @Desc   : 新建调查接口：取用户基本信息新建一个空调查，返回新调查的编码
//     * @Param  : number  user_code     用户编码
//     * @Return : number  $survey_code  新调查编码
//     */
//     public function survey_create(){
//         $user_code    = $_POST['user_code'] ;
//         $survey_code  = $_POST['survey_code'] ;
//         $survey_state = $_POST['survey_state'] ;
//         $info         = json_decode($_POST['info'], true) ;
//         $question     = json_decode($_POST['question'], true) ;

//         dump($info['survey_name']) ;
//         if($info['survey_name'] == NULL){
//             $info['survey_name'] = '未命名' ;
//         }

//         // 先判断POST的调查编码是否存在：不存在则新建调查编码，存在则修改目标调查编码的相关信息
//         if(!$survey_code){
//             $survey_code = surveyCreate($user_code) ;
//             if(!$survey_code){
//                 $this -> ajaxReturn(0, '初始创建调查编码失败', 0) ;
//                 return false ;
//             }
//         }
//         // dump('1...') ;
//         // dump($survey_code) ;

//         // 更新调查基本信息
//         if($info){
//             unset($info['survey_state']) ;    // 删除info中的调查状态属性

//             // 活动时间处理
//             if($info['length_day']){
//                 $length_day       = $info['length_day'] ;
//                 $start_time       = $data['start_time'] = date('Y-m-d H:i:s') ;
//                 $data['end_time'] = date('Y-m-d H:i:s',strtotime("$start_time + $length_day day"));
//                 unset($info['length_day']) ;
//             }

//             if(!surveyInfoAlter($survey_code, $info)){
//                 $this -> ajaxReturn(0, '更新基本信息失败', 0) ;
//                 return false ;
//             }
//         }
//         // dump('2...') ;

//         // 更新调查题目信息
//         if($question){
//             if(!surveyQuestionDelete($survey_code) || !surveyQuestionAlter($user_code, $survey_code, $question)){
//                 $this -> ajaxReturn(0, '更新题目信息失败', 0) ;
//                 return false ;
//             }
//         }
//         // dump('3...') ;

//         // 如果调查状态是发布状态，还要更新用户账户相关信息
//         if(intval($survey_state) == 2){
//             if(!userActionUpdate($user_code, 1002, $survey_code)){
//                 $this -> ajaxReturn(0, '更新用户账户信息失败', 0) ;
//                 return false ;
//             }
//         }
//         // dump('4...') ;

//         // 以上所有顺利完成，更新正式的最新的调查状态并返回结果
//         $data['survey_state'] = $survey_state ;
//         $data['state_time']   = date('Y-m-d H:i:s') ;
//         if(M(TB_BAS_SURVEY_INFO) -> where("survey_code = '$survey_code'")-> save($data)){
//             $this -> ajaxReturn($survey_code, 'success:api_survey_create', 1) ;
//         }else{
//             $this -> ajaxReturn($survey_code, 'failed:api_survey_create', 0) ;
//         }
//     }

//    /*
//     * @Name   : survey_info_update
//     * @Desc   : 调查信息修改接口
//     * @Param  : number   user_code    用户编码
//     * @Param  : number   survey_code  调查编码
//     * @Param  : string   alter_type   修改类型
//     * @Param  : json     sv_info      调查基本信息
//     * @Param  : json     sv_item      调查题目信息
//     * @Return : boolean  true/false   修改成功或失败标志
//     */
//     public function survey_info_update(){
//         $user_code   = $_POST['user_code'] ;
//         $survey_code = $_POST['survey_code'] ;

//         if($_POST['sv_info']){
//             $sv_info = json_decode($_POST['sv_info'], true) ;  // 调查基本信息
//             $sv_info['state_time'] = date('Y-m-d H:i:s') ;     // 数据更新时间
//         }
//         if($_POST['sv_item']){
//             $sv_item = json_decode($_POST['sv_item'], true) ;  // 题目基本信息
//         }

//         $survey = M(TB_BAS_SURVEY_INFO) -> where("survey_code = '$survey_code'") -> find() ;

//         // 如果来源数据的用户就是调查创建用户才进行更新操作
//         if($survey['user_code'] == $user_code){    
//             $res = false ;

//             // 更新目标调查基本信息
//             if(!empty($sv_info)){   
//                 $res = surveyInfoAlter($survey_code, $sv_info) ;    
//             }

//             // 更新目标调查题目信息
//             if(!empty($sv_item)){
//                 if(surveyQuestionDelete($survey_code)){    // 删除目标调查相关问题信息
//                     $res = surveyQuestionAlter($survey_code, $sv_item) ;    // 更新目标调查相关问题信息
//                 }
//             }

//             if($res){
//                 echo true ; 
//             }else{
//                 echo false ;
//             }
//         }else{
//             echo false ;
//         }
//     }

//    /*
//     * @Name   : survey_info_select
//     * @Desc   : 调查信息查询接口
//     * @Param  : number  survey_code   调查编码
//     * @Return : json    $survey_info  调查基本信息
//     */
//     public function survey_info_select(){
//         $survey_code = $_POST['survey_code'] ;
//         $survey      = surveyInfoSelect($survey_code) ;

//         // 返回查询结果
//         if($survey){
//             $this -> ajaxReturn($survey, 'success:api_survey_info_find', 1, 'json') ;
//         }else{
//             $this -> ajaxReturn($survey, 'failed:api_survey_info_find', 0) ;
//         }
//     }

//    /*
//     * @Name   : survey_info_base_find
//     * @Desc   : 调查基本信息查询接口
//     * @Param  : number  survey_code   调查编码
//     * @Return : json    $survey_info  调查基本信息
//     */
//     public function survey_info_base_find(){
//         $survey_code = $_POST['survey_code'] ;
//         $survey_info = surveyInfoFind($survey_code) ;

//         // 返回查询结果
//         if($survey_info){
//             $this -> ajaxReturn($survey_info, 'success:api_survey_info_find', 1, 'json') ;
//         }else{
//             $this -> ajaxReturn($survey_info, 'success:api_survey_info_find', 0) ;
//         }
//     }

//    /*
//     * @Name   : survey_recomm_create
//     * @Desc   : 调查推荐规则创建（目前一套调查只能生成一套规则，以后要实现单调查多规则功能需要再开发完善）
//     * @Param  : number  survey_code  调查编码
//     * @Param  : json    recommend    调查推荐规则
//     * @Return : mix     Param        不同的处理类型对应不同的出参
//     */
//     public function survey_recomm_create(){ 
//         $survey_code = $_POST['survey_code'] ;
//         $recommend   = json_decode($_POST['recommend'], true) ;
//         $limit       = 500 ;

//         // 删除目标调查下的前一个临时规则

//         // 自定义推荐规则创建
//         if($recommend && $survey_code){
//             M(TB_BAS_SURVEY_RECOMMEND_RULE) -> where("survey_code = '$survey_code' and recommend_state = 1") -> delete() ;
//             $flag = recommendCreate($survey_code, $recommend) ;
//         }else{
//             $flag = false ;
//         }

//         // 调查推荐用户
//         // 待改造成：调查发布后才生成推荐用户（需要建设服务器定时推送功能）
//         // $survey = M(TB_BAS_SURVEY_INFO) -> where("survey_code = '$survey_code'") -> find() ;
//         // if($survey['survey_state'] >= 3){
//         //     $res = surveyRecommendUser($survey_code, $recomm_type, $limit) ;                    
//         // }

//         // 返回结果
//         if($flag){
//             $this -> ajaxReturn(1, "success:api_survey_recomm_create", 1) ;
//         }else{
//             $this -> ajaxReturn(0, "failed:api_survey_recomm_create", 0) ;           
//         }
//     }

//    /*
//     * @Name   : survey_recomm_user
//     * @Desc   : 向调查推荐用户接口
//     * @Param  : number  survey_code  调查编码
//     * @Param  : json    recommend    调查推荐规则
//     * @Return : number  user_cnt     推荐成功用户数
//     */
//     public function survey_recomm_user(){
//         $survey_code = $_POST['survey_code'] ;
//         $recomm_type = $_POST['recomm_type'] ;
//         $recommend   = json_decode($_POST['recommend'], true) ;
//         $limit       = 500 ;

//         // 推荐规则创建
//         if($recommend){
//             $recommend_code = recommendCreate($survey_code, $recommend) ;   
//         }

//         // 推荐用户生成
//         $user_cnt = surveyRecommendUser($survey_code, $recomm_type, $limit) ;
//         echo $user_cnt ;
//     }

//    /*
//     * @Name   : survey_answer_submit
//     * @Desc   : 调查参与答题结果提交接口
//     * @Param  : json     answer_survey    调查信息
//     * @Param  : json     answer_question  问题信息
//     * @Return : boolean  true/false       汇总结果提交成功或失败标志
//     */
//     public function survey_answer_submit(){
//         $survey      = json_decode($_POST['survey'], true) ;
//         $question    = json_decode($_POST['question'], true) ;
//         $user_code   = cookie('user_code') ;
//         $survey_code = $survey['survey_code'] ;

//         // 新增用户参与调查详情信息
//         if(empty($survey) || empty($question) || !surveyActionAdd($survey, $question)){
//             $this -> ajaxReturn(0, '更新调查参与信息失败', 0) ;
//             return false ;
//         }

//         // 用户参与数据更新成功，再更新用户账户相关信息
//         if(!userActionUpdate($user_code, 1001, $survey_code)){
//             $this -> ajaxReturn(0, '更新用户账户信息失败', 0) ;
//             return false ;
//         }

//         // 全部更新完毕返回结果
//         $this -> ajaxReturn($survey_code, 'success:survey_answer_submit', 1) ;
//     }

//    /*
//     * @Name   : survey_created_select
//     * @Desc   : 用户已创建调查查询接口：按不同类型查询用户创建过的调查信息
//     * @Param  : number  user_code     用户编码
//     * @Param  : string  survey_state  查询调查状态（0:无效调查；1:创建草稿；2:创建完成；3:调查发布；4:活动开始；5:活动结束）
//     * @Return : json    $jsonSurvey   满足条件的调查信息
//     */
//     public function survey_created_select(){
//         $user_code    = $_POST['user_code'] ;
//         $survey_state = $_POST['survey_state'] ;
//         $url_visit    = U('survey/visit') ;
//         $url_alter    = U('survey/alter') ;
//         $url_analyse  = U('survey/analyse') ;

//         $tbBasSurveyInfo  = M(TB_BAS_SURVEY_INFO)  -> getTableName() ;
//         $tbDetSurveyState = M(TB_DET_SURVEY_STATE) -> getTableName() ;

//         $sql = "select ".
//                 "    a.survey_code, a.survey_name, a.state_time, a.survey_state, b.state_desc_sketch survey_state_desc, ".
//                 "    date(a.create_time) create_date, date(a.start_time) start_date , ".
//                 "    concat('$url_visit/s/', a.survey_code) url_visit, concat('$url_alter/s/', a.survey_code) url_alter, ".
//                 "    concat('$url_analyse/s/', a.survey_code) url_analyse ".
//                 "from $tbBasSurveyInfo a , $tbDetSurveyState b ".
//                 "where a.survey_state = b.survey_state_code ".
//                 "and a.user_code = $user_code ".
//                 "and a.survey_state >= $survey_state ".
//                 "order by a.state_time desc" ;

//         $data = M() -> query($sql) ;

//         if($data){
//             $this -> ajaxReturn($data, 'success:survey_created_select', 1, 'json') ;
//         }else{
//             $this -> ajaxReturn(0, 'success:survey_created_select', 0) ;
//         }
//     }

//    /*
//     * @Name   : survey_action_select
//     * @Desc   : 调查参与信息查询接口
//     * @Param  : number  $user_code    用户编码
//     * @Param  : number  $survey_code  调查编码
//     * @Param  : string  type          查询方式
//     * @Return : json    $data         用户相关行为信息
//     */
//     public function survey_action_select(){
//         $type        = $_POST['type'] ;
//         $user_code   = $_POST['user_code'] ;
//         $survey_code = $_POST['survey_code'] ;
//         $url_visit   = U('survey/visit') ;
//         $url_alter   = U('survey/alter') ;
//         $url_analyse = U('survey/analyse') ;

//         $condition_us = "1 = 1" ;
//         $condition_sv = "1 = 1" ;

//         $tbBasSurveyInfo   = M(TB_BAS_SURVEY_INFO)   -> getTableName() ;
//         $tbBasSurveyAction = M(TB_BAS_SURVEY_ACTION) -> getTableName() ;
//         $tbDetSurveyState  = M(TB_DET_SURVEY_STATE)  -> getTableName() ;

//         switch($type){
//             case 'simple' : 
//                 $count = M(TB_BAS_SURVEY_ACTION) -> where("user_code = '$user_code' and survey_code = '$survey_code'") -> count() ;

//                 if($count){
//                     $this -> ajaxReturn($count, 'success:api_survey_action_select', 1, 'json') ;
//                 }else{
//                     $this -> ajaxReturn(false, 'failed:api_survey_action_select', 0) ;
//                 }
//                 break ;

//             case 'action' :
//                 if($user_code){
//                     $condition_sv = "b.user_code = $user_code " ;
//                 } ;
//                 if($survey_code){
//                     $condition_sv = "b.survey_code = $survey_code " ;
//                 } ;

//                 $sql =  "select ".
//                         "    a.survey_code, a.survey_name, a.state_time, a.survey_state, c.state_desc_sketch survey_state_desc, ".
//                         "    date(a.start_time) start_date, concat('$url_visit/s/', a.survey_code) url_visit, ".
//                         "    concat('$url_alter/s/', a.survey_code) url_alter, concat('$url_analyse/s/', a.survey_code) url_analyse ".
//                         "from $tbBasSurveyInfo a , $tbBasSurveyAction b , $tbDetSurveyState c ".
//                         "where a.survey_code = b.survey_code ".
//                         "and a.survey_state = c.survey_state_code ".
//                         "and a.survey_state >= 3 ".
//                         "and $condition_us ".
//                         "and $condition_sv ". 
//                         "order by a.end_time desc" ;
//                 $data = M() -> query($sql) ;

//                 if($data){
//                     $this -> ajaxReturn($data, 'success:api_survey_action_select', 1, 'json') ;
//                 }else{
//                     $this -> ajaxReturn(false, 'failed:api_survey_action_select', 0) ;
//                 }
//                 break ;
//         }
//     }

//    /*
//     * @Name   : survey_custom_option
//     * @Desc   : 自定义选项增加
//     * @Param  : number  user_code      选项创建用户编码
//     * @Param  : string  option_name    自定义选项名称
//     * @Param  : number  question_code  对应问题编码
//     * @Param  : number  custom_spare   自定义选项对应备用选项编码
//     * @Return : bool    true/false     操作成功或失败标志
//     */
//     public function survey_custom_option(){
//         $user_code   = $_POST['user_code'] ;
//         $survey_code = $_POST['survey_code'] ;
//         $option      = json_decode($_POST['custom_option'], true) ;   // 取用户相关信息

//         $sql = "delete from tb_bas_question_option ".
//                "where create_user = $user_code and option_type = 2 ".
//                "and question_code in ( select question_code from tb_bas_question_info where survey_code = $survey_code)" ;
//         M() -> execute($sql) ;

//         for($i = 0; $i < count($option); $i++){
//             $data                 = $option[$i] ;          // 取入参（option_name/question_code/custom_spare）
//             $data['option_type']  = 2 ;                    // 选项类型（1:普通选项；2:自定义选项）
//             $data['option_state'] = 2 ;                    // 选项状态（0:无效；1:有效；2:临时）
//             $data['create_user']  = $user_code ;           // 选项创建用户
//             $data['create_time']  = date('Y-m-d H:i:s') ;  // 选项创建时间

//             // 生成选项编码（在考虑能否下线选项编码这个字段不要了）
//             $condition = "question_code = " . $data['question_code'] . " and option_state <> 2" ;
//             $data['option_seq'] = M(TB_BAS_QUESTION_OPTION) -> where($condition) -> max('option_seq') + 1 ;

//             // 整理好的数据插入问题选项清单表
//             if(insertTable(TB_BAS_QUESTION_OPTION, $data)){
//                 $option[$i]['option_seq'] = $data['option_seq'] ;
//             }else{
//                 $this -> ajaxReturn(false, 'failed:survey_custom_option', 0) ;
//             }
//         }

//         $this -> ajaxReturn($option, 'success:survey_custom_option', 1, 'json') ;
//     }


// /**************************************** 统计模块接口 ****************************************/

//    /*
//     * @Name   : stats_sv_action_cnt
//     * @Desc   : 调查参与情况统计
//     * @Param  : number  $survey_code  调查编码
//     * @Return : json    $jsonData     统计结果
//     */
//     public function stats_sv_action_cnt(){
//         $survey_code = $_POST['survey_code'] ;   // 取调查编码

//         $sql  = "select date_format(start_time, '%Y-%m-%d') date , count(1) count ".
//                 "from tb_bas_survey_action where survey_code = $survey_code ".
//                 "group by date order by 1" ;
//         $data = M() -> query($sql) ;

//         if(count($data) > 0){
//             $this -> ajaxReturn($data, 'success', 1, 'json');
//         }else{
//             $this -> ajaxReturn(0, 'failed', 0);
//         }

//     }

//    /*
//     * @Name   : stats_sv_group_cnt
//     * @Desc   : 调查参与情况分组统计接口
//     * @Param  : number  $survey_code  调查编码
//     * @Param  : array   $condition    要分组的字段组成的数组
//     * @Return : json    $jsonData     统计结果
//     */
//     public function stats_sv_group_cnt(){
//         $survey_code = $_POST['survey_code'] ;   // 取调查编码
//         $condition   = $_POST['condition'] ;   // 取group条件
//         $prop        = $table = $group = array() ;

//         $tbBasUserInfo     = M(TB_BAS_USER_INFO)     -> getTableName() ;
//         $tbBasSurveyAction = M(TB_BAS_SURVEY_ACTION) -> getTableName() ;

//         for($i = 0; $i < count($condition); $i++){
//             $bas_prop_name  = $condition[$i] ;
//             $relation       = M(TB_BAS_PROP_DET_RELATION) -> where("bas_table_name = 'BasUserInfo' and bas_prop_name = '$bas_prop_name'") -> find() ;
//             $bas_prop_name  = $relation['bas_prop_name'] ;
//             $det_table_name = $relation['det_table_name'] ;
//             $det_prop_name  = $relation['det_prop_name'] ;
//             $det_prop_desc  = $relation['det_prop_desc'] ;
//             $tbDetName      = M($det_table_name) -> getTableName() ;

//             array_push($prop, "t$i.".$det_prop_desc." $bas_prop_name") ;  // 生成目标字段数组
//             array_push($group, "t$i.".$det_prop_desc) ;                   // 生成分组字段数组
//             array_push($table, $tbDetName . " t$i") ;                     // 生成维表表名数组
//             $and = " and a.$bas_prop_name = t$i.$det_prop_name". $and ;  // 生成条件字符串
//         }

//         $prop  = implode(',', $prop) ;     // 连接数组生成目标字段字符串
//         $group = implode(',', $group) ;    // 连接数组生成分组字段字符串
//         $table = implode(',', $table) ;    // 连接数组生成维表表名字符串

//         $sql =  "select $prop , count(1) count ". 
//                 "from $tbBasUserInfo a , $tbBasSurveyAction b , $table ".
//                 "where a.user_code = b.user_code and b.survey_code = $survey_code $and ".
//                 "group by $group" ;
//         $data = M() -> query($sql) ;

//         if(count($data) > 0){
//             $this -> ajaxReturn($data, 'success', 1, 'json');
//         }else{
//             $this -> ajaxReturn(0, 'failed', 0);
//         }
//     }

//    /*
//     * @Name   : stats_qt_group_cnt
//     * @Desc   : 调查答题情况分组统计接口
//     * @Param  : number  $survey_code  调查编码
//     * @Param  : array   $condition    要分组的字段组成的数组
//     * @Return : json    $jsonData     统计结果
//     */
//     public function stats_qt_group_cnt(){
//         $survey_code   = $_POST['survey_code'] ;      // 取调查编码
//         $question_code = $_POST['question_code'] ;    // 取问题编码
//         $condition     = $_POST['condition'] ;        // 取group条件
//         $prop          = $table = $group = array() ;

//         $tbBasUserInfo       = M(TB_BAS_USER_INFO)     -> getTableName() ;
//         $tbBasQuestionAction = M(TB_BAS_QUESTION_ACTION) -> getTableName() ;

//         for($i = 0; $i < count($condition); $i++){
//             $bas_prop_name  = $condition[$i] ;
//             $relation       = M(TB_BAS_PROP_DET_RELATION) -> where("bas_table_name = 'BasUserInfo' and bas_prop_name = '$bas_prop_name'") -> find() ;
//             $det_table_name = $relation['det_table_name'] ;
//             $bas_prop_name  = $relation['bas_prop_name'] ;
//             $det_prop_name  = $relation['det_prop_name'] ;
//             $det_prop_desc  = $relation['det_prop_desc'] ;

//             $tbDetName = M($det_table_name) -> getTableName() ;

//             array_push($prop, "t$i.".$det_prop_desc." $bas_prop_name") ;  // 生成目标字段数组
//             array_push($group, "t$i.".$det_prop_desc) ;                   // 生成分组字段数组
//             array_push($table, $tbDetName . " t$i") ;                     // 生成维表表名数组
//             $and = " and a.$bas_prop_name = t$i.$det_prop_name". $and ;   // 生成条件字符串
//         }

//         if($question_code){
//             $and = "and b.question_code = $question_code". $and ;
//         }

//         $prop  = implode(',', $prop) ;     // 连接数组生成目标字段字符串
//         $group = implode(',', $group) ;    // 连接数组生成分组字段字符串
//         $table = implode(',', $table) ;    // 连接数组生成维表表名字符串

//         $sql =  "select b.question_code, b.option_name, $prop , count(1) count ". 
//                 "from $tbBasUserInfo a , $tbBasQuestionAction b , $table ".
//                 "where a.user_code = b.user_code and b.survey_code = $survey_code ".
//                 "and b.question_type <> 'textarea' $and ".
//                 "group by b.question_code, b.option_name, $group" ;
//         $data = M() -> query($sql) ;

//         if(count($data) > 0){
//             $this -> ajaxReturn($data, 'success', 1, 'json');
//         }else{
//             $this -> ajaxReturn(0, 'failed', 0);
//         }
//     }

//    /*
//     * @Name   : stats_qt_group_cnt
//     * @Desc   : 调查答题情况分组统计接口
//     * @Param  : number  $survey_code  调查编码
//     * @Param  : array   $condition    要分组的字段组成的数组
//     * @Return : json    $jsonData     统计结果
//     */
//     public function survey_textarea_content(){
//         $survey_code   = $_POST['survey_code'] ;      // 取调查编码
//         $question_code = $_POST['question_code'] ;    // 取问题编码

//     }

// /**************************************** 其他接口 ****************************************/

//    /*
//     * @Name   : search
//     * @Desc   : 搜索接口
//     * @Param  : string  $type   搜索类型
//     * @Param  : string  $words  搜索关键字
//     * @Return : 处理数据后直接前往搜索页面
//     */   
//     public function search(){
//         $type  = $_POST['type'] ;   // 搜索类型
//         $words = $_POST['words'] ;  // 搜索关键字

//         if($type && $words){
//             $data = vkSearch($type, $words) ;
//         }else{
//             $data = false ; 
//         }

//         if(count($data) > 0){
//             $this -> ajaxReturn($data, 'success', 1, 'json');
//         }else{
//             $this -> ajaxReturn(0, 'failed', 0);
//         }
//     }

//    /*
//     * @Name   : search_go
//     * @Desc   : 搜索接口
//     * @Param  : string  $type      搜索类型
//     * @Param  : string  $word      搜索关键字
//     * @Return : 处理数据后直接前往搜索页面
//     */   
//     public function search_go(){
//         $type  = $_POST['type'] ;   // 搜索类型
//         $words = $_POST['words'] ;   // 搜索关键字
//         $url   = U('search/index') ;

//         if($type && $words){
//             // 生成对应的搜索URL
//             $url = $url . '?type=' . $type . '&words=' . $words ;
//         }

//         echo $url ;
//     }

//    /*
//     * @Name   : search_main
//     * @Desc   : 搜索接口
//     * @Param  : string  $word      搜索关键字
//     * @Return : json    $jsonData  搜索结果数据
//     */   
//     public function search_main(){
//         $type = $_POST['search_type'] ;
//         if($_POST['search_words']){
//             $word = $_POST['search_words'] ;
//         }else{
//             $word = cookie('search_words') ;   
//         }
//         echo $word ;

//         $url_us_visit   = U('user/visit') ;
//         $url_sv_visit   = U('survey/survey/visit') ;
//         $url_sv_analyse = U('survey/survey/analyse') ;

//         $table = M(constant('TB_BAS_' . strtoupper($type) . '_INFO')) -> getTableName() ;
//         $tbDetSurveyState    = M(TB_DET_SURVEY_STATE)     -> getTableName() ;
//         $tbBasUserAccout     = M(TB_BAS_USER_ACCOUT)      -> getTableName() ;
//         $tbBasSurveyInfo     = M(TB_BAS_SURVEY_INFO)      -> getTableName() ;
//         $tbBasUserExtendInfo = M(TB_BAS_USER_EXTEND_INFO) -> getTableName() ;
//         $tbDetUserLevel      = M(TB_DET_USER_LEVEL)       -> getTableName() ;
//         $tbDetQuestionType   = M(TB_DET_QUESTION_TYPE)    -> getTableName() ;
//         $tbDetSurveyState    = M(TB_DET_SURVEY_STATE)     -> getTableName() ;

//         // 按照不同的搜索类型查询数据
//         switch($type){
//             case 'survey' :
//                 $condition = "survey_name like '%". $word . "%'" ;
//                 $sql =  "select a.survey_name, a.user_nick, a.question_num, date(a.start_time) start_date, ".
//                         "       concat('$url_sv_visit/s/', a.survey_code) url_survey_visit, b.state_desc_sketch survey_state, ".
//                         "       concat('$url_us_visit/u/', a.user_code) url_user_visit, a.survey_desc ".
//                         "from $table a, $tbDetSurveyState b ".
//                         "where a.survey_state = b.survey_state_code and a.survey_state >= 3 and $condition ".
//                         "order by start_date desc " ;
//                 break ;
//             case 'question' :
//                 $condition = "question_name like '%". $word . "%'" ;
//                 $sql =  "select a.question_name, a.question_option, date(a.create_time) create_date, ".
//                         "       b.survey_name, c.state_desc_sketch survey_state, d.question_type_desc question_desc, ".
//                         "       concat('$url_sv_analyse/s/', b.survey_code) url_survey_analyse, ".
//                         "       concat('$url_sv_visit/s/', b.survey_code) url_survey_visit ".
//                         "from $table a, $tbBasSurveyInfo b, $tbDetSurveyState c, $tbDetQuestionType d ".
//                         "where a.survey_code = b.survey_code and b.survey_state = c.survey_state_code ".
//                         "and a.question_type = d.question_type_code and b.survey_state >= 3 and $condition ".
//                         "order by create_date desc " ; 
//                 break ;
//             case 'user' :
//             $condition = "user_nick like '%". $words . "%'" ;
//             $sql =  "select a.user_nick, b.user_desc, c.publish_times, c.answer_times, d.user_level_desc user_level, ".
//                     "       concat('$url_us_visit/u/', a.user_code) url_user_visit ".
//                     "from $table a, $tbBasUserExtendInfo b, $tbBasUserAccout c, $tbDetUserLevel d ".
//                     "where a.user_code = b.user_code and a.user_code = c.user_code ".
//                     "and c.user_level = d.user_level_value and $condition ".
//                     "order by c.user_level desc " ;
//                 break ;
//         }

//         $data = M() -> query($sql) ;

//         //  echo json_encode($data) ;
//         if(count($data) > 0){
//             $this -> ajaxReturn($data, 'success:api_search_main', 1, 'json') ;
//         }else{
//             $this -> ajaxReturn(0, 'failed:api_search_main', 0);
//         }
//     }
//    /*
//     * @Name   : get_server_url
//     * @Desc   : 动态生成服务器URL地址
//     * @Param  : string  $name  用于动态生成URL的字符串入参
//     * @Return : string  $url   生成的URL地址
//     */
//     public function get_server_url(){
//         $name = $_POST['name'] ;
//         if($name){
//             $this -> ajaxReturn(U($name), "success:api_get_server_url", 1) ;
//         }else{
//             $this -> ajaxReturn(0, "failed:api_get_server_url", 0) ;
//         }
//     }

// /**************************************** 测试接口 ****************************************/

   /*
    * @Name   : 接口名称
    * @Desc   : 接口描述
    * @Param  : array  $array  入参
    * @Return : array  $array  出参
    */
    public function test(){

    $survey_code = 10000011 ;    

    $stats['question_count'] = $stats['qt_cnt_xz'] = $stats['qt_cnt_zg'] = $stats['qt_cnt_pf'] = 0 ;

    $tbBasQuestionInfo = M(TB_BAS_QUESTION_INFO) -> getTableName() ;

    $sql = "select survey_code, question_class, count(question_code) count from $tbBasQuestionInfo
            where survey_code = $survey_code group by survey_code, question_class" ;
    $question = M() -> query($sql) ;

    for($i = 0; $i < count($question); $i++){
        switch(intval($question[$i]['question_class'])){
            case 1 :
                $stats['qt_cnt_xz'] += $question[$i]['count'] ;
                break ;

            case 2 :
                $stats['qt_cnt_zg'] += $question[$i]['count'] ;
                break ;

            case 3 :
                $stats['qt_cnt_pf'] += $question[$i]['count'] ;
                break ;
        }

        $stats['question_count'] += $question[$i]['count'] ;
    }

    // if($question){
    //     for($i = 0; $i < count($question); $i++){
    //         $type_num = $question[$i]['question_type'] . '_num' ;
    //         $qt_statist["$type_num"] = $question[$i]['count'] ;
    //     } ;

    //     $qt_statist['question_num'] = $qt_statist['radio_num'] + $qt_statist['checkbox_num'] + $qt_statist['textarea_num'] ;        
    // } ;

    dump($stats)  ;


    }   
}

?>
