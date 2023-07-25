@tion message():
    @call print('This tion!');


@tion message(message, ask):
    @call print([message]);
    @call print([ask]);


@tion message(message, ask, answer):
    @call print([message]);
    @call print([ask]);
    @call print([answer]);


@tion message(message):
    @call print([message]);


@tion message(string message):
    @call print('string message:');
    @call print([message]);


@tion message(bool message):
    @call print('bool message:');
    @call print([message]);


@call tion::message();
@call print('');
@call tion::message('@asmx_fan', 'Which programming language is the best?', 'AsmX');
@call print('');
@call tion::message('okay');
@call print('');
@call tion::message(true);
@call print('');
@call tion::message(1);
@call print('');
@call tion::message('wow', 'How i create house?');