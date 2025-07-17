
<script lang="ts">
    import config from '$lib/configs/api.json';
    import { onMount, onDestroy  } from 'svelte';
    import loading_img from '$lib/img/loading.gif';
    // import AudioPlayer from '$lib/component/AudioPlayer.svelte';
    import { float32ToWavBlob } from '$lib/ts/audioUtils';
    import { isValidUrl } from '$lib/ts/api/vajaApi';
    import setting_logo from '$lib/img/settings.svg';
    import { goto } from '$app/navigation';
    import { browser } from '$app/environment';

    const rateArrey = ["x-low", "low", "100%", "high", "x-high"];
    let slideRate = 3; // เริ่มต้นที่ "100%"
    let voice_name = config.speaker;

    let status = "";
    let status_loading = 0;

    let audio_url = ""

    import io from "socket.io-client";
    let socket: any;
	let sockId: any;
    let bufferList: Float32Array;
    let audioContext: AudioContext;
    let startTime = 0;
    let statusPlay = false;
	let expectedEndTime = 0;
    let source: AudioBufferSourceNode [] = [];
    let countStream = 0;
    let toggleStop = 0;
    let text_proprocess: string = "";
    let isConnected = false;

    let grpc_url = config.socket_url;
    let key_id = "";
    onMount(() => {
        if (browser) {
            grpc_url = localStorage.getItem('url') || config.socket_url;
            key_id = localStorage.getItem('key') || '';
            let speedRate = localStorage.getItem('rate') || "high";
            slideRate = rateArrey.indexOf(speedRate); // เริ่มต้นที่ "100%"
            voice_name = localStorage.getItem('voice') || config.speaker;
        }
        if (key_id !== "") {
            if (isValidUrl(grpc_url)) {
                console.log("✅ gRPC URL is ValidUrl: " + grpc_url);
                socket = io(grpc_url,{transports:['websocket'],timeout: 5000});

                socket.on('connect', () => {
                    console.log("✅ WebSocket connected");
                    isConnected = true;
                });
                socket.on('disconnect', () => {
                    console.log('❌ Disconnected from socket');
                    isConnected = false;
                });
                socket.on('connect_error', (err: any) => {
                    console.log('❌ Connection error:' + err);
                    isConnected = false;
                });
                socket.on('sockid', (data: any) => {
                    console.log("sockid: "+data);
                    sockId = data;
                    status = "Connected to server";
                    syn_handle();
                });
                socket.on('error', (data: any) => {
                    console.log("Error: "+data);
                    text_proprocess = "";
                    syn_handle();
                });
                socket.on('audio_chunk', (data: any) => {
                    const f32Array = new Float32Array(data);
                    const tmp = new Float32Array(bufferList.length + f32Array.length);
                    tmp.set(bufferList, 0);
                    tmp.set(f32Array, bufferList.length);
                    bufferList = tmp;
                    playChunk(f32Array);
                });
                socket.on('audio_end', (data: any) => {
                    console.log("audio_end:" + data);
                    if (bufferList && bufferList.length > 0) {
                        // const blob = new Blob([bufferList], {type:"audio/wav"});
                        const blob = float32ToWavBlob(bufferList, 22050);
                        audio_url = window.URL.createObjectURL(blob);
                        status_loading = 2;
                        status = "Audio synthesis completed.";
                    } else {
                        console.log("❌ No audio data received:"+data);
                        text_proprocess = "";
                        status_loading = 0;
                        statusPlay = false;
                        status = "No audio data received:"+data;
                    }
                });
            } else {
                alert("❌ gRPC URL is not ValidUrl: " + grpc_url);
                goto('Setting');
            }
        } else {
            alert("❌ Please set Api key from Ai4Thai.");
            goto('Setting');
        }
	});
    onDestroy(() => {
        console.log("onDestroy");
		stopAudio();
        if (socket && isConnected) {
            console.log("Disconnecting socket");
            socket.disconnect();
        }
	});
    function playChunk(data: Float32Array) {
        if (toggleStop !== 2) {
            const buffer = audioContext.createBuffer(1, data.length, 22050);
            buffer.getChannelData(0).set(data);

            source[countStream] = audioContext.createBufferSource();
            source[countStream].buffer = buffer;
            source[countStream].connect(audioContext.destination);

            // ตรวจสอบให้เสียงต่อเนื่อง
            const duration = buffer.duration;
            const now = audioContext.currentTime;
            expectedEndTime += buffer.duration;

            // ถ้า startTime ผ่านไปแล้ว ให้ใช้ now แทน
            if (startTime < now) {
                startTime = now;
            }

            source[countStream].start(startTime);
            startTime += duration;

            source[countStream].onended = () => {
                statusPlay = checkPlay();
            };
            countStream++;
        }
  	}
    function stopAudio() {
        if (checkPlay()) {
            toggleStop = 2;
            statusPlay = false;
            startTime = audioContext.currentTime;
            expectedEndTime = 0;
            for (let i=0; i<countStream; i++) {
                if (source[i]) {
                    try {
                        source[i].stop(0);
                    } catch (e) {
                        console.warn("source already stopped", e);
                    }
                }
            }
            console.log("⏹️ Audio stopped");
        }
    }
    function checkPlay() {
		if (audioContext) {
			if (audioContext.currentTime < expectedEndTime) {
				return true;
			}
		} 
        return false;
	}
    async function synSocket(inputText: string) {
        toggleStop = 1;
        countStream = 0;
        source = [];

        if (text_proprocess !== inputText.trim() || !bufferList) {
            text_proprocess = inputText.trim();
            if (socket && isConnected && !checkPlay()) {
                status_loading = 1;
                // downloadSyn(text_proprocess);
                startTime = 0;
                expectedEndTime = 0;
                statusPlay = true;
                bufferList = new Float32Array(0);
                audioContext = new AudioContext();
                console.log("emit synt: "+ text_proprocess);
                socket.emit("synt", {"text": text_proprocess,"voice_name": voice_name,"key": key_id})
            } else {
                alert("Error: socket");
            }
                
        }
        else {
        //     if (bufferList.length > 0 && !checkPlay()) {
        //         startTime = 0;
        //         expectedEndTime = 0;
        //         statusPlay = true;
        //         audioContext = new AudioContext();
        //         playChunk(bufferList);
        //     }
            alert("Please change the text you want to synthesize.");
        }
        
    }


    function selectText() {
        const selection = window.getSelection();
        return selection ? selection.toString() : '';
    }
    async function syn_handle() {
        let testInput = "กรุณาเลือกข้อความที่ต้องการสังเคราะห์เสียงพูด";
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true }) as chrome.tabs.Tab[];
        if (chrome.scripting && tab.id !== undefined) {
            const [result] = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: selectText
            });
            // output = "scripting";
            testInput = result.result ? result.result : "กรุณาเลือกข้อความที่ต้องการสังเคราะห์เสียงพูด";
        } else {
            testInput = "Error";
        }
        // status = selectText();
        synSocket("<prosody rate=\""+rateArrey[slideRate]+"\">"+testInput+"</prosody>");
        
    }
    // async function downloadSyn(inputText: string) {
    //     audio_url = await vaja_synth(inputText);
    //     status_loading = 2
    // }


</script>
<center>
    <br>
    <div class="audio-box">
        <div style="width: 35px;"></div>
        {#if status_loading === 1}
            <img class="img-loading" alt="login logo" src={loading_img} />
        {:else if status_loading === 2 }
            <!-- <AudioPlayer src={audio_url} title="Synthesis Audio"/> -->
            <audio controls>
                <source src={audio_url}>
                Your browser does not support the audio element.
            </audio>

        {:else}
            <div></div>
        {/if}
        <button class="bnt-setting" on:click={() => {goto('Setting');}}>
            <img class="img-setting" src={setting_logo} alt="Setting" />
        </button>
    </div>
    <label for="slider">ความเร็วเสียง: {rateArrey[slideRate]}</label>
    <input type="range" min="0"  max="4" step="1"
        bind:value={slideRate}
        style="width: 235px"
    />
    <div class="buttons">
        <button on:click={syn_handle} disabled={statusPlay}>Start Speaking</button>
        <button on:click={stopAudio} disabled={!statusPlay}>Stop Speaking</button>
    </div>
    <p>{status}</p>
</center>

<style>
    .audio-box {
        display: flex;
        justify-content: space-between;
        width: 350px;
        height: 35px;
        /* border: 1px solid #ccc; */
        align-items: center;
    }
    audio {
        width: 100%;
        height: 35px;
    }
    .buttons {
        margin: 0 auto 40px auto;
        width: 345px;
    }
    .buttons button {
        margin: 0 10px 0 10px;
    }
    .img-loading {
        width: 74px;
        height: 74px;
    }
    .bnt-setting {
        width: 35px;
        height: 35px;
        background-color: transparent;
        border: none;
    }
    .img-setting {
        width: 100%;
        height: 100%;
    }


</style>