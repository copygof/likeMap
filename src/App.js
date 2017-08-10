import React from 'react';
import { MapViewContainer } from './featureMap'

import { Provider } from 'react-redux'
import configureStore from './configureStore'

const store = configureStore()

const App = () => (
  <Provider store={store}>
    <MapViewContainer />
  </Provider>
)

export default App
