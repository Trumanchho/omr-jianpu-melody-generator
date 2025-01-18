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


def sort_contours(contours, y_threshold=10, w_bound_h=25, group_size=6):
    contours = sorted(contours, key=lambda x: cv2.boundingRect(x)[1]) # sort by y
    groups = []
    line = []
    #print(cv2.boundingRect(contours[0]))
    _,line_y,line_w,line_h= cv2.boundingRect(contours[1])
    line_l = max(line_w,line_h)
    line_y = line_y - (line_l - line_h)//2
    line_mid = line_y + line_l//2
    #print(line_y)

    # group contours by similar y
    for c in contours:
        _,y,w,h = cv2.boundingRect(c)
        l = max(w,h)
        # filter only allowed width
        if l < w_bound_h:
            l = max(w,h)
            # y = y - (l - h)//2
            # curr_y = y
            y = y - (l - h)//2
            mid = y + l//2
            #if abs(curr_y - line_y) <= y_threshold:
            if abs(mid - line_mid) <= y_threshold:
                #print(cv2.boundingRect(c)[1])
                line.append(c)
            else:
                #line_y = y
                y = y - (l - h)//2
                line_mid = y + l//2
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
    bbox_img = img.copy()
    img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    img = cv2.GaussianBlur(img, (3,7), 0)
    img = cv2.threshold(img, 128, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)[1]
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (4,1)) #(5-7, 1-3)
    dilated_img = cv2.dilate(img, kernel, iterations=1)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1,4))
    eroded_img = cv2.erode(dilated_img, kernel, iterations=1)

    # Contours of numbers
    contours = cv2.findContours(eroded_img, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    contours = contours[0] if len(contours) == 2 else contours[1]
    #filtered_contours = list(contours)
    filtered_contours = list(filter(lambda x: max(cv2.boundingRect(x)[2], cv2.boundingRect(x)[3]) > 5, contours))
    
    # Contours of dots and lines
    contours = cv2.findContours(dilated_img, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    contours = contours[0] if len(contours) == 2 else contours[1]
    filtered_contours.extend(list(filter(lambda x: cv2.boundingRect(x)[3] < 5, contours)))
    
    contour_groups = sort_contours(filtered_contours, y_threshold=5)

    char_images = []
    
    i = -1
    for group in contour_groups:
        line = []
        for cnt in group:
            x, y, w, h = cv2.boundingRect(cnt)
            pad = 10
            l = max(w+pad,h+pad)
            x = x - (l - w)//2
            y = y - (l - h)//2
            i += 1
            char_img = og_img[y:y+l, x:x+l]
            char_img = cv2.resize(char_img, (32, 32))
            #cv2.imwrite(f"raw_data/{i}.PNG", char_img)
            cv2.rectangle(bbox_img, (x, y), (x+l, y+l), (36 + 3*i, 255, 12), 2)
            line.append(char_img)
        char_images.append(line)

    cv2.imshow("Bounding Boxes", bbox_img)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

    # Option to delete lines
    inputting = True
    while inputting:
        line_to_remove = input("Enter line number to remove (first line starts at 0) press Enter to skip: ")
        if line_to_remove != "":
            line_to_remove = int(line_to_remove)
            char_images.pop(line_to_remove)
            contour_groups.pop(line_to_remove)
            bbox_img = og_img.copy()
            # redraw bounding boxes
            for group in contour_groups:
                for cnt in group:
                    x, y, w, h = cv2.boundingRect(cnt)
                    pad = 10
                    l = max(w+pad,h+pad)
                    x = x - (l - w)//2
                    y = y - (l - h)//2
                    cv2.rectangle(bbox_img, (x, y), (x+l, y+l), (36 + 3*i, 255, 12), 2)
            cv2.imshow("Bounding Boxes", bbox_img)
            cv2.waitKey(0)
            cv2.destroyAllWindows()
        else:
            i = 0
            for group in char_images:
                for img in group:
                    cv2.imwrite(f"raw_data/{i}.PNG", img)
                    i += 1
            inputting = False
    return char_images

# Input: OMR model (model), array of Jianpu symbols 32x32 images (symbols)
# Output: string encoding of predictions
def predict_jianpu(model, symbols):
    out_string = ""
    for line in symbols:
        for sym in line:
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

raw_img = cv2.imread('song_pages/test_page20.PNG')
img = resize_image(raw_img, 850)
#img = cv2.imread('example/amazing_grace_jianpu.PNG')

symbols = detect_jianpu(img)

# inputting = true
# while inputting:
#     line_to_remove = input("Enter line number to remove (first line starts at 0) press Enter to skip: ")
#     if line_to_remove != "":
#         del symbols[line_to_remove]
model = tf.keras.models.load_model('jianpu.model.keras')
id_string = predict_jianpu(model, symbols)
print(id_string)

generate_midi_file(split_string(id_string), 1)
play_notes(split_string(id_string), 1.5)


# cv2.imshow("Bounding Boxes", symbols)
# cv2.waitKey(0) 