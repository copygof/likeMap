import { combineReducers } from 'redux'
import { reducer as map } from './featureMap'

export default combineReducers({
  map,
  maps: map
})