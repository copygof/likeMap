import React, { Component } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Keyboard,
  Image,
  Animated,
  Dimensions
} from 'react-native'
import { connect } from 'react-redux'
import MapViews from './MapView'

const { width, height } = Dimensions.get('window');

class MapViewContainer extends Component {

  state = {
    textValue: '',
    isFocus: false,
    animScrollView: new Animated.Value(height),
    place: []
  }

  renderCloseText() {
    return (
      <TouchableOpacity
        onPress={() => this.setState({ textValue: '' })}
        style={{
          position: 'absolute',
          right: 0
        }}
      >
        <Image style={{ width: 30, height: 30, marginRight: 5 }} source={require('./image/ic_clear.png')} />
      </TouchableOpacity>
    )
  }
  renderMapButton() {
    return (
      <TouchableOpacity
        onPress={() => Keyboard.dismiss()}
      >
      {
        this.state.isFocus
        ? <Image style={{ width: 35, height: 35, marginRight: 5 }} source={require('./image/ic_keyboard_backspace.png')} />
        : <Image style={{ width: 35, height: 35, marginRight: 5 }} source={require('./image/ic_map.png')} />
      }
      </TouchableOpacity>
    )
  }
  renderTextInput() {
    return (
      <View
        style={{
          backgroundColor: this.state.isFocus ? '#f5f5f5' : 'transparent',
          paddingBottom: 3,
          paddingHorizontal: 15,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
        }}>
        <View style={styles.wrapperTextInput}>
          {this.renderMapButton()}
          <TextInput
            // underlineColorAndroid={"#f5f5f5"}
            underlineColorAndroid={"#ffffff"}
            style={styles.textInput}
            //autoFocus={true}
            placeholder={'Where your go ?'}
            onChangeText={textValue => this.setState({ textValue })}
            onFocus={() => {
              this.setState({ isFocus: true })
              this.startAnimScrollView()
            }}
            onBlur={() => {
              this.setState({ isFocus: false })
              !this.state.textInput && this.closeAnimScrollView()
            }}
            // blurOnSubmit
            value={this.state.textValue}
          />
          {this.state.textValue ? this.renderCloseText() : null}
        </View>
      </View>
    )
  }

  startAnimScrollView() {
    Animated.spring(this.state.animScrollView, {
      toValue: 75
    }).start()
  }
  closeAnimScrollView() {
    Animated.spring(this.state.animScrollView, {
      toValue: height
    }).start()
  }

  renderRow(data, i) {
    const { primaryText, secondaryText, fullText } = data
    return (
      <View style={{ flex: 1 }} key={i}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: '#ffffff', borderWidth: 0.5, borderColor: '#dfdfdf', height: 80, justifyContent: 'center', paddingHorizontal: 5 }}
          onPress={() => {
            
          }}>
          <Text>{primaryText}</Text>
          <Text>{secondaryText}</Text>
        </TouchableOpacity>
    </View> 
    )
  }

  renderScrollView() {
    return (
      <Animated.View
        style={{
          transform: [{
            translateY: this.state.animScrollView
          }],
          backgroundColor: '#f5f5f5',
          height,
          paddingHorizontal: 15,
          paddingTop: 15,
          
        }}
        >
        <View style={{ flex: 1, backgroundColor: '#ffffff', elevation: 3 }}>
          <View style={{ flex: 1, backgroundColor: '#ffffff', padding: 15, flexWrap: 'wrap' }}>
            <Text style={{ fontSize: 18, marginBottom: 5 }}>Find your location</Text>
            <View style={{ width, height: 1, backgroundColor: '#e0e0e0' }} />
          </View>
          <ScrollView
            style={{
              backgroundColor: '#ffffff',
              padding: 15
            }}>
            {this.state.place.map((data, i) => this.renderRow(data, i))}
          </ScrollView>
        </View>
      </Animated.View>
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <MapViews />
        {this.renderScrollView()}
        {this.renderTextInput()} 
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  wrapperTextInput: {
    backgroundColor: '#ffffff',
    height: 60,
    padding: 5,
    borderRadius: 3,
    elevation: 3,
    // marginTop: 40,
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center'
  },
  textInput: {
    flex: 1,
    // backgroundColor: '#f5f5f5',
    height: 50
  }
})

const mapStateToProps = state => ({
  map: state.map
})

export default connect(mapStateToProps)(MapViewContainer)
