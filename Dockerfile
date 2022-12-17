FROM node
WORKDIR /home/needon/twitter

COPY root* /
RUN chmod -R +x /script

CMD /script/run.sh ; sleep infinity
