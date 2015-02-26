<?php

/*
 * name         index.php
 * type         php_file
 * description  ThinkPHP架构入口文件
 * create-date  2012-06-03
 * version      1.0.00
 * author       Yun
 * mender       Null
 * modify-date  Null
 * modify-desc  Null
 * copyright    VixiK
 *
 */

header("Content-type:text/html;charset=utf-8");

define('THINK_PATH' ,'./system/') ;  // 定义框架路径
define('APP_NAME'   ,'app'      ) ;  // 定义项目名称
define('APP_PATH'   ,'./app/'   ) ;  // 定义项目路径
define('APP_DEBUG'  ,true       ) ;  // 开启调试模式

// 项目常量定义
// define('ROOT'       ,'http://readyun.gicp.net') ;  // 定义网站根路径（花生壳）
define('ROOT'       ,'./'              ) ;  // 定义网站根路径（本地）
define('VIXIK'      ,ROOT.'vixik/'     ) ;  // 系统核心类库目录
define('VK_JMVC'    ,VIXIK.'jmvc/'     ) ;  // VixiK前端管理JMVC目录
define('VK_PUBLIC'  ,VK_JMVC.'public/' ) ;  // VixiK公共目录
define('VK_PUB_IMG' ,VK_PUBLIC.'image/') ;  // VixiK公共图片目录

// 基础表常量定义
define('TB_BAS_USER_INFO'                        ,'BasUserInfo'                    ) ;  // 用户基本信息
define('TB_BAS_USER_EXTEND_INFO'                 ,'BasUserExtendInfo'              ) ;  // 用户扩展信息
define('TB_BAS_USER_ACCOUT'                      ,'BasUserAccout'                  ) ;  // 用户账户信息
define('TB_BAS_USER_INTEREST'                    ,'BasUserInterest'                ) ;  // 用户兴趣信息
define('TB_BAS_USER_ACTION_LOG'                  ,'BasUserActionLog'               ) ;  // 用户行为日志表
define('TB_BAS_USER_FOLLOW_USER'                 ,'BasUserFollowUser'              ) ;  // 用户关注用户信息
define('TB_BAS_USER_FOLLOW_SURVEY'               ,'BasUserFollowSurvey'            ) ;  // 用户关注调查信息
define('TB_BAS_USER_FOLLOW_SVPROP'               ,'BasUserFollowSvprop'            ) ;  // 用户关注调查属性
define('TB_BAS_USER_SHARE_SURVEY'                ,'BasUserShareSurvey'             ) ;  // 用户分享调查信息
define('TB_BAS_SURVEY_INFO'                      ,'BasSurveyInfo'                  ) ;  // 调查基本信息
define('TB_BAS_TAG_INFO'                         ,'BasTagInfo'                     ) ;  // 调查标签信息
define('TB_BAS_SURVEY_RECOMMEND'                 ,'BasSurveyRecommend'             ) ;  // 调查推荐信息
define('TB_BAS_SURVEY_RECOMMEND_RULE'            ,'BasSurveyRecommendRule'         ) ;  // 调查推荐规则
define('TB_BAS_SURVEY_RECOMMEND_USER'            ,'BasSurveyRecommendUser'         ) ;  // 调查推荐用户清单
define('TB_BAS_SURVEY_ACTION'                    ,'BasSurveyAction'                ) ;  // 调查参与详情
define('TB_BAS_QUESTION_INFO'                    ,'BasQuestionInfo'                ) ;  // 调查问题详情
define('TB_BAS_QUESTION_OPTION'                  ,'BasQuestionOption'              ) ;  // 问题选项清单
define('TB_BAS_QUESTION_ACTION'                  ,'BasQuestionAction'              ) ;  // 调查答题详情
define('TB_BAS_SURVEY_COMMENT'                   ,'BasSurveyComment'               ) ;  // 调查评论详情
define('TB_BAS_REWARD'                           ,'BasReward'                      ) ;  // 奖励信息
define('TB_BAS_PROP_DET_RELATION'                ,'BasPropDetRelation'             ) ;  // 基础表属性和维表关系对应表

// 维表常量定义
define('TB_DET_USER_PROP'                        ,'DetUserProp'                    ) ;  // 用户属性配置表
define('TB_DET_USER_TYPE'                        ,'DetUserType'                    ) ;  // 用户类型维表
define('TB_DET_USER_SEX'                         ,'DetUserSex'                     ) ;  // 用户性别维表
define('TB_DET_USER_AGE'                         ,'DetUserAge'                     ) ;  // 用户年龄维表
define('TB_DET_USER_CAREER'                      ,'DetUserCareer'                  ) ;  // 用户职业维表
define('TB_DET_INDUSTRY_CLASS'                   ,'DetIndustryClass'               ) ;  // 行业大类维表
define('TB_DET_INDUSTRY_CLASS_SUB'               ,'DetIndustryClassSub'            ) ;  // 行业小类维表
define('TB_DET_USER_EDU'                         ,'DetUserEdu'                     ) ;  // 用户学历维表
define('TB_DET_USER_INCOME'                      ,'DetUserIncome'                  ) ;  // 用户收入分类维表
define('TB_DET_USER_INCOME_SECTION'              ,'DetUserIncomeSection'           ) ;  // 用户收入区间维表
define('TB_DET_USER_CHARACTER'                   ,'DetUserCharacter'               ) ;  // 用户性格类型维表
define('TB_DET_USER_AFFECTION'                   ,'DetUserAffection'               ) ;  // 用户感情状态维表
define('TB_DET_USER_STATURE'                     ,'DetUserStature'                 ) ;  // 用户身材类型维表
define('TB_DET_USER_HOBBY'                       ,'DetUserHobby'                   ) ;  // 用户性格类型维表
define('TB_DET_AREA_PROVINCE'                    ,'DetAreaProvince'                ) ;  // 省级地域维表
define('TB_DET_AREA_CITY'                        ,'DetAreaCity'                    ) ;  // 城市地域维表
define('TB_DET_AREA_MAP'                         ,'DetAreaMap'                     ) ;  // 城市地域总维表
define('TB_DET_SURVEY_TYPE'                      ,'DetSurveyType'                  ) ;  // 调查类型
define('TB_DET_SURVEY_TYPE_SUB'                  ,'DetSurveyTypeSub'               ) ;  // 调查子类型
define('TB_DET_SURVEY_CLASS'                     ,'DetSurveyClass'                 ) ;  // 调查大类
define('TB_DET_SURVEY_CLASS_SUB'                 ,'DetSurveyClassSub'              ) ;  // 调查小类
define('TB_DET_SURVEY_TRADE'                     ,'DetSurveyTrade'                 ) ;  // 调查行业分类
define('TB_DET_SURVEY_STATE'                     ,'DetSurveyState'                 ) ;  // 调查类型维表
define('TB_DET_SURVEY_RECOMM_TYPE'               ,'DetSurveyRecommType'            ) ;  // 调查推荐类型
define('TB_DET_QUESTION_CLASS'                   ,'DetQuestionClass'               ) ;  // 问题类型
define('TB_DET_QUESTION_PROP'                    ,'DetQuestionProp'                ) ;  // 问题属性
define('TB_DET_REWARD_TYPE'                      ,'DetRewardType'                  ) ;  // 奖励类型
define('TB_DET_RECOMMEND_USER_STATE'             ,'DetRecommendUserState'          ) ;  // 调查推荐用户状态
define('TB_DET_SURVEY_RECOMMEND_STATE'           ,'DetSurveyRecommendState'        ) ;  // 调查推荐规则状态
define('TB_DET_SURVEY_RECOMMEND_TYPE'            ,'DetSurveyRecommendType'         ) ;  // 调查推荐类型
define('TB_DET_QUESTION_CLASS_TYPE'              ,'DetQuestionClassType'           ) ;  // 题目类型
define('TB_DET_USER_LEVEL'                       ,'DetUserLevel'                   ) ;  // 用户等级
define('TB_DET_USER_LEVEL_RIGHT'                 ,'DetUserLevelRight'              ) ;  // 用户等级权限
define('TB_DET_USER_ACTION_RIGHT'                ,'DetUseActionRight'              ) ;  // 用户行为权限
define('TB_DET_SCORE_ADD_RULE'                   ,'DetScoreAddRule'                ) ;  // 积分累计规则表
define('TB_DET_COINS_ACTION_RULE'                ,'DetCoinsActionRule'             ) ;  // 金币使用规则表
define('TB_DET_USER_ACTION_TYPE'                 ,'DetUserActionType'              ) ;  // 积分金币行为类型表
define('TB_DET_USER_ACTION_CONFIG'               ,'DetUserActionConfig'            ) ;  // 用户行为配置表
define('TB_DET_USER_TYPE_SURVEY_RECOMM_RELATION' ,'DetUserTypeSurveyRecommRelation') ;  // 用户类型与创建调查推荐等级关系表

// 接口表常量定义
define('TB_API_PARAM_CHECK_CONFIG'               ,'apiParamCheckConfig'            ) ;  // 接口参数校验规则
define('TB_SYS_PAGE_PATH_CONFIG'                 ,'sysPagePathConfig'              ) ;  // 页面路径信息配置

// 加载框架入口文件
require ('./system/ThinkPHP.php') ;

?>
