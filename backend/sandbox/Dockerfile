FROM mcr.microsoft.com/playwright:v1.41.0-jammy

WORKDIR /sandbox

# Install Python
RUN apt-get update && apt-get install -y python3 python3-pip

# Install Python dependencies
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

COPY . .

# Create screenshots directory
RUN mkdir -p /sandbox/screenshots

EXPOSE 8001

CMD ["python3", "sandbox_service.py"]
