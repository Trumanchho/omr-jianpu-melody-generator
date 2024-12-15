import mido
from mido import Message, open_output, MidiFile, MidiTrack
import time

#songs
songs = {
    "sol1p132": "1u2u 35-5u6uw 52-3u2u 1.2u3.1u 5--. 5u 4-.4u3u2u 321- -4u3u4.5u 2--1u2u 35-5u6uw 52-3u2u 1.2u3.6u 5--.5u 4-.4u3u2u 351h- -1hu7u6.7u 1h--- -1h76 3--- -653 2--- -6lu7lu1u6lu1u2u 3--- -6l16l 5--- -1h76 3--- -676 5--- -1u2u3.5u 5--- -04u3u2.1u 1---",
    "hc23p50" : "5u4u3.2u352-.4u3u2u11u7lu123--1u7lu6l7lu1u22u6u53u2u1.4u4.3u452-. 5lu5u4u3.2u352-.4u3u2u1.7lu123--1u7lu6l7lu1u22u6u53u2u1-4u43u4u3u4u6u65------1h-7.6u5---6.6u5.4u3--3u2u12u3-1hu765-6-5.4u5---1h-7.6u5---6u66u5.4u3--3u2u12u3.1hu1hu76u5-.66u6u5u54u5-321---",
    "hc24p21" : "5.3u21u6lu5l6lu3lu5l- 5l.1u6l1u2u36u5u3- 2.3u5u3u21.3u2u1u6l 5l1u2u32u1u6l--- 5.3u21u6lu5l6lu3lu5l- 35u6u32u1u6l--- 61hu6u56u5u35u3u2- 5lu6lu1u2u35u6u25u3u1-"

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

def transpose(half_steps):
    for key in note_map:
        note_map[key] += half_steps

def split_string(string):
    """
    Split a string into a list of tokens.
    """
    string = string.replace(" ", "")
    tokens = []
    i = 0
    while i < len(string):
        token = string[i]
        i += 1
        while i < len(string) and string[i].isalpha():
            token += string[i]
            i += 1
        tokens.append(token)
    print(tokens)
    return tokens

def play_notes(token_arr, duration):
    """
    Play MIDI notes corresponding to numbers 1-7.

    :param note_string: String of numbers '1-7' representing notes
    :param duration: Duration to play each note (in seconds)
    """
    tempo = duration
    # List available MIDI output ports
    output_names = mido.get_output_names()
    if not output_names:
        print("No MIDI output ports found. Please connect a MIDI synth or software.")
        return

    port_name = output_names[0]  # Use the first available MIDI output port

    # Open the MIDI output port
    with open_output(port_name) as output:
        mid = MidiFile()
        track = MidiTrack()
        for token in token_arr:
            duration = tempo
            if token[0] in note_map:
                note = note_map[token[0]]
                if len(token) > 1:
                    if 'h' in token:
                        note += 12
                    elif 'l' in token:
                        note -= 12
                    if 'u' in token:
                        duration /= 2
                    elif 'w' in token:
                        duration /= 4
                output.send(Message('note_on', note=note, velocity=64))
                time.sleep(duration)  # Hold note for duration
                output.send(Message('note_off', note=note, velocity=64))
            elif token[0] == '-':
                time.sleep(duration)
            elif token[0] == '.':
                time.sleep(duration / 2)
            else:
                print(f"Invalid character '{token}' in input. Skipping.")

# Input: a string of numbers 1-7
if __name__ == "__main__":
    #user_input = input("Enter a string of numbers (1-7) to play notes: ")
    parsed = split_string(songs["hc24p21"])
    transpose(3)
    play_notes(parsed, .8)