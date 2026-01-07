# 1. Build Stage (Updated to use a supported Maven image)
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Build the app
RUN mvn clean package -DskipTests

# 2. Run Stage (Updated to use Eclipse Temurin JRE)
FROM eclipse-temurin:17-jre
WORKDIR /app
# Copy the built jar file
COPY --from=build /app/target/*.jar app.jar

# Expose port
EXPOSE 8080

# Run command
ENTRYPOINT ["java", "-Dspring.profiles.active=prod", "-jar", "app.jar"]