# Define the Routes collection
@collection Routes:
    # Property to send a message
    @property send '/sendMessage';
    # Property to delete a message
    @property delete '/deleteMessage';
    # Property to forward a message
    @property forward '/forwardMessage';

# Create an instance of the Routes collection
@create collection Routes routes;

# Set the 'forward' property of the collection to 'forwarded'
@property collection::routes forward 'forwarded';

# Call the print function to print the value of collection::routes::forward
@call print(collection::routes::forward);