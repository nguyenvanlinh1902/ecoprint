import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

// Import reducers
import storeReducer from './reducers/storeReducer';

// Combine reducers
const rootReducer = combineReducers({
  store: storeReducer,
  // Add more reducers here as needed
});

// Create store with middleware
const store = createStore(
  rootReducer,
  composeWithDevTools(applyMiddleware(thunk))
);

export default store; 