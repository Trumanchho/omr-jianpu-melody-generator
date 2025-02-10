import React, { useState } from "react"
import * as Tone from "tone"
import { Midi } from "@tonejs/midi"
import './FileInput.css'

function FileInput() {

    const [imageSrc, setImageSrc] = useState<string | null>(null)
    const [charGrid, setCharGrid] = useState<string[][]>([])
    const [tokens, setTokens] = useState<string[]>([])
    const [midiURL, setMidiURL] = useState<string>("")
    const [midi, setMidi] = useState<Midi | null>(null)
    const [isPlaying, setIsPlaying] = useState<boolean>(false)
    const [generatingMidi, setGeneratingMidi] = useState<boolean>(false)
    const [bpm, setBpm] = useState<number>(120)

    let token_idx:number = 0

    const resetFile = (e:any) => {
        e.target.value = null
        setTokens([])
        // Clear all text inputs (maybe select by class in case other text inputs are used)
        const inputs = document.querySelectorAll('input[type="text"]')
        inputs.forEach(input => {
            (input as HTMLInputElement).value = '' 
        })
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
        setGeneratingMidi(true)
        let res:any
        if (tokens.length != 0) {
            const data = {'tokens': tokens, 'bpm' : bpm}
            let response = await fetch(`${import.meta.env.VITE_API_URL}/omr-results`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json'},
                    body: JSON.stringify(data)
                })
            res = await response.json()
        } else if (charGrid.length !== 0) {
            const data = {'char_list': charGrid, 'bpm': bpm}
            let response = await fetch(`${import.meta.env.VITE_API_URL}/omr-results`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json'},
                    body: JSON.stringify(data)
                })

            res = await response.json()
            setTokens(res.tokens)
        }

        // Start of code adapted from https://saturncloud.io/blog/creating-a-blob-from-a-base64-string-in-javascript/#:~:text=BLOB%20in%20JavaScript-,To%20convert%20a%20Base64%20string%20to%20a%20BLOB%20in%20JavaScript,creates%20a%20new%20BLOB%20object.
        if (res) {
            let byteCharacters = atob(res.b64_midi_file)
            let byteArrays = []
    
            for (let i=0; i<byteCharacters.length; i++) {
                byteArrays.push(byteCharacters.charCodeAt(i))
            }
    
            let byteArray = new Uint8Array(byteArrays)
            // End of adapted code
            let blob = new Blob([byteArray])
            
            let midi = new Midi(byteArray.buffer)
            setMidi(midi)
            setMidiURL(URL.createObjectURL(blob))
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
            // End of adapted code

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

    const updateTokens = (tokenIdx:number, token:string) => {
        setTokens(prev => {
            let temp = [...prev]
            temp[tokenIdx] = token
            return temp
        })
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
                    <div key={rowIndex} className="horizontal">
                        <div>
                            <span>Line {rowIndex}</span>
                            <button onClick={() => deleteRow(rowIndex)}>
                                <i className="fa-solid fa-trash"></i>
                            </button>
                        </div>
                        {row.map((char, colIndex) => {
                            token_idx++
                            return (
                            <div className="vertical" key={`${rowIndex}-${colIndex}`}>
                                <img 
                                    src={`data:image/png;base64,${char}`} 
                                    alt=""
                                    style={{ border: '1px solid black' }} 
                                />
                                <input id={`${token_idx-1}`} className="token-input" type="text" 
                                    value={tokens[token_idx-1]} 
                                    onChange={(e) => updateTokens(Number(e.target.id), e.target.value)}
                                />
                            </div>
                        )})}    
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