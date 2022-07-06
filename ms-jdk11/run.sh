docker run -d \
  -v $(pwd)/vscode/code-server/extensions:/home/coder/vscode/code-server/extensions \
  -v $(pwd)/projects:/home/coder/workspace \
  -v $(pwd)/.m2:/home/coder/.m2 \
  -e XDG_DATA_HOME=/home/coder/vscode \
  -p 8090:9999 \
  -p 3000:3000 \
  -p 8080:8080 \
  -e PASSWORD=password \
  --name kloudide \
  nogada/code-server:v1.5


docker run -d \
  -p 8091:8080 \
  -e PASSWORD=password \
  --name codesever \
  codercom/code-server 




  docker run -d \
  --name=linux-codesever \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Asia/Seoul \
  -e DEFAULT_WORKSPACE=/config/workspace  \
  -p 8443:8443 \
  lscr.io/linuxserver/code-server:latest
  
  
  docker run -d \
  --name=code-server \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Asia/Seoul \
  -e PASSWORD=password `#optional` \
  -e HASHED_PASSWORD= `#optional` \
  -e SUDO_PASSWORD=password `#optional` \
  -e SUDO_PASSWORD_HASH= `#optional` \
  -e PROXY_DOMAIN=code-server.my.domain `#optional` \
  -e DEFAULT_WORKSPACE=/config/workspace `#optional` \
  -p 8443:8443 \
  -v /path/to/appdata/config:/config \
  --restart unless-stopped \
  lscr.io/linuxserver/code-server:latest