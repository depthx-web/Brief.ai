FROM ghcr.io/berriai/litellm:main-stable
COPY litellm-config.yaml /app/config.yaml
CMD ["--config", "/app/config.yaml", "--port", "4000"]
