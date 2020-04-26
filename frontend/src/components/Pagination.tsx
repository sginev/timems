import React from 'react'

import Pagination from 'react-bootstrap/Pagination';

let active = 2;
let items:any[] = [];
for ( let number = 1; number <= 10; number++ ) {
  items.push(
    <Pagination.Item key={ number } active={ number === active }>
      { number }
    </Pagination.Item>
  );
}

type PaginationProperties = { 
  currentPage:number, 
  lastPage:number, 
  onAction:(page:number)=>void,
}

const brange = ( from:number, to:number ) => new Array(to-from+1).fill(0).map((_,i)=>i+from);
const decideButtonNumbers = ( currentPage:number, lastPage:number, maxButtonsCount:number ) =>
{
  if ( lastPage <= maxButtonsCount ) {
    return brange( 1, lastPage );
  }

  const onion = ~~(.5 * maxButtonsCount) - 2

  if ( currentPage <= 3 + onion ) {
    return [ ...brange( 1, maxButtonsCount - 2 ), -1, lastPage ]
  }

  if ( currentPage >= lastPage - onion - 2 ) {
    return [ 1, -1, ...brange( lastPage - maxButtonsCount + 3, lastPage ) ]
  }

  return [ 1, -1, ...brange( currentPage - onion, currentPage + onion ), -1, lastPage ]
}

const PaginationComponent:React.FC<PaginationProperties> = 
({ currentPage, lastPage, onAction }) => {
  if ( lastPage === 0 )
    return <></>

  const buttons:(number|'...')[] = decideButtonNumbers( currentPage, lastPage, 11 );
  const onItemClick = pg => onAction( pg )

  return (
    <Pagination>
      { buttons.map( 
          ( pg, i ) => pg === -1 ? 
            <Pagination.Ellipsis key={ i } disabled /> :
            <Pagination.Item key={ i } onClick={ () => onItemClick( pg ) } active={ pg === currentPage }> 
              { pg } 
            </Pagination.Item> ) 
      }
    </Pagination>
  )
}

export default PaginationComponent