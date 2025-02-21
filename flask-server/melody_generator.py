import mido
from mido import Message, open_output, MidiFile, MidiTrack
import time

#songs
songs = {
    "song": "6lu7luB1u17lu6l3u1uB2u3u2L7lu6luB7lu7l2u3u3S5lw7lwB6lLL6lu7luB1D7lu6lD3uB4LD2u2u3uB4L2D4uB3LD6lu2u3uB4L6lD4uB3LL2u1uB2D1u7l1u4uB3LD6lu2u3uB4u45u62u4uB3uD2w3u2u36lBQrLL6lu7lu1u11u2u1u5u4u3LL2u3u4u44u4u3u2u4u3uD4w3u1hu66u7u1h1hu1hu1hD6u7LL6u7u1h6u7u1hu1hu6u1hu7LL6lu7lu1D7lu6l3u1u2u3u2L7lu6lu7lL3S5lu7lu6lLL6lu7lu1D7lu6l6lu3u4L2u2u1u7lD2u2D3u4L2D4u3LD6lu2u3u4u46u6D4u3LD2u2u1u2D1u7l1u4u3LD6lu2u3u4D5u62u4u3LLL2L1D2u3LL6u7u1h1hu1hu1hu7u6S5u6u7LD3w3wB4u45u62u4uB3uD2w1u2u3D6luB7lD7lw7lw7l5B6LQrD6w7w1hu1hDQr1hu7u6uS5u6u7QrD3w3wB4u45u62u4u3uD2w1u2u3L2u23uB2u2u3uD2w1u2u36lQrLQrD6lw6lwB7l6lu7lu7lu7lu2u1uEr6lu7lQrD2w3w4D5u62u4u3uD2w1u2u36l7lL7lS5l6lLLL3u2u1u2u36l4u3u2u3u4L2u1u7lu1u243u2u1u2u3L6l121u2u3u4w4w3w2w2u1L2u22u21u2u3u4u3LL2L123LLL6l6543u4u3u2u1L2L3D7u6LL",
}

# Map numbers 1-7 to MIDI note values (C4-B4)
note_map = {
    '1': 60,  # C4
    '2': 62,  # D4
    '3': 64,  # E4
    '4': 65,  # F4
    '5': 67,  # G4
    '6': 69,  # A4
    '7': 71   # B4
}

def transpose(half_steps, scale=note_map):
    for key in scale:
        scale[key] += half_steps

def split_string(string):
    #Split a string into a list of tokens.
    string = string.replace(" ", "")
    tokens = []
    i = 0
    while i < len(string):
        token = string[i]
        i += 1
        while i < len(string) and string[i].isalpha() and string[i].islower():
            token += string[i]
            i += 1
        tokens.append(token)
    return tokens
def combine_tokens(token_arr):
    out_string = ''
    for token in token_arr:
        out_string += token
    return out_string

def generate_midi_file(token_arr, duration, steps=0, filename='song'):
    scale = note_map.copy()
    transpose(steps, scale)
    tempo = duration
    # Create a new MIDI file with a single track
    midi = MidiFile()
    track = MidiTrack()
    midi.tracks.append(track)

    track.append(Message('program_change', program=0, time=0))  # Set instrument to Acoustic Grand Piano

    prev_duration = tempo
    sharp = False
    for token in token_arr:
        duration = tempo
        if token[0] in scale:
            note = scale[token[0]]
            
            if 'h' in token: # change octave
                note += 12
            elif 'l' in token:
                note -= 12
            if 'u' in token: # change note length
                duration /= 2
            elif 't' in token:
                duration /= 3
            elif 'w' in token:
                duration /= 4
            if sharp:
                note += 1
            track.append(Message('note_on', note=note, velocity=64, time=0))
            track.append(Message('note_off', note=note, velocity=64, time=int( 480*duration)))
            sharp = False
        elif token[0] == 'L': # Line (-)
            track.append(Message('note_off', note=0, velocity=0, time=int( 480*prev_duration)))
        elif token[0] == 'D': # Dot (.)
            track.append(Message('note_off', note=0, velocity=0, time=int( 480*prev_duration/2)))
        elif token[0] == 'S': # Sharp (#)
            sharp = True
        elif token == 'Qr':
            track.append(Message('note_off', note=0, velocity=0, time=int( 480*duration)))
        elif token == 'Er':
            track.append(Message('note_off', note=0, velocity=0, time=int( 480*duration/2)))
        else:
            pass
            #print(f"Invalid character '{token}' in input. Skipping.")
        prev_duration = duration
    midi.save(f'output_midi/{filename}.mid')

def play_notes(token_arr, duration):
    tempo = duration/2
    # List available MIDI output ports
    output_names = mido.get_output_names()
    if not output_names:
        print("No MIDI output ports found. Please connect a MIDI synth or software.")
        return

    port_name = output_names[0]  # Use the first available MIDI output port

    # Open the MIDI output port
    with open_output(port_name) as output:

        # Play each note in the input string and write to MIDI file
        prev_duration = tempo
        sharp = False
        for token in token_arr:
            duration = tempo

            if token[0] in note_map:
                note = note_map[token[0]]
                
                if 'h' in token: # change octave
                    note += 12
                elif 'l' in token:
                    note -= 12
                if 'u' in token: # change note length
                    duration /= 2
                elif 'w' in token:
                    duration /= 4
                if sharp:
                    note += 1
                output.send(Message('note_on', note=note, velocity=64))
                time.sleep(duration)
                output.send(Message('note_off', note=note, velocity=64))
                sharp = False
            elif token[0] == 'L': # Line (-)
                time.sleep(prev_duration)
            elif token[0] == 'D': # Dot (.)
                time.sleep(prev_duration / 2)
            elif token[0] == 'S': # Sharp (#)
                sharp = True
            else:
                pass
                #print(f"Invalid character '{token}' in input. Skipping.")
            prev_duration = duration
            

# Input: a string of numbers 1-7
if __name__ == "__main__":
    #user_input = input("Enter a string of numbers (1-7) to play notes: ")
    parsed = split_string(songs["song"])
    transpose(-2)
    generate_midi_file(parsed, 1) # 1 = 120bpm, 2 = 60bpm, 1.5 = 90bpm
    play_notes(parsed, 1.7) 