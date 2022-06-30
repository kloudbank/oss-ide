FROM codercom/code-server

# install util
RUN sudo apt update
RUN sudo apt install -y wget
RUN sudo apt install -y gpg

# Add Repo for JDK
RUN wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
RUN sudo install -o root -g root -m 644 packages.microsoft.gpg /etc/apt/trusted.gpg.d/
RUN sudo wget -q https://packages.microsoft.com/config/debian/9/prod.list -O /etc/apt/sources.list.d/microsoft-prod.list
RUN sudo apt update
RUN sudo apt-get install -y apt-transport-https
RUN sudo apt-get update
RUN sudo apt-get install -y msopenjdk-11



# set working dir
USER 1000
ENV USER=coder
RUN mkdir /home/coder/workspace
RUN mkdir -p /home/coder/vscode/code-server/extensions
RUN mkdir -p /home/coder/.m2
WORKDIR /home/coder/workspace


# intall python 3.8
RUN sudo apt update
RUN sudo apt install -y python3
RUN sudo bash -c 'echo "alias python=python3" >> /etc/bash.bashrc'
RUN sudo bash -c 'echo "alias py=python3" >> /etc/bash.bashrc'



# install nodejs
RUN sudo curl -k -o node-v14.14.0-linux-x64.tar.gz https://nodejs.org/download/release/v14.14.0/node-v14.14.0-linux-x64.tar.gz
RUN sudo mkdir -p /usr/local/lib/nodejs
RUN sudo tar -xvf node-v14.14.0-linux-x64.tar.gz -C /usr/local/lib/nodejs
RUN echo "export PATH=/usr/local/lib/nodejs/node-v14.14.0-linux-x64/bin:$PATH" >> ~/.bashrc

# install maven
RUN sudo apt install -y maven

# install azure cli
RUN sudo bash -c 'curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash '

# install kubectl
RUN sudo bash -c 'sudo curl -fsSLo /usr/share/keyrings/kubernetes-archive-keyring.gpg https://packages.cloud.google.com/apt/doc/apt-key.gpg'
RUN sudo bash -c 'echo "deb [signed-by=/usr/share/keyrings/kubernetes-archive-keyring.gpg] https://apt.kubernetes.io/ kubernetes-xenial main" | sudo tee /etc/apt/sources.list.d/kubernetes.list'
RUN sudo apt-get update
RUN sudo apt-get install -y kubectl
RUN alias k=kubectl

# install util
RUN sudo apt install -y httpie
RUN sudo apt install -y dnsutils
RUN sudo apt install -y net-tools
RUN sudo bash -c 'sudo wget -O- https://bit.ly/glances | sudo /bin/bash'
RUN sudo apt install -y vim
RUN sudo apt install -y zsh
RUN sudo apt install -y netcat
RUN sudo apt install -y traceroute






EXPOSE 9999

ENTRYPOINT ["/usr/bin/entrypoint.sh", "--bind-addr", "0.0.0.0:9999", "."]