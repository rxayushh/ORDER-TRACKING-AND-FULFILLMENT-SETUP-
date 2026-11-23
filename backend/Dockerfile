# Stage 1: Build JAR with Maven & OpenJDK 21
FROM maven:3.9.9-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml ./
COPY src ./src
RUN mvn -B -DskipTests package

# Stage 2: Minimal JRE Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
