const START_MOVE = 'START-MOVE'
const DO_MOVE = 'DO-MOVE'
type StartMoveAction = {type: 'START-MOVE',checker:CheckerType}
type DoMoveAction = {type: 'DO-MOVE',ceil:CeilType}
export const SetActionStartMove  = (checker:CheckerType):StartMoveAction => ({type:START_MOVE, checker:checker})
export const SetActionDoMove = (ceil:CeilType):DoMoveAction => ({type:DO_MOVE,ceil:ceil})

type BoardAction = | StartMoveAction | DoMoveAction





// Типы
export interface CheckerType{
     color: 'white'| 'black',
     x:number,
     y:number,
     isKing: boolean;

}
export interface CeilType {
    type: true | false,
    isBe: true | false,
    x: number,
    y:number,
    checker: CheckerType | null


}
export interface AllowedCeilType {
    ceil : CeilType
    moveType: 'turn' | 'capture'
}
export type FieldType = CeilType[][]
export interface BoardStateType {
    field: FieldType,
    alowedCeils: AllowedCeilType[],
    selectedCeil : CheckerType | null,
    turn:'white'|'black'
}



// инициализцияи 
let initialState : BoardStateType ={
    field : [],
    alowedCeils : [],
    selectedCeil : null,
    turn:'white'
}
let field : FieldType = []
for (let i : number = 0; i < 8; i++) {
        let row :CeilType[] = []
        for(let j :number= 0; j < 8;j++){
            let type = ((i+j) % 2 == 0)
            if(!type){
                if(i>= 0 && i <= 2){
                    row.push({type:type,isBe:true,checker:{color:'black',x:j,y:i,isKing:false},x:j,y:i})        
                }
                else if(i>= 5 && i <= 7){
                    row.push({type:type,isBe:true,checker:{color:'white',x:j,y:i,isKing:false},x:j,y:i})      
                }  
                else{
                     row.push({type:type,isBe:false,x:j,y:i,checker:null})
                } 
            }
            else{
                row.push({type:type,isBe:false,x:j,y:i,checker:null})    
            }
        }
        field.push(row)
    }
initialState.field = field
const CheckBoundaries = (x: number, y: number): boolean => {
    return x >= 0 && x < 8 && y >= 0 && y < 8;
};

// Поиск всех доступных взятий для одной шашки
const FindCaptureMoves = (
    field: FieldType,
    checker: CheckerType
): AllowedCeilType[] => {
    const captureMoves: AllowedCeilType[] = [];

    const directions = [
        { dx: -1, dy: -1 },
        { dx: 1, dy: -1 },
        { dx: -1, dy: 1 },
        { dx: 1, dy: 1 },
    ];

    const addCaptureMove = (ceil: CeilType) => {
        const alreadyAdded = captureMoves.some(
            move =>
                move.ceil.x === ceil.x &&
                move.ceil.y === ceil.y
        );

        if (!alreadyAdded) {
            captureMoves.push({
                ceil,
                moveType: 'capture',
            });
        }
    };

    for (const { dx, dy } of directions) {
        let x = checker.x + dx;
        let y = checker.y + dy;

        // Обычная шашка может перепрыгнуть только через
        // ближайшую диагональную клетку.
        if (!checker.isKing) {
            const landingX = checker.x + 2 * dx;
            const landingY = checker.y + 2 * dy;

            if (
                !CheckBoundaries(x, y) ||
                !CheckBoundaries(landingX, landingY)
            ) {
                continue;
            }

            const enemy = field[y][x];
            const landing = field[landingY][landingX];

            if (
                enemy.checker !== null &&
                enemy.checker.color !== checker.color &&
                !landing.isBe
            ) {
                addCaptureMove(landing);
            }

            continue;
        }

        // ДАМКА: ищем первого противника по диагонали.
        let enemyFound = false;

        while (CheckBoundaries(x, y)) {
            const currentCeil = field[y][x];

            if (currentCeil.isBe) {
                // Своя шашка блокирует диагональ.
                if (
                    currentCeil.checker === null ||
                    currentCeil.checker.color === checker.color
                ) {
                    break;
                }

                // Встретили противника.
                enemyFound = true;

                x += dx;
                y += dy;
                break;
            }

            x += dx;
            y += dy;
        }

        // Если противника нет, взятия нет.
        if (!enemyFound) {
            continue;
        }

        // За противником дамка может приземлиться
        // на любую свободную клетку до следующей преграды.
        while (CheckBoundaries(x, y)) {
            const landing = field[y][x];

            if (landing.isBe) {
                break;
            }

            addCaptureMove(landing);

            x += dx;
            y += dy;
        }
    }

    return captureMoves;
};

// Обычные ходы вперёд
const FindNormalMoves = (
    field: FieldType,
    checker: CheckerType
): AllowedCeilType[] => {
    const moves: AllowedCeilType[] = [];

    const directions = checker.isKing
        ? [
            { dx: -1, dy: -1 },
            { dx: 1, dy: -1 },
            { dx: -1, dy: 1 },
            { dx: 1, dy: 1 },
        ]
        : [
            {
                dx: -1,
                dy: checker.color === 'white' ? -1 : 1,
            },
            {
                dx: 1,
                dy: checker.color === 'white' ? -1 : 1,
            },
        ];

    for (const { dx, dy } of directions) {
        let x = checker.x + dx;
        let y = checker.y + dy;

        while (CheckBoundaries(x, y)) {
            const ceil = field[y][x];

            if (ceil.isBe) {
                break;
            }

            moves.push({
                ceil,
                moveType: 'turn',
            });

            // Обычная шашка ходит только на одну клетку.
            if (!checker.isKing) {
                break;
            }

            x += dx;
            y += dy;
        }
    }

    return moves;
};

// Проверяем, может ли хоть одна шашка этого цвета рубить
const HasAnyCapture = (
    field: FieldType,
    color: 'white' | 'black'
): boolean => {
    return field.some(row =>
        row.some(ceil => {
            const checker = ceil.checker;

            return (
                checker !== null &&
                checker.color === color &&
                FindCaptureMoves(field, checker).length > 0
            );
        })
    );
};

const BoardReducer = (
    state: BoardStateType = initialState,
    action: BoardAction
): BoardStateType => {

    switch (action.type) {
        case START_MOVE: {
            const { checker: requestedChecker } = action;

            // Берём актуальную шашку непосредственно с доски
            const checker =
                state.field[requestedChecker.y]?.[requestedChecker.x]?.checker;
            
            if (
                checker === null ||
                checker === undefined ||
                checker.color !== requestedChecker.color
            ) {
                return state;
            }
            if(checker.color != state.turn){
                return state
            }

            // Проверяем взятия выбранной шашки
            const captureMoves = FindCaptureMoves(state.field, checker);

            // Если какая-то шашка игрока может рубить,
            // обычные ходы запрещены
            const hasCaptures = HasAnyCapture(
                state.field,
                checker.color
            );

            if (hasCaptures && captureMoves.length === 0) {
                return {
                    ...state,
                    selectedCeil: null,
                    alowedCeils: [],
                };
            }

            // Если есть взятия — показываем их.
            // Иначе показываем обычные ходы.
            const allowedMoves = captureMoves.length > 0
                ? captureMoves
                : FindNormalMoves(state.field, checker);

            return {
                ...state,
                selectedCeil: checker,
                alowedCeils: allowedMoves,
            };
        }

        case DO_MOVE: {
    const checker = state.selectedCeil;

    if (checker === null || checker.color !== state.turn) {
        return state;
    }

    const { x, y } = action.ceil;
    const { x: oldX, y: oldY } = checker;

    const allowedMove = state.alowedCeils.find(
        move => move.ceil.x === x && move.ceil.y === y
    );

    if (!allowedMove) {
        return state;
    }

    const isCapture = allowedMove.moveType === 'capture';

    // Ищем побитую шашку между начальной и конечной клетками.
    let capturedX: number | null = null;
    let capturedY: number | null = null;

    if (isCapture) {
        const dx = Math.sign(x - oldX);
        const dy = Math.sign(y - oldY);

        let scanX = oldX + dx;
        let scanY = oldY + dy;

        while (scanX !== x && scanY !== y) {
            const currentCeil = state.field[scanY][scanX];

            if (currentCeil.checker !== null) {
                capturedX = scanX;
                capturedY = scanY;
                break;
            }

            scanX += dx;
            scanY += dy;
        }

        // Если не нашли противника на пути, ход не выполняем.
        if (capturedX === null || capturedY === null) {
            return state;
        }

        const capturedChecker =
            state.field[capturedY][capturedX].checker;

        if (
            capturedChecker === null ||
            capturedChecker.color === checker.color
        ) {
            return state;
        }
    }

    // Превращаем шашку в дамку на последней горизонтали.
    const reachesKingRow =
        (checker.color === 'white' && y === 0) ||
        (checker.color === 'black' && y === 7);

    const movedChecker: CheckerType = {
        ...checker,
        x,
        y,
        isKing: checker.isKing || reachesKingRow,
    };

    const newField: FieldType = state.field.map(row =>
        row.map(ceil => {
            // Клетка, на которую переместилась шашка.
            if (ceil.x === x && ceil.y === y) {
                return {
                    ...ceil,
                    checker: movedChecker,
                    isBe: true,
                };
            }

            // Старая клетка шашки.
            if (ceil.x === oldX && ceil.y === oldY) {
                return {
                    ...ceil,
                    checker: null,
                    isBe: false,
                };
            }

            // Удаляем побитую шашку.
            if (
                isCapture &&
                ceil.x === capturedX &&
                ceil.y === capturedY
            ) {
                return {
                    ...ceil,
                    checker: null,
                    isBe: false,
                };
            }

            return ceil;
        })
    );

    // После взятия проверяем продолжение уже для новой позиции.
    // Если шашка превратилась в дамку, поиск сразу учитывает её
    // новые возможности.
    if (isCapture) {
        const nextCaptures = FindCaptureMoves(
            newField,
            movedChecker
        );

        if (nextCaptures.length > 0) {
            return {
                ...state,
                field: newField,
                selectedCeil: movedChecker,
                alowedCeils: nextCaptures,
            };
        }
    }

    // Ход завершён: передаём очередь сопернику.
    return {
        ...state,
        field: newField,
        selectedCeil: null,
        alowedCeils: [],
        turn: state.turn === 'white' ? 'black' : 'white',
    };
}

        default:
            return state;
    }
};
export default BoardReducer