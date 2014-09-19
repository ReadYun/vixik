
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
	var $reset = $('#reset') ;
	var $replace = $('#replace') ;
	var $btn3 = $('#test3') ;
	var $form = $('#Main').vkForm() ;
	var data$ ;

	// $form.vkForm('reset') ;
	$reset.click(function(){
		$('#Main').vkForm('reset', {name$:['hobby', 'birth'], selectVal:7}) ;
	}) ;

	// $form.vkForm('replace') ;
	$replace.click(function(){
		console.log('replace') ;
		$('.vf-checkbox').vkForm('replace', {data$:[{val:1,tag:'你好'}, {val:3,tag:'阿的江阿凡达'}, {val:7,tag:'哈哈'}]}) ;
	}) ;

});

