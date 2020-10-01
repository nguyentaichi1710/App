import React, {useEffect, useState, useCallback} from 'react';
import {View, StyleSheet, Alert} from 'react-native';
import {Text} from 'react-native-paper';
import {Button} from 'react-native-paper';
import AsyncStorage from '@react-native-community/async-storage';
import {TextInput} from 'react-native-paper';
import {useFocusEffect} from '@react-navigation/native';
import InCallManager from 'react-native-incall-manager';
import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  MediaStream,
  MediaStreamTrack,
  mediaDevices,
  registerGlobals,
} from 'react-native-webrtc';
export default function CallScreen({navigation, ...props}) {
  let name;
  let connectedUser;
  const [userId, setUserId] = useState('');
  const [socketActive, setSocketActive] = useState(false);
  const [calling, setCalling] = useState(false);
  const [localStream, setLocalStream] = useState({toURL: () => null});
  const [remoteStream, setRemoteStream] = useState({toURL: () => null});
  const [conn, setConn] = useState(
    new WebSocket(
      'wss://connect.websocket.in/v3/1998?api_key=Xn7ycNPVRfcjNSqA7mIaKT3p2tU5B8rWES7LWhNqcqdilIflUqYDqYyOEGiM',
    ),
  );
  const [yourConn, setYourConn] = useState(
    new RTCPeerConnection({
      iceServers: [
        {
          urls: 'stun:stun.l.google.com:19302',
        },
        {
          urls: 'stun:stun1.l.google.com:19302',
        },
        {
          urls: 'stun:stun2.l.google.com:19302',
        },
      ],
    }),
  );
  const [offer, setOffer] = useState(null);
  const [callToUsername, setCallToUsername] = useState(null);
  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem('userId').then((id) => {
        console.log(id);
        if (id) {
          setUserId(id);
          console.log('userID', userId.toString());
        } else {
          setUserId('');
          navigation.push('Login');
        }
      });
    }, [userId]),
  );
  useEffect(() => {
    navigation.setOptions({
      title: 'Room ID - ' + userId,
      headerRight: () => (
        <Button mode="text" onPress={onLogout} style={{paddingRight: 10}}>
          Logout
        </Button>
      ),
    });
  }, [userId]);
  useEffect(() => {
    if (socketActive && userId.length > 0) {
      try {
        InCallManager.start({media: 'audio'});
        InCallManager.setForceSpeakerphoneOn(true);
        InCallManager.setSpeakerphoneOn(true);
      } catch (err) {
        console.log('InApp Caller ---------------------->', err);
      }
      console.log(InCallManager);
      send({
        type: 'login',
        name: userId,
      });
    }
  }, [socketActive, userId]);
  useEffect(() => {
    conn.onopen = () => {
      console.log('Connected to the signaling server');
      setSocketActive(true);
    };
    conn.onmessage = (msg) => {
      let data;
      if (msg.data === 'Hello world') {
        data = {};
      } else {
        data = JSON.parse(msg.data);
        console.log('Data --------------------->', data);
        switch (data.type) {
          case 'login':
            console.log('Login');
            break;
          case 'offer':
            handleOffer(data.offer, data.name);
            console.log('Offer');
            break;
          case 'answer':
            handleAnswer(data.answer);
            console.log('Answer');
            break;
          case 'candidate':
            handleCandidate(data.candidate);
            console.log('Candidate');
            break;
          case 'leave':
            handleLeave();
            console.log('Leave');
            break;
          default:
            break;
        }
      }
    };
    conn.onerror = function (err) {
      console.log('Got error', err);
    };
    let isFront = false;
    mediaDevices.enumerateDevices().then((sourceInfos) => {
      let videoSourceId;
      for (let i = 0; i < sourceInfos.length; i++) {
        const sourceInfo = sourceInfos[i];
        if (
          sourceInfo.kind == 'videoinput' &&
          sourceInfo.facing == (isFront ? 'front' : 'environment')
        ) {
          videoSourceId = sourceInfo.deviceId;
        }
      }
      mediaDevices
        .getUserMedia({
          audio: true,
          video: {
            mandatory: {
              minWidth: 800,
              minHeight: 400,
              minFrameRate: 30,
            },
            facingMode: isFront ? 'user' : 'environment',
            optional: videoSourceId ? [{sourceId: videoSourceId}] : [],
          },
        })
        .then((stream) => {
          setLocalStream(stream);
          yourConn.addStream(stream);
        })
        .catch((error) => {
          throw err;
        });
    });

    yourConn.onaddstream = (event) => {
      console.log('On Add Stream', event);
      setRemoteStream(event.stream);
    };
    yourConn.onicecandidate = (event) => {
      if (event.candidate) {
        send({
          type: 'candidate',
          candidate: event.candidate,
        });
      }
    };
  }, []);
  const send = (message) => {
    if (connectedUser) {
      message.name = connectedUser;
      console.log('Connected iser in end----------', message);
    }
    conn.send(JSON.stringify(message));
  };
  const onCall = () => {
    setCalling(true);
    connectedUser = callToUsername;
    console.log('Caling to', callToUsername);
    yourConn.createOffer().then((offer) => {
      yourConn.setLocalDescription(offer).then(() => {
        console.log('Sending Ofer');
        console.log(offer);
        send({
          type: 'offer',
          offer: offer,
        });
      });
    });
  };
  const handleOffer = async (offer, name) => {
    console.log(name + ' is calling you.');

    console.log('Accepting Call===========>', offer);
    connectedUser = name;

    try {
      await yourConn.setRemoteDescription(new RTCSessionDescription(offer));

      const answer = await yourConn.createAnswer();

      await yourConn.setLocalDescription(answer);
      send({
        type: 'answer',
        answer: answer,
      });
    } catch (err) {
      console.log('Offerr Error', err);
      throw err;
    }
  };

  const handleAnswer = (answer) => {
    yourConn.setRemoteDescription(new RTCSessionDescription(answer));
  };
  const handleCandidate = (candidate) => {
    setCalling(false);
    console.log('Candidate ----------------->', candidate);
    yourConn.addIceCandidate(new RTCIceCandidate(candidate));
  };
  const hangUp = () => {
    send({
      type: 'leave',
    });
  };

  const handleLeave = () => {
    connectedUser = null;
    setRemoteStream({toURL: () => null});

    yourConn.close();
    yourConn.onicecandidate = null;
    yourConn.onaddstream = null;
    Alert.alert('Da ngat ket noi');
  };

  const onLogout = () => {
    hangUp();

    AsyncStorage.removeItem('userId').then((res) => {
      navigation.push('Login');
    });
  };
  return (
    <View style={styles.root}>
      <View style={styles.inputField}>
        <Button
          mode="contained"
          onPress={onCall}
          loading={calling}
          contentStyle={styles.btnContent}
          disabled={!(socketActive && userId.length > 0)}>
          Call
        </Button>
      </View>
      <View style={styles.videos}>
        <View style={styles.localVideos}>
          <RTCView streamURL={localStream.toURL()} style={styles.localVideo} />
        </View>
        <View style={styles.remoteVideos}>
          <RTCView
            streamURL={remoteStream.toURL()}
            style={styles.remoteVideo}
          />
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  root: {
    backgroundColor: '#fff',
    flex: 1,
    padding: 20,
  },
  inputField: {
    flexDirection: 'column',
  },
  videos: {
    width: '100%',
    height: '100%',
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 6,
    marginBottom: 10,
    zIndex: 1,
  },
  localVideos: {
    position: 'absolute',
    zIndex: 3,
    backgroundColor: '#f2f2f2',
    left: '70%',
    width: '30%',
    height: '30%',
  },
  localVideo: {
    width: '100%',
    height: '80%',
  },
  remoteVideo: {
    height: '80%',
    width: '100%',
  },
  remoteVideos: {
    position: 'absolute',
    zIndex: 2,
    backgroundColor: '#f2f2f2',
    height: '100%',
    width: '100%',
    top: 150,
  },
});
