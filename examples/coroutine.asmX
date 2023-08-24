@coroutine generator():
    @call print('Step 1');
    @yield 0;
    @call print('Step 2');
    @yield 1;
    @call print('Step 3');
    @yield 2;
    @call print('End');

@call coroutine::generator::next();
@call coroutine::generator::next();
@call coroutine::generator::next();
@call coroutine::generator::next();