import React from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
} from 'react-native';
const HomeScreen = (props) => {
  return (
    <View style={styles.container}>
      <Image
        style={styles.imgLogo}
        source={require('../icon/iconlg.png')}></Image>
      <Text style={styles.textLogo}> ABC</Text>
      <TouchableOpacity
        onPress={() => {
          props.navigation.push('User');
        }}>
        <Text style={styles.textBtn}>Join Chat</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          props.navigation.push('Login');
        }}>
        <Text style={styles.textBtn}>Join Call</Text>
      </TouchableOpacity>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center'},
  textBtn: {
    color: 'black',
    borderBottomWidth: 2,
    borderBottomColor: 'black',
    fontSize: 20,
    marginTop: 10,
  },
  imgLogo: {width: 100, height: 100, marginTop: 100},
  textLogo: {color: 'black', marginTop: 20, fontSize: 35},
});

export default HomeScreen;
