import {combineReducers} from 'redux';
import exampleReducer from './example-reducer'

/*
 * We combine all reducers into a single object before updated data is dispatched (sent) to store
 * Your entire applications state (store) is just whatever gets returned from all your reducers
 * */

const allReducers = combineReducers({
    example: exampleReducer
});

export default allReducers