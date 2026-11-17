FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /build
COPY pom.xml ./
COPY api-gateway/pom.xml api-gateway/
COPY user-service/pom.xml user-service/
COPY court-service/pom.xml court-service/
COPY booking-service/pom.xml booking-service/
COPY payment-service/pom.xml payment-service/
COPY notification-service/pom.xml notification-service/
COPY review-service/pom.xml review-service/
COPY notification-service/src notification-service/src
RUN apk add --no-cache maven && mvn clean package -pl notification-service -am -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /build/notification-service/target/*.jar app.jar
EXPOSE 8085
ENTRYPOINT ["java", "-Duser.timezone=UTC", "-jar", "app.jar"]
