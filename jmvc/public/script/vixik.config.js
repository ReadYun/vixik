/*
 * vixik.config.js
 * VixiK前台配置脚本
 *
 * @create-date  2012-09-25
 * @version      1.0.00
 * @author       cao.zhiyun
 * @copyright    VixiK
 */

// 服务器路径配置
__SRV_ROOT__   = '/vixik/'  ;// 服务器根路径


// 网站URL路径配置
__URL_ROOT__   = __SRV_ROOT__ + 'index.php/'  ;// 网站根路径
__URL_INDEX__  = __URL_ROOT__ + 'index/'      ;// 门户模块路径
__URL_USER__   = __URL_ROOT__ + 'user/'       ;// 用户模块路径
__URL_SURVEY__ = __URL_ROOT__ + 'survey/'     ;// 调查模块路径
__URL_SEARCH__ = __URL_ROOT__ + 'search/'     ;// 搜索模块路径
__URL_API__    = __URL_ROOT__ + 'api/'        ;// 接口模块路径
__URL_ADMIN__  = __URL_ROOT__ + 'admin/'      ;// 管理员模块路径


// JMVC路径配置
__JMVC_ROOT__   = __SRV_ROOT__    + 'jmvc/'    ;// JMVC根路径
__JMVC_VIEW__   = __JMVC_ROOT__   + 'view/'    ;// JMVC模板路径
__JMVC_PUBLIC__ = __JMVC_ROOT__   + 'public/'  ;// JMVC项目公共文件路径
__JMVC_PLUGIN__ = __JMVC_PUBLIC__ + 'plugin/'  ;// JMVC项目插件路径
__JMVC_LIB__    = __JMVC_PUBLIC__ + 'lib/'     ;// JMVC项目功能库路径
__JMVC_IMG__    = __JMVC_PUBLIC__ + 'image/'   ;// JMVC项目功能库路径


// 接口定义
__API__             = __URL_API__ + 'api'          ;// 新定义的总接口（其他接口准备下线）
__API_USER_VERIFY__ = __URL_API__ + 'user_verify'  ;// 用户验证接口





__API_SURVEY_CREATE__          = __URL_API__ + 'survey_create'	         ;// 新建调查接口
__API_SURVEY_INFO_SELECT__     = __URL_API__ + 'survey_info_select'	     ;// 调查完整信息查询接口
__API_SURVEY_INFO_BASE_FIND__  = __URL_API__ + 'survey_info_base_find'   ;// 调查基本信息查询接口
__API_SURVEY_INFO_UPDATE__     = __URL_API__ + 'survey_info_update'	     ;// 调查信息修改接口
__API_SURVEY_ACTION_SELECT__   = __URL_API__ + 'survey_action_select'    ;// 调查参与信息查询接口
__API_SURVEY_ANSWER_SUBMIT__   = __URL_API__ + 'survey_answer_submit'	 ;// 调查参与答题结果提交接口
__API_SURVEY_CREATED_SELECT__  = __URL_API__ + 'survey_created_select'   ;// 用户已创建调查查询接口
__API_SURVEY_RECOMM_CREATE__   = __URL_API__ + 'survey_recomm_create'    ;// 调查推荐规则处理接口
__API_SURVEY_CUSTOM_OPTION__   = __URL_API__ + 'survey_custom_option'	 ;// 自定义选项增加接口

__API_USER_CREATE__            = __URL_API__ + 'user_create'	         ;// 新建用户接口
__API_USER_COUNT__             = __URL_API__ + 'user_count'	             ;// 用户数统计汇总接口
__API_USER_INFO_FIND__         = __URL_API__ + 'user_info_find'	         ;// 用户信息查询接口
__API_USER_INFO_UPDATE__       = __URL_API__ + 'user_info_update'	     ;// 用户基本信息更新接口
__API_USER_ACCOUT_FIND__       = __URL_API__ + 'user_accout_find'	     ;// 用户账户信息查询接口
__API_USER_ACCOUT_UPDATE__     = __URL_API__ + 'user_accout_update'	     ;// 用户账户信息更新接口
__API_USER_ACTION_CFG_SELECT__ = __URL_API__ + 'user_action_cfg_select'	 ;// 用户行为配置规则查询接口
__API_USER_ACTION_LOG_SELECT__ = __URL_API__ + 'user_action_log_select'  ;// 用户行为日志查询接口
__API_USER_VERIFY__            = __URL_API__ + 'user_verify'     	     ;// 用户验证接口
__API_USER_INFO_VERIFY__       = __URL_API__ + 'user_info_verify'	     ;// 用户信息验证接口
__API_USER_LOGIN_VERIFY__      = __URL_API__ + 'user_login_verify'	     ;// 用户登录验证接口
__API_USER_INFO_COMPLETE__     = __URL_API__ + 'user_info_complete'	     ;// 用户资料完整度查询接口
__API_USER_FOLLOW_QUERY__      = __URL_API__ + 'user_follow_query'	     ;// 用户关注与收藏信息查询接口
__API_USER_FOLLOW_UPDATE__     = __URL_API__ + 'user_follow_update'      ;// 用户关注与收藏信息更新接口

__API_STATS_SV_ACTION_CNT__    = __URL_API__ + 'stats_sv_action_cnt'	 ;// 调查参与情况统计接口
__API_STATS_SV_GROUP_CNT__     = __URL_API__ + 'stats_sv_group_cnt'  	 ;// 调查参与情况分组统计接口
__API_STATS_QT_GROUP_CNT__     = __URL_API__ + 'stats_qt_group_cnt'  	 ;// 调查答题情况分组统计接口

__API_SEARCH__                 = __URL_API__ + 'search'	 		         ;// 搜索查询
__API_SEARCH_GO__              = __URL_API__ + 'search_go'	 		     ;// 搜索入口
__API_SEARCH_MAIN__            = __URL_API__ + 'search_main'	    	 ;// 主搜索接口（待废弃）
__API_UPLOAD_IMG__             = __URL_API__ + 'upload_img'	 		     ;// 图片上传接口
__API_CROP_IMG__               = __URL_API__ + 'crop_img'	        	 ;// 图片裁剪接口
__API_GET_SERVER_URL__         = __URL_API__ + 'get_server_url'	         ;// 获取服务器对应的行为URL

__API_DET_DATA_SELECT__        = __URL_API__ + 'det_data_select'	     ;// 维表数据查询接口
__API_AREA_CITY_SELECT__       = __URL_API__ + 'area_city_select'	     ;// 市级地域查询接口
__API_TEST__                   = __URL_API__ + 'test'	                 ;// 测试接口
