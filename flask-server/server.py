from flask import Flask, request, send_from_directory
from flask_cors import CORS

from generate import fileBuff2Img, detect_jianpu, predict_jianpu, resize_image
from melody_generator import split_string, play_notes, generate_midi_file

import cv2
import base64


app = Flask(__name__)
CORS(app)

@app.route('/omr-results', methods=['POST'])
def omrResults():
    if 'file' in request.files:
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
    else:
        data = request.get_json()
        bpm = 120 / data['bpm']
        img_list = []
        for row in data['char_list']:
            img_row = []
            for b64 in row:
                b64decode = base64.b64decode(b64)
                img = fileBuff2Img(b64decode)
                img_row.append(img)
            img_list.append(img_row)
        
        tokens = split_string(predict_jianpu(img_list))
        generate_midi_file(tokens, bpm)
        # FluidSynth('output_midi/TimGM6mb.sf2').midi_to_audio('output_midi/song.mid', 'output_midi/song.wav')
        return send_from_directory('output_midi', 'song.mid', as_attachment=True ,mimetype='audio/midi')
        #play_notes(tokens, 1)
        #return 
            

        


if __name__ == "__main__":
    app.run(debug=True)