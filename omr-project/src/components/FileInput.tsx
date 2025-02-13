import React, { useState } from "react"
import * as Tone from "tone"
import { Midi } from "@tonejs/midi"
import { useCharGrid, useUpdateCharGrid } from "../contexts/charGridContext"

import '../styles/FileInput.css'
import { useTokens, useUpdateTokens } from "../contexts/tokenContext"

let steps = 0
let timeout:any

function FileInput() {

    const [midiURL, setMidiURL] = useState<string>("")
    const [midi, setMidi] = useState<Midi | null>(null)
    const [isPlaying, setIsPlaying] = useState<boolean>(false)
    const [predictingMidi, setpredictingMidi] = useState<boolean>(false)
    const [bpm, setBpm] = useState<number>(120)

    // Contexts
    const charGrid = useCharGrid()
    const setCharGrid = useUpdateCharGrid()
    const tokens = useTokens()
    const setTokens = useUpdateTokens()

    const deleteRow = (page:number, row:number) => {
        setCharGrid(grid => {
            return  grid.map((p, pageIndex) => 
                pageIndex === page ? p.filter((_, i) => i !== row) : p
            )
        })
        setTokens(grid => {
            return  grid.map((p, pageIndex) => 
                pageIndex === page ? p.filter((_, i) => i !== row) : p
            )
        })
    }

    const predictMidi = async () => {
        
        setpredictingMidi(true)
        let res:any
        if (charGrid.length !== 0 && tokens.length === 0) {
            let token_grid = []
            for (let i=0;i<charGrid.length;i++) {
                const data = {'char_list': charGrid[i], 'bpm': bpm, 'steps': steps}
                let response = await fetch(`${import.meta.env.VITE_API_URL}/omr-results`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json'},
                        body: JSON.stringify(data)
                    })
    
                res = await response.json()
    
                // Reshape tokens to match char_grid
                let reshaped_tokens = []
                let res_token_idx = 0
                for (let j=0;j<charGrid[i].length;j++) {
                    let token_row:string[] = []
                    for (let k=0;k<charGrid[i][j].length;k++) {
                            token_row.push(res.tokens[res_token_idx])
                            res_token_idx++
                    }
                    reshaped_tokens.push(token_row)
                }
                token_grid.push(reshaped_tokens)
            }
            setTokens(token_grid)
        }
        setpredictingMidi(false)
    }

    const generateMidi = async () => {
        let res:any
        if (tokens.length != 0) {
            const data = {'tokens': tokens.flat(2), 'bpm': bpm, 'steps': steps}
            let response = await fetch(`${import.meta.env.VITE_API_URL}/omr-results`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json'},
                    body: JSON.stringify(data)
                })
            res = await response.json()
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
                Tone.getTransport().schedule((time) => {
                    sampler.triggerAttackRelease(
                        note.name,
                        note.duration,
                        time,
                        note.velocity
                    )
                }, note.time)
            })
            Tone.getTransport().start()
            setIsPlaying(true)
            timeout = setTimeout(() => {
                Tone.getTransport().stop()
                Tone.getTransport().cancel()
                setIsPlaying(false)
            }, track.duration * 1000)
        }
    }

    const stopMidi = () => {
        Tone.getTransport().stop()
        Tone.getTransport().cancel()
        clearInterval(timeout)
        setIsPlaying(false)
    }

    const updateTokens = (x:number, y:number, z:number, token:string) => {
        setTokens(prev => {
            let temp = [...prev]
            temp[x][y][z] = token
            return temp
        })

    }

    const updateBpm = (e:any) => {
        setBpm(Number(e.target.value))
    }
    const updateSteps = (e:any) => {
        steps = Number(e.target.value)
    }

    return (
        <div>
            {charGrid.map((page, pageIndex) => {
                return (
                <div key={`${pageIndex}`}>
                    <span>Page {pageIndex}</span>
                    {page.map((row, rowIndex) => {
                        return (
                        <div key={`${pageIndex}-${rowIndex}`} className="horizontal">
                            <div>
                                <span>Line {rowIndex}</span>
                                <button onClick={() => deleteRow(pageIndex, rowIndex)}>
                                    <i className="fa-solid fa-trash"></i>
                                </button>
                            </div>
                            {row.map((char, colIndex) => {
                                return (
                                <div className="vertical" key={`${pageIndex}-${rowIndex}-${colIndex}`}>
                                    <img 
                                        src={`data:image/png;base64,${char}`} 
                                        alt=""
                                        style={{ border: '1px solid black' }} 
                                    />
                                    <input className="token-input" type="text" 
                                        value={tokens.length > 0 ? tokens[pageIndex][rowIndex][colIndex] : ''} 
                                        onChange={(e) => updateTokens(pageIndex, rowIndex, colIndex, e.target.value)}
                                    />
                                </div>
                            )})}    
                        </div>
                    )})}
                </div>
            )})}

            <input type="range" id="bpm" min="40" max="140" value={bpm} onChange={updateBpm}/>
            <label htmlFor="bpm">BPM: {bpm}</label><br/>
            {/* remove temp br tag later */}
            <label htmlFor="transpose">Transpose</label>
            <input type="number" id="tranpose" defaultValue={steps} onChange={updateSteps}/>
            <div style={{display: "flex"}}>
                <button onClick={predictMidi} disabled={(predictingMidi)} >Predict</button>
                {predictingMidi &&
                    <span>Predicting Notes...</span>
                }
                <button onClick={generateMidi} disabled={tokens.length === 0}>Generate MIDI</button>
                {midiURL && !predictingMidi && (
                    <div>
                        <a href={midiURL} download="song.mid">Download MIDI File</a>
                        <button onClick={playMidi}>Play MIDI</button>
                        <button onClick={stopMidi}>Stop</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default FileInput