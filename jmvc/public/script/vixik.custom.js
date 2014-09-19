/*
 * vixik.custom.js
 * VixiK自定义统一JS脚本
 *
 * @create-date  2012-08-08
 * @version      1.0.00
 * @author       cao.zhiyun
 * @copyright    VixiK
 */


/* 定义全局变量
 * ---------------------------------------- */
  __YYY__ = 'ABC' ;

/* ---------------------------------------- */

//获取当前日期
function currDate(){
    var d=new Date() , str='' ;
    var Year=d.getFullYear() ;
    var Month=d.getMonth() + 1 ;
    var Day=d.getDate() ;

    str+=Year+'-'+Month+'-'+Day ;
    return str ;
}
//获取当前时间
function currTime(){
    var d=new Date() , str='' ;
    var Hours=d.getHours() ;
    var Min=d.getMinutes() ;
    var Sec=d.getSeconds() ;

    str+=Hours+':'+Min+':'+Sec ;
    return str ;
}
//获取当前日期时间
function currDateTime(){
    var timestamp='' ;

    timestamp+=currDate() ;
    timestamp+=' '+currTime() ;
    return timestamp ;
}
