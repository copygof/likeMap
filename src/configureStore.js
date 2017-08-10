import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import { composeWithDevTools } from 'remote-redux-devtools'
import logger from 'redux-logger'
import reducers from './reducers'

export default (initialState) => {

 // const composeEnhancers = composeWithDevTools({ realtime: true })
  const middlewares = [thunk, logger]
  // const store = createStore(reducers, /* preloadedState, */ composeEnhancers(
  //   applyMiddleware(...middlewares),
  //   // other store enhancers if any
  // ));
  const store = createStore(
    reducers,
    compose(
      applyMiddleware(...middlewares)
    )
  )
  return store
}