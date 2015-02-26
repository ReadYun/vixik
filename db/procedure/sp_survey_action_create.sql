drop procedure if exists sp_survey_action_create_random ;
create procedure sp_survey_action_create_random
(
  in   ii_survey_code  integer,
  in   ii_user_num     integer,
  out  oi_statuscode   integer
)
/**** ------------------------------ Header
    * @name       sp_survey_action_create_random
    * @caption    �����ݣ�������������Ϣ�������ɣ�������ݣ�
    * @describe   ��������������һ���������û������������
    *
    * ------------------------------ Params
    * @param_in   ii_survey_code  integer  �������
    * @param_in   ii_user_num     integer  Ҫ���ɵ��û�����
    * @param_out  oi_statuscode   integer  ���״̬
    *
    * ------------------------------ Tables
    * @tar_table  tb_bas_survey_action             Ŀ��������������
    * @tar_table  tb_bas_question_action           Ŀ��������������
    * @src_table  tb_bas_survey_action_build_user    Դ����������������û��嵥
    * @src_table  tb_bas_question_option             Դ��������Ŀѡ������
    * @src_table  tb_bas_survey_info                 Դ�����������Ϣ
    *
    * ------------------------------ Info
    * @version      1.0.000
    * @author       cao.zhiyun
    * @create-date  2015-1-22
    * @copyright    VixiK
    */

begin
    /** 
      * ����������
      * �����ܱ�����pi_pc_  �����ڲ�������vi_vc_
      */    
    declare pc_log_proc         varchar(100)         ;#��������
    declare pc_log_desc         varchar(100)         ;#������־����
    declare pc_log_para         varchar(32)          ;#����������
    declare pi_flag             integer default 0    ;#���̵��÷���ֵ
    declare pi_sqlcode          integer default 0    ;#����״̬����
    declare vi_cur_option       integer default 0    ;#�������α�cur_option��־λ
    declare vi_question_code    integer              ;#��������Ŀ����
    declare vc_question_class   varchar(8)           ;#��������Ŀ����
    declare vc_question_type    varchar(8)           ;#��������ĿС��
    declare vi_option_code      integer              ;#������ѡ�����
    declare vc_option_name      varchar(32)          ;#������ѡ������
    declare vi_option_seq       integer              ;#������ѡ�����
    declare vi_option_type      integer              ;#������ѡ������
    declare vi_option_value     integer              ;#������ѡ��ֵ
    declare vi_limit_a          integer              ;#������limit_a
    declare vi_limit_b          integer              ;#������limit_b
    declare vi_option_cnt       integer              ;#������ѡ�������
    declare vi_user_rate        integer              ;#������ѡ�������
    
    /** 
      * �α궨�壺
      * �ӵ�ѡ��͵��������⿪ʼ��ѡ��ѡ������һ����Ŀ�������¶�Ӧ��ѡ����Ϊ�α�Ŀ��
      */    
    declare cur_option cursor for 
    select 
        question_code   ,#��Ŀ����
        question_class  ,#��Ŀ����
        question_type   ,#��ĿС��
        option_code     ,#ѡ�����
        option_name     ,#ѡ������
        option_seq      ,#ѡ�����
        option_type     ,#ѡ������
        option_value     #ѡ��ֵ
    from tb_bas_question_option x1 where exists(
        select question_code from (
            select question_code, count(1) count 
            from tb_bas_question_option
            where survey_code = ii_survey_code 
            and option_state = 1 and question_type in('11', '31')
            group by question_code 
            order by count desc limit 1) x2
        where x1.question_code = x2.question_code) 
    order by rand() ;
    
    /** �α���ɺ��־λ�������� **/
    declare continue handler for not found set vi_cur_option = 1 ;
    
    /** �����쳣�������� **/
    declare exit handler for sqlexception,sqlwarning
    
    /** ������ʼ�� **/
    set oi_statuscode = pi_sqlcode                       ;#״̬����ֵ
    set pc_log_para   = ii_survey_code                   ;#������Ҫ����������д��־��
    set vi_limit_a    = ii_user_num                      ;#limit����	
    set pc_log_proc   = 'sp_survey_action_create_random' ;#��������

    /**
      * description Ŀ���˵��
      *
    ##�����������
	  create table tb_bas_survey_action
	  (
	      survey_code         integer       ,#�������
	      user_code           integer       ,#�����û�����
	      start_time          datetime      ,#���ʼʱ��
	      end_time            datetime      ,#������ʱ��
	      use_times           integer       ,#���⻨��ʱ�䣨�룩
	      get_coins           integer       ,#�õ����
	      get_score           integer       ,#�õ�����
	      reward_type_code    varchar(8)    ,#��������
	      reward_is_use       integer        #�����Ƿ�ʹ�ã�0:δʹ�ã�1:��ʹ�ã�
	  ) ;
      
    ##������Ŀ��������
	  create table tb_bas_question_action
	  (
  	  	user_code        integer         ,#�����û�����
  	  	survey_code      integer         ,#�������
  	  	question_code    integer         ,#��Ŀ����
  	  	question_type    varchar(8)      ,#��Ŀ���ͣ�ͬ�������ͣ�
  	  	question_seq     integer         ,#��Ŀ���
        option_code      integer         ,#ѡ�����
  	  	option_name      varchar(256)    ,#ѡ��ѡ������
  	  	option_seq       integer         ,#ѡ�����
  	  	option_type      integer         ,#ѡ�����ͣ�0:��ѡ�1:��ͨѡ�2:�Զ���ѡ�
  	  	option_value     integer          #ѡ��ֵ
	  ) ;
    **/
      
    ##��ʱ������ѡ��Ŀ����������ʱ��ת
	  drop table if exists tb_tmp_question_action ;
	  create temporary table tb_tmp_question_action
	  (
        user_code        integer         ,#�����û�����
        survey_code      integer         ,#�������
        question_code    integer         ,#��Ŀ����
        question_class   varchar(8)      ,#��Ŀ����
        question_type    varchar(8)      ,#��ĿС��
        question_seq     integer         ,#��Ŀ���
        option_code      integer         ,#ѡ�����
        option_name      varchar(256)    ,#ѡ��ѡ������
        option_seq       integer         ,#ѡ�����
        option_type      integer         ,#ѡ������
        option_value     integer          #ѡ��ֵ
	  ) ;
	  create index idx_tb_tmp_question_action__user_code on tb_tmp_question_action(user_code) ;
	  
    ##��ʱ����ʱ�洢user_code
	  drop table if exists tb_tmp_user_list ;
	  create temporary table tb_tmp_user_list
	  (
        user_code        integer         #�����û�����
	  ) ;
	  create index idx_tb_tmp_user_list__user_code on tb_tmp_user_list(user_code) ;

    set  pc_log_desc = '0.0. ��ʼ' ;
    call sp_proc_write_log(pc_log_proc, pc_log_desc, pc_log_para, pi_flag) ;
    if pi_flag != 0 then set oi_statuscode = pi_flag ;
    end if;

    set  pc_log_desc = '0.1. ���ܴ���' ;
    call sp_proc_write_log(pc_log_proc, pc_log_desc, pc_log_para, pi_flag) ;
    if pi_flag != 0 then set oi_statuscode = pi_flag ;
    end if;

    ##ɾ������������������
    if exists (
        select * from tb_bas_survey_action where survey_code = ii_survey_code limit 1)
    then
        delete from tb_bas_survey_action where survey_code = ii_survey_code ;
    end if;
    
    ##ɾ����Ŀ�������������
    if exists (
        select * from tb_bas_question_action where survey_code = ii_survey_code limit 1)
    then
        delete from tb_bas_question_action where survey_code = ii_survey_code ;
    end if;

    set  pc_log_desc = '1.0. ��ѡ�������������' ;
    call sp_proc_write_log(pc_log_proc, pc_log_desc, pc_log_para, pi_flag) ;
    if pi_flag != 0 then set oi_statuscode = pi_flag ;
    end if;
        
    set  pc_log_desc = '1.1. ��ѡ�����α�' ;
    call sp_proc_write_log(pc_log_proc, pc_log_desc, pc_log_para, pi_flag) ;
    if pi_flag != 0 then set oi_statuscode = pi_flag ;
    end if;

    open cur_option ;
    
    loop_cur: loop
    
        /** ȡ�α굱ǰ���ݸ����� **/
        fetch cur_option into
            vi_question_code    ,#��������Ŀ����
            vc_question_class   ,#��������Ŀ����
            vc_question_type    ,#��������ĿС��
            vi_option_code      ,#������ѡ�����
            vc_option_name      ,#������ѡ������
            vi_option_seq       ,#������ѡ�����
            vi_option_type      ,#������ѡ��С��
            vi_option_value      #������ѡ��ֵ
		    ;
		
        /** 
          * ��ȡĿ���û�������
          * ��ʣ���û����а��������ȡһ������ΪҪ��ȡ���û���������α��Ѿ����ף���ʣ����û���ȫ�������һ�ε�ѡ��
          *
          */
        if vi_cur_option 
        then 
            set vi_limit_b = vi_limit_a ;
        else 
            select ceil(rand()*vi_limit_a) into vi_limit_b ;
        end if ;
    
        /** �α�ָ����ѡ���֮ǰ����õ��û��������ѿ�����ƥ���������ݲ���Ŀ�����Ŀ��������� **/
        insert into tb_bas_question_action
        (
            user_code        ,#�����û�����
            survey_code      ,#�������
            question_code    ,#��Ŀ����
            question_class   ,#��Ŀ����
            question_type    ,#��ĿС��
            option_code      ,#ѡ�����
            option_name      ,#ѡ������
            option_seq       ,#ѡ�����
            option_type      ,#ѡ������
            option_value      #ѡ��ֵ
        )
        select 
            user_code          ,#�����û�����
            ii_survey_code     ,#�������
            vi_question_code   ,#��Ŀ����
            vc_question_class  ,#��Ŀ����
            vc_question_type   ,#��ĿС��
            vi_option_code     ,#ѡ�����
            vc_option_name     ,#ѡ������
            vi_option_seq      ,#ѡ�����
            vi_option_type     ,#ѡ������
            vi_option_value     #ѡ��ֵ
        from tb_bas_survey_action_build_user 
        where user_code not in (
            select user_code from tb_bas_question_action where survey_code = ii_survey_code)
        order by rand() limit vi_limit_b ;
        
        /** ���¼���ʣ���Ŀ���û��� **/ 
        select ii_user_num - count(distinct user_code) into vi_limit_a
        from tb_bas_question_action where survey_code = ii_survey_code ;
        
        /** �Ե�ǰƥ�����µĵ�ѡ��Ŀѡ�� **/
        insert into tb_bas_question_action
        (
            user_code        ,#�����û�����
            survey_code      ,#�������
            question_code    ,#��Ŀ����
            question_class   ,#��Ŀ����
            question_type    ,#��ĿС��
            option_code      ,#ѡ�����
            option_name      ,#ѡ������
            option_seq       ,#ѡ�����
            option_type      ,#ѡ������
            option_value      #ѡ��ֵ
        )
        select 
            x1.user_code       ,#�����û�����
            x2.survey_code     ,#�������
            x2.question_code   ,#��Ŀ����
            x2.question_class  ,#��Ŀ����
            x2.question_type   ,#��ĿС��
            x2.option_code     ,#ѡ�����
            x2.option_name     ,#ѡ������
            x2.option_seq      ,#ѡ�����
            x2.option_type     ,#ѡ������
            x2.option_value     #ѡ��ֵ
        from (
            select user_code from tb_bas_question_action where option_code = vi_option_code) x1, (
            select * from (
               select * from tb_bas_question_option
               where survey_code = ii_survey_code
               and option_state = 1 and question_type in('11', '31') and question_code <> vi_question_code 
               order by rand()) a 
            group by question_code) x2 ;
		
		    /** ѭ���Ƿ�����ж�����־λ��Ч˵���Ѵ���no found���α��ѵ��ף� **/
        if vi_cur_option then leave loop_cur ;
        end if ;
    
    end loop ;

    set  pc_log_desc = '1.2. ��ѡ���ر��α�' ;
    call sp_proc_write_log(pc_log_proc, pc_log_desc, pc_log_para, pi_flag) ;
    if pi_flag != 0 then set oi_statuscode = pi_flag ;
    end if;

    close cur_option ;
    
    set  pc_log_desc = '2.0. ��ѡ�������������' ;
    call sp_proc_write_log(pc_log_proc, pc_log_desc, pc_log_para, pi_flag) ;
    if pi_flag != 0 then set oi_statuscode = pi_flag ;
    end if;
        
    select count(1)*2 into vi_option_cnt
    from tb_bas_question_option where question_code in (
        select question_code from (
            select question_code, count(1) count from tb_bas_question_option 
            where survey_code = ii_survey_code and question_type = '12'
            group by question_code order by count desc limit 1) a) ;
            
    loop_checkbox: loop
    	
    	select ceil(count(1)/vi_option_cnt) into vi_user_rate
    	from tb_bas_survey_action_build_user where survey_code = ii_survey_code ;
    	
        if vi_option_cnt
        then
            /** 
              * ����Ŀѡ����а���Ŀ�������ѡһѡ�����û��б����ѿ�����ƥ���������ݲ���Ŀ�����Ŀ���������
              * ��Ϊ���ܶ���ʱ���ѯ��ͬʱ�����²�����ERROR 1137 (HY000): Can't reopen table: 'tb_tmp_question_action'��
              * ���Էֲ�����
              * һ���㶨��䱣����δ���汾֧�ִ����������Ѫ����
              insert into tb_tmp_question_action
              (
                  user_code        ,#�����û�����
                  survey_code      ,#�������
                  question_code    ,#��Ŀ����
                  question_type    ,#��Ŀ����
                  option_code      ,#ѡ�����
                  option_name      ,#ѡ������
                  option_seq       ,#ѡ�����
                  option_type       #ѡ������
              )
              select 
                  x1.user_code       ,#�����û�����
                  x2.survey_code     ,#�������
                  x2.question_code   ,#��Ŀ����
                  x2.question_type   ,#��Ŀ����
                  x2.option_code     ,#ѡ�����
                  x2.option_name     ,#ѡ������
                  x2.option_seq      ,#ѡ�����
                  x2.option_type      #ѡ������
              from (
                  select user_code from tb_bas_survey_action_build_user a1
                  where survey_code = ii_survey_code and not exists(
                      select user_code from tb_tmp_question_action a2 
                      where a1.user_code = a2.user_code)
                  limit vi_user_rate) x1, (
                  select * from (
                      select * from tb_bas_question_option 
                      where survey_code = ii_survey_code and question_type = 'checkbox' and option_state = 1 
                      order by rand()) b1 group by question_code ) x2 ;
              *************************************************************/          
                    
            /** ��ȡĿ���û��ŵ���ʱ���� **/
            delete from tb_tmp_user_list ;
            insert into tb_tmp_user_list
            select user_code from tb_bas_survey_action_build_user a
            where survey_code = ii_survey_code and not exists(
                select user_code from tb_tmp_question_action b
                where a.user_code = b.user_code)
            limit vi_user_rate ;
            
            /** �ٻ������ݲ��뵽Ŀ����� **/
            insert into tb_tmp_question_action
            (
                user_code        ,#�����û�����
                survey_code      ,#�������
                question_code    ,#��Ŀ����
                question_class   ,#��Ŀ����
                question_type    ,#��ĿС��
                option_code      ,#ѡ�����
                option_name      ,#ѡ������
                option_seq       ,#ѡ�����
                option_type      ,#ѡ������
                option_value      #ѡ��ֵ
            )
            select 
                x1.user_code       ,#�����û�����
                x2.survey_code     ,#�������
                x2.question_code   ,#��Ŀ����
                x2.question_class  ,#��Ŀ����
                x2.question_type   ,#��ĿС��
                x2.option_code     ,#ѡ�����
                x2.option_name     ,#ѡ������
                x2.option_seq      ,#ѡ�����
                x2.option_type     ,#ѡ������
                x2.option_value     #ѡ��ֵ
            from (
                select user_code from tb_tmp_user_list) x1, (
                select * from (
                    select * from tb_bas_question_option 
                    where survey_code = ii_survey_code and question_type = '12' and option_state = 1 
                    order by rand()) a group by question_code ) x2 ;
            
            /** ��־λ������ **/ 
            set vi_option_cnt = vi_option_cnt - 1 ;
        else
            insert into tb_bas_question_action
            (
                user_code        ,#�����û�����
                survey_code      ,#�������
                question_code    ,#��Ŀ����
                question_class   ,#��Ŀ����
                question_type    ,#��ĿС��
                option_code      ,#ѡ�����
                option_name      ,#ѡ������
                option_seq       ,#ѡ�����
                option_type      ,#ѡ������
                option_value      #ѡ��ֵ
            )
            select distinct 
                user_code        ,#�����û�����
                survey_code      ,#�������
                question_code    ,#��Ŀ����
                question_class   ,#��Ŀ����
                question_type    ,#��ĿС��
                option_code      ,#ѡ�����
                option_name      ,#ѡ������
                option_seq       ,#ѡ�����
                option_type      ,#ѡ������
                option_value      #ѡ��ֵ
            from tb_tmp_question_action ;
            
            leave loop_checkbox ;
        end if ;        
        
    end loop ;
    
    set  pc_log_desc = '3.0. ���������������������' ;
    call sp_proc_write_log(pc_log_proc, pc_log_desc, pc_log_para, pi_flag) ;
    if pi_flag != 0 then set oi_statuscode = pi_flag ;
    end if;
    
    /** �������ݲ��뵽Ŀ����� **/
    insert into tb_bas_question_action
    (
        user_code        ,#�����û�����
        survey_code      ,#�������
        question_code    ,#��Ŀ����
        question_class   ,#��Ŀ����
        question_type    ,#��ĿС��
        option_code      ,#ѡ�����
        option_name      ,#ѡ������
        option_seq       ,#ѡ�����
        option_type      ,#ѡ������
        option_value      #ѡ��ֵ
    )
		select 
		    t1.user_code      ,#�����û�����
		    t2.survey_code    ,#�������    
		    t2.question_code  ,#��Ŀ����
		    t2.question_class ,#��Ŀ����
		    t2.question_type  ,#��ĿС��
		    t2.option_code    ,#ѡ�����    
		    t2.option_name    ,#ѡ������    
		    t2.option_seq     ,#ѡ�����    
		    t2.option_type    ,#ѡ������    
		    pf_low_value+round(rand()*(pf_high_value-pf_low_value)) abc #ѡ��ֵ      
		from (
		    select user_code from tb_bas_survey_action_build_user where survey_code = ii_survey_code) t1, (
		    select a.pf_low_value, a.pf_high_value, a.survey_code, a.question_code, a.question_class,
               a.question_type, b.option_code, b.option_name, b.option_seq, b.option_type
		    from tb_bas_question_info a
		    left outer join tb_bas_question_option b on a.question_code = b.question_code 
		    where a.survey_code = ii_survey_code and a.question_type = 32) t2 ;
      
    set  pc_log_desc = '4.0. ���������Ϣ����' ;
    call sp_proc_write_log(pc_log_proc, pc_log_desc, pc_log_para, pi_flag) ;
    if pi_flag != 0 then set oi_statuscode = pi_flag ;
    end if;
    
    set  pc_log_desc = '4.1. ������������Ϣ����' ;
    call sp_proc_write_log(pc_log_proc, pc_log_desc, pc_log_para, pi_flag) ;
    if pi_flag != 0 then set oi_statuscode = pi_flag ;
    end if;
    
	  insert into tb_bas_survey_action
	  (
	      survey_code    ,#�������
	      user_code      ,#�����û�����
	      start_time     ,#���ʼʱ��
	      use_times       #���⻨��ʱ�䣨�룩
	  )
	  select 
	      a.survey_code               ,#�������
	      a.user_code                 ,#�����û�����
	      date_add(b.start_time, interval ceil(20*rand()) day) ,#���ʼʱ��
	      ceil(200 + 300*rand())       #���⻨��ʱ�䣨�룩
    from tb_bas_survey_action_build_user a, (
        select * from tb_bas_survey_info where survey_code = ii_survey_code) b ;

    set  pc_log_desc = '4.2. ���²������ʱ��' ;
    call sp_proc_write_log(pc_log_proc, pc_log_desc, pc_log_para, pi_flag) ;
    if pi_flag != 0 then set oi_statuscode = pi_flag ;
    end if;
    
    update tb_bas_survey_action
    set end_time = date_add(start_time, interval use_times second)
    where survey_code = ii_survey_code ;
    
    set  pc_log_desc = '5. ����' ;
    call sp_proc_write_log(pc_log_proc, pc_log_desc, pc_log_para, pi_flag) ;
    if pi_flag != 0 then set oi_statuscode = pi_flag ;
    end if;
    
    set oi_statuscode = pi_sqlcode ;
end ;

/** ���̵��� ���ݼ�� **/
call sp_survey_action_create_random(10000031, 1234, @res) ;
select @res ;

select * from tb_sys_proc_write_log where proc_name = 'sp_survey_action_create_random' and main_para = 10000031 ;
delete from tb_sys_proc_write_log   where proc_name = 'sp_survey_action_create_random' and main_para = 10000031 ;

select * from tb_bas_survey_action   where survey_code = 10000031 ;
select * from tb_bas_question_action where survey_code = 10000031 ;

select question_code, option_code, count(distinct user_code) from tb_bas_question_action 
where survey_code = 10000031 group by question_code, option_code ;

select question_code, count(distinct user_code) from tb_bas_question_action 
where survey_code = 10000031 group by question_code ;
