from flask import Flask, request, send_from_directory
from flask_cors import CORS

from generate import fileBuff2Img, detect_jianpu, predict_jianpu, resize_image
from melody_generator import split_string, play_notes, generate_midi_file, combine_tokens

import cv2
import base64
import os


app = Flask(__name__)
CORS(app)

@app.route('/omr-results', methods=['POST'])
def omrResults():
    if 'file' in request.files: # Detect Jianpu from file
        file = request.files['file']
        img = fileBuff2Img(file.read())
        img = resize_image(img, 850)
        char_list, bbox = detect_jianpu(img)

        b64_char_list = []

        for row in char_list:
            b64_char_row = []
            for img in row:
                _, buffer = cv2.imencode('.jpg', img)
                img_bytes = buffer.tobytes()
                img_base64 = base64.b64encode(img_bytes).decode('utf-8')
                b64_char_row.append(img_base64)
            b64_char_list.append(b64_char_row)

        _, buffer = cv2.imencode('.png', bbox)
        img_bytes = buffer.tobytes()
        img_base64 = base64.b64encode(img_bytes).decode('utf-8')

        return {"image": img_base64, "char_list": b64_char_list}
    else: # generate Jianpu predictions

        data = request.get_json()

        if 'tokens' in data: # Tokens are given
            string = combine_tokens(data['tokens'])
            tokens = split_string(string)
            generate_midi_file(tokens, 120/data['bpm'], steps=data['steps'])

        else: # Tokens are not given. Need to predict...
            img_list = []
            for row in data['char_list']:
                img_row = []
                for b64 in row:
                    b64decode = base64.b64decode(b64)
                    img = fileBuff2Img(b64decode)
                    img_row.append(img)
                img_list.append(img_row)

            tokens = split_string(predict_jianpu(img_list))
            generate_midi_file(tokens, 120/data['bpm'], steps=data['steps'])

        with open(f"output_midi/song.mid", "rb") as midi_file:
            b64_midi_file = base64.b64encode(midi_file.read()).decode('utf-8')

        return {'b64_midi_file': b64_midi_file, 'tokens': tokens}
        #return send_from_directory('output_midi', 'song.mid', as_attachment=True ,mimetype='audio/midi')
        #play_notes(tokens, 1)
        #return


if __name__ == "__main__":
    os.makedirs('output_midi', exist_ok=True)
    app.run(host='0.0.0.0', port=8080, debug=False)