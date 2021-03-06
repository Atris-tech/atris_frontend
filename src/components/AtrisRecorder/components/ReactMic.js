import React, { Component } from "react";
import { blobToArrayBuffer } from "blob-util";
import { saveAs } from "file-saver";

import "./ReactMic.css";
import mic_not_allow from "../assets/mic-not-allow.svg";
import cross_icon from "../assets/cross-icon.svg";
import record_icon from "../assets/record.svg";
import pause from "../assets/pause.svg";
import settings from "../assets/settings.svg";
import CanvasControls from "./CanvasControls";
import AudioContext from "../libs/AudioContext";
import Visualizer from "../libs/Visualizer";

let recorderStates = {
  allow_mic: "allow_mic",
  wait_record: "wait-record",
  active: "active",
  active_paused: "active paused",
  processing: "processing",
  preview: "preview"
};
export default class ReactMic extends Component {
  state = {
    recorder_state: recorderStates.wait_record,
    dialog_settings: false,
    start_request: false,
    isRecording: false,
    isPaused: false,
    blobURL: null,
    audioViz_playing: false,
    audioBufferSourceNode: null, // used to pause, resume and play the final player,
    audioPlayer_pausedAt: 0,
    audioPlayer_startedAt: null,
    audioPlayer_paused: true, // initially player is not playing, means its paused
    audioPlayer_resume: false,
    totalTimerSeconds: 0,
    timerActive: false,
    timeString: "00:00"
  };

  startRecording = () => {
    this.setState({
      recorder_state: recorderStates.active
    });
  };

  stopRecording = () => {
    this.setState({ isRecording: false });
  };

  onSave = blobObject => {};

  onStart = () => {};

  setRef = childRef => {
    this.canvasRef = childRef;
  };

  onStop = blobObject => {
    let blobURL = window.URL.createObjectURL(blobObject);
    this.setState({ blobURL: blobURL });

    this.props.onStop(blobObject) // send complete audio blob to server by ws

    blobToArrayBuffer(blobObject)
      .then(function(arrayBuff) {
        console.log(arrayBuff, "xxx xx ");

        return AudioContext.decodeAudioData(arrayBuff);
      })
      .then(buffer => {
        this.setState({
          buffer_audioData: buffer
        });
      })
      .catch(err => {
        console.log(err, " at audio decode and viz");
      });
  };

  audioPlayer_play = () => {
    const { buffer_audioData } = this.state;
    this.setState({
      audioViz_playing: true
    });

    console.log(buffer_audioData.duration, "xx x112");

    const canvas = this.canvasRef;
    const canvasCtx = canvas.getContext("2d");
    let width = 1366;
    let height = 120;
    let backgroundColor = "";
    let strokeColor = "#07cf89";

    console.log(new Date(), "time");

    const audioEndCallBack = () => {
      let totalAudioTime = buffer_audioData.duration * 1000;
      this.setState({
        audioPlayer_paused: true
      });

      let timeOffset =
        this.state.audioPlayer_pausedAt +
        Date.now() -
        this.state.audioPlayer_startedAt;

      console.log(timeOffset, "timeOffset");

      console.log("teeest", timeOffset - totalAudioTime);
      if (Math.abs(timeOffset - totalAudioTime) < 50) {
        this.setState({
          audioPlayer_resume: false,
          audioPlayer_pausedAt: 0
        });
      }
    };

    const setAudioBufferSourceNode = sourceNode => {
      this.setState({
        audioBufferSourceNode: sourceNode
      });
    };

    if (this.state.audioPlayer_resume === false) {
      //audio is being played first time

      this.setState({
        audioPlayer_startedAt: Date.now()
      });

      let playTimeOffset = 0;

      Visualizer.playerSineWave(
        canvasCtx,
        canvas,
        width,
        height,
        backgroundColor,
        strokeColor,
        buffer_audioData,
        audioEndCallBack,
        setAudioBufferSourceNode,
        playTimeOffset
      );
    }

    if (this.state.audioPlayer_resume === true) {
      this.setState({
        audioPlayer_startedAt: Date.now()
      });

      // console.log("xxx 111", this.state.audioPlayer_pausedAt);

      let playTimeOffset = this.state.audioPlayer_pausedAt / 1000;
      Visualizer.playerSineWave(
        canvasCtx,
        canvas,
        width,
        height,
        backgroundColor,
        strokeColor,
        buffer_audioData,
        audioEndCallBack,
        setAudioBufferSourceNode,
        playTimeOffset
      );
    }
  };

  audioPlayer_pause = () => {
    let { audioBufferSourceNode } = this.state;
    audioBufferSourceNode.stop(0);

    let timeOffset =
      this.state.audioPlayer_pausedAt +
      Date.now() -
      this.state.audioPlayer_startedAt;
    this.setState({
      audioPlayer_pausedAt: timeOffset,
      audioPlayer_paused: true,
      audioPlayer_resume: true
    });

    console.log("audioPlayer_resume: true");
  };

  onData = recordedBlob => {
    console.log("ONDATA CALL IS BEING CALLED! ", recordedBlob);
    // this.sendMessage(recordedBlob);
    this.props.onData(recordedBlob);
  };

  onBlock = () => {
    // alert("ya blocked me!");
    this.setState({
      isRecording: false,
      recorder_state: recorderStates.allow_mic
    });
  };

  onPause = () => {
    console.log("main onPause");
  };

  setTime = () => {
    this.setState(
      {
        totalTimerSeconds: this.state.totalTimerSeconds + 1
      },
      () => {
        let totalSeconds = this.state.totalTimerSeconds;
        let minutes = this.formatTime(parseInt(totalSeconds / 60));
        let seconds = this.formatTime(totalSeconds % 60);
        let timeString = "" + minutes + ":" + seconds;
        this.setState({
          timeString: timeString
        });
      }
    );
  };
  setTimeState = state => {
    // state can be active pause reset

    if (state === "active") {
      this.interval = setInterval(() => {
        this.setTime();
      }, 1000);
    }
    if (state === "pause") {
      clearInterval(this.interval);
    }
    if (state === "reset") {
      clearInterval(this.interval);
      this.setState({
        totalTimerSeconds: 0
      });
    }
  };
  formatTime = val => {
    // use as seconds = formatTime(totalSeconds % 60)
    // minutes = formatTime(parseInt(totalSeconds / 60)
    var valString = val + "";
    if (valString.length < 2) {
      return "0" + valString;
    } else {
      return valString;
    }
  };

  componentDidMount = () => {
   };

  componentDidUpdate = (prevProps, prevState) => {
    if (prevState.recorder_state !== this.state.recorder_state) {
      if (
        prevState.recorder_state === recorderStates.wait_record &&
        this.state.recorder_state === recorderStates.active
        //state wait record to acitve
      ) {
        this.setState({
          isRecording: true,
          isPaused: false
        });
        this.setTimeState("active"); // start timer
      }

      if (
        prevState.recorder_state === recorderStates.active_paused &&
        this.state.recorder_state === recorderStates.active
        //state active paused to acitve
      ) {
        this.setState({
          isRecording: true,
          isPaused: false
        });
        this.setTimeState("active"); // start timer
      }

      if (this.state.recorder_state === recorderStates.active_paused) {
        this.setState({
          isRecording: true,
          isPaused: true
        });
        this.setTimeState("pause"); // stop timer
      }
      if (this.state.recorder_state === recorderStates.processing) {
        this.setState({
          isRecording: false,
          isPaused: false
        });
        //clear timer
        this.setTimeState("reset"); // stop timer
      }
    }
  };

  render() {
    const { blobURL, isRecording, isPaused } = this.state;

    return (
      <div className="root_padding">
        <div className="vr-voice-recorder-container">
          {
            //allow-mic wait-record reset [active (active paused) add class below] processing preview
          }
          <div className={`voice-recorder ${this.state.recorder_state}`}>
            <div className="allow-mic-message ">
              <div className="mic-icon">
                <img src={mic_not_allow} alt="mic-not-allow-icon" />
              </div>
              <div>Please allow access to your microphone to continue…</div>
            </div>
            <div className="reaching-max-time-msg">
              <div className="msg">
                {" "}
                You are reaching maximum record time. Recording will be stopped
                in
                <span className="time"></span>
              </div>
            </div>
            <div className="press-mic-message">
              <div>Click the button to start recording…</div>
            </div>
            <div className="waveform-container">
              <div className="audio-editor">
                <div
                  className={`top-controls ${this.state.recorder_state ===
                    recorderStates.preview && "visible"}`}
                >
                  <button
                    className="btn-quit"
                    onClick={() => {
                      // Clean up work below
                      this.setState({
                        recorder_state: recorderStates.wait_record,
                        blobURL: null
                      });
                      AudioContext.resetAnalyser();
                    }}
                  >
                    <img src={cross_icon} alt="quit-icon" />
                  </button>
                </div>
                <div className="canvas-and-controls">
                  <div className="waveform-canvas-container">
                    <div className="selection-area"></div>
                    <div className="canvas-wrapper">
                      <CanvasControls
                        className="waveform_canvas"
                        width={1366}
                        height={120}
                        isRecording={isRecording}
                        isPaused={isPaused}
                        backgroundColor="#000"
                        visualSetting="sinewave"
                        audioBitsPerSecond={128000}
                        recorder_state={this.state.recorder_state}
                        startRecording={this.startRecording}
                        onStop={this.onStop}
                        onStart={this.onStart}
                        onSave={this.onSave}
                        onData={this.onData}
                        onBlock={this.onBlock}
                        onPause={this.onPause}
                        strokeColor="#07cf89"
                        setRef={this.setRef}
                      />
                    </div>
                    <div className="play-progress-line"></div>
                  </div>
                  <div className="control-bars-wrapper">
                    <div className="record-controls">
                      <div className="control-bar cb-left"></div>
                      <div className="control-bar cb-right"></div>
                    </div>
                  </div>
                </div>
                <div className="controls flex">
                  <div className="flex-1">
                    <button
                      className={`play-button ${!this.state
                        .audioPlayer_paused && "playing"}`}
                      onClick={() => {
                        if (this.state.audioPlayer_paused === true) {
                          //audio not playing
                          this.setState(
                            {
                              audioPlayer_paused: false
                            },
                            () => {
                              this.audioPlayer_play();
                            }
                          );

                          console.log(
                            "this.audioPlayer_play();() called",
                            this.state.audioPlayer_paused,
                            "1"
                          );
                        }

                        if (this.state.audioPlayer_paused === false) {
                          //audio is being played
                          this.setState(
                            {
                              audioPlayer_paused: true
                            },
                            () => {
                              this.audioPlayer_pause();
                            }
                          );

                          console.log(
                            "this.audioPlayer_pause();() called",
                            this.state.audioPlayer_paused,
                            "2"
                          );
                        }
                      }}
                    >
                      <div className="tooltip">
                        <span>Play</span>
                        <span className="space">Space</span>
                      </div>
                      <div className="arrow"></div>
                    </button>
                    <button className="fade-in"></button>
                    <button className="fade-out"></button>
                  </div>
                  <div className="block-save flex">
                    <div className="flex-right">
                      <button
                        className="btn-save"
                        onClick={() => {
                          saveAs(this.state.blobURL, "meeting.wav");
                        }}
                      >
                        <div className="save-label">Save</div>
                        <div className="save-processing">
                          <div className="save-processing-bg"></div>
                          <div className="save-processing-label">
                            Processing...
                          </div>
                        </div>
                      </button>
                      <div className="dropdown">
                        <button className="btn-save-gdrive">
                          Google Drive
                        </button>
                        <button className="btn-save-dropbox">Dropbox</button>
                      </div>
                    </div>
                  </div>
                </div>
                {
                  //visible below to show it
                }
                <div className="dialog-quit">
                  <div className="label-quit">
                    Are you sure you want to finish editing?
                  </div>
                  <button className="btn-quit-accept">Yes</button>
                  <button className="btn-quit-deny">Cancel</button>
                </div>
              </div>
            </div>

            <div className="bottom-menu">
              <div className="mode-switch flex-1 flex-left"></div>

              <div className="flex-1 flex-center">
                {
                  //active class below
                }
                <div
                  className={`btn-record ${(this.state.recorder_state ==
                    recorderStates.active ||
                    this.state.recorder_state ==
                      recorderStates.active_paused) &&
                    "active"}`}
                  onClick={() => {
                    if (
                      this.state.recorder_state ===
                        recorderStates.active_paused ||
                      this.state.recorder_state === recorderStates.active
                      //condition for recording active state
                    ) {
                      //means recording stoped, can also do redirect callbacks here
                      this.setState({
                        recorder_state: recorderStates.processing
                      });
                      //currently moving to preview after 1 sec
                      setTimeout(
                        function() {
                          // this.setState({
                          //   recorder_state: recorderStates.preview
                          // });
                          this.props.routeFxn();
                        }.bind(this),
                        1000
                      );
                    } else if (
                      //condition for first time record state, we do allow mic and if it later allowed we do active state by callback
                      // we set isRecording true to start microphone.record fxn in canvasControls component
                      this.state.recorder_state === recorderStates.wait_record
                    ) {
                      this.setState({
                        recorder_state: recorderStates.allow_mic,
                        isRecording: true,
                        totalTimerSeconds: 0
                      });

                      this.setTimeState("active"); // start timer
                    }
                  }}
                >
                  <div className="icn-record">
                    <i className="icn-record-inner"></i>
                    <img src={record_icon} alt="record_icon" />
                  </div>
                  <div className="record-timer">{this.state.timeString}</div>
                  <div className="processing-info">
                    <div className="processing-info-inner"></div>
                    <div className="processing-text">
                      <span className="the-text">Processing...</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-pause-record"
                  onClick={() => {
                    if (
                      this.state.recorder_state === recorderStates.active_paused
                    ) {
                      this.setState({
                        recorder_state: recorderStates.active
                      });
                    } else {
                      this.setState({
                        recorder_state: recorderStates.active_paused
                      });
                    }
                  }}
                >
                  <i className="icn-pause-record">
                    <img src={pause} alt="pause_icon" />
                  </i>
                </button>
              </div>
              <div className="flex-1 flex-right">
              </div>
            </div>
            <div className="alert error browser-not-supported">
              <div className="alert_icon"></div>
              <div className="h">Your browser is not supported</div>
              <div className="desc">
                To use this website, we recommend the latest version of
                <a
                  href="https://www.google.com/chrome/browser/desktop/index.html"
                  target="_blank"
                  rel="nofollow"
                >
                  Chrome
                </a>{" "}
                or
                <a
                  href="https://www.mozilla.org/firefox/new/"
                  target="_blank"
                  rel="nofollow"
                >
                  Firefox
                </a>
                .
              </div>
            </div>
            <div className="alert error common" id="alert-template">
              <div className="alert_icon"></div>
              <div className="desc only hidden no-mics">
                No microphones found. Sound recording is unavailable.
              </div>
              <div className="desc only hidden internal-error"></div>
              <div className="buttons">
                <button className="btn white btn-alert-ok">Ok</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
