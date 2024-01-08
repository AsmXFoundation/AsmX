# Import the request lib
@import request;

# Set the URL as a string
@set url string 'https://www.google.com';

# Make a GET request using the request lib
@call request->get(set::url);

# Print the response
@call print($cmdret);
