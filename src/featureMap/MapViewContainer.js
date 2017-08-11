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
  Dimensions,
  Platform
} from 'react-native'
import { connect } from 'react-redux'
import MapView from 'react-native-maps';
import RNGooglePlaces from 'react-native-google-places'

const { width, height } = Dimensions.get('window')

const ASPECT_RATIO = width / height
const LATITUDE = 37.78825;
const LONGITUDE = -122.4324;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
let id = 0;

const MY_KEY = 'AIzaSyCGYaDkW-n-bLIVfisWBTAsjMzFS7eZKhA'

class MapViewContainer extends Component {

  state = {
    textValue: '',
    isFocus: false,
    animScrollView: new Animated.Value(height),
    place: [],
    markers: [],
    region: {
      latitude: LATITUDE,
      longitude: LONGITUDE,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    }
  }

  componentDidMount() {
    RNGooglePlaces.getCurrentPlace()
      .then((results) => {
        const { latitude = '', longitude = '' } = results[0]
        this.setState({
          region: {
            ...this.state.region,
            latitude,
            longitude
          }
        })
      })
      .catch((error) => console.log(error.message));
  }

  renderCloseText() {
    return (
      <TouchableOpacity
        onPress={() => this.setState({ textValue: '' })}
        style={styles.buttonCloseText}>
        <Image style={styles.icon} source={require('./image/ic_clear.png')} />
      </TouchableOpacity>
    )
  }
  renderMapButton() {
    return (
      <TouchableOpacity
        onPress={() => {
          this.closeAnimScrollView()
          Keyboard.dismiss()
        }}
      >
        {
          this.state.isFocus
            ? <Image style={styles.icon} source={require('./image/ic_keyboard_backspace.png')} />
            : <Image style={styles.icon} source={require('./image/ic_map.png')} />
        }
      </TouchableOpacity>
    )
  }
  onChangeText(textValue) {
    this.setState({ textValue })
    RNGooglePlaces.getAutocompletePredictions(textValue)
      .then((place) => {
        this.setState({ place })
      })
  }
  renderTextInput() {
    return (
      <View style={[styles.wrapTextInput, { backgroundColor: (this.state.isFocus || this.state.textValue) ? '#f5f5f5' : 'transparent', }]}>
        <View style={styles.wrapperTextInput}>
          {this.renderMapButton()}
          <TextInput
            underlineColorAndroid={"#ffffff"}
            style={styles.textInput}
            placeholder={'Where your go ?'}
            onChangeText={this.onChangeText.bind(this)}
            onFocus={() => {
              this.setState({ isFocus: true })
              this.startAnimScrollView()
            }}
            onBlur={() => {
              this.setState({ isFocus: false })
              !this.state.textValue && this.closeAnimScrollView()
            }}
            value={this.state.textValue}
          />
          {this.state.textValue && this.state.isFocus ? this.renderCloseText() : null}
        </View>
      </View>
    )
  }

  startAnimScrollView() {
    Animated.spring(this.state.animScrollView, {
      toValue: Platform.select({
        android: 75,
        ios: 85
      }),
    }).start()
  }
  closeAnimScrollView() {
    Animated.spring(this.state.animScrollView, {
      toValue: height
    }).start()
  }

  renderRow(data, i, length) {
    const { primaryText, secondaryText, fullText } = data
    return (
      <View style={styles.list} key={i}>
        <Image style={styles.iconPlace} source={require('./image/ic_place.png')} />
        <TouchableOpacity
          style={[styles.listItem, {
             borderTopWidth: i === 0 ? 1 : 0.5,
             borderBottomWidth: i === length - 1 ? 1 : 0.5,
          }]}
          onPress={() => {
            RNGooglePlaces.lookUpPlaceByID(data.placeID)
              .then((results) => {
                const { latitude, longitude } = results
                this.setState({
                  locationValue: results,
                  region: {
                    ...this.state.region,
                    latitude,
                    longitude
                  },
                  textValue: fullText,
                  markers: [{
                    coordinate: { latitude, longitude },
                    key: id++,
                    color: 'red',
                  }],
                  isFocus: false
                })
                this.closeAnimScrollView()
              })
              .catch((error) => console.log(error.message));
          }}>
          <Text numberOfLines={1}>{primaryText}</Text>
          <Text numberOfLines={1}>{secondaryText}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  renderScrollView() {
    return (
      <Animated.View style={[styles.slide, { transform: [{ translateY: this.state.animScrollView }] }]}>
        <View style={styles.wrapperSlide}>
          <View style={styles.wrapperTextSlideTitle}>
            <Text style={styles.textPrimary}>Find your location</Text>
            <View style={styles.textSecondary} />
          </View>
          <ScrollView style={styles.scrollview}>
            {this.state.place.map((data, i) => this.renderRow(data, i, this.state.place.length))}
          </ScrollView>
        </View>
      </Animated.View>
    )
  }

  onRegionChange(region) {
    this.setState({ region });
  }

  onMapPress(e) {
    this.setState({
      markers: [
        {
          coordinate: e.nativeEvent.coordinate,
          key: id++,
          color: 'red',
        },
      ],
    })
    const { latitude, longitude } = e.nativeEvent.coordinate
    return fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${MY_KEY}`)
      .then(res => res.json())
      .then(value => {
        return RNGooglePlaces.lookUpPlaceByID(value.results[0].place_id)
      })
      .then((place) => {
        this.setState({ textValue: place.address })
        return RNGooglePlaces.getAutocompletePredictions(place.address)
      })
      .then((place) => {
        this.setState({ place })
      })
  }

  renderMapView() {
    return (
      <View style={styles.mapContainer}>
        <MapView.Animated
          ref={ref => { this.map = ref; }}
          style={styles.map}
          region={this.state.region}
          initialRegion={this.state.region}
          onPress={(e) => this.onMapPress(e)}
          showsUserLocation={false}
          showsCompass={false}
          showsIndoors={false}
          onRegionChange={region => this.onRegionChange(region)}
        >
          {this.state.markers.map(marker => (
            <MapView.Marker
              key={marker.key}
              coordinate={marker.coordinate}
              pinColor={marker.color}
            />
          ))}
        </MapView.Animated>
      </View>
    )
  }

  render() {
    return (
      <View style={styles.container}>
        {this.renderMapView()}
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
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  wrapTextInput: {
    paddingBottom: 3,
    paddingHorizontal: 15,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  wrapperTextInput: {
    backgroundColor: '#ffffff',
    height: 60,
    padding: 5,
    borderRadius: 3,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    marginTop: Platform.select({
      android: 15,
      ios: 25
    }),
    flexDirection: 'row',
    alignItems: 'center'
  },
  textInput: {
    flex: 1,
    height: 50,
    paddingRight: 30
  },
  scrollview: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  wrapperSlide: {
    flex: 1,
    backgroundColor: '#ffffff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  listItem: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 0.5,
    borderColor: '#ffffff',
    borderTopColor: '#dfdfdf',
    borderBottomColor: '#dfdfdf',
    height: 80,
    justifyContent: 'center',
    paddingHorizontal: 5
  },
  wrapperTextSlideTitle: {
    backgroundColor: '#ffffff',
    padding: 15,
    flexWrap: 'wrap'
  },
  textPrimary: {
    fontSize: 18,
    marginBottom: 5
  },
  textSecondary: {
    height: 1,
    backgroundColor: '#e0e0e0'
  },
  icon: {
    width: 30,
    height: 30,
    marginRight: 5
  },
  iconPlace: {
    width: 25,
    height: 25,
    marginHorizontal: 15
  },
  buttonCloseText: {
    position: 'absolute',
    right: 0
  },
  slide: {
    backgroundColor: '#f5f5f5',
    height: Platform.select({
      android: height - 100,
      ios: height - 85
    }),
    padding: 15
  },
  list: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  }
})

const mapStateToProps = state => ({
  map: state.map
})

export default connect(mapStateToProps)(MapViewContainer)
