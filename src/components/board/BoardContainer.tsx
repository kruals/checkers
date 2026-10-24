import  {connect } from 'react-redux'
import Board from './Board'
import type { StoreType ,DispatchType} from '../../redux/redux-store'

let mapStateToProps = ( state : StoreType ) => {
    return{
        field: state.BroadReducer.field,
        alowedCeils:state.BroadReducer.alowedCeils,
        selectedCeil: state.BroadReducer.selectedCeil
    }
}
let mapDispatchToProps = (dispatch : DispatchType) =>{
    return{
        dispatch : dispatch
    }
}

export type BoardPropsType = ReturnType<typeof mapStateToProps> &  ReturnType<typeof mapDispatchToProps>
let BoardContainer = connect(mapStateToProps,mapDispatchToProps) (Board)

export default BoardContainer