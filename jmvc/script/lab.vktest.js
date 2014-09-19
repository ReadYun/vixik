/**
 * Name        : lab.vktest.js
 * Description : js for lab/vktest.html
 *
 * Create-time : 2012-8-14 18:14:09
 * Author      : ReadYun
 * Copyright   : VixiK
 * Version     : 1.0.00
 */

steal('init.js')
.then(function($){
    loadPlugin('vkData', 'vkForm') ;
}) 
.then(function($){
	console.log('lab.vktest.js') ;

	$('button').on('click.button', function(){
		console.log(this) ;
		console.log('---------------') ;
	}) ;

	$(document).on('click.document', function(){
		console.log('click.document') ;
		console.log(this) ;
	}) ;

	$('#vktest1').on('click.vktest1', function(){
		console.log('click.vktest1') ;
		console.log(this) ;
	}) ;

	$('#vktest2').on('click.vktest2', function(e){
		// e.stopPropagation() ;
		$('#vktest1').trigger('click.vktest1') ;
	}) ;

}) ;
