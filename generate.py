import cv2
import numpy as numpy
import matplotlib.pyplot as plt
import tensorflow as tf 
from variables import class_names
from melody_generator import split_string, play_notes, generate_midi_file

# Resizes img so that its longest edge is equal to max_resize if it is longer
def resize_image(img, max_resize):
    h, w = img.shape[:2]

    longest = max(h,w)
    
    if longest > max_resize:
        scale_factor = max_resize/longest
        new_w = int(w*scale_factor)
        new_h = int(h*scale_factor)
        resized = cv2.resize(img, (new_w, new_h))
        img = resized

    return img


def sort_contours(contours, y_threshold=10, w_threshold=30, group_size=7):
    contours = sorted(contours, key=lambda x: cv2.boundingRect(x)[1]) # sort by y
    groups = []
    line = []
    #print(cv2.boundingRect(contours[0]))
    _,line_y,line_w,line_h= cv2.boundingRect(contours[1])
    line_l = max(line_w,line_h)
    line_y = line_y - (line_l - line_h)//2
    #print(line_y)

    # group contours by similar y
    for c in contours:
        _,y,w,h = cv2.boundingRect(c)
        l = max(w,h)
        # filter only allowed width
        if l < w_threshold: 
            l = max(w,h)
            y = y - (l - h)//2
            curr_y = y
            if abs(curr_y - line_y) <= y_threshold:
                #print(cv2.boundingRect(c)[1])
                line.append(c)
            else:
                line_y = y
                groups.append(line)
                line = []
                line.append(c)
    # sort each group by x
    groups = [sorted(g, key=lambda x: cv2.boundingRect(x)[0]) for g in groups if len(g) > group_size] 

    return groups
            

# Input: an image (img)
# Output: array of detected Jianpu symbols
def detect_jianpu(img):
    # Adapted from https://www.youtube.com/watch?v=9FCw1xo_s0I&list=PL2VXyKi-KpYuTAZz__9KVl1jQz74bDG7i&index=8&ab_channel=PythonTutorialsforDigitalHumanities
    og_img = img
    bbox_img = img
    img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    img = cv2.GaussianBlur(img, (7,7), 0)
    img = cv2.threshold(img, 128, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)[1]
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (4,1)) #(5-7, 1-3)
    img = cv2.dilate(img, kernel, iterations=1)

    contours = cv2.findContours(img, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    contours = contours[0] if len(contours) == 2 else contours[1]
    
    contour_groups = sort_contours(contours)
    char_images = []
    i = -1
    for group in contour_groups:
        for cnt in group:
            x, y, w, h = cv2.boundingRect(cnt)
            pad = 7
            l = max(w+pad,h+pad)
            x = x - (l - w)//2
            y = y - (l - h)//2
            i += 1
            char_img = og_img[y:y+l, x:x+l]
            char_img = cv2.resize(char_img, (32, 32))
            #cv2.imwrite(f"raw_data/{i}.PNG", char_img)
            cv2.rectangle(bbox_img, (x, y), (x+l, y+l), (36 + 3*i, 255, 12), 2)
            char_images.append(char_img)
            
    cv2.imshow("Bounding Boxes", bbox_img)
    cv2.waitKey(0)
    cv2.destroyAllWindows()
    return char_images

# Input: OMR model (model), array of Jianpu symbols 32x32 images (symbols)
# Output: string encoding of predictions
def predict_jianpu(model, symbols):
    out_string = ""
    for sym in symbols:
        img_array = tf.keras.preprocessing.image.img_to_array(sym)
        img_array = tf.expand_dims(img_array, 0)
        img_array = tf.image.rgb_to_grayscale(img_array)
        img_array = img_array / 255.0

        # Predict using the trained model
        predictions = model.predict(img_array)
        predicted_class_index = tf.argmax(predictions[0], axis=-1).numpy()
        predicted_class = class_names[predicted_class_index]

        print(f"Predicted class: {predicted_class}")
        out_string += predicted_class

    return out_string

raw_img = cv2.imread('song_pages/image.png')
img = resize_image(raw_img, 850)
#img = cv2.imread('example/amazing_grace_jianpu.PNG')

symbols = detect_jianpu(img)

model = tf.keras.models.load_model('jianpu.model.keras')
id_string = predict_jianpu(model, symbols)

generate_midi_file(split_string(id_string), 1)
play_notes(split_string(id_string), 1.5)


# cv2.imshow("Bounding Boxes", symbols)
# cv2.waitKey(0) 