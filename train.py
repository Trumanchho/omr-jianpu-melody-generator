import os
import cv2
import numpy as np 
import matplotlib.pyplot as plt 
import tensorflow as tf 
from variables import class_names

dataset = tf.keras.utils.image_dataset_from_directory(
    "data",
    image_size=(32, 32),
    #batch_size=32, 
    label_mode='int',  # Ensure labels are integers for sparse_categorical_crossentropy
    class_names=class_names
)

# process the images
def process_img(image, label):
    image = tf.image.rgb_to_grayscale(image)
    return tf.cast(image, tf.float32) / 255.0, label

dataset = dataset.map(process_img).prefetch(tf.data.AUTOTUNE)

# Define the model
model = tf.keras.models.Sequential([
    tf.keras.layers.Flatten(input_shape=(32, 32, 1)),
    tf.keras.layers.Dense(128, activation='relu'),
    tf.keras.layers.Dense(len(class_names), activation='softmax')
])

# Compile the model
model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

# Train the model
model.fit(dataset, epochs=150)

# Save the model
model.save('jianpu.model.keras')
