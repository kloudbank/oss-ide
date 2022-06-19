FROM ubuntu:20.04


RUN useradd -m coder --uid=1000
USER 1000
ENV USER=coder
WORKDIR /home/coder
COPY --chown=1000 ./code-server/extensions ./extensions
