import mido
from mido import Message, open_output, MidiFile, MidiTrack
import time

#songs
songs = {
    "twinkle": "1 1 5 5 6 6 5- 4 4 3 3 2 2 1",

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
        # Create a new MIDI file with a single track
        midi = MidiFile()
        track = MidiTrack()
        midi.tracks.append(track)

        track.append(Message('program_change', program=0, time=0))  # Set instrument to Acoustic Grand Piano

        # Play each note in the input string and write to MIDI file
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
                time.sleep(duration)
                output.send(Message('note_off', note=note, velocity=64))

                track.append(Message('note_on', note=note, velocity=64, time=0))
                track.append(Message('note_off', note=note, velocity=64, time=int(960 * duration)))
            elif token[0] == '-':
                time.sleep(duration)
                track.append(Message('note_off', note=0, velocity=0, time=int(960 * duration)))
            elif token[0] == '.':
                time.sleep(duration / 2)
                track.append(Message('note_off', note=0, velocity=0, time=int(960 * duration/2)))
            else:
                print(f"Invalid character '{token}' in input. Skipping.")
        midi.save('output_midi/song.mid')
            

# Input: a string of numbers 1-7
if __name__ == "__main__":
    #user_input = input("Enter a string of numbers (1-7) to play notes: ")
    parsed = split_string(songs["twinkle"])
    transpose(3)
    play_notes(parsed, .6)