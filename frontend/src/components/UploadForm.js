import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import Wavesurfer from "wavesurfer.js";
import {
  Button,
  Container,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
  Box,
  Snackbar,
  IconButton,
  Fade,
  Grid,
} from "@mui/material";
import {
  Close as CloseIcon,
  Upload as UploadIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
} from "@mui/icons-material";

const UploadForm = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const waveformRef = useRef(null);
  const wavesurferRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleFileChange = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      setAudioUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError("");
    setSuccess(false);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "https://silencesense-jncbdec5zjf3nttufkgpr9.streamlit.app/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Server Response:", response.data);
      setResult(response.data);
      setSuccess(true);
    } catch (err) {
      setError("An error occurred while processing the file.");
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPause = () => {
    if (wavesurferRef.current) {
      if (isPlaying) {
        wavesurferRef.current.pause();
      } else {
        wavesurferRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleCloseSnackbar = () => {
    setError("");
    setSuccess(false);
  };

  const handleWaveformClick = (event) => {
    const waveWidth = waveformRef.current.clientWidth;
    const clickX =
      event.clientX - waveformRef.current.getBoundingClientRect().left;
    const percentage = clickX / waveWidth;
    wavesurferRef.current.seekTo(percentage);
    if (!isPlaying) {
      wavesurferRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimestampClick = (timestamp) => {
    if (!wavesurferRef.current) return;

    const duration = wavesurferRef.current.getDuration();
    if (
      duration <= 0 ||
      isNaN(timestamp) ||
      timestamp < 0 ||
      timestamp > duration
    )
      return;

    const percentage = timestamp / duration;
    wavesurferRef.current.seekTo(percentage);
    if (!isPlaying) {
      wavesurferRef.current.play();
      setIsPlaying(true);
    }
  };

  const parseTime = (timeStr) => {
    const [minutes, seconds] = timeStr.split(":").map(Number);
    return minutes * 60 + seconds;
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(
      2,
      "0"
    )}`;
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleFileChange,
    accept: ".mp3",
    multiple: false,
  });

  useEffect(() => {
    if (waveformRef.current && audioUrl) {
      wavesurferRef.current = Wavesurfer.create({
        container: waveformRef.current,
        waveColor: "#e1ff1c",
        progressColor: "#f58327",
        height: 150,
        responsive: true,
        barWidth: 2,
        cursorColor: "#e1ff1c",
        cursorWidth: 2,
        interact: true,
        fillParent: true,
      });

      wavesurferRef.current.load(audioUrl);

      wavesurferRef.current.on("ready", () => {
        wavesurferRef.current.setVolume(1);
      });

      wavesurferRef.current.on("audioprocess", () => {
        const time = wavesurferRef.current.getCurrentTime();
        setCurrentTime(time);
      });

      waveformRef.current.addEventListener("click", handleWaveformClick);

      return () => {
        if (wavesurferRef.current) {
          wavesurferRef.current.destroy();
        }
      };
    }
  }, [audioUrl]);

  return (
    <Container
      component="main"
      maxWidth="lg"
      sx={{ mt: 4, mb: 4, backgroundColor: "#0a0a0a", color: "#ffffff" }}
    >
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: "bold",
            mb: 2,
            color: "#e1ff1c",
          }}
        >
          SilenceSense
        </Typography>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {result
            ? `Total Silence Duration: ${result.total_silence_duration.toFixed(
                2
              )} seconds`
            : "Upload an MP3 file to see results"}
        </Typography>
      </Box>

      {}
      <Box
        {...getRootProps()}
        sx={{
          p: 4,
          border: "2px dashed",
          borderColor: "#e1ff1c",
          borderRadius: 4,
          textAlign: "center",
          backgroundColor: "#1e1e1e",
          boxShadow: 4,
          transition: "background-color 0.3s, border-color 0.3s",
          mb: 4,
          "&:hover": {
            cursor: "pointer",
            backgroundColor: "#333",
            borderColor: "#f58327",
          },
        }}
      >
        <input {...getInputProps()} />
        <Typography variant="h6" sx={{ mb: 2, color: "#e1ff1c" }}>
          <UploadIcon fontSize="large" /> Drag & Drop MP3 File Here or Click to
          Select
        </Typography>
        <Typography variant="body1" sx={{ color: "#ffffff" }}>
          Supported format: MP3
        </Typography>
      </Box>

      {}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Button
          variant="contained"
          sx={{
            mt: 2,
            backgroundColor: "#f58327",
            color: "#ffffff",
            "&:hover": {
              backgroundColor: "#e1ff1c",
              color: "#0a0a0a",
            },
          }}
          onClick={handleSubmit}
          disabled={loading || !file}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Upload"}
        </Button>
      </Box>

      <Grid container spacing={4}>
        {}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              backgroundColor: "#1e1e1e",
              boxShadow: 4,
              borderRadius: 2,
              position: "relative",
            }}
          >
            <Typography variant="h5" sx={{ mb: 2, color: "#e1ff1c" }}>
              Audio Waveform
            </Typography>
            <Box ref={waveformRef} sx={{ height: 150, mb: 2 }}></Box>
            <Box sx={{ textAlign: "center" }}>
              <Button
                variant="contained"
                color={isPlaying ? "secondary" : "primary"}
                onClick={handlePlayPause}
                sx={{
                  mb: 2,
                  backgroundColor: isPlaying ? "#f58327" : "#e1ff1c",
                  color: "#ffffff",
                  "&:hover": {
                    backgroundColor: isPlaying ? "#e1ff1c" : "#f58327",
                  },
                }}
              >
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </Button>
              <Typography
                variant="body2"
                sx={{
                  position: "absolute",
                  bottom: 8,
                  left: 16,
                  color: "#e1ff1c",
                }}
              >
                {formatTime(currentTime)}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              backgroundColor: "#1e1e1e",
              boxShadow: 4,
              borderRadius: 2,
              position: "relative",
            }}
            className="silence-detection"
          >
            <Typography variant="h5" sx={{ mb: 2, color: "#e1ff1c" }}>
              Silence Detection
            </Typography>
            {file && (
              <Typography variant="body1" sx={{ mb: 2, color: "white" }}>
                File Uploaded: {file.name}
              </Typography>
            )}
            {loading && <CircularProgress />}
            {!loading && result && result.silences.length > 0 && (
              <List>
                {result.silences.map((silence, index) => (
                  <ListItem
                    button
                    key={index}
                    onClick={() =>
                      handleTimestampClick(parseTime(silence.start))
                    }
                  >
                    <ListItemText
                      primary={`Silence: ${silence.start} - ${silence.end}`}
                      primaryTypographyProps={{ sx: { color: "#e1ff1c" } }}
                      secondary={`${silence.duration.toFixed(2)} seconds`}
                      secondaryTypographyProps={{ sx: { color: "#f58327" } }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
            {!loading && !result && (
              <Typography variant="body1" sx={{ mb: 2, color: "white" }}>
                No results to display.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        TransitionComponent={Fade}
      >
        <Paper
          elevation={6}
          sx={{
            backgroundColor: "#FFCDD2",
            padding: 2,
            display: "flex",
            alignItems: "center",
          }}
        >
          <Typography variant="body1" sx={{ flexGrow: 1, color: "#D32F2F" }}>
            {error}
          </Typography>
          <IconButton onClick={handleCloseSnackbar} sx={{ color: "#D32F2F" }}>
            <CloseIcon />
          </IconButton>
        </Paper>
      </Snackbar>

      {}
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        TransitionComponent={Fade}
      >
        <Paper
          elevation={6}
          sx={{
            backgroundColor: "#C8E6C9",
            padding: 2,
            display: "flex",
            alignItems: "center",
          }}
        >
          <Typography variant="body1" sx={{ flexGrow: 1, color: "#388E3C" }}>
            File processed successfully!
          </Typography>
          <IconButton onClick={handleCloseSnackbar} sx={{ color: "#388E3C" }}>
            <CloseIcon />
          </IconButton>
        </Paper>
      </Snackbar>
    </Container>
  );
};

export default UploadForm;
