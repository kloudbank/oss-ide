FROM ubuntu:20.04


RUN useradd -m coder --uid=1000
USER 1000
ENV USER=init
WORKDIR /home/init
COPY --chown=1000 ./code-server/extensions ./extensions
