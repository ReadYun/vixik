/**
 * Name        : test.index.js
 * Description : js for Public/mainsearch.html
 *
 * Create-time : 2012-8-14 18:14:09
 * Author      : ReadYun
 * Copyright   : VixiK
 * Version     : 1.0.00
 */

steal('init.js')
.then(function($){
    loadPlugin('iCheck', 'vkForm', 'vkPaging', 'vkData', 'bsDatetimepicker') ;
}) 
.then(function($){

    $('.form_datetime').datetimepicker({
        language:  'zh-CN',
        weekStart: 1,
        todayBtn:  1,
		autoclose: 1,
		todayHighlight: 1,
		startView: 2,
		forceParse: 0,
        showMeridian: 1
    });

	var data$     = $.vkData('array_create_seq', {start:1, length:100}) ;
	var view_list = __JMVC_VIEW__ + 'test.ejs' ;
	var view_nav  = __JMVC_VIEW__ + 'vpaging.nav.ejs' ;
	var $textt    = $('#textt') ;

	console.log($textt) ;
	console.log($textt[0]) ;

	$('#pop').popover({
        title   : '123123',
        // html    : true,
        // content : $textt,
        content : 'aaaaa',
	}) ;

	$('#submit').click(function(){
		console.log($textt.find('textarea').val()) ;
	}) ;

	// $('#pop').click(function(){
	// 	this.popover('show') ;
	// }) ;

	$('#Paging').vkPaging({
		data$    : data$,
		$pagBody : $('#pagBody'),
		$pagNav  : $('#pagNav'),
		num_list : 5,
		num_nav  : 8,
		view_list : view_list,
		// view_nav  : view_nav,
	}) ;

	$('#txt').click(function(){
		var val = $('#text1').val() ;
		console.log(val) ;
		$('#text2').attr('value', val) ;
		console.log(val.split('\n')) ;
	}) ;

	$('#add').click(function(){

		var data$ = $.vkData('array_create_seq', {start:100, length:500}) ;

		$('#Paging').vkPaging({
			data$    : data$,
			$pagBody : $('#pagBody'),
			$pagNav  : $('#pagNav'),
			num_list : 5,
			num_nav  : 8,
			view_list : view_list,
			// view_nav  : view_nav,
		}) ;
	}) ;

	// $('#Paging').vkPaging('list', 3) ;

    // $('#ctrl1').append(
    //     $view,
    //     {data: data$}
    // ) ;

    // $.Controller('Test.Index', {
    //     defaults : {
    //     }
    // }, {
    //     init : function(){
    //     },
    // }) ;

    // $('#ctrl1').vkPaging({a:1, b:2}) ;


    // $('#add').click(function(){
    // 	var $ctrl1 = $('#ctrl1') ;
    // 	var $tmp = $("<div class='test_index' style='display:none'></div>").attr('id', 'tmp') ;

    // 	$ctrl1.append($tmp) ;

	   //  $tmp.test_index({}) ;
	   //  $('#ctrl1').test_index({
	   //  }) ;
	   //  $('#ctrl2').test_index({
	   //  }) ;
    // }) ;

    // $('#del').click(function(){
	   //  $('#tmp').remove() ;
    // }) ;



	// console.log($('#vkForm').vkForm('getValue1', {
 //                get_type    : 1,
 //                key_list    : ['question_code', 'question_type', 'question_seq'],
 //                alias_name  : 'question_code',
 //                alias_value : 'option$'
 //            })) ;
	// console.log($('#vkForm').vkForm('getValue1', {
 //                get_type    : 2,
 //                key_list    : ['question_code', 'question_type', 'question_seq'],
 //                alias_name  : 'question_code',
 //                alias_value : 'option$'
 //            })) ;
	// console.log($('#vkForm').vkForm('getValue1', {
 //                get_type    : 3,
 //                key_list    : ['question_code', 'question_type', 'question_seq'],
 //                alias_name  : 'question_code',
 //                alias_value : 'option$'
 //            })) ;
	// console.dir($('#vkForm').vkForm('getValue1', {
 //                get_type    : 4,
 //                key_list    : ['question_code', 'question_type', 'question_seq'],
 //                alias_name  : 'question_code',
 //                alias_value : 'option$'
 //            })) ;
	// console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^') ;
	// console.log($('#vkForm').vkForm('getValue')) ;
	// console.log($('#vkForm').vkForm('getValue', {
 //                get_type    : 1,
 //                check_null  : 1,
 //            })) ;
	// console.dir($('#vkForm').vkForm('getValue', {
 //                get_type    : 2,
 //                // get_null    : false,
 //                key_list    : ['question_code', 'question_type', 'question_seq'],
 //                alias_name  : 'vkform_name1',
 //                alias_value : 'option$',
 //            })) ;
}) ;
