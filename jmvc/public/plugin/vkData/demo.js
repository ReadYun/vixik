
/**
 * Name        : vkForm.js
 * Description : VixiK表单插件
 *
 * Create-time : 2013-6-13, 4:18:17
 * Author      : ReadYun
 * Copyright   : VixiK
 * Version     : 1.0.00
 */

$(function(){
	var $form = $('#testForm') ;
	var $btn1 = $('#test1') ;
	var $btn2 = $('#test2') ;
	var $btn3 = $('#test3') ;
	var form$ = $form.vkForm() ;
	var data$ ;

	// $form.vkForm('reset') ;
	$btn1.click(function(){
		var option$ = {
			get_type    : '1',
			verify_null : true
		} ;
		data$ = $form.vkForm('getValue', option$) ;
		console.dir(data$) ;
	}) ;

	$btn2.click(function(){
		var option$ = {
			get_type    : '2',
			verify_null : true

		} ;
		data$ = $form.vkForm('getValue', option$) ;
		console.dir(data$) ;
	}) ;
	
	$btn3.click(function(){
		var option$ = {
			get_type    : '3',
			verify_null : true

		} ;
		data$ = $form.vkForm('getValue', option$) ;
		console.dir(data$) ;
	}) ;
	

});

