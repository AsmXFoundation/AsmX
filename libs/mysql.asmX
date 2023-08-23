@using method connect;
@using method connectAuth;
@using method query;

@constructor __init__mysql__(self):
    @add 0 0;

@class MySQL:
    @bind constructor __init__mysql__;

    @method connect():
        @modify $cmd 'mysql -u root -p';
        @invoke 0x08;

    @method connectAuth(host, username, password):
        @modify $cmd fmt'mysql -h [host] -u [username] -p [password]';
        @invoke 0x08;

    @method query(string query):
        selg.query query;
        @modify $cmd 'mysql';
        @modify $cmdarg self.query;
        @invoke 0x08;


@create class MySQL MYSQL;
@call class::MYSQL();