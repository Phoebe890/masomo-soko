# 1. Build Stage (Use Maven with Java 21)
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Build the app
RUN mvn clean package -DskipTests

# 2. Run Stage (Use JRE 21)
FROM eclipse-temurin:21-jre
WORKDIR /app
# Copy the built jar file
COPY --from=build /app/target/*.jar app.jar

# Expose port
EXPOSE 8080

# Run command
ENTRYPOINT ["java", "-Dspring.profiles.active=prod", "-jar", "app.jar"]