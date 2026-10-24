import {combineReducers, legacy_createStore as createStore} from 'redux'
import BroadReducer from './Board-reducer'
let reducers = combineReducers({
    BroadReducer,
})

let store  = createStore(reducers);
export type StoreType = ReturnType<typeof store.getState>
export type DispatchType = typeof store.dispatch
(window as any).store = store
export default store