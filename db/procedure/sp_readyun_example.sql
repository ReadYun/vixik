drop procedure if exists sp_readyun_example ;
create procedure sp_readyun_example
(
  in  ii_para       integer,
  out oi_statuscode integer
)
/**** ---------------------------------------- Header
    * @name       sp_readyun_example
    * @caption    ���̱���
    * @describe   ��������
    *
    * ---------------------------------------- Params
    * @param_in   ii_para        �������
    * @param_out  oi_statuscode  �������
    *
    * ---------------------------------------- Tables
    * @tar_table  tb_target_xxx  Ŀ�����
    * @src_table  tb_source_xxx  Դ����
    *
    * ---------------------------------------- Info
    * @version      1.0.000
    * @author       cao.zhiyun
    * @create-date  2012-2-1
    * @copyright    VixiK
    */

begin
  /**
    * description �������*/
    declare vc_log_proc    varchar(100)         ;#��������
    declare vc_log_desc    varchar(100)         ;#������־����
    declare vc_log_para    varchar(32)          ;#����������
    declare sqlcode        integer default 0    ;#����״̬
    declare vi_flag        integer default 0    ;#����д��־���̷���ֵ
    declare vi_day         integer              ;#����ͳ������
    declare vi_month       integer              ;#����ͳ���·�
    declare vs_sql_str     varchar(500)         ;#sql�ַ���
    declare vs_pre_str     varchar(500)         ;#������Ԥ��������ַ���
    declare vs_exe_str     varchar(500)         ;#������ִ������ַ���
    
    /** �쳣���� **/
    declare continue handler for not found set sqlcode=0         ;#�ޱ�ɾ�����˳�
	declare exit handler for sqlexception,sqlwarning   #�쳣��������

    set oi_statuscode = sqlcode ;
    set vc_log_proc   = 'sp_readyun_example' ;
    set vc_log_para   = ii_para ;

  /**
    * description Ŀ���˵��
    *
    ********��Ʒ��Ŀ��Ӧ��ϵ��********
    create table tb_mid_itemcat_relation
    (
        top_cat_code     varchar(32)    ,#�Ա�������Ŀ����
        low_cat_code     varchar(32)    ,#�Ա��ͼ���Ŀ����
        low_cat_level    integer         #�Ա��ͼ���Ŀ����
    ) ;
    **/

    /**��¼ִ����־**/
    set  vc_log_desc = '----- 0.0.��ʼ -----' ;
    call sp_proc_write_log(vc_log_proc, vc_log_desc, vc_log_para, vi_flag) ;
    if vi_flag != 0 then set oi_statuscode = vi_flag ;
    end if;

	loop_label: loop
	
	end loop ;

    /**��¼ִ����־**/
    set  vc_log_desc = '----- ���� -----' ;
    call sp_proc_write_log(vc_log_proc, vc_log_desc, vc_log_para, vi_flag) ;
    if vi_flag != 0 then set oi_statuscode = vi_flag ;
    end if;

end ;