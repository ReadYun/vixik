<?php

/**
 * name         File_name
 * type         Class|Interface|Function
 * description  File_desc
 *
 * @params     parm1/parm2/..
 * @return     var1/var2/..
 *
 * @version    1.0.00
 * @author     cao.zhiyun
 *
 * create-date  2012-01-01
 * mender       Null
 * modify-date  Null
 * modify-desc  Null
 * copyright    VixiK
 */
header("Content-type:text/html;charset=utf-8");

class LabAction extends Action{
    public function index(){

        $user_code = cookie('user_code') ;
        // dump($_COOKIE) ;
        // dump($cookie('user_code')) ;
        cookie('ck1','ck11',3600);
        cookie('ck2','ck22',3600);

        $AreaProvince  = M(TB_DET_AREA_PROVINCE ) -> select() ;  //省级地域
        $this -> assign('province',  $AreaProvince ) ;
        
        $this->display() ;
    }

    public function vkdata(){
        $this->display() ;
    }

    public function vkform(){
        $survey_type  = M(TB_DET_SURVEY_TYPE)   -> select() ;
        $survey_class = M(TB_DET_SURVEY_CLASS)  -> select() ;
        $province     = M(TB_DET_AREA_PROVINCE) -> select() ;
        $career       = M(TB_DET_USER_CAREER)   -> select() ;
        $edu          = M(TB_DET_USER_EDU)      -> select() ;
        $level        = M(TB_DET_USER_LEVEL)    -> select() ;

        $this -> assign('survey_code',  $survey_code) ;
        $this -> assign('survey_type',  $survey_type) ;
        $this -> assign('survey_class', $survey_class) ;
        $this -> assign('province',     $province) ;
        $this -> assign('career',       $career) ;
        $this -> assign('edu',          $edu) ;
        $this -> assign('level',        $level) ;
        
        $this->display() ;
    }

    public function vkpaging(){
        $this->display() ;
    }

    public function vkchart(){
        $this->display() ;
    }

    public function vktest(){
        $this->display() ;
    }
}
?>
