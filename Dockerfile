from node:alpine


# install git
RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh

# adding python (some npm modules need it)
RUN apk --no-cache add g++ gcc libgcc libstdc++ linux-headers make python
RUN npm install --quiet node-gyp -g

COPY ./package.json ./
COPY ./package-lock.json ./

# install node modules
RUN npm install

COPY . .

CMD ["node", "."]