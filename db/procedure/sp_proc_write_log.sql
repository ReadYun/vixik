drop procedure if exists sp_proc_write_log ;
create procedure sp_proc_write_log
(
    in     proc_name    varchar(100),
    in     step_desc    varchar(100),
    in     main_para    varchar(32),
    out    erro_code    integer
)

/** head
    * @name       sp_proc_write_log
    * @caption    ��־���̼�¼
    * @describe   ������־������̣�ע�������̲�д��־��
    *----------------------------------------- Param In
    * @param_in   proc_name    �����������
    * @param_in   step_desc    ����������Ϣ
    * @param_in   main_para    ������
    *----------------------------------------- Param Out
    * @param_out  erro_code    ������־
    *----------------------------------------- Table Name
    * @tar_table  tb_sys_proc_write_log   ������־��־��
    *----------------------------------------- Other Info
    * @version      1.0.000
    * @create-date  2012-2-1
    * @author       ��־�S
    * @copyright    vixik
    */

begin
	declare sqlcode integer default 0; 						     #����״̬
	declare exit handler for sqlexception ,sqlwarning,not found  #�쳣��������
	set erro_code=sqlcode;

  /**
    * description Ŀ���˵��
    *
    #�洢������־��Ϣ
    create table tb_sys_proc_write_log
    (
        proc_name    varchar(100)    ,#��־����
        step_desc    varchar(100)    ,#��������
        main_para    varchar(32)     ,#��Ҫ����
        curr_time    timestamp        #��ǰʱ��
    ) ;
  **/

    insert into tb_sys_proc_write_log
    (
        proc_name    ,#��־����
        step_desc    ,#��������
        main_para    ,#������
        curr_time     #��ǰʱ��
    )
    values
    (
        proc_name             ,#������
        step_desc             ,#��������
        main_para             ,#������
        current_timestamp()    #��ǰʱ��
    );

    set erro_code=sqlcode;

    commit;

end ;
