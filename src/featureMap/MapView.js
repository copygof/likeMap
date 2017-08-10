import React, { Component } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity
} from 'react-native'
import { connect } from 'react-redux'
import MapView, { PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';
import RNGooglePlaces from 'react-native-google-places';

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE = 37.78825;
const LONGITUDE = -122.4324;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
let id = 0;

class MapViews extends Component {
   constructor(props) {
     super(props)
     this.state = {
      region: {
        latitude: LATITUDE,
        longitude: LONGITUDE,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      },
      markers: [],
    }
   }

  // ref={ref => { this.map = ref; }}

  componentDidMount() {
    
    RNGooglePlaces.getCurrentPlace()
    .then((results) => {      
      const { latitude = '', longitude = '' } = results[0]
      console.log(latitude, longitude)
      
      this.setState({
        region: {
          ...this.state.region,
          latitude,
          longitude
        }
      })
      return fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${MY_KEY}`)
    })
    .then(res => res.json())
    .then(value => console.log('fetch', value))
    .catch((error) => console.log(error.message));
  }

  onAnimate() {
    this.map.animateToRegion({
      ...this.state.regions,
      // latitude,
      // longitude
    })
    // animateToRegion //animateToCoordinate
  }

  onRegionChange(region) {
    this.setState({ region });
  }

  render () {
    
    return (
      <View style ={styles.container}>
         <MapView.Animated
          ref={ref => { this.map = ref; }}
          style={styles.map}
          region={this.state.region}
          initialRegion={this.state.region}
          // onPress={(e) => this.onMapPress(e)}
          showsUserLocation={true}
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
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  }
});

export default MapViews

