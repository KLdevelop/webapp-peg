import React, { useEffect, useState } from 'react';
import styles from './PegField.module.scss';
import { useSwipeable } from 'react-swipeable';
import { copyToMutableArray } from 'src/utils';

interface Cell {
  i: number;
  j: number;
}

interface Props {
  initialCells: InitialCells;
  voidCells: VoidCells;
  restartTrigger?: boolean;
}

export const PegField = (props: Props) => {
  const [curCell, setCurCell] = useState<null | Cell>(null);
  const { initialCells, voidCells, restartTrigger } = props;
  const [cells, setCells] = useState<boolean[][]>(copyToMutableArray(initialCells));

  const { ref } = useSwipeable({
    onSwipedLeft: () => {
      if (curCell === null) return;
      makeTurn(curCell.i, curCell.j - 2);
      setCurCell(null);
    },
    onSwipedRight: () => {
      if (curCell === null) return;
      makeTurn(curCell.i, curCell.j + 2);
      setCurCell(null);
    },
    onSwipedUp: () => {
      if (curCell === null) return;
      makeTurn(curCell.i - 2, curCell.j);
      setCurCell(null);
    },
    onSwipedDown: () => {
      if (curCell === null) return;
      makeTurn(curCell.i + 2, curCell.j);
      setCurCell(null);
    },
    preventScrollOnSwipe: true,
  });

  useEffect(() => {
    if (curCell !== null && cells[curCell.i][curCell.j] === false) setCurCell(null);
  }, [curCell, cells]);

  function checkCell(i: number, j: number) {
    if (
      curCell === null ||
      i < 0 ||
      j < 0 ||
      i === cells.length ||
      j === cells.length ||
      cells[i][j] === true ||
      voidCells.indexOf('' + i + j) !== -1
    )
      return false;

    if (i === curCell.i) {
      if (j === curCell.j + 2) return cells[i][j - 1];
      else if (j === curCell.j - 2) return cells[i][j + 1];
      return false;
    } else if (j === curCell.j) {
      if (i === curCell.i + 2) return cells[i - 1][j];
      else if (i === curCell.i - 2) return cells[i + 1][j];
      return false;
    }

    return false;
  }

  function makeTurn(i: number, j: number) {
    if (curCell === null) return false;

    const newCells = [...cells];

    if (checkCell(i, j)) {
      newCells[curCell.i][curCell.j] = false;

      if (i === curCell.i) {
        if (j === curCell.j + 2) newCells[i][j - 1] = false;
        else if (j === curCell.j - 2) newCells[i][j + 1] = false;
      } else if (j === curCell.j) {
        if (i === curCell.i + 2) newCells[i - 1][j] = false;
        else if (i === curCell.i - 2) newCells[i + 1][j] = false;
      }

      newCells[i][j] = true;

      setCells(newCells);

      return true;
    }

    return false;
  }

  function onEmptyCellClick(i: number, j: number) {
    if (makeTurn(i, j)) setCurCell({ i, j });
  }

  useEffect(() => {
    const pegsCount = cells.reduce((sum, cur) => sum + cur.filter((cell) => cell).length, 0);

    if (pegsCount <= 1) alert('You won!');
  }, [cells]);

  useEffect(() => {
    setCells(copyToMutableArray(initialCells));
  }, [restartTrigger, initialCells]);

  function onStartSwiping(e: React.TouchEvent, i: number, j: number) {
    if (cells[i][j] === false) return;

    if (curCell === null || (curCell.i !== i && curCell.j !== j)) setCurCell({ i, j });
    else setCurCell(null);
  }

  return (
    <div className={styles.PegField} ref={ref}>
      {cells.map((cellsLine, i) => (
        <div className={styles.cellsLine} key={i}>
          {cellsLine.map((cell, j) => {
            return voidCells.includes('' + i + j) ? (
              <div className={styles.voidCell} key={'' + i + j}></div>
            ) : cell ? (
              <div
                className={
                  curCell !== null && curCell.i === i && curCell.j === j
                    ? styles.activeCell
                    : styles.cellWithPeg
                }
                key={'' + i + j}
                // onClick={() => onCellClick(i, j)}
                onTouchStart={(e) => onStartSwiping(e, i, j)}
              >
                <span className={styles.peg}></span>
              </div>
            ) : (
              <div
                className={styles.emptyCell}
                key={'' + i + j}
                onClick={() => onEmptyCellClick(i, j)}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};