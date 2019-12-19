import React, { Component } from "react";
import AtrisRecorder from "./AtrisRecorder/components";
import { EuiSpacer } from "@elastic/eui";
import { EuiText, EuiFlexGroup, EuiFlexItem, EuiTitle } from "@elastic/eui";
import { navigate } from "@reach/router";
import { TextAnnotator } from "react-text-annotate";

import AudioPlayer from "./AudioPlayer";

import { FaHatWizard, FaSnowman } from "react-icons/fa";

const TEXT =
  "When Sebastian Thrun started working on self-driving cars at Google in 2007, few people outside of the company took him seriously. “I can tell you very senior CEOs of major American car companies would shake my hand and turn away because I wasn’t worth talking to,” said Thrun, now the co-founder and CEO of online higher education startup Udacity, in an interview with Recode earlier this week. A little less than a decade later, dozens of self-driving startups have cropped up while automakers around the world clamor, wallet in hand, to secure their place in the fast-moving world of fully automated transportation.";
const TAG_COLORS = {
  ORG: "#00ffa2",
  PERSON: "#84d2ff"
};

export default class ReportBody extends Component {
  state = {
    value: this.props.annotateValue,
    tag: "default tag"
  };

  componentWillReceiveProps(props) {
    console.log("new Props");
    this.setState({ value: props.annotateValue });
  }

  handleChange = value => {
    // this.setState({ value });
  };

  render() {
    return (
      <EuiFlexGroup>
        <EuiFlexItem>
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexDirection: "row"
              }}
            >
              <FaHatWizard
                style={{ width: "24px", height: "24px", marginRight: "8px" }}
              />
              <EuiTitle>
                <h2>Transcribe Summary</h2>
              </EuiTitle>
            </div>

            <EuiText>
              The transcribe summary of firt speech by atris hello world.The
              transcribe summary of firt speech by atris hello world.The
              transcribe summary of firt speech by atris hello world.The
              transcribe summary of firt speech by atris hello world.The
              transcribe summary of firt speech by atris hello world
            </EuiText>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexDirection: "row",
                marginTop: "8px"
              }}
            >
              <FaSnowman
                style={{ width: "24px", height: "24px", marginRight: "8px" }}
              />
              <EuiTitle>
                <h2>Transcribe</h2>
              </EuiTitle>
            </div>

            <TextAnnotator
              style={{
                // fontFamily: "IBM Plex Sans",
                // maxWidth: 500,
                lineHeight: 1.5
              }}
              content={TEXT}
              value={this.state.value}
              onChange={this.handleChange}
              getSpan={span => ({
                ...span,
                tag: this.state.tag,
                color: TAG_COLORS[this.state.tag]
              })}
            />

            <EuiText>
              The transcribe of firt speech by atris hello worldThe transcribe
              of firt speech by atris hello world The transcribe of firt speech
              by atris hello world The transcribe of firt speech by atris hello
              world The transcribe of firt speech by atris hello world The
              transcribe of firt speech by atris hello world
            </EuiText>
            <EuiText>
              The transcribe of firt speech by atris hello worldThe transcribe
              of firt speech by atris hello world The transcribe of firt speech
              by atris hello world The transcribe of firt speech by atris hello
              world The transcribe of firt speech by atris hello world The
              transcribe of firt speech by atris hello world
            </EuiText>
            <EuiText>
              The transcribe of firt speech by atris hello worldThe transcribe
              of firt speech by atris hello world The transcribe of firt speech
              by atris hello world The transcribe of firt speech by atris hello
              world The transcribe of firt speech by atris hello world The
              transcribe of firt speech by atris hello world
            </EuiText>
            <EuiText>
              The transcribe of firt speech by atris hello worldThe transcribe
              of firt speech by atris hello world The transcribe of firt speech
              by atris hello world The transcribe of firt speech by atris hello
              world The transcribe of firt speech by atris hello world The
              transcribe of firt speech by atris hello world
            </EuiText>

            <EuiText>
              The transcribe of firt speech by atris hello worldThe transcribe
              of firt speech by atris hello world The transcribe of firt speech
              by atris hello world The transcribe of firt speech by atris hello
              world The transcribe of firt speech by atris hello world The
              transcribe of firt speech by atris hello world
            </EuiText>
          </div>
        </EuiFlexItem>
        {/* <EuiFlexItem
          style={{ minWidth: "384px", width: "25vw", flexBasis: "auto" }}
        >
          <p>Another content grid item</p>
          <EuiSpacer />
          <p>
            Note how both of these are the same width and height despite having
            different content?
          </p>
        </EuiFlexItem> */}
      </EuiFlexGroup>
    );
  }
}
