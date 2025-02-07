import React, { useState } from "react"
import * as Tone from "tone"
import { Midi } from "@tonejs/midi"

function FileInput() {

    const [imageSrc, setImageSrc] = useState<string | null>(null)
    const [charGrid, setCharGrid] = useState<string[][]>([])
    const [midiURL, setMidiURL] = useState<string>("")
    const [midi, setMidi] = useState<Midi | null>(null)
    const [isPlaying, setIsPlaying] = useState<boolean>(false)
    const [generatingMidi, setGeneratingMidi] = useState<boolean>(false)
    const [bpm, setBpm] = useState<number>(120)

    const resetFile = (e:any) => {
        e.target.value = null
    }

    const uploadFile = async (e:any) => {
        
        let file = e.target.files[0]
        if (file) {
            const data = new FormData()
            data.append("file", file)

            let response = await fetch(`${import.meta.env.VITE_API_URL}/omr-results`,
                {
                    method: 'POST',
                    body: data,
                }
            )

            let result = await response.json()
            setImageSrc(`data:image/png;base64,${result.image}`)
            setCharGrid(result.char_list)
        }

    }

    const deleteRow = (idx:number) => {
        setCharGrid(grid => grid.filter((_, i) => i !== idx))
    }

    const generateMidi = async (e:any) => {
        if (charGrid.length !== 0) {
            setGeneratingMidi(true)
            const data = {"char_list": charGrid, "bpm": bpm}
            let response = await fetch(`${import.meta.env.VITE_API_URL}/omr-results`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json'},
                    body: JSON.stringify(data)
                }
            )

            let res = await response.blob()
            let buffer = await res.arrayBuffer()
            let midi = new Midi(buffer)
            setMidi(midi)
            setMidiURL(URL.createObjectURL(res))
            setGeneratingMidi(false)
        }
    }

    const playMidi = async () => {
        if (midi && !isPlaying) {

            // Start of code from https://tonejs.github.io/ 
            const sampler = new Tone.Sampler({
                urls: {
                    C4: "C4.mp3",
                    "D#4": "Ds4.mp3",
                    "F#4": "Fs4.mp3",
                    A4: "A4.mp3",
                },
                release: 1,
                baseUrl: "https://tonejs.github.io/audio/salamander/",
            }).toDestination();
            // End of code from https://tonejs.github.io/ 

            await Tone.loaded()
            let track = midi.tracks[0]
            let now = Tone.now();
    
            track.notes.forEach(note => {
                sampler.triggerAttackRelease(
                    note.name,
                    note.duration,
                    now + note.time,
                    note.velocity
                )
            })
            await Tone.start()
            setIsPlaying(true)
            setTimeout(() => {
                setIsPlaying(false)
            }, track.duration * 1000)
        }
    }

    const updateBpm = (e:any) => {
        setBpm(Number(e.target.value))
    }

    return (
        <div>
            <label htmlFor="myfile">Upload File:</label>
            <input type="file" id="myfile" name="myfile" onChange={uploadFile} onClick={resetFile}/>
            {/* <button onClick={uploadFile}>Detect Jianpu</button> */}

            {imageSrc && <img src={imageSrc} alt="Bounding Boxes" />}
            <div>
                {charGrid.map((row, rowIndex) => (
                    <div key={rowIndex}>
                        <div>
                            <span>Line {rowIndex}</span>
                            <button onClick={() => deleteRow(rowIndex)}>
                                <i className="fa-solid fa-trash"></i>
                            </button>
                        </div>
                        {row.map((char, colIndex) => (
                            <img 
                                key={`${rowIndex}-${colIndex}`}
                                src={`data:image/png;base64,${char}`} 
                                alt=""
                                style={{ border: '1px solid black' }} 
                            />
                        ))}
                    </div>
                ))}
                <input type="range" id="bpm" min="40" max="140" value={bpm} onChange={updateBpm}/>
                <label htmlFor="bpm">BPM: {bpm}</label>
                <div style={{display: "flex"}}>
                    <button onClick={generateMidi}>Generate</button>
                    {generatingMidi &&
                        <span>Generating...</span>
                    }
                    {midiURL && !generatingMidi && (
                        <div>
                            <a href={midiURL} download="song.mid">Download MIDI File</a>
                            <button onClick={playMidi}>Play MIDI</button>
                        </div>
                    )}
                </div>
            </div>


        </div>
    );
}

export default FileInput