# 1. Build Stage
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Build the app and skip tests to save time
RUN mvn clean package -DskipTests

# 2. Run Stage
FROM openjdk:17-jdk-slim
WORKDIR /app
# Copy the built jar file (Ensure the name matches what maven generates)
# Usually it is target/your-app-name-0.0.1-SNAPSHOT.jar
# We use a wildcard *.jar to automatically find it
COPY --from=build /app/target/*.jar app.jar

# Expose port 8080 (Matches your properties file)
EXPOSE 8080

# Run the app using the Production Profile
ENTRYPOINT ["java", "-Dspring.profiles.active=prod", "-jar", "app.jar"]