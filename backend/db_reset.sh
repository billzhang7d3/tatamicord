#!/bin/bash

sudo docker stop $(sudo docker ps -aq)
sudo docker rm $(sudo docker ps -aq)
sudo fuser -k 5432/tcp
sudo docker compose up -d
