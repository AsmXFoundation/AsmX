@using method get;
@using method post;
@using method delete;
@using method put;
@using method patch;

@constructor __init__(self):
    @call print('');

@class request:
    @bind constructor __init__;
    @bind method get;
    @bind method post;
    @bind method delete;
    @bind method put;
    @bind method patch;

    @method get(string route):
        @modify $cmd curl -X GET -H "Content-Type: application/json";
        @modify $cmdargs route;
        @invoke 0x09;
        # @ret $cmdret;

    @method post(string route):
        @modify $cmd curl -X POST -H "Content-Type: application/json";
        @modify $cmdargs [route];
        @invoke 0x09;
        # @ret $cmdret;

    @method delete(string route):
        @modify $cmd curl -X DELETE -H "Content-Type: application/json";
        @modify $cmdargs [route];
        @invoke 0x09;
        # @ret $cmdret;

    @method put(string route):
        @modify $cmd curl -X PUT -H "Content-Type: application/json";
        @modify $cmdargs [route];
        @invoke 0x09;
        # @ret $cmdret;

    @method patch(string route):
        @modify $cmd curl -X PATCH -H "Content-Type: application/json";
        @modify $cmdargs [route];
        @invoke 0x09;
        # @ret $cmdret;

@create class request request;
@call class::request();