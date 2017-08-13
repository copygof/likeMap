import React, { Component } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Keyboard,
  Image,
  Animated,
  Dimensions,
  Platform
} from 'react-native'
import MapView from 'react-native-maps';

const { width, height } = Dimensions.get('window')
const ASPECT_RATIO = width / height
const LATITUDE = 37.78825
const LONGITUDE = -122.4324
const LATITUDE_DELTA = 0.0922
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO
let id = 0;
const RADIUS = '500' // meters
const LANGUAGE_SEARCH_PLACE_DETAIL = 'th'
let ss
const API_KEY = 'AIzaSyDHuVuz518BBNftdk3d2m1sttASsGosWLA'

class MapViewContainer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      textValue: '',
      isFocus: false,
      animScrollView: new Animated.Value(height),
      place: [],
      placeDetail: {},
      markers: [],
      region: {
        latitude: LATITUDE,
        longitude: LONGITUDE,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      },
      slideOpen: false
    }
  }

  componentDidMount() {
    navigator.geolocation.getCurrentPosition(
      (data) => {
        const { latitude = '', longitude = '' } = data.coords
        this.setState({
          region: {
            ...this.state.region,
            latitude,
            longitude
          }
        })
      },
      (error) => console.log(error)
    )
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
          this.state.slideOpen
            ? <Image style={styles.icon} source={require('./image/ic_keyboard_backspace.png')} />
            : <Image style={styles.icon} source={require('./image/ic_map.png')} />
        }
      </TouchableOpacity>
    )
  }
  searchPlaceAutoComplete(textValue) {
    const { latitude, longitude } = this.state.region
    fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${textValue}&location=${latitude},${longitude}&radius=${RADIUS}&key=${API_KEY}`)
    .then(res => res.json())
    .then((res) => {
      console.log('res', res)
      this.setState({
        place: res.predictions
      })
    })
    .catch(error => console.log(error))
  }
  fetchPlaceDetailById(placeId) {
    return fetch(`https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&language=${LANGUAGE_SEARCH_PLACE_DETAIL}&key=${API_KEY}`)
    .then(res => res.json())
  }
  setPlaceDetail(res) {
    const { result = { geometry: { location: { lat: '', lng: '' } } }} = res
    const { lat: latitude = '', lng: longitude = '' } = result.geometry.location
    this.latitude = latitude
    this.longitude = longitude

    this.setState({
      placeDetail: result,
      // region: {
      //   ...this.state.region
      // },
      textValue: result.name,
      markers: [{
        coordinate: { latitude, longitude },
        key: id++,
        color: 'red',
      }],
      isFocus: false
    })
  }
  setMarkerById(placeId) {
    this.fetchPlaceDetailById(placeId)
    .then((res) => {
      this.closeAnimScrollView(() => this.setPlaceDetail(res))
    })
    .then(() => {
      this.map.animateToRegion({
        latitude: this.latitude,
        longitude: this.longitude,
        latitudeDelta: LATITUDE_DELTA * 0.1,
        longitudeDelta: LONGITUDE_DELTA * 0.1
      }, 1000)
    })
    .catch((error) => console.log(error));
  }
  nearbysearch(textValue) {
    const { latitude, longitude } = this.state.region
    fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?input=${textValue}&location=${latitude},${longitude}&rankby=distance&language=${LANGUAGE_SEARCH_PLACE_DETAIL}&key=${API_KEY}`)
    .then(res => res.json())
    .then(res => {
      this.setState({
        place: res.results.map(value => ({
          ...value,
          structured_formatting: {
            main_text: value.name,
            secondary_text: value.vicinity
          }
        }))
      })
    })
  }
  onChangeText(textValue) {
    this.setState({ textValue })
    this.searchPlaceAutoComplete(textValue)
  }
  renderTextInput() {
    return (
      <View style={[styles.wrapTextInput, { backgroundColor: this.state.slideOpen ? '#f5f5f5' : 'transparent', }]}>
        <View style={styles.wrapperTextInput}>
          {this.renderMapButton()}
          <TextInput
            selectTextOnFocus
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
    this.setState({ slideOpen: true })
    Animated.spring(this.state.animScrollView, {
      toValue: Platform.select({
        android: 75,
        ios: 85
      }),
    }).start()
  }
  closeAnimScrollView(cb = () => {}) {
    this.setState({ slideOpen: false })
    Animated.spring(this.state.animScrollView, {
      toValue: height
    }).start(cb())
  }

  renderRow(data, i, length) {
    const { main_text = '', secondary_text = '' } = data.structured_formatting
    return (
      <View style={styles.list} key={i}>
        <Image style={styles.iconPlace} source={require('./image/ic_place.png')} />
        <TouchableOpacity
          style={[styles.listItem, {
             borderTopWidth: i === 0 ? 1 : 0.5,
             borderBottomWidth: i === length - 1 ? 1 : 0.5,
          }]}
          onPress={() => this.setMarkerById(data.place_id)}>
          <Text numberOfLines={1}>{main_text}</Text>
          <Text numberOfLines={1}>{secondary_text}</Text>
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
    const { latitude, longitude } = e.nativeEvent.coordinate    
    this.setState({
      markers: [
        {
          coordinate: e.nativeEvent.coordinate,
          key: id++,
          color: 'red',
        },
      ],
    }, () => {
      this.map.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: this.state.region.latitudeDelta * 0.1,
        longitudeDelta: this.state.region.latitudeDelta * 0.1
      }, 1000)
    })
    return fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${API_KEY}`)
      .then(res => res.json())
      .then(value => {
        return this.fetchPlaceDetailById(value.results[0].place_id)
      })
      .then((res) => {
        const { result } = res
        console.log('result', res)
        this.setState({
          placeDetail: result,
          textValue: result.name,
          isFocus: false
        })
      })
      .then(() => this.nearbysearch(this.state.textValue))
  }

  renderMapView() {
    return (
      <View style={styles.mapContainer}>
        <MapView
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
              identifier="marker"
              key={marker.key}
              coordinate={marker.coordinate}
              pinColor={marker.color}
            />
          ))}
        </MapView>
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

export default MapViewContainer
