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

    $json=file_get_contents("php://input") ;
    $json_en=json_encode($json) ;
    $json_de=json_decode($json) ;
    //echo json_decode(json_encode($json)) ;
    echo $json ;
?>
