# Docker use
Build the Docker image by running the following command:
```sh
docker build -t my-node-app .
```

This will create a Docker image with the tag "my-node-app" based on the instructions in the Dockerfile.

```sh
docker run -it --rm my-node-app
```

This will start a container based on the Docker image and run the alternate entrypoint and default command specified in the Dockerfile.