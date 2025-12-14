# Build step #2: build the API with the client as static files
FROM python:3.11
WORKDIR /app

COPY requirements.txt server.py variables.py generate.py melody_generator.py ./
RUN apt-get update && apt-get install ffmpeg libsm6 libxext6  -y
RUN pip install -r ./requirements.txt
ENV FLASK_ENV=production

EXPOSE 5000
CMD ["python", "server.py"]
