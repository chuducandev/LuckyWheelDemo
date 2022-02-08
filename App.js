import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  ImageBackground,
  Dimensions,
  Image,
  TouchableOpacity,
  Animated,
  Easing,
  Pressable,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import TrackPlayer, { State } from 'react-native-track-player';
import RNShake from 'react-native-shake';

const { width, height } = Dimensions.get("window");

const prizes = ["$100", "$800", "$700", "$600", "$500", "$400", "$300", "$200"];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const App = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [isPlayingConfetti, setIsPlayingConfetti] = useState(false);
  const [deg, setDeg] = useState(0);
  const degRef = useRef(new Animated.Value(0)).current;
  const scaleRef = useRef(new Animated.Value(0)).current;
  const buttonScaleRef = useRef(new Animated.Value(1)).current;
  const confettiRef = useRef();

  useEffect(() => {
    startPlayingAudio();
    loopZoomButton();

    const subscription = RNShake.addListener(() => spin());

    return () => {
      subscription.remove();
    }
  }, [deg])

  async function loopZoomButton() {
    Animated.loop(
      Animated.sequence([
        Animated.timing(buttonScaleRef, {
          toValue: 0.9,
          duration: 250,
          // easing: Easing.ease,
          useNativeDriver: false,
        }),
        Animated.timing(buttonScaleRef, {
          toValue: 1,
          duration: 250,
          // easing: Easing.ease,
          useNativeDriver: false,
        }),
        Animated.timing(buttonScaleRef, {
          toValue: 1.1,
          duration: 250,
          // easing: Easing.ease,
          useNativeDriver: false,
        }),
        Animated.timing(buttonScaleRef, {
          toValue: 1,
          duration: 250,
          // easing: Easing.ease,
          useNativeDriver: false,
        }),
      ]),
      {
        iterations: -1,
      }
    ).start();
  }

  const spin = () => {
    hideDialog();
    buttonScaleRef.stopAnimation();

    if (!isSpinning) {
      const next = deg + Math.floor(Math.random() * 8) * 45 + 360 * 8;
      console.log("next", next, deg);
      setIsSpinning(true);
      Animated.timing(degRef, {
        toValue: next,
        duration: 10000,
        easing: Easing.easingOut,
        useNativeDriver: true,
      }).start(() => {
        setIsSpinning(false);
        setDeg(next);
        showDialog();
      });
    }
  };

  const getPrize = deg => {
    const moduloDeg = (deg - 22.5) % 360;
    console.log("moduloDeg", moduloDeg);
    return prizes[(Math.floor((moduloDeg >= 0 ? moduloDeg : moduloDeg + 360) / 45) + 1) % 8];
  }

  const startPlayingAudio = async () => {
    // Set up the player
    await TrackPlayer.setupPlayer();

    // Add a track to the queue
    await TrackPlayer.add({
      url: require('./assets/background-music.mp3'),
      duration: 210,
    });

    // Start playing it
    await TrackPlayer.play();
  };

  const showDialog = async () => {
    setIsPlayingConfetti(true);
    confettiRef && confettiRef.current.play();
    Animated.timing(scaleRef, {
      toValue: 1,
      duration: 300,
      easing: Easing.easingOut,
      useNativeDriver: false,
    }).start();
  }

  const hideDialog = () => {
    setIsPlayingConfetti(false);
    scaleRef.setValue(0);
  }

  return (
    <SafeAreaView style={{ backgroundColor: "#591042", flex: 1 }}>
      <StatusBar
        backgroundColor="transparent"
        translucent={true}
        barStyle="light-content"
      />
      <ImageBackground
        source={require("./assets/background.png")}
        resizeMode="cover"
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <Image
          source={require("./assets/title.png")}
          style={{
            width: width * 0.6,
            height: width * 0.6 * 0.41,
            marginBottom: height * 0.07,
          }}
        />
        <Pressable
          style={{
            alignItems: "center",
            justifyContent: "flex-start",
          }}
          onPress={() => spin()}
        >
          <Animated.Image
            source={require("./assets/wheel.gif")}
            style={[{
              width: width * 0.85,
              height: width * 0.85,
            }, {
              transform: [{
                rotate: degRef.interpolate({
                  inputRange: [0, 360],
                  outputRange: ["0deg", "360deg"],
                }),
              }]
            }]}
          />
          <Image
            source={require("./assets/pointer.png")}
            style={{
              height: width * 0.12,
              width: width * 0.12 / 367 * 200,
              position: "absolute",
            }}
          />
        </Pressable>
        <AnimatedPressable
          onPress={() => spin()}
          style={[{
            marginTop: height * 0.05,
          }, {
            transform: [{ scale: isSpinning ? 1 : buttonScaleRef }]
          }]}
        >
          <Image
            source={require("./assets/button.png")}
            style={{
              width: width * 0.5,
              height: width * 0.5 * 0.206,
            }}
          />
        </AnimatedPressable>
        {isPlayingConfetti && <AnimatedPressable
          style={[{
            width: width,
            height: height + 50,
            alignItems: "center",
            justifyContent: "center",
            position: "absolute",
            alignSelf: "center",
            top: -50,
          }, {
            backgroundColor: scaleRef.interpolate({
              inputRange: [0, 1],
              outputRange: ["rgba(0,0,0,0)", "rgba(0,0,0,0.5)"],
            })
          }]}
          onPress={() => hideDialog()}
        >
          <Animated.View
            style={[{
              backgroundColor: "#591042",
              width: width * 0.75,
              height: width * 0.3,
              borderRadius: 20,
              borderWidth: 5,
              borderColor: "#F7E861",
              position: "absolute",
              alignItems: "center",
              justifyContent: "center",
            }, {
              transform: [{ scale: scaleRef }]
            }]}
          >
            <Text
              style={{
                color: "#F7E861",
                fontSize: 24,
                fontWeight: "bold",
                textAlign: "center",
                marginBottom: 5,
              }}
            >
              Congratulations!
            </Text>
            <Text
              style={{
                color: "#F7E861",
                fontSize: 20,
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              You have won {getPrize(deg)}
            </Text>
          </Animated.View>
          <LottieView
            ref={confettiRef}
            source={require("./assets/confetti.json")}
            style={{
              width: width,
              height: height,
            }}
          />
        </AnimatedPressable>}

      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({

});

export default App;
