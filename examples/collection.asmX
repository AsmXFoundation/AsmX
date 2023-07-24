@collection Routes:
    @property send '/sendMessage';
    @property delete '/deleteMessage';
    @property forward '/forwardMessage';

@create collection Routes routes;
@property collection::routes forward 'forwarded';
@call print(collection::routes::forward);