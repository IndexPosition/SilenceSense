from flask import Flask, request, jsonify
from flask_cors import CORS
import tempfile
import os
import librosa
import numpy as np
import webrtcvad

app = Flask(__name__)
CORS(app)

def read_mp3(file_path):
    audio, sample_rate = librosa.load(file_path, sr=16000, mono=True)
    audio = np.int16(audio * 32767)
    return audio, sample_rate

def frame_generator(frame_duration_ms, audio, sample_rate):
    n_samples_per_frame = int(sample_rate * frame_duration_ms / 1000)
    for start in range(0, len(audio), n_samples_per_frame):
        yield audio[start:start + n_samples_per_frame]

def vad_collector(sample_rate, frame_duration_ms, padding_duration_ms, vad, frames):
    num_padding_frames = int(padding_duration_ms / frame_duration_ms)
    ring_buffer = []
    triggered = False

    silences = []
    silence_start = None

    for i, frame in enumerate(frames):
        frame_bytes = np.array(frame, dtype=np.int16).tobytes()
        
        if len(frame_bytes) != frame_duration_ms * sample_rate // 1000 * 2:
            continue
        
        is_speech = vad.is_speech(frame_bytes, sample_rate)

        if not triggered:
            ring_buffer.append(frame_bytes)
            if len(ring_buffer) > num_padding_frames:
                ring_buffer.pop(0)
            if sum(1 for f in ring_buffer if vad.is_speech(f, sample_rate)) == 0:
                triggered = True
                silence_start = i * frame_duration_ms
        else:
            if is_speech:
                triggered = False
                silence_end = i * frame_duration_ms
                silence_duration = (silence_end - silence_start) / 1000.0
                silences.append((silence_start, silence_end, silence_duration))

    return silences

def format_time(milliseconds):
    seconds = milliseconds / 1000
    minutes, seconds = divmod(seconds, 60)
    return f"{int(minutes)}:{int(seconds):02}"

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and file.filename.endswith('.mp3'):
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as temp_file:
            file_path = temp_file.name
            file.save(file_path)

            temp_file.close()

            try:
                audio, sample_rate = read_mp3(file_path)
                vad = webrtcvad.Vad()
                vad.set_mode(3)  # 0 = Aggressive, 3 = Very Aggressive
                
                frames = frame_generator(30, audio, sample_rate)
                silences = vad_collector(sample_rate, 30, 300, vad, list(frames))
                
                result = []
                for start, end, duration in silences:
                    start_time = format_time(start)
                    end_time = format_time(end)
                    result.append({
                        'start': start_time,
                        'end': end_time,
                        'duration': duration
                    })

                return jsonify({
                    'silences': result,
                    'total_silence_duration': sum(duration for _, _, duration in silences)
                })
            except Exception as e:
                return jsonify({'error': str(e)}), 500
            finally:
                os.remove(file_path)
    else:
        return jsonify({'error': 'Invalid file format'}), 400

if __name__ == '__main__':
    app.run(debug=True)
