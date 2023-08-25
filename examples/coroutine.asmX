@coroutine generator(int size):
    @call print([size]);
    @call print('Step 1');
    @yield 0;
    @call print('Step 2');
    @yield 1;
    @call print('Step 3');
    @yield 2;
                                        #ignore
    @call print('End');
    @call print('End');

@call coroutine::generator::next(0);    # Step 1
@call tion::print($return);
@call coroutine::generator::next(0);    # Step 2
@call tion::print($return);
@call coroutine::generator::next(0);    # Step 3
@call tion::print($return);
@call coroutine::generator::next(0);    # { value: 'Void', done: 'true' }
@call tion::print($return);

@call coroutine::generator::return(3);  # { value: '3', done: 'true' }
@call tion::print($return);
@call coroutine::generator::start(3);   # { value: '3', done: 'false' }
@call tion::print($return);

@call coroutine::generator::next(0);    # Step 1
@call tion::print($return);
@call coroutine::generator::next(0);    # Step 2
@call tion::print($return);
@call coroutine::generator::next(0);    # Step 3
@call tion::print($return);
@call coroutine::generator::next(0);    # { value: 'Void', done: 'true' }
@call print(json::$return::done);       # true