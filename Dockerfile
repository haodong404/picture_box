FROM rust:alpine as build
RUN apk add openssl-dev musl-dev
WORKDIR /home
COPY . .
RUN cargo build --release

FROM debian:stable-slim as runtime
COPY --from=build /home/target/release/picture_box /app/picture_box
COPY --from=build /home/resources/config.json /etc/picture_box/config.json
WORKDIR /app
VOLUME /app/pictures/
USER root
EXPOSE 7709
CMD [ "./picture_box", "-c", "/etc/picture_box/config.json" ]
