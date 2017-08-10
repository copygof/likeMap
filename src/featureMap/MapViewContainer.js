import React, { Component } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet
} from 'react-native'
import { connect } from 'react-redux'
import MapViews from './MapView'

class MapViewContainer extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>55555</Text>
        <MapViews />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
})

const mapStateToProps = state => ({
  map: state.map
})

export default connect(mapStateToProps)(MapViewContainer)
