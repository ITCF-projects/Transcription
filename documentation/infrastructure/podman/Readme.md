# Run project with Podman (on RHEL9)

Docker is not supported on Red Hat Engerprise Linux 9 (x64) Ref: https://docs.docker.com/engine/install/rhel/   
Podman is used instead, the docker-compose-files are compatible with Podman.

## Nginx

Nginx is installed on the host as a front for containers.
- Proxy port 443 -> 4173 (frontend-container)
- Redirect port 80 -> 443

Install:   
`sudo dnf install nginx`

Configuration file:  
`/etc/nginx/conf.d/transcribe.conf`

## Podman

Install:  
`sudo dnf install podman`  
`sudo dnf install podman-compose`

Enable deligation of cpu for all users (used for transcribe-containers with 4 cores)  

    sudo mkdir -p /etc/systemd/system/user@.service.d

    cat <<EOF | sudo tee /etc/systemd/system/user@.service.d/delegate.conf
    [Service]
    Delegate=cpu cpuset io memory pids
    EOF

    sudo systemctl daemon-reload

Ref:  
https://rootlesscontaine.rs/getting-started/common/cgroup2/

## Service account for rootless containers

The containers run in user space as rootless containers with podman.  
Service account `transcribe` is used for running the containers.

Ref:  
https://rootlesscontaine.rs/getting-started/common/subuid/  
https://blog.christophersmart.com/2021/02/20/rootless-podman-containers-under-system-accounts-managed-and-enabled-at-boot-with-systemd/  

Create service account, allow running processes not logged in, add subuids/subguids (for podman):

    export SERVICE="transcribe"
    sudo useradd -r -m -d "/home/${SERVICE}" -s /bin/bash "${SERVICE}"
    sudo loginctl enable-linger "${SERVICE}"
    sudo usermod --add-subuids 300000-365535 --add-subgids 300000-365535 "${SERVICE}" && podman system migrate 

Add current user to transcribe-group (for file permissions):  
`sudo usermod --append --groups transcribe $USER`

Switch user to service account:  
`sudo -u transcribe bash`

## Project setup

### Folder structure

    /var/transcribe
          /certs
          /secret
          /source
          /transcriptions
    
### Build, start/stop containers

Switch user to service account:  
`sudo -u transcribe bash`  

Change folder:  
`cd /var/transcribe/source/Transcribe/`

Build:  
`podman-compose -f docker-compose.yml  -f docker-compose.liu-override.yml build`

Run containers (-d as deamon):  
`podman-compose -f docker-compose.yml  -f docker-compose.liu-override.yml up -d`

Stop containers:  
`podman-compose -f docker-compose.yml  -f docker-compose.liu-override.yml down`

List running containers:   
`podman ps`

List images:   
`podman images`

Show/tail log for container:

    podman logs -f transcribe_api_1
    podman logs -f transcribe_frontend_1
    podman logs -f folderwatcher  
    podman logs -f transcribeSV  
    podman logs -f transcribeEN

### Start containers on reboot

Generate service-files for all containers (as `transcribe` service account). Make sure alla containers are running.

    mkdir -p ~/.config/systemd/user/
    cd ~/.config/systemd/user/

    podman generate systemd --files --new --name transcribe_frontend_1
    podman generate systemd --files --new --name transcribe_api_1
    podman generate systemd --files --new --name folderwatcher
    podman generate systemd --files --new --name transcribeSV
    podman generate systemd --files --new --name transcribeEN

Restart systemctrl and enable all container-services. The services is automatic started att boot.  
XDG_RUNTIME_DIR is needed for systemctl to run as a user.

    export XDG_RUNTIME_DIR=/run/user/"$(id -u)"
    systemctl --user daemon-reload

    systemctl --user enable container-transcribe_frontend_1
    systemctl --user enable container-transcribe_api_1
    systemctl --user enable container-folderwatcher
    systemctl --user enable container-transcribeSV
    systemctl --user enable container-transcribeEN

Reboot server and check if the contaiers is running.  

Note! If the docker-compose files are changed, the service-files need to be generated again.


## TODO - not sure if used?

    sudo systemctl enable podman-restart.service

Convert service-containers to run podman-compose (5 -> 1 services)...