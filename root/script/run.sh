#!/bin/bash

File=package.json

if [ ! -e $FILE ]; then
  cd /home/needon/twitter/ && git clone https://github.com/k4584587/TwitterLikeBot-JS.git .
else
  git pull && npm install

  enfFIle=.env
  if [ ! -e $enfFIle ]; then
    echo "환경변수 파일이 없습니다. 환경변수를 설정해주세요."
  else
    yarn dev
  fi

fi
