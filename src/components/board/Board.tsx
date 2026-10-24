import styles from './Board.module.css'
import {SetActionStartMove,SetActionDoMove} from '../../redux/Board-reducer'
import type { BoardPropsType } from './BoardContainer'
import type {CheckerType,CeilType,AllowedCeilType} from '../../redux/Board-reducer'
import {memo,useCallback} from 'react'
interface PropsCeilComponentType {
    type:boolean, 
    isBe:boolean,
    checker:CheckerType | null,
    alowed:boolean, 
    x:number,
    y:number, 
    selected:boolean,
    alowedType? : 'turn' | 'capture',
    DoMove: (ceil:CeilType) => void,
    StartMove: (checker:CheckerType) => void

}
const CeilComponent = memo((props : PropsCeilComponentType) =>{
        const colorCeil = props.type ? styles.whiteCeil : styles.blackCeil;
        const ceil = {
            type:props.type,
            isBe:props.isBe,
            checker:props.checker!,
            x:props.x,
            y:props.y

        }

        return <div className = {`${styles.ceil} ${colorCeil} ${props.selected ? styles.selected : null}`} >
            {props.isBe ? 
            <div  className ={`${styles.checker} 
            ${props.checker!.color === 'white' ? styles.whiteChecker : styles.blackChecker}`} 
            onClick ={() => props.StartMove(props.checker!)}>
                <div className = {`${styles.inside} 
                ${props.checker!.color === 'white' ? styles.whiteCheckerInside : styles.blackCheckerInside}`}>
                    {props.checker?.isKing ? <div className = {styles.king}>
                        <img src="/icons8-корона-48.png" alt="crown"/>
                    </div> : null}

                </div>
            </div> 
            : props.alowed ? <div className ={styles.divAlowedCeil} onClick ={() => props.DoMove(ceil)}>
                <div className = {`${props.alowedType === 'turn' ? styles.alowedCeilTurn :styles.alowedCeilCapture}`}></div>
            </div> : null}
        </div>
    })

const Board = (props:BoardPropsType) => {


     const StartMove = useCallback((checker:CheckerType) =>{
        props.dispatch(SetActionStartMove(checker))
    },[props.dispatch])
    const DoMove = useCallback((ceil:CeilType) =>{
        props.dispatch(SetActionDoMove(ceil))
    },[props.dispatch])

    const field = props.field.map((el : CeilType[]) => {
        let row = []
        for(let i = 0; i < el.length;i++){
            let x = el[i].x
            let y = el[i]?.y
            const allowedMoves = props.alowedCeils.find((item:AllowedCeilType) => item.ceil.x === x && item.ceil.y === y)
            const alowed = Boolean(allowedMoves);
            const alowedType = allowedMoves?.moveType;
            let selected = (props.selectedCeil?.x == x) && (props.selectedCeil?.y == y)
            row.push(<CeilComponent key={`${x}-${y}`}
                type = {el[i].type} isBe = {el[i].isBe} checker = {el[i].checker} alowed = {alowed} x = {el[i].x} y = {el[i].y} 
                selected = {selected} alowedType = {alowedType} DoMove = {DoMove} StartMove = {StartMove}/>)
        }
        return <div className={styles.row} key={el[0]?.y}>{row}</div>
    })
    return <div className={styles.board}>
        <div className={styles.field}>
            {field}
        </div>
    </div>
}

export default Board