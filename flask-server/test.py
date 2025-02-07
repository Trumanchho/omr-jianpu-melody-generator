import os
import cv2
import numpy as np 
import matplotlib.pyplot as plt 
import tensorflow as tf 
from variables import class_names

model = tf.keras.models.load_model('jianpu.model.keras')


for i in range(53):

    img_path = f"raw_data/{i}.PNG"
    img = tf.keras.preprocessing.image.load_img(img_path, target_size=(32, 32))
    img_array = tf.keras.preprocessing.image.img_to_array(img)  # Convert image to array
    img_array = tf.expand_dims(img_array, 0)  # Add batch dimension (1 image)

    # Process image
    img_array = tf.image.rgb_to_grayscale(img_array)
    img_array = img_array / 255.0


    # Predict using the trained model
    predictions = model.predict(img_array)
    predicted_class_index = tf.argmax(predictions[0], axis=-1).numpy()
    predicted_class = class_names[predicted_class_index]

    print(f"Predicted class: {predicted_class}")
