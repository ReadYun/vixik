
/**
 * Name        : index.js
 * Description : File_desc
 *
 * Create-time : 2012-8-13, 4:18:17
 * Author      : ReadYun
 * Copyright   : VixiK
 * Version     : 1.0.00
 */

$(function(){ 
    $('#surveyMenu').click(function(){
        $('#boxMain>div').hide() ;
        $('#surveyBox').show() ;
        $('#created').show().tabs({event:'mouseover'}) ;
    }) ;
    $('#rewardMenu').click(function(){
        $('#boxMain>div').hide() ;
        $('#rewardBox').show() ;
    }) ;
    $('#collectMenu').click(function(){
        $('#boxMain>div').hide() ;
        $('#collectBox').show() ;
    }) ;
}) ;