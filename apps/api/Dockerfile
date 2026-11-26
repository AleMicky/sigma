# ── Stage 1: Build ────────────────────────────────────────────
FROM eclipse-temurin:21.0.13.1_2-jdk-alpine-3.23 AS build

WORKDIR /build

# Copy Maven wrapper and POM first (cache dependencies)
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN --mount=type=cache,target=/root/.m2 \
    chmod +x mvnw && ./mvnw dependency:go-offline -B

# Copy source and build
COPY src/ src/
RUN --mount=type=cache,target=/root/.m2 \
    ./mvnw package -DskipTests -B && \
    mv target/*.jar target/app.jar

# ── Stage 2: Runtime ─────────────────────────────────────────
FROM eclipse-temurin:21.0.13.1_2-jre-alpine-3.23 AS runtime

RUN addgroup -S sigma && adduser -S sigma -G sigma

WORKDIR /app

COPY --from=build /build/target/app.jar app.jar

# Create uploads directory
RUN mkdir -p /app/uploads && chown -R sigma:sigma /app

USER sigma

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
