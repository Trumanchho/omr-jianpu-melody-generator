import os
import cv2
import numpy as np 
import matplotlib.pyplot as plt 
import tensorflow as tf 
from variables import class_names

dataset = tf.keras.utils.image_dataset_from_directory(
    "data",
    image_size=(32, 32),
    batch_size=32, 
    label_mode='int',  # Ensure labels are integers for sparse_categorical_crossentropy
    class_names=class_names
)

# process the images
def process_img(image, label):
    image = tf.image.rgb_to_grayscale(image)
    return tf.cast(image, tf.float32) / 255.0, label

dataset = dataset.map(process_img).prefetch(tf.data.AUTOTUNE)

# Data aumentation
data_augmentation = tf.keras.Sequential([
  tf.keras.layers.RandomZoom(0.2)
])
# Define the model
model = tf.keras.models.Sequential()

# Add Data Augmentation Layer
model.add(data_augmentation) 

# Add convolutional layers
# Adapted from https://www.youtube.com/watch?v=eMMZpas-zX0&ab_channel=PatrickLoeber
model.add(tf.keras.layers.Conv2D(32, (3,3), strides=(1,1), padding="valid", activation="relu", input_shape=(32,32,1)))
model.add(tf.keras.layers.MaxPool2D((2,2)))
model.add(tf.keras.layers.Conv2D(32, 3, activation="relu"))
model.add(tf.keras.layers.MaxPool2D((2,2)))

model.add(tf.keras.layers.Flatten(input_shape=(32, 32, 1)))
model.add(tf.keras.layers.Dense(128, activation='relu'))
model.add(tf.keras.layers.Dense(len(class_names), activation='softmax'))

# print(model.summary())

# import sys; sys.exit()


# Compile the model
model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

# Train the model
model.fit(dataset, epochs=50)

# Save the model
model.save('jianpu.model.keras')
